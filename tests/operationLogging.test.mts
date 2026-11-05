import assert from "node:assert/strict";
import test from "node:test";
import { failureEvent as clientEvent } from "../src/shared/observability/failureEvent.ts";
import { failureEvent as backendEvent } from "../functions/src/platform/failureEvent.ts";

const id = "12345678-1234-4321-9876-123456789abc";
for (const [name, event] of [
  ["cliente", clientEvent],
  ["backend", backendEvent],
] as const) {
  test(`${name}: esperado e inesperado são distinguíveis sem copiar dados privados`, () => {
    const privateData = {
      code: "functions/permission-denied",
      message: "token=secret https://example.test/object?signature=private",
      stack: "CPF: 000.000.000-00",
      identity: { document: "private" },
      uid: "private-user",
    };
    const expected = event("cache.load", privateData, id);
    assert.deepEqual(expected, {
      operation: "cache.load",
      correlationId: id,
      outcome: "failure",
      code: "permission-denied",
      expected: true,
    });
    const unknown = event("media.upload.sign", new Error(privateData.message), id);
    assert.equal(unknown.expected, false);
    assert.equal(unknown.code, "internal");
    for (const forbidden of ["secret", "signature", "CPF", "identity", "private-user"])
      assert.ok(!JSON.stringify([expected, unknown]).includes(forbidden));
  });
  test(`${name}: código e correlação maliciosos não ampliam campos de log`, () => {
    const result = event(
      "cache.save",
      { code: "secret-query-string", user: "private" },
      "token=private",
    );
    assert.equal(result.correlationId, "unavailable");
    assert.equal(result.code, "internal");
    assert.deepEqual(Object.keys(result).sort(), [
      "code",
      "correlationId",
      "expected",
      "operation",
      "outcome",
    ]);
  });
}

test("adaptadores dos dois pacotes seguem o mesmo protocolo fechado de erro", () => {
  for (const error of [
    null,
    undefined,
    "private",
    1,
    { code: "unavailable" },
    { code: "invalid-argument" },
  ])
    assert.deepEqual(clientEvent("cache.load", error, id), backendEvent("cache.load", error, id));
});
