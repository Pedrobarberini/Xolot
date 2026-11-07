import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";
import {
  validatePolicy,
  recoveryRequests,
  reducedRuntimePolicy,
  cloneDrillRequest,
  costBudget,
  monitoringDashboard,
  alertPolicies,
  recoveryCount,
} from "../scripts/ops/plans.mjs";
const policy = JSON.parse(readFileSync("config/operations/immediate-policy.json", "utf8"));
const channels = [
  "projects/xolot-384e9/notificationChannels/1",
  "projects/xolot-384e9/notificationChannels/2",
];
test("ensaio exige contagem explícita e válida, sem tratar resposta vazia ou incompleta como zero", () => {
  const row = (value: unknown) => ({
    result: { aggregateFields: { total: { integerValue: value } } },
  });
  assert.equal(recoveryCount([{ readTime: "snapshot" }, row("0")]), 0);
  assert.equal(recoveryCount([row("42")]), 42);
  for (const response of [
    [],
    [{}],
    [row("NaN")],
    [row("-1")],
    [row(0)],
    [row("9007199254740992")],
    [row("1"), row("1")],
  ])
    assert.throws(() => recoveryCount(response));
});

test("recuperação habilita PITR e agenda backup sem apagar, importar ou sobrescrever dados", () => {
  const operations = recoveryRequests(policy);
  assert.equal(operations.length, 2);
  assert.deepEqual(
    operations.map((op) => op.method),
    ["PATCH", "POST"],
  );
  assert.equal(operations[1].body.retention, "1209600s");
  assert.throws(() => validatePolicy({ ...policy, projectId: "other" }));
  assert.throws(() => cloneDrillRequest("(default)", "2026-11-06T20:00:00.000Z"));
  assert.throws(() => cloneDrillRequest("folko-restore-20261106-0000", "private-url"));
  assert.equal(
    cloneDrillRequest("folko-restore-20261106-0000", "2026-11-06T20:00:00.000Z").body.pitrSnapshot
      .database,
    "projects/xolot-384e9/databases/(default)",
  );
});
test("IAM reduz só os dois runtimes e preserva etag, condições, proprietários e agente Google", () => {
  const compute = "serviceAccount:239260393879-compute@developer.gserviceaccount.com";
  const appEngine = "serviceAccount:xolot-384e9@appspot.gserviceaccount.com";
  const google = "serviceAccount:239260393879@cloudservices.gserviceaccount.com";
  const before = {
    version: 3,
    etag: "original",
    bindings: [
      { role: "roles/editor", members: [compute, appEngine, google] },
      { role: "roles/owner", members: ["user:synthetic@example.invalid"] },
      {
        role: "roles/viewer",
        members: ["group:synthetic@example.invalid"],
        condition: { expression: "true" },
      },
    ],
  };
  const result = reducedRuntimePolicy(before);
  assert.deepEqual(result.after.bindings.find((b) => b.role === "roles/editor").members, [google]);
  assert.equal(result.after.etag, "original");
  assert.deepEqual(result.after.bindings[1], before.bindings[1]);
  assert.deepEqual(result.after.bindings[2], before.bindings[2]);
  assert.deepEqual(reducedRuntimePolicy(result.after).after, result.after);
  assert.deepEqual(before.bindings[0].members, [compute, appEngine, google]);
});
test("orçamento BRL 50 usa só os dois canais aprovados; dashboard não confunde leituras com reais", () => {
  const budget = costBudget(policy, channels);
  assert.equal(budget.amount.specifiedAmount.units, "50");
  assert.equal(budget.notificationsRule.disableDefaultIamRecipients, true);
  assert.deepEqual(budget.notificationsRule.monitoringNotificationChannels, channels);
  assert.equal(
    "allUpdatesRule" in budget,
    false,
    "v1 usa notificationsRule, sem o campo legado v1beta1",
  );
  assert.deepEqual(
    budget.thresholdRules.map((rule) => rule.thresholdPercent),
    [0.5, 0.8, 1],
  );
  assert.throws(() => costBudget(policy, ["projects/other/notificationChannels/1"]));
  assert.equal(monitoringDashboard().gridLayout.widgets.length, 13);
  assert.equal(alertPolicies(channels).length, 3);
});
