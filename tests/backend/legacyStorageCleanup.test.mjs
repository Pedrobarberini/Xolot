import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";
const require = createRequire(import.meta.url);
const { deleteLegacyStorage } = require("../../functions/lib/accountDeletion.js");

test("bucket legado ausente não impede exclusão em projeto R2; falhas reais continuam visíveis", async () => {
  const bucket = (code) => ({
    deleteFiles: async () => {
      throw Object.assign(new Error("synthetic"), { code });
    },
    file: () => ({ delete: async () => undefined }),
  });
  await deleteLegacyStorage("synthetic", bucket(404));
  await assert.rejects(
    deleteLegacyStorage("synthetic", bucket(403)),
    (error) => error.code === 403,
  );
  await assert.rejects(
    deleteLegacyStorage("synthetic", bucket("ETIMEDOUT")),
    (error) => error.code === "ETIMEDOUT",
  );
});
