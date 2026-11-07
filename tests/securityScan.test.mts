import assert from "node:assert/strict";
import test from "node:test";
import { secretIndicators } from "../scripts/security-scan.mjs";
test("configuração pública Firebase/reCAPTCHA é permitida; segredo real no cliente é rejeitado sem exibi-lo", () => {
  assert.deepEqual(
    secretIndicators(
      "EXPO_PUBLIC_FIREBASE_API_KEY=public\nEXPO_PUBLIC_FIREBASE_APPCHECK_SITE_KEY=public",
    ),
    [],
  );
  assert.deepEqual(secretIndicators("EXPO_PUBLIC_R2_" + "SECRET_ACCESS_KEY"), [
    "privateClientEnvironment",
  ]);
  assert.deepEqual(secretIndicators("-----BEGIN " + "PRIVATE KEY-----"), ["privateKey"]);
  assert.deepEqual(secretIndicators("ghp_" + "a".repeat(36)), ["githubCredential"]);
});
