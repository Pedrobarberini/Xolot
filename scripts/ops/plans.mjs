import assert from "node:assert/strict";

export const projectId = "xolot-384e9";
export const projectNumber = "239260393879";
export function recoveryCount(response) {
  assert.ok(Array.isArray(response), "Resposta de contagem inválida.");
  const results = response.filter((row) => row.result?.aggregateFields?.total);
  assert.equal(results.length, 1, "A contagem precisa de um resultado explícito.");
  const raw = results[0].result.aggregateFields.total.integerValue;
  assert.ok(typeof raw === "string" && /^(?:0|[1-9][0-9]*)$/.test(raw));
  const count = Number(raw);
  assert.ok(Number.isSafeInteger(count), "Contagem fora da faixa segura.");
  return count;
}
export function validatePolicy(policy) {
  assert.equal(policy.version, 1);
  assert.equal(policy.projectId, projectId);
  assert.equal(policy.projectNumber, projectNumber);
  assert.equal(policy.databaseId, "(default)");
  assert.equal(policy.locationId, "southamerica-east1");
  assert.deepEqual(policy.budget, { currencyCode: "BRL", units: "50", thresholds: [0.5, 0.8, 1] });
  assert.deepEqual(policy.recovery, { pitrEnabled: true, dailyRetentionSeconds: 1209600 });
  assert.deepEqual(policy.iam.replacementProjectRoles, [
    "roles/datastore.user",
    "roles/firebaseauth.admin",
  ]);
  assert.equal(policy.iam.preserveGoogleServiceAgents, true);
  return policy;
}

export function recoveryRequests(policy) {
  validatePolicy(policy);
  const database = `projects/${projectId}/databases/(default)`;
  return [
    {
      service: "firestore",
      method: "PATCH",
      path: `/v1/${database}?updateMask=pointInTimeRecoveryEnablement`,
      body: { name: database, pointInTimeRecoveryEnablement: "POINT_IN_TIME_RECOVERY_ENABLED" },
    },
    {
      service: "firestore",
      method: "POST",
      path: `/v1/${database}/backupSchedules`,
      body: { retention: `${policy.recovery.dailyRetentionSeconds}s`, dailyRecurrence: {} },
    },
  ];
}

export function cloneDrillRequest(destinationId, snapshotTime) {
  assert.match(destinationId, /^folko-restore-[0-9]{8}-[0-9]{4}$/);
  assert.match(snapshotTime, /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:00\.000Z$/);
  assert.ok(Number.isFinite(Date.parse(snapshotTime)));
  return {
    service: "firestore",
    method: "POST",
    path: `/v1/projects/${projectId}/databases:clone`,
    body: {
      databaseId: destinationId,
      pitrSnapshot: { database: `projects/${projectId}/databases/(default)`, snapshotTime },
      encryptionConfig: { useSourceEncryption: {} },
    },
  };
}

const runtimeMembers = [
  `serviceAccount:${projectNumber}-compute@developer.gserviceaccount.com`,
  `serviceAccount:${projectId}@appspot.gserviceaccount.com`,
];
export function reducedRuntimePolicy(before) {
  assert.ok(
    before.etag && Array.isArray(before.bindings),
    "A política precisa de etag e bindings.",
  );
  const after = structuredClone(before);
  const editor = after.bindings.find((b) => b.role === "roles/editor" && !b.condition);
  assert.ok(editor, "Binding Editor original não encontrado.");
  const replacements = ["roles/datastore.user", "roles/firebaseauth.admin"];
  for (const member of runtimeMembers) {
    const alreadyReduced = replacements.every((role) =>
      after.bindings.some((b) => b.role === role && !b.condition && b.members.includes(member)),
    );
    assert.ok(
      editor.members.includes(member) || alreadyReduced,
      "Runtime não corresponde à revisão.",
    );
    for (const role of replacements) {
      let binding = after.bindings.find((b) => b.role === role && !b.condition);
      if (!binding) {
        binding = { role, members: [] };
        after.bindings.push(binding);
      }
      if (!binding.members.includes(member)) binding.members.push(member);
    }
    editor.members = editor.members.filter((value) => value !== member);
  }
  after.bindings = after.bindings.filter((b) => b.members.length);
  return { before, after, changedMembers: runtimeMembers, replacementRoles: replacements };
}

const filter = (metric, resource = "cloud_run_revision", extra = "") =>
  `metric.type="${metric}" AND resource.type="${resource}"${extra ? " AND " + extra : ""}`;
