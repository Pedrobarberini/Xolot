import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export function secretIndicators(source) {
  const patterns = {
    privateKey: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    serviceAccount: /"type"\s*:\s*"service_account"/,
    awsCredential: /\b(?:AKIA|ASIA)[A-Z0-9]{16}\b/,
    githubCredential: /\b(?:gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{50,})\b/,
    paymentCredential: /\b(?:APP_USR|TEST)-\d{10,}-\d{6}-[A-Za-z0-9]{16,}-\d+\b/,
    privateClientEnvironment:
      /EXPO_PUBLIC_[A-Z0-9_]*(?:SECRET|PRIVATE_KEY|ACCESS_TOKEN|ACCESS_KEY|PASSWORD)[A-Z0-9_]*/,
  };
  return Object.entries(patterns)
    .filter(([, pattern]) => pattern.test(source))
    .map(([kind]) => kind);
}

function scan() {
  const paths = execFileSync(
    "git",
    ["ls-files", "--cached", "--others", "--exclude-standard", "-z"],
    { encoding: "utf8", maxBuffer: 8 * 1024 * 1024 },
  )
    .split("\0")
    .filter(Boolean);
  if (process.argv.includes("--dist")) {
    const collect = (directory) => {
      if (!existsSync(directory)) return;
      for (const entry of readdirSync(directory, { withFileTypes: true })) {
        const path = join(directory, entry.name);
        if (entry.isDirectory()) collect(path);
        else paths.push(path);
      }
    };
    collect("dist");
  }
  const findings = [];
  let checked = 0;
  for (const path of paths) {
    if (!/\.(?:[cm]?[jt]sx?|mts|json|ya?ml|rules|md|html|map)$/.test(path) || !existsSync(path))
      continue;
    checked++;
    for (const kind of secretIndicators(readFileSync(path, "utf8"))) findings.push({ path, kind });
  }
  // Apenas nomes dos campos do ambiente são inspecionados; os valores não saem do arquivo.
  if (existsSync(".env"))
    for (const line of readFileSync(".env", "utf8").split(/\r?\n/)) {
      const name = line.match(/^\s*([A-Z][A-Z0-9_]+)\s*=/)?.[1];
      if (name) for (const kind of secretIndicators(name)) findings.push({ path: ".env", kind });
    }
  console.log(
    JSON.stringify(
      {
        checked,
        findings,
        note: "Busca por padrões conhecidos; não substitui rotação, IAM ou análise do histórico.",
      },
      null,
      2,
    ),
  );
  if (findings.length) process.exitCode = 1;
}
if (resolve(process.argv[1] ?? "") === fileURLToPath(import.meta.url)) scan();
