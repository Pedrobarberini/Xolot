import assert from "node:assert/strict";
import { readFileSync, writeFileSync } from "node:fs";
import { createRequire } from "node:module";
import { createHash } from "node:crypto";
const project = "xolot-384e9";
const number = "239260393879";
const member = `serviceAccount:${number}-compute@developer.gserviceaccount.com`;
const directory = "output/testes/imediatas-20261106";
const buckets = [
  `gcf-sources-${number}-southamerica-east1`,
  `gcf-v2-sources-${number}-southamerica-east1`,
  `gcf-v2-uploads-${number}.southamerica-east1.cloudfunctions.appspot.com`,
];
const repository = `projects/${project}/locations/southamerica-east1/repositories/gcf-artifacts`;
const plan = {
  project,
  member,
  buckets,
  repository,
  projectRole: "roles/logging.logWriter",
  repositoryRole: "roles/artifactregistry.writer",
  bucketRole: "roles/storage.objectViewer",
  purpose:
    "Preserve a subset of existing effective build access before removing Editor; no new identity, public access, billing product or bucket",
  codeHash: createHash("sha256")
    .update(readFileSync(new URL(import.meta.url)))
    .digest("hex"),
};
const hash = createHash("sha256").update(JSON.stringify(plan)).digest("hex");
writeFileSync(`${directory}/build-access-plan.json`, JSON.stringify({ ...plan, hash }, null, 2));
const args = process.argv.slice(2);
assert.ok(args.every((arg) => arg === "--apply" || /^--approve=[a-f0-9]{64}$/.test(arg)));
if (!args.includes("--apply"))
  console.log(JSON.stringify({ dryRun: true, hash, cloudChangesApplied: false }));
