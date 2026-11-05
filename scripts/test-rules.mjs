import { spawn } from "node:child_process";
import { assertRulesTarget, rulesProject } from "./rules-target.mjs";

assertRulesTarget(process.env, false);
if (process.argv.length > 2) throw new Error("test:rules não aceita substituir o alvo.");
async function buildStep(args) {
  const code = await new Promise((accept, reject) => {
    const buildProcess = spawn(process.execPath, args, { stdio: "inherit" });
    buildProcess.on("error", reject);
    buildProcess.on("exit", (code) => accept(code ?? 1));
  });
  if (code !== 0) throw new Error(`Build local do backend falhou: ${code}`);
}
await buildStep(["functions/scripts/clean-lib.cjs"]);
await buildStep(["node_modules/typescript/bin/tsc", "--project", "functions/tsconfig.json"]);
const child = spawn(
  process.execPath,
  [
    "node_modules/firebase-tools/lib/bin/firebase.js",
    "emulators:exec",
    "--only",
    "auth,firestore,storage",
    "--project",
    rulesProject,
    "--config",
    "firebase.emulators.json",
    "node --test --test-concurrency=1 tests/rules/*.test.mts",
  ],
  { stdio: "inherit", env: { ...process.env, GCLOUD_PROJECT: rulesProject } },
);
child.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
child.on("exit", (code) => {
  process.exitCode = code ?? 1;
});
