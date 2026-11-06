import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { test } from "node:test";

// Somente introspecção dos contratos de deploy; nunca chamar os handlers nesta suíte.
if (process.env.GCLOUD_PROJECT && !process.env.GCLOUD_PROJECT.startsWith("demo-"))
  throw new Error("Introspecção de teste exige projeto demo.");
process.env.GCLOUD_PROJECT = "demo-xolot-functions";
const require = createRequire(import.meta.url);
const before = JSON.parse(
  readFileSync(new URL("../../config/functions-exports.json", import.meta.url)),
);

test("entrypoint conserva todos os endpoints, triggers, regiões, segredos e opções", () => {
  const functions = require("../../functions/lib/index.js");
  const actual = Object.fromEntries(
    Object.entries(functions)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([name, fn]) => [name, JSON.parse(JSON.stringify(fn.__endpoint ?? fn.__trigger))]),
  );
  assert.deepEqual(actual, before);
  assert.equal(Object.keys(actual).length, 25);
});

test("bootstrap pode ser recarregado sem criar outro Admin App", () => {
  const { getApps, getApp } = require("firebase-admin/app");
  const previous = getApp();
  const count = getApps().length;
  delete require.cache[require.resolve("../../functions/lib/bootstrap/admin.js")];
  require("../../functions/lib/bootstrap/admin.js");
  assert.equal(getApps().length, count);
  assert.equal(getApp(), previous);
});