export function monitoringDashboard() {
  const chart = (title, metric, resource, aligner, extra = "") => ({
    title,
    xyChart: {
      dataSets: [
        {
          timeSeriesQuery: {
            timeSeriesFilter: {
              filter: filter(metric, resource, extra),
              aggregation: {
                alignmentPeriod: "60s",
                perSeriesAligner: aligner,
                ...(aligner === "ALIGN_PERCENTILE_95" ? {} : { crossSeriesReducer: "REDUCE_SUM" }),
              },
            },
          },
          plotType: "LINE",
        },
      ],
      timeshiftDuration: "0s",
    },
  });
  return {
    displayName: "Folko — Operação v1",
    gridLayout: {
      columns: "2",
      widgets: [
        chart(
          "Requisições por segundo",
          "run.googleapis.com/request_count",
          "cloud_run_revision",
          "ALIGN_RATE",
        ),
        chart(
          "Latência p95 do servidor (ms)",
          "run.googleapis.com/request_latencies",
          "cloud_run_revision",
          "ALIGN_PERCENTILE_95",
        ),
        chart(
          "HTTP 5xx por segundo",
          "run.googleapis.com/request_count",
          "cloud_run_revision",
          "ALIGN_RATE",
          'metric.labels.response_code_class="5xx"',
        ),
        chart(
          "HTTP 401 por segundo",
          "run.googleapis.com/request_count",
          "cloud_run_revision",
          "ALIGN_RATE",
          'metric.labels.response_code="401"',
        ),
        chart(
          "HTTP 429 por segundo",
          "run.googleapis.com/request_count",
          "cloud_run_revision",
          "ALIGN_RATE",
          'metric.labels.response_code="429"',
        ),
        chart(
          "Documentos lidos por segundo",
          "firestore.googleapis.com/document/read_count",
          "firestore_instance",
          "ALIGN_RATE",
        ),
        chart(
          "Documentos gravados por segundo",
          "firestore.googleapis.com/document/write_count",
          "firestore_instance",
          "ALIGN_RATE",
        ),
        chart(
          "Execuções de funções de 1ª geração",
          "cloudfunctions.googleapis.com/function/execution_count",
          "cloud_function",
          "ALIGN_RATE",
        ),
        chart(
          "Bytes enviados pelas APIs por segundo",
          "run.googleapis.com/container/network/sent_bytes_count",
          "cloud_run_revision",
          "ALIGN_RATE",
        ),
        chart(
          "Bytes recebidos pelas APIs por segundo",
          "run.googleapis.com/container/network/received_bytes_count",
          "cloud_run_revision",
          "ALIGN_RATE",
        ),
        chart(
          "Dados e índices do Firestore (bytes)",
          "firestore.googleapis.com/storage/data_and_index_storage_bytes",
          "firestore.googleapis.com/Database",
          "ALIGN_MAX",
        ),
        chart(
          "Armazenamento PITR (bytes)",
          "firestore.googleapis.com/storage/pitr_storage_bytes",
          "firestore.googleapis.com/Database",
          "ALIGN_MAX",
        ),
        chart(
          "Armazenamento de backups (bytes)",
          "firestore.googleapis.com/storage/backups_storage_bytes",
          "firestore.googleapis.com/Database",
          "ALIGN_MAX",
        ),
      ],
    },
  };
}

function validateChannels(channels) {
  assert.equal(channels.length, 2, "São necessários os dois canais aprovados.");
  assert.equal(new Set(channels).size, 2);
  for (const channel of channels)
    assert.match(channel, /^projects\/(?:xolot-384e9|239260393879)\/notificationChannels\/[0-9]+$/);
}
export function alertPolicies(channels) {
  validateChannels(channels);
  return [
    ["HTTP 5xx", 'metric.labels.response_code_class="5xx"', 4],
    ["Rejeições de autenticação", 'metric.labels.response_code="401"', 99],
    ["Quotas excedidas", 'metric.labels.response_code="429"', 19],
  ].map(([title, extra, maximum]) => ({
    displayName: `Folko — ${title} v1`,
    enabled: true,
    combiner: "OR",
    notificationChannels: channels,
    documentation: {
      content:
        "Contagem na janela de cinco minutos. Investigar antes de alterar limites. Este alerta não certifica proteção contra DDoS nem interrompe gastos.",
      mimeType: "text/markdown",
    },
    conditions: [
      {
        displayName: title,
        conditionThreshold: {
          filter: filter("run.googleapis.com/request_count", "cloud_run_revision", extra),
          aggregations: [
            {
              alignmentPeriod: "300s",
              perSeriesAligner: "ALIGN_SUM",
              crossSeriesReducer: "REDUCE_SUM",
            },
          ],
          comparison: "COMPARISON_GT",
          thresholdValue: maximum,
          duration: "0s",
          trigger: { count: 1 },
        },
      },
    ],
  }));
}
export function costBudget(policy, channels) {
  validatePolicy(policy);
  validateChannels(channels);
  return {
    displayName: "Folko — R$ 50 por mês",
    budgetFilter: { projects: [`projects/${projectNumber}`], calendarPeriod: "MONTH" },
    amount: { specifiedAmount: { currencyCode: "BRL", units: "50" } },
    thresholdRules: policy.budget.thresholds.map((thresholdPercent) => ({
      thresholdPercent,
      spendBasis: "CURRENT_SPEND",
    })),
    notificationsRule: {
      disableDefaultIamRecipients: true,
      monitoringNotificationChannels: channels,
    },
  };
}
