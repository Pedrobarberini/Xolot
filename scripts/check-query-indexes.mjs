import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { queryCatalog } from "../src/config/queryCatalog.ts";

const actual = JSON.parse(readFileSync("firestore.indexes.json", "utf8"));
const key = (index) => JSON.stringify([index.collectionGroup, index.queryScope, index.fields]);
const expected = Object.values(queryCatalog)
  .filter((query) => query.indexFields)
  .map((query) => ({
    collectionGroup: query.collection,
    queryScope: "COLLECTION",
    fields: query.indexFields.map(([fieldPath, order]) => ({ fieldPath, order })),
  }));
assert.deepEqual(actual.indexes.map(key).sort(), expected.map(key).sort());
assert.ok(actual.indexes.every((index) => index.queryScope === "COLLECTION"));
console.log(
  `${Object.keys(queryCatalog).length} consultas; ${expected.length} índices compostos candidatos conferidos, sem deploy.`,
);
