import { readFileSync, writeFileSync, existsSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import assert from "node:assert/strict";
import { googleOperatorClient } from "./googleClient.mjs";
import { cloneDrillRequest, projectId, recoveryCount } from "./plans.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const dir = resolve(root, "output/testes/imediatas-20261106");
mkdirSync(dir, { recursive: true });
const file = resolve(dir, "restore-drill-plan.json");
const ledgerFile = resolve(dir, "restore-drill-application.json");
const args = process.argv.slice(2);
const mode =
  args.find((arg) => ["--plan", "--apply", "--check", "--cleanup"].includes(arg)) || "--plan";
assert.ok(
  args.every(
    (arg) =>
      ["--plan", "--apply", "--check", "--cleanup"].includes(arg) ||
      /^--approve=[a-f0-9]{64}$/.test(arg),
  ),
);
assert.ok(
  args.filter((arg) => ["--plan", "--apply", "--check", "--cleanup"].includes(arg)).length <= 1,
);
const sha = (value) => createHash("sha256").update(value).digest("hex");
const rules = readFileSync(resolve(root, "config/operations/restore-drill.rules"), "utf8");
const codeHash = sha(readFileSync(fileURLToPath(import.meta.url)));
const dependencyHashes = Object.fromEntries(
  ["plans.mjs", "googleClient.mjs"].map((name) => [
    name,
    sha(readFileSync(resolve(root, "scripts/ops", name))),
  ]),
);
let plan;
if (existsSync(file)) plan = JSON.parse(readFileSync(file));
else {
  const stamp = new Date().toISOString().replace(/[-:TZ.]/g, "");
  plan = {
    projectId,
    source: "(default)",
    destinationId: `folko-restore-${stamp.slice(0, 8)}-${stamp.slice(8, 12)}`,
    snapshotPolicy: "provider HTTP date minus three minutes, rounded to a minute",
    denyRulesSha256: sha(rules),
    codeHash,
    dependencyHashes,
    check: "Compare bounded collection counts at the exact snapshot; no document bodies exported",
    cleanup:
      "Delete only this temporary clone after validation; never delete or overwrite the source",
    charged: true,
  };
  plan.hash = sha(JSON.stringify(plan));
  writeFileSync(file, JSON.stringify(plan, null, 2));
}
assert.equal(plan.projectId, projectId);
assert.equal(plan.source, "(default)");
assert.match(plan.destinationId, /^folko-restore-[0-9]{8}-[0-9]{4}$/);
const { hash: planHash, ...planContent } = plan;
assert.equal(sha(JSON.stringify(planContent)), planHash, "O conteúdo do plano foi alterado.");
assert.equal(plan.codeHash, codeHash, "O ensaio precisa ser revisado após mudar o script.");
assert.deepEqual(plan.dependencyHashes, dependencyHashes, "As dependências do ensaio mudaram.");
assert.equal(plan.denyRulesSha256, sha(rules));
if (mode === "--plan") {
  console.log(
    JSON.stringify({
      mode: "dry-run",
      planHash: plan.hash,
      destinationId: plan.destinationId,
      charged: true,
      cloudChangesApplied: false,
    }),
  );
} else {
  assert.equal(
    args.find((arg) => arg.startsWith("--approve="))?.slice(10),
    plan.hash,
    "O plano do ensaio precisa de aprovação explícita.",
  );
  const api = await googleOperatorClient();
  const destination = `projects/${projectId}/databases/${plan.destinationId}`;
  const releaseName = `projects/${projectId}/releases/cloud.firestore/${plan.destinationId}`;
  let ledger = existsSync(ledgerFile)
    ? JSON.parse(readFileSync(ledgerFile))
    : {
        planHash: plan.hash,
        startedAt: new Date().toISOString(),
        destinationId: plan.destinationId,
      };
  assert.equal(ledger.planHash, plan.hash);
  const save = () => writeFileSync(ledgerFile, JSON.stringify(ledger, null, 2));
  async function assertPrivateRelease() {
    const release = await api("rules", "/v1/" + releaseName);
    const ruleset = await api("rules", "/v1/" + release.rulesetName);
    assert.equal(
      sha(ruleset.source.files[0].content.replace(/\r\n/g, "\n")),
      sha(rules.replace(/\r\n/g, "\n")),
      "O banco do ensaio precisa de regras deny-all.",
    );
  }
  if (mode === "--apply") {
    if (ledger.operation) {
      console.log(JSON.stringify({ alreadyStarted: true, operation: ledger.operation }));
    } else {
      const source = await api("firestore", `/v1/projects/${projectId}/databases/(default)`);
      assert.equal(
        source.pointInTimeRecoveryEnablement,
        "POINT_IN_TIME_RECOVERY_ENABLED",
        "Ative e confira a política de recuperação primeiro.",
      );
      const serverNow = Date.parse(api.serverDate || "");
      assert.ok(Number.isFinite(serverNow));
      const snapshotTime = new Date(Math.floor((serverNow - 180000) / 60000) * 60000).toISOString();
      assert.ok(Date.parse(snapshotTime) >= Date.parse(source.earliestVersionTime));
      try {
        await api("firestore", "/v1/" + destination);
        throw new Error("Destino já existe; não será sobrescrito.");
      } catch (error) {
        if (error.status !== 404) throw error;
      }
      const ruleset = await api("rules", `/v1/projects/${projectId}/rulesets`, "POST", {
        source: { files: [{ name: "restore-drill.rules", content: rules }] },
      });
      await api("rules", `/v1/projects/${projectId}/releases`, "POST", {
        name: releaseName,
        rulesetName: ruleset.name,
      });
      await assertPrivateRelease();
      ledger.snapshotTime = snapshotTime;
      ledger.privateRelease = releaseName;
      save();
      const request = cloneDrillRequest(plan.destinationId, snapshotTime);
      const operation = await api(request.service, request.path, request.method, request.body);
      assert.match(
        operation.name,
        new RegExp(`^projects/${projectId}/databases/[^/]+/operations/[^/]+$`),
      );
      ledger.operation = operation.name;
      save();
      console.log(
        JSON.stringify({
          started: true,
          operation: ledger.operation,
          destinationId: plan.destinationId,
          sourceUnchanged: true,
        }),
      );
    }
  }
  if (mode === "--check") {
    if (ledger.cleanupOperation) {
      const cleanup = await api("firestore", "/v1/" + ledger.cleanupOperation);
      if (!cleanup.done) console.log(JSON.stringify({ cleanupPending: true }));
      else {
        assert.ok(!cleanup.error);
        try {
          await api("firestore", "/v1/" + destination);
          throw new Error("A cópia ainda existe.");
        } catch (error) {
          if (error.status !== 404) throw error;
        }
        ledger.cleaned = true;
        ledger.cleanedAt = new Date().toISOString();
        save();
        console.log(
          JSON.stringify({
            cleanupVerified: true,
            destinationId: plan.destinationId,
            sourceUnchanged: true,
          }),
        );
      }
    } else {
      assert.ok(ledger.operation);
      assert.match(
        ledger.operation,
        new RegExp(`^projects/${projectId}/databases/[^/]+/operations/[^/]+$`),
      );
      const operation = await api("firestore", "/v1/" + ledger.operation);
      if (!operation.done)
        console.log(JSON.stringify({ pending: true, operation: ledger.operation }));
      else {
        assert.ok(!operation.error, "O clone não foi concluído com sucesso.");
        await assertPrivateRelease();
        const database = await api("firestore", "/v1/" + destination);
        assert.equal(database.name, destination);
        assert.equal(database.locationId, "southamerica-east1");
        const collections = [
          "accounts",
          "profiles",
          "posts",
          "postEngagement",
          "directMessages",
          "notifications",
          "follows",
          "postComments",
          "socialPreferences",
          "moderationReports",
        ];
        const counts = {};
        for (const collectionId of collections) {
          const query = {
            structuredAggregationQuery: {
              structuredQuery: { from: [{ collectionId }] },
              aggregations: [{ count: {}, alias: "total" }],
            },
          };
          const before = await api(
            "firestore",
            `/v1/projects/${projectId}/databases/(default)/documents:runAggregationQuery`,
            "POST",
            { ...query, readTime: ledger.snapshotTime },
          );
          const after = await api(
            "firestore",
            `/v1/${destination}/documents:runAggregationQuery`,
            "POST",
            query,
          );
          assert.equal(
            recoveryCount(after),
            recoveryCount(before),
            "Contagem divergente na coleção " + collectionId,
          );
          counts[collectionId] = recoveryCount(after);
        }
        ledger.verified = true;
        ledger.verifiedAt = new Date().toISOString();
        ledger.counts = counts;
        ledger.limitations = [
          "Collection counts are not a byte-for-byte content audit.",
          "Firestore recovery does not include Firebase Auth identities or R2 objects.",
        ];
        save();
        console.log(
          JSON.stringify({
            verified: true,
            collections: collections.length,
            destinationId: plan.destinationId,
            documentBodiesExported: false,
            cleanupPending: true,
          }),
        );
      }
    }
  }
  if (mode === "--cleanup") {
    assert.equal(ledger.verified, true, "Conferir o ensaio antes de remover a cópia.");
    if (ledger.cleaned) {
      console.log(JSON.stringify({ alreadyCleaned: true }));
    } else {
      let database = await api("firestore", "/v1/" + destination);
      if (database.deleteProtectionState === "DELETE_PROTECTION_ENABLED") {
        await api("firestore", `/v1/${destination}?updateMask=deleteProtectionState`, "PATCH", {
          name: destination,
          etag: database.etag,
          deleteProtectionState: "DELETE_PROTECTION_DISABLED",
        });
        database = await api("firestore", "/v1/" + destination);
      }
      const operation = await api(
        "firestore",
        `/v1/${destination}${database.etag ? "?etag=" + encodeURIComponent(database.etag) : ""}`,
        "DELETE",
      );
      ledger.cleanupOperation = operation.name;
      ledger.cleaned = false;
      save();
      console.log(
        JSON.stringify({
          cleanupStarted: true,
          operation: operation.name,
          destinationId: plan.destinationId,
          sourceUnchanged: true,
        }),
      );
    }
  }
}
