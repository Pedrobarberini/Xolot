import assert from "node:assert/strict";
import test from "node:test";
import { appCheckPolicy, createAppCheckInitializer } from "../src/config/appCheckPolicy.ts";
test("CAPTCHA obrigatório nunca inicia silenciosamente sem site key/provedor compatível", () => {
  assert.equal(appCheckPolicy("web", undefined, false), null);
  assert.equal(appCheckPolicy("ios", "public-site-key", false), null);
  assert.throws(() => appCheckPolicy("web", " ", true), /configurada/);
  assert.throws(() => appCheckPolicy("android", "key", true), /configurada/);
  assert.deepEqual(appCheckPolicy("web", " public-site-key ", true), {
    siteKey: "public-site-key",
  });
});
test("App Check inicializa uma vez; falha real continua visível e pode ser repetida", () => {
  let calls = 0;
  const start = createAppCheckInitializer(() => {
    calls++;
    if (calls === 1) throw new Error("SDK");
  });
  const config = appCheckPolicy("web", "public", true);
  assert.throws(() => start(config), /iniciar a verificação/);
  start(config);
  start(config);
  start(null);
  assert.equal(calls, 2);
});
