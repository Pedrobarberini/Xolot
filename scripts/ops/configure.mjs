import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { googleOperatorClient } from "./googleClient.mjs";
import {
  projectId,
  projectNumber,
  validatePolicy,
  recoveryRequests,
  reducedRuntimePolicy,
  monitoringDashboard,
  alertPolicies,
  costBudget,
} from "./plans.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "../..");
const policy = validatePolicy(
  JSON.parse(readFileSync(resolve(root, "config/operations/immediate-policy.json"))),
);
const evidence = resolve(root, "output/testes/imediatas-20261106");
mkdirSync(evidence, { recursive: true });
const [operation, ...flags] = process.argv.slice(2);
if (!["recovery", "monitoring", "iam"].includes(operation))
  throw new Error("Escolha recovery, monitoring ou iam.");
const apply = flags.includes("--apply");
const approval = flags.find((arg) => arg.startsWith("--approve="))?.slice(10);
if (flags.some((arg) => arg !== "--apply" && !/^--approve=[a-f0-9]{64}$/.test(arg)))
  throw new Error("Opção inválida.");
let settings;
if (operation === "monitoring") {
  settings = JSON.parse(readFileSync(resolve(evidence, "operator-settings.json")));
  if (
    !Array.isArray(settings.notificationEmails) ||
    settings.notificationEmails.length !== 2 ||
    new Set(settings.notificationEmails).size !== 2 ||
    settings.notificationEmails.some(
      (email) =>
        typeof email !== "string" ||
        email.length > 254 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    )
  )
    throw new Error(
      "Os dois destinatários aprovados precisam estar no arquivo privado de parâmetros.",
    );
}
const sha = (value) => createHash("sha256").update(value).digest("hex");
const plan = {
  operation,
  projectId,
  config: policy,
  recipientCount: settings?.notificationEmails.length ?? 0,
  privateSettingsHash: settings ? sha(JSON.stringify(settings)) : null,
  codeHashes: Object.fromEntries(
    ["configure.mjs", "plans.mjs", "googleClient.mjs"].map((name) => [
      name,
      sha(readFileSync(resolve(root, "scripts/ops", name))),
    ]),
  ),
  changes:
    operation === "recovery"
      ? [
          "Enable seven-day PITR",
          "Create daily backup schedule, retain 14 days",
          "No document deletion or overwrite; restore drill remains a separate acceptance",
        ]
      : operation === "iam"
        ? [
            "Replace Editor for the two known application runtimes with datastore.user and firebaseauth.admin",
            "Preserve Google service agents, owners, conditions, resource-level secret bindings and current etag",
          ]
        : [
            "Create/reuse two approved email channels",
            "Create a thirteen-chart operations dashboard and three bounded request-count alerts",
            "Enable Budget API if disabled, then create project-specific BRL 50 monthly budget with 50/80/100% alerts",
            "Default IAM recipients disabled; budget does not stop spend",
          ],
};
const hash = sha(JSON.stringify(plan));
writeFileSync(
  resolve(evidence, `${operation}-plan.json`),
  JSON.stringify({ ...plan, hash, approvalRequired: true }, null, 2),
);
if (!apply) {
  console.log(
    JSON.stringify({
      operation,
      mode: "dry-run",
      hash,
      cloudChangesApplied: false,
      changes: plan.changes,
    }),
  );
} else {
  if (approval !== hash) throw new Error("O hash aprovado não corresponde ao plano atual.");
  const api = await googleOperatorClient();
  const ledger = {
    operation,
    planHash: hash,
    startedAt: new Date().toISOString(),
    steps: [],
    completed: false,
  };
  const save = () =>
    writeFileSync(
      resolve(evidence, `${operation}-application.json`),
      JSON.stringify(ledger, null, 2),
    );
  const step = (name, result) => {
    ledger.steps.push({ name, ...result });
    save();
  };
  save();
  try {
    if (operation === "recovery") {
      const dbPath = `/v1/projects/${projectId}/databases/(default)`;
      const db = await api("firestore", dbPath);
      if (
        db.databaseEdition !== "STANDARD" ||
        db.locationId !== policy.locationId ||
        db.deleteProtectionState !== "DELETE_PROTECTION_ENABLED"
      )
        throw new Error("A instância não corresponde à revisão de recuperação.");
      const requests = recoveryRequests(policy);
      if (db.pointInTimeRecoveryEnablement !== "POINT_IN_TIME_RECOVERY_ENABLED") {
        const request = requests[0];
        const result = await api(request.service, request.path, request.method, {
          ...request.body,
          etag: db.etag,
        });
        step("enable-pitr", { operation: result.name });
      }
      const schedules = await api("firestore", dbPath + "/backupSchedules");
      if (schedules.nextPageToken)
        throw new Error("Lista de agendas truncada; revisar antes de alterar.");
      const daily = schedules.backupSchedules?.find((item) => item.dailyRecurrence);
      if (daily && daily.retention !== `${policy.recovery.dailyRetentionSeconds}s`)
        throw new Error("Já existe agenda diária com outra retenção; não será sobrescrita.");
      if (!daily) {
        const request = requests[1];
        const result = await api(request.service, request.path, request.method, request.body);
        step("daily-backup", { resource: result.name, retention: result.retention });
      }
      const current = await api("firestore", dbPath);
      const currentSchedules = await api("firestore", dbPath + "/backupSchedules");
      if (
        current.pointInTimeRecoveryEnablement !== "POINT_IN_TIME_RECOVERY_ENABLED" ||
        !currentSchedules.backupSchedules?.some(
          (item) =>
            item.dailyRecurrence && item.retention === `${policy.recovery.dailyRetentionSeconds}s`,
        )
      )
        throw new Error("Readback da recuperação ainda não confirmou a configuração.");
      step("readback", {
        pitr: current.pointInTimeRecoveryEnablement,
        firstBackupAndRestoreDrillPending: true,
      });
    }
    if (operation === "iam") {
      const before = await api(
        "resourceManager",
        `/v1/projects/${projectId}:getIamPolicy`,
        "POST",
        { options: { requestedPolicyVersion: 3 } },
      );
      // The role permission subset was checked against the provider in prerequisites.json.
      const prerequisite = JSON.parse(readFileSync(resolve(evidence, "prerequisites.json")));
      for (const role of ["datastore.user", "firebaseauth.admin"])
        if (
          !prerequisite.roles.some(
            (item) =>
              item.role === role && item.status === 200 && item.notCoveredByEditor?.length === 0,
          )
        )
          throw new Error("A redução de privilégios não tem verificação de subconjunto.");
      const change = reducedRuntimePolicy(before);
      writeFileSync(
        resolve(evidence, "iam-rollback-private.json"),
        JSON.stringify({ projectId, before, proposed: change.after }, null, 2),
      );
      const after = await api("resourceManager", `/v1/projects/${projectId}:setIamPolicy`, "POST", {
        policy: change.after,
      });
      if (
        after.bindings.some(
          (b) =>
            b.role === "roles/editor" &&
            !b.condition &&
            b.members.some((member) => change.changedMembers.includes(member)),
        )
      )
        throw new Error("Readback de IAM ainda mostra Editor no runtime.");
      for (const role of change.replacementRoles)
        if (
          !change.changedMembers.every((member) =>
            after.bindings.some(
              (b) => b.role === role && !b.condition && b.members.includes(member),
            ),
          )
        )
          throw new Error("Readback de IAM não confirmou os dois runtimes.");
      step("runtime-iam", {
        runtimes: 2,
        roles: change.replacementRoles,
        etagChanged: before.etag !== after.etag,
        runtimeSmokePending: true,
      });
    }
    if (operation === "monitoring") {
      const channelList = await api(
        "monitoring",
        `/v3/projects/${projectId}/notificationChannels?pageSize=100`,
      );
      if (channelList.nextPageToken) throw new Error("Lista de canais truncada.");
      const channels = [];
      for (const email of settings.notificationEmails) {
        let channel = channelList.notificationChannels?.find(
          (item) => item.type === "email" && item.labels?.email_address === email,
        );
        if (!channel)
          channel = await api(
            "monitoring",
            `/v3/projects/${projectId}/notificationChannels`,
            "POST",
            {
              type: "email",
              displayName: `Folko — alertas ${channels.length + 1}`,
              labels: { email_address: email },
              enabled: true,
            },
          );
        channels.push(channel.name);
        step("email-channel", {
          resource: channel.name,
          verificationStatus: channel.verificationStatus ?? "UNKNOWN",
        });
      }
      const dashboards = await api(
        "monitoring",
        `/v1/projects/${projectId}/dashboards?pageSize=100`,
      );
      if (dashboards.nextPageToken) throw new Error("Lista de dashboards truncada.");
      const dashboardBody = monitoringDashboard();
      const dashboard =
        dashboards.dashboards?.find((item) => item.displayName === dashboardBody.displayName) ??
        (await api("monitoring", `/v1/projects/${projectId}/dashboards`, "POST", dashboardBody));
      step("dashboard", { resource: dashboard.name });
      const policies = await api(
        "monitoring",
        `/v3/projects/${projectId}/alertPolicies?pageSize=100`,
      );
      if (policies.nextPageToken) throw new Error("Lista de alertas truncada.");
      for (const body of alertPolicies(channels)) {
        const alert =
          policies.alertPolicies?.find((item) => item.displayName === body.displayName) ??
          (await api("monitoring", `/v3/projects/${projectId}/alertPolicies`, "POST", body));
        step("alert-policy", { resource: alert.name, valid: !alert.validity?.code });
      }
      const service = `/v1/projects/${projectNumber}/services/billingbudgets.googleapis.com`;
      const state = await api("serviceUsage", service);
      if (state.state !== "ENABLED") {
        const enabled = await api("serviceUsage", service + ":enable", "POST", {});
        step("budget-api", { operation: enabled.name });
        // Enabling can be asynchronous; rerunning is idempotent and preserves created resources.
        if ((await api("serviceUsage", service)).state !== "ENABLED")
          throw new Error("API de orçamento em ativação; repetir após concluir.");
      }
      const info = await api("billing", `/v1/projects/${projectId}/billingInfo`);
      if (!info.billingEnabled || !/^billingAccounts\/[A-Z0-9-]+$/.test(info.billingAccountName))
        throw new Error("Cobrança do projeto indisponível.");
      const account = await api("billing", "/v1/" + info.billingAccountName);
      if (account.currencyCode !== "BRL")
        throw new Error("Moeda da conta difere do orçamento aprovado em BRL.");
      const budgetBody = costBudget(policy, channels);
      const list = await api("budgets", `/v1/${info.billingAccountName}/budgets?pageSize=100`);
      if (list.nextPageToken) throw new Error("Lista de orçamentos truncada.");
      let budget = list.budgets?.find((item) => item.displayName === budgetBody.displayName);
      if (
        budget &&
        (budget.amount?.specifiedAmount?.units !== "50" ||
          budget.amount?.specifiedAmount?.currencyCode !== "BRL" ||
          JSON.stringify(budget.budgetFilter?.projects) !==
            JSON.stringify(budgetBody.budgetFilter.projects))
      )
        throw new Error("Orçamento existente diverge da revisão; não será sobrescrito.");
      if (!budget)
        budget = await api("budgets", `/v1/${info.billingAccountName}/budgets`, "POST", budgetBody);
      step("budget", {
        resource: budget.name,
        currencyCode: "BRL",
        units: "50",
        automaticShutdown: false,
      });
    }
    ledger.completed = true;
    ledger.finishedAt = new Date().toISOString();
    save();
    console.log(
      JSON.stringify({
        operation,
        completed: true,
        steps: ledger.steps.length,
        evidence: `output/testes/imediatas-20261106/${operation}-application.json`,
      }),
    );
  } catch (error) {
    ledger.error = error.message;
    save();
    throw error;
  }
}
