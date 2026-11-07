import assert from "node:assert/strict";
import test from "node:test";
import { appCheckPolicy } from "../src/config/appCheckPolicy.ts";
import {
  appCheckRequiredForPlatform,
  firebaseApiKeyForPlatform,
} from "../src/config/firebaseClientPolicy.ts";

test("chave restrita web não substitui a chave de clientes nativos", () => {
  assert.equal(firebaseApiKeyForPlatform("web", " shared ", " web-only "), "web-only");
  for (const platform of ["android", "ios"]) {
    assert.equal(firebaseApiKeyForPlatform(platform, " shared ", "web-only"), "shared");
    assert.equal(firebaseApiKeyForPlatform(platform, undefined, "web-only"), undefined);
  }
});

test("web sem chave específica preserva configuração legada e valida ausência", () => {
  assert.equal(firebaseApiKeyForPlatform("web", "shared", undefined), "shared");
  assert.equal(firebaseApiKeyForPlatform("web", "shared", "  "), "shared");
  assert.equal(firebaseApiKeyForPlatform("web", undefined, "web-only"), "web-only");
  assert.equal(firebaseApiKeyForPlatform("web", undefined, undefined), undefined);
});

test("rollout web obrigatório não exige provedor nativo", () => {
  assert.equal(appCheckRequiredForPlatform("web", false, true), true);
  for (const platform of ["android", "ios"]) {
    const required = appCheckRequiredForPlatform(platform, false, true);
    assert.equal(required, false);
    assert.equal(appCheckPolicy(platform, "public-web-site-key", required), null);
  }
});

test("exigência global explícita conserva falha para provedor nativo incompatível", () => {
  for (const platform of ["web", "android", "ios"]) {
    assert.equal(appCheckRequiredForPlatform(platform, true, false), true);
  }
  assert.throws(
    () =>
      appCheckPolicy(
        "android",
        "public-web-site-key",
        appCheckRequiredForPlatform("android", true, true),
      ),
    /configurada/,
  );
  assert.equal(appCheckRequiredForPlatform("web", false, false), false);
});
