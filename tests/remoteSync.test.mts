import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const postService = readFileSync(
  new URL("../src/services/firebasePostService.ts", import.meta.url),
  "utf8"
);
const profileService = readFileSync(
  new URL("../src/features/profiles/data/firebaseProfileReader.ts", import.meta.url),
  "utf8"
);

test("consulta pública inclui perfis legados e reels inválidos geram diagnóstico", () => {
  assert.equal(profileService.includes('orderBy("updatedAt", "desc")'), false);
  assert.match(postService, /onWarning\?: \(warning: Error\) => void/);
  assert.match(postService, /invalidDocuments \+ unavailableMedia/);
});
