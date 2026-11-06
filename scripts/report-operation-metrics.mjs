import {
  mkdirSync,
  readFileSync,
  realpathSync,
  statSync,
  writeFileSync,
  existsSync,
} from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { createRequire } from "node:module";
import {
  metricOperations,
  parseMetricBatch,
} from "../functions/src/observability/metricProtocol.ts";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const percent = (values, percentile) =>
  values.length ? values[Math.max(0, Math.ceil(values.length * percentile) - 1)] : null;

export function summarizeOperationLogs(entries) {
  if (!Array.isArray(entries) || entries.length > 1000)
    throw new Error("Formato de relatório inválido.");
  const groups = new Map();
  const seen = new Set();
  let accepted = 0,
    rejected = 0,
    unrelated = 0,
    duplicates = 0,
    discardedOrUnconfirmed = 0;
  for (const entry of entries) {
    const payload = entry?.jsonPayload;
    if (!payload || payload.event !== "folko.operation_metrics") {
      unrelated++;
      continue;
    }
    const { event, message, ...data } = payload;
    if (message !== undefined && message !== "folko.operation_metrics") {
      rejected++;
      continue;
    }
    const batch = parseMetricBatch(data);
    if (!batch) {
      rejected++;
      continue;
    }
    const insertId =
      typeof entry.insertId === "string" && entry.insertId.length <= 256 ? entry.insertId : null;
    const logName =
      typeof entry.logName === "string" && entry.logName.length <= 512 ? entry.logName : "";
    if (insertId) {
      const key = `${logName}\0${insertId}`;
      if (seen.has(key)) {
        duplicates++;
        continue;
      }
      seen.add(key);
    }
    accepted++;
    discardedOrUnconfirmed += batch.dropped;
    for (const sample of batch.samples) {
      const key = `${batch.releaseId}:${batch.platform}:${sample.operation}:${sample.outcome}`;
      if (!groups.has(key))
        groups.set(key, {
          platform: batch.platform,
          releaseId: batch.releaseId,
          operation: sample.operation,
          outcome: sample.outcome,
          successes: 0,
          failures: 0,
          cancellations: 0,
          values: [],
          codes: {},
        });
      const group = groups.get(key);
      group.codes[sample.code] = (group.codes[sample.code] ?? 0) + 1;
      if (sample.outcome === "success") group.successes++;
      else if (sample.outcome === "failure") group.failures++;
      else group.cancellations++;
      group.values.push(sample.value);
    }
  }
  const metrics = [...groups.values()]
    .map(({ values, ...group }) => {
      values.sort((left, right) => left - right);
      const count = values.length;
      return {
        ...group,
        unit: group.operation === "query.posts.documents" ? "returned_documents" : "milliseconds",
        samples: count,
        mean: Math.round((values.reduce((sum, value) => sum + value, 0) / count) * 100) / 100,
        p50: percent(values, 0.5),
        p95: percent(values, 0.95),
        max: values.at(-1),
        sampleWarning: count < 100 ? "small_sample" : null,
      };
    })
    .sort((left, right) =>
      `${left.operation}:${left.platform}:${left.releaseId}:${left.outcome}`.localeCompare(
        `${right.operation}:${right.platform}:${right.releaseId}:${right.outcome}`,
      ),
    );
  return {
    schemaVersion: 1,
    source: "untrusted_client_diagnostics",
    sampleRate: 0.2,
    acceptedBatches: accepted,
    rejectedBatches: rejected,
    unrelatedEntries: unrelated,
    duplicateEntries: duplicates,
    discardedOrUnconfirmed,
    missingOperations: metricOperations.filter(
      (operation) => !metrics.some((item) => item.operation === operation),
    ),
    metrics,
    limitations: [
      "Not a production SLA or a security, billing, ranking or social-counter authority.",
      "Small or discarded samples can bias percentiles.",
      "Returned document count is not billed Firestore reads.",
      "Remote log download is capped at 1000 entries; a truncated window is marked explicitly.",
    ],
  };
}

