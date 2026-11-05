import assert from "node:assert/strict";
import test from "node:test";
import { validateCursor, InvalidQueryCursorError } from "../src/shared/primitives/pagination.ts";

const cursor = {
  version: 1,
  queryId: "feed",
  scope: null,
  documentId: "post-1",
  value: { kind: "timestamp", seconds: 1000, nanoseconds: 123456789 },
};
test("cursor mantém nanos e não pode ser reaproveitado em outro filtro, versão ou consulta", () => {
  assert.deepEqual(validateCursor(cursor, "feed", null, "timestamp"), cursor);
  for (const other of [
    { ...cursor, version: 2 },
    { ...cursor, queryId: "authorPosts" },
    { ...cursor, scope: "another" },
    { ...cursor, documentId: "../post" },
    { ...cursor, value: { ...cursor.value, nanoseconds: 1e9 } },
    { ...cursor, value: { kind: "timestamp", seconds: Number.NaN, nanoseconds: 0 } },
    { ...cursor, value: { kind: "string", value: "wrong" } },
  ])
    assert.throws(() => validateCursor(other, "feed", null, "timestamp"), InvalidQueryCursorError);
});
