import assert from "node:assert/strict";
import test from "node:test";
import { functionsPackageLock } from "../scripts/functions-package-lock.mjs";

test("pacote Functions conserva versões congeladas e exclui o importer do frontend", () => {
  const source = {
    lockfileVersion: "9.0",
    settings: { autoInstallPeers: true },
    importers: {
      ".": { dependencies: { expo: { specifier: "~54", version: "54.0.35" } } },
      functions: { dependencies: { sdk: { specifier: "^1", version: "1.2.3(peer@1)" } } },
    },
    snapshots: { "sdk@1.2.3(peer@1)": { dependencies: { peer: "1" } } },
  };
  const result = functionsPackageLock(source);
  assert.deepEqual(Object.keys(result.importers), ["."]);
  assert.deepEqual(result.importers["."], source.importers.functions);
  assert.deepEqual(result.snapshots, source.snapshots);
  assert.ok(source.importers["."].dependencies.expo);
  result.importers["."].dependencies.sdk.version = "modified";
  assert.equal(source.importers.functions.dependencies.sdk.version, "1.2.3(peer@1)");
});

test("formato inesperado e dependência local sem pacote são recusados", () => {
  assert.throws(() => functionsPackageLock({ lockfileVersion: "10" }));
  assert.throws(() =>
    functionsPackageLock({
      lockfileVersion: "9.0",
      importers: { functions: { dependencies: { shared: { specifier: "workspace:*" } } } },
    }),
  );
});

test("patch exclusivo do Metro não entra no pacote Functions; patch transitivo do backend exige arquivo próprio", () => {
  const source = {
    lockfileVersion: "9.0",
    importers: { functions: { dependencies: { sdk: { specifier: "^1", version: "1.0.0" } } } },
    patchedDependencies: { "metro@0.83.7": "synthetic-hash" },
    snapshots: { "sdk@1.0.0": { dependencies: { peer: "2.0.0" } }, "peer@2.0.0": {} },
  };
  assert.equal("patchedDependencies" in functionsPackageLock(source), false);
  assert.ok(source.patchedDependencies["metro@0.83.7"]);
  assert.throws(() =>
    functionsPackageLock({ ...source, patchedDependencies: { "peer@2.0.0": "hash" } }),
  );
});
