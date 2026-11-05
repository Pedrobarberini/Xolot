import { readdirSync, readFileSync, writeFileSync, existsSync } from "node:fs";
import { join } from "node:path";
import prettier from "prettier";

// Caminhos legados saem da exceção quando forem movidos para sua funcionalidade.
const legacy = new Set(JSON.parse(readFileSync("config/format-legacy-files.json", "utf8")));
const files = [];
function collect(directory) {
  if (!existsSync(directory)) return;
  for (const entry of readdirSync(directory, { withFileTypes: true })) {
    const file = join(directory, entry.name).replaceAll("\\", "/");
    if (entry.isDirectory()) collect(file);
    else if (/\.(?:[cm]?[jt]sx?|json)$/.test(file) && !legacy.has(file)) files.push(file);
  }
}
for (const root of [
  "src",
  "functions/src",
  "functions/scripts",
  "scripts",
  "tests",
  "config",
  "contracts",
])
  collect(root);
for (const file of ["eslint.config.mjs", "jest.config.cjs", "firebase.emulators.json"])
  if (existsSync(file)) files.push(file);
let failures = 0;
for (const file of files) {
  const source = readFileSync(file, "utf8");
  const options = { ...(await prettier.resolveConfig(file)), filepath: file };
  if (process.argv.includes("--write")) writeFileSync(file, await prettier.format(source, options));
  else if (!(await prettier.check(source, options))) {
    console.error(`Formatação pendente: ${file}`);
    failures++;
  }
}
console.log(
  `${files.length} arquivos novos/migrados verificados; ${legacy.size} caminhos legados registrados.`,
);
if (failures) process.exitCode = 1;