else {
  assert.equal(args.find((arg) => arg.startsWith("--approve="))?.slice(10), hash);
  const approval = JSON.parse(readFileSync(`${directory}/authorization.json`));
  assert.equal(approval.infrastructure, "Autorizar bloco completo");
  assert.equal(
    approval.buildAccess?.authorized,
    true,
    "A preservação dos acessos de build exige aprovação específica.",
  );
  const require = createRequire(import.meta.url);
  const { getGlobalDefaultAccount, getAccessToken } = require("firebase-tools/lib/auth");
  const token = await getAccessToken(getGlobalDefaultAccount().tokens.refresh_token, []);
  const hosts = new Set([
    "iam.googleapis.com",
    "cloudresourcemanager.googleapis.com",
    "cloudfunctions.googleapis.com",
    "storage.googleapis.com",
    "artifactregistry.googleapis.com",
  ]);
  async function request(url, method = "GET", body) {
    assert.equal(new URL(url).protocol, "https:");
    assert.ok(hosts.has(new URL(url).hostname));
    const response = await fetch(url, {
      method,
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "Content-Type": "application/json",
        "x-goog-user-project": project,
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
      signal: AbortSignal.timeout(30000),
    });
    const data = await response.json();
    assert.ok(
      response.ok,
      `Build access HTTP ${response.status}: ${data.error?.status || "unknown"}`,
    );
    return data;
  }
  const projectUrl = `https://cloudresourcemanager.googleapis.com/v1/projects/${project}`;
  const before = await request(projectUrl + ":getIamPolicy", "POST", {
    options: { requestedPolicyVersion: 3 },
  });
  assert.ok(
    before.bindings.some(
      (binding) =>
        binding.role === "roles/editor" && !binding.condition && binding.members.includes(member),
    ),
    "Revisar a política original antes de preservar o acesso de build.",
  );
  const functions = await request(
    `https://cloudfunctions.googleapis.com/v2/projects/${project}/locations/southamerica-east1/functions`,
  );
  assert.ok(!functions.nextPageToken);
  for (const fn of functions.functions || [])
    if (fn.buildConfig?.serviceAccount)
      assert.equal(
        fn.buildConfig.serviceAccount,
        `projects/${project}/serviceAccounts/${member.slice(15)}`,
      );
  const roles = new Map();
  for (const role of [
    "editor",
    "logging.logWriter",
    "artifactregistry.writer",
    "storage.objectViewer",
    "storage.legacyBucketOwner",
    "storage.legacyObjectOwner",
  ])
    roles.set(
      role,
      (await request("https://iam.googleapis.com/v1/roles/" + role)).includedPermissions,
    );
  const editor = new Set(roles.get("editor"));
  for (const role of ["logging.logWriter", "artifactregistry.writer"])
    assert.ok(
      roles.get(role).every((permission) => editor.has(permission)),
      "Não ampliar permissões além do Editor.",
    );
  const bucketPolicies = [];
  for (const bucket of buckets) {
    const url = `https://storage.googleapis.com/storage/v1/b/${bucket}/iam`;
    const policy = await request(url + "?optionsRequestedPolicyVersion=3");
    const effective = new Set(editor);
    for (const binding of policy.bindings) {
      if (binding.condition || !binding.members.includes(`projectEditor:${project}`)) continue;
      const permissions = roles.get(binding.role.replace("roles/", ""));
      if (permissions) permissions.forEach((permission) => effective.add(permission));
    }
    assert.ok(
      roles.get("storage.objectViewer").every((permission) => effective.has(permission)),
      "A leitura precisa ser subconjunto do acesso efetivo anterior.",
    );
    bucketPolicies.push({ bucket, url, before: policy });
  }
  const repoUrl = `https://artifactregistry.googleapis.com/v1/${repository}`;
  const repositoryBefore = await request(
    repoUrl + ":getIamPolicy?options.requestedPolicyVersion=3",
  );
  assert.ok(repositoryBefore.etag);
  const ledger = {
    planHash: hash,
    before,
    repositoryBefore,
    bucketPolicies,
    changes: [],
    completed: false,
  };
  const save = () =>
    writeFileSync(
      `${directory}/build-access-application-private.json`,
      JSON.stringify(ledger, null, 2),
    );
  save();
  function addRole(policy, role) {
    const copy = structuredClone(policy);
    copy.bindings ??= [];
    let binding = copy.bindings.find((item) => item.role === role && !item.condition);
    if (!binding) {
      binding = { role, members: [] };
      copy.bindings.push(binding);
    }
    if (!binding.members.includes(member)) binding.members.push(member);
    return copy;
  }
  function verify(policy, role) {
    assert.ok(
      policy.bindings.some(
        (binding) =>
          binding.role === role && !binding.condition && binding.members.includes(member),
      ),
    );
  }
  for (const bucket of bucketPolicies) {
    const updated = await request(bucket.url, "PUT", addRole(bucket.before, plan.bucketRole));
    verify(updated, plan.bucketRole);
    ledger.changes.push({ scope: bucket.bucket, role: plan.bucketRole });
    save();
  }
  const updatedRepository = await request(repoUrl + ":setIamPolicy", "POST", {
    policy: addRole(repositoryBefore, plan.repositoryRole),
  });
  verify(updatedRepository, plan.repositoryRole);
  ledger.changes.push({ scope: repository, role: plan.repositoryRole });
  save();
  const currentProject = await request(projectUrl + ":getIamPolicy", "POST", {
    options: { requestedPolicyVersion: 3 },
  });
  const updatedProject = await request(projectUrl + ":setIamPolicy", "POST", {
    policy: addRole(currentProject, plan.projectRole),
  });
  verify(updatedProject, plan.projectRole);
  ledger.changes.push({ scope: project, role: plan.projectRole });
  ledger.completed = true;
  save();
  console.log(
    JSON.stringify({
      completed: true,
      changes: ledger.changes.length,
      existingEffectivePermissionsOnly: true,
      editorRemovalPending: true,
    }),
  );
}