export function renderOperationMetricsMarkdown(report) {
  const rows = report.metrics.map(
    (metric) =>
      `| ${metric.operation} (${metric.releaseId}) | ${metric.platform} | ${metric.outcome} | ${metric.samples} | ${metric.p50} | ${metric.p95} | ${metric.unit} | ${metric.sampleWarning ?? "—"} |`,
  );
  return `# Folko — diagnóstico operacional\n\nOrigem: amostras declaradas pelos clientes (20%). Nenhum número deste relatório concede benefícios ou contabiliza interações sociais.\n\nLotes válidos: ${report.acceptedBatches}; rejeitados: ${report.rejectedBatches}; duplicados no arquivo: ${report.duplicateEntries}.\n\nAmostras descartadas ou sem confirmação de envio: ${report.discardedOrUnconfirmed}. Janela truncada: ${Boolean(report.truncated)}.\n\n| Operação | Plataforma | Resultado | Amostras | p50 | p95 | Unidade | Atenção |\n| --- | --- | --- | ---: | ---: | ---: | --- | --- |\n${rows.join("\n") || "| Sem amostras | — | — | 0 | — | — | — | Não interpretar como sucesso |"}\n\nOperações sem amostra: ${report.missingOperations.join(", ") || "nenhuma"}.\n\nOs percentis são separados por resultado; cancelamentos e falhas não contam como sucesso rápido. Contagem de documentos retornados não mede a fatura. Para custo e disponibilidade, correlacionar com métricas oficiais do provedor.\n`;
}

async function fetchLogs(project, hours) {
  if (project !== JSON.parse(readFileSync(join(root, ".firebaserc"), "utf8")).projects.default)
    throw new Error("Projeto diferente do configurado.");
  const require = createRequire(import.meta.url);
  const { getAccessToken, getGlobalDefaultAccount } = require("firebase-tools/lib/auth");
  const account = getGlobalDefaultAccount();
  if (!account?.tokens?.refresh_token) throw new Error("Autenticação do operador ausente.");
  const token = await getAccessToken(account.tokens.refresh_token, []);
  const since = new Date(Date.now() - hours * 3600000).toISOString();
  let pageToken;
  const entries = [];
  for (let page = 0; page < 5; page++) {
    const response = await fetch("https://logging.googleapis.com/v2/entries:list", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token.access_token}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(10000),
      body: JSON.stringify({
        resourceNames: [`projects/${project}`],
        filter: `jsonPayload.event="folko.operation_metrics" AND timestamp>="${since}"`,
        orderBy: "timestamp desc",
        pageSize: 200,
        ...(pageToken ? { pageToken } : {}),
      }),
    });
    if (!response.ok) throw new Error("Falha autorizada de leitura de logs.");
    const body = await response.json();
    entries.push(...(body.entries ?? []));
    pageToken = body.nextPageToken;
    if (!pageToken) break;
  }
  return {
    entries,
    truncated: Boolean(pageToken),
    window: { since, until: new Date().toISOString() },
  };
}

async function main(args) {
  const option = (name) => {
    const index = args.indexOf(name);
    return index < 0 ? undefined : args[index + 1];
  };
  const input = option("--input");
  if ((!input && !args.includes("--fetch")) || (input && args.includes("--fetch")))
    throw new Error("Informe uma fonte de relatório.");
  let data;
  if (input) {
    const location = resolve(input);
    if (statSync(location).size > 8 * 1024 * 1024) throw new Error("Arquivo grande demais.");
    const parsed = JSON.parse(readFileSync(location, "utf8"));
    data = {
      entries: Array.isArray(parsed) ? parsed : parsed.entries,
      truncated: Boolean(parsed.truncated),
    };
  } else {
    const hours = Number(option("--since-hours") ?? 24);
    if (!Number.isInteger(hours) || hours < 1 || hours > 168) throw new Error("Janela inválida.");
    data = await fetchLogs(option("--project"), hours);
  }
  const report = {
    ...summarizeOperationLogs(data.entries),
    truncated: data.truncated,
    ...(data.window ? { window: data.window } : {}),
  };
  const output = resolve(
    option("--output") ?? join(root, "output/testes/metricas-operacionais/resumo"),
  );
  if (!output.startsWith(root + sep)) throw new Error("Saída deve ficar no projeto.");
  let parent = dirname(output);
  while (!existsSync(parent)) parent = dirname(parent);
  const resolvedParent = realpathSync(parent);
  if (resolvedParent !== root && !resolvedParent.startsWith(root + sep))
    throw new Error("Destino fora do projeto.");
  mkdirSync(dirname(output), { recursive: true });
  writeFileSync(output + ".json", JSON.stringify(report, null, 2) + "\n");
  writeFileSync(output + ".md", renderOperationMetricsMarkdown(report));
  console.log(
    JSON.stringify({
      report: relative(root, output + ".md"),
      acceptedBatches: report.acceptedBatches,
      metrics: report.metrics.length,
      truncated: report.truncated,
    }),
  );
}
if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  main(process.argv.slice(2)).catch(() => {
    console.error(
      "Não foi possível gerar o diagnóstico. Verifique formato, autenticação, projeto e permissões. Nenhum payload privado foi impresso.",
    );
    process.exitCode = 1;
  });
