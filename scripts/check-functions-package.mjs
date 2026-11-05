import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { cpSync, mkdtempSync, readFileSync, realpathSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, isAbsolute, join, relative, resolve } from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import YAML from "yaml";
import { functionsPackageLock } from "./functions-package-lock.mjs";

const repository = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const pnpm = process.env.npm_execpath;
if (!pnpm) throw new Error("Execute com pnpm run test:package:functions.");
const stage = mkdtempSync(join(tmpdir(), "xolot-functions-package-"));
const portable = join(stage, "portable");
const rootModulesFile = join(repository, "node_modules/.modules.yaml");
const originalModules = readFileSync(rootModulesFile, "utf8");

function run(binary, args, cwd) {
  return new Promise((accept, reject) => {
    const child = spawn(binary, args, {
      cwd,
      stdio: "inherit",
      env: { ...process.env, NODE_PATH: "", npm_config_ignore_scripts: "true" },
    });
    child.on("error", reject);
    child.on("exit", (code) =>
      code === 0 ? accept() : reject(new Error(`Comando de empacotamento falhou: ${code}`)),
    );
  });
}

try {
  cpSync(join(repository, "functions"), portable, {
    recursive: true,
    filter: (file) => {
      const path = relative(join(repository, "functions"), file).replaceAll("\\", "/");
      return (
        !path || /^(?:src|scripts)(?:\/|$)/.test(path) || /^(?:package|tsconfig)\.json$/.test(path)
      );
    },
  });
  const sourceLock = YAML.parse(readFileSync(join(repository, "pnpm-lock.yaml"), "utf8"));
  writeFileSync(join(portable, "pnpm-lock.yaml"), YAML.stringify(functionsPackageLock(sourceLock)));
  writeFileSync(join(portable, "pnpm-workspace.yaml"), "packages: ['.']\nnodeLinker: isolated\n");
  const binary = /\.[cm]?js$/.test(pnpm) ? process.execPath : pnpm;
  const prefix = binary === process.execPath ? [pnpm] : [];
  await run(
    binary,
    [...prefix, "install", "--frozen-lockfile", "--ignore-scripts", "--prod"],
    portable,
  );
  // O compilador é ferramenta; imports e tipos precisam resolver a partir do pacote isolado.
  await run(
    process.execPath,
    [
      join(repository, "node_modules/typescript/bin/tsc"),
      "--project",
      join(portable, "tsconfig.json"),
    ],
    portable,
  );
  await run(
    process.execPath,
    [fileURLToPath(new URL("./smoke-functions.cjs", import.meta.url)), portable],
    portable,
  );
  const requirePortable = createRequire(join(portable, "package.json"));
  for (const dependency of ["firebase-admin/app", "firebase-functions/v2/https", "mercadopago"])
    assert.ok(requirePortable.resolve(dependency));
  console.log("Functions: compilação e carga isoladas aprovadas, sem executar handlers.");
} finally {
  // Apenas o diretório temporário exclusivo desta execução pode ser removido.
  const resolvedStage = realpathSync(stage);
  const inside = relative(realpathSync(tmpdir()), resolvedStage);
  if (!inside || inside.startsWith("..") || isAbsolute(inside))
    throw new Error("Limpeza recusada: diretório fora do temporário.");
  rmSync(resolvedStage, { recursive: true, force: true });
  assert.equal(
    readFileSync(rootModulesFile, "utf8"),
    originalModules,
    "Instalação raiz foi alterada",
  );
}
