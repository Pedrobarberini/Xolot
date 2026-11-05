import { ESLint } from "eslint";
import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { relative } from "node:path";

export function compareDiagnostics(current, baseline) {
  const remaining = new Map(baseline.map((item) => [item.fingerprint, item.count]));
  return current.filter((item) => {
    if (item.fatal || item.ruleId === "architecture/boundaries") return true;
    const available = remaining.get(item.fingerprint) ?? 0;
    if (!available) return true;
    remaining.set(item.fingerprint, available - 1);
    return false;
  });
}

async function main() {
  const eslint = new ESLint();
  const results = await eslint.lintFiles([
    "App.tsx",
    "index.ts",
    "src",
    "functions/src",
    "functions/scripts",
    "scripts",
    "tests",
  ]);
  const diagnostics = results.flatMap((result) => {
    const source = result.source ?? readFileSync(result.filePath, "utf8");
    const lines = source.split(/\r?\n/);
    return result.messages.map((message) => {
      const file = relative(process.cwd(), result.filePath).replaceAll("\\", "/");
      const fingerprint = createHash("sha256")
        .update(
          JSON.stringify([file, message.ruleId, message.message, lines[message.line - 1]?.trim()]),
        )
        .digest("hex");
      return {
        fingerprint,
        file,
        ruleId: message.ruleId,
        message: message.message,
        line: message.line,
        fatal: Boolean(message.fatal),
      };
    });
  });
  const baselineFile = "config/lint-baseline.json";
  if (process.argv.includes("--update-baseline")) {
    if (diagnostics.some((item) => item.fatal || item.ruleId === "architecture/boundaries"))
      throw new Error(
        "Não é permitido aceitar erro de parser ou violação de arquitetura no baseline.",
      );
    const legacy = new Set(JSON.parse(readFileSync("config/format-legacy-files.json", "utf8")));
    const newCodeErrors = diagnostics.filter((item) => !legacy.has(item.file));
    if (newCodeErrors.length) {
      for (const item of newCodeErrors)
        console.error(`${item.file}:${item.line} ${item.ruleId}: ${item.message}`);
      throw new Error(
        "Corrija os diagnósticos do código novo; o baseline só registra dívida legada.",
      );
    }
    const counts = new Map();
    for (const item of diagnostics)
      counts.set(item.fingerprint, {
        ...item,
        count: (counts.get(item.fingerprint)?.count ?? 0) + 1,
      });
    mkdirSync("config", { recursive: true });
    writeFileSync(baselineFile, JSON.stringify([...counts.values()], null, 2) + "\n");
    console.log(
      `Dívida existente registrada: ${diagnostics.length} diagnósticos. Alterações no baseline exigem revisão.`,
    );
    return;
  }
  const baseline = existsSync(baselineFile) ? JSON.parse(readFileSync(baselineFile, "utf8")) : [];
  const added = compareDiagnostics(diagnostics, baseline);
  for (const item of added)
    console.error(`${item.file}:${item.line} ${item.ruleId}: ${item.message}`);
  console.log(`${diagnostics.length} diagnósticos existentes; ${added.length} regressões de lint.`);
  if (added.length) process.exitCode = 1;
}

if (process.argv[1]?.replaceAll("\\", "/").endsWith("/scripts/lint.mjs")) await main();
