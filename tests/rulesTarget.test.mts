import assert from "node:assert/strict";
import test from "node:test";
import { assertRulesTarget, rulesProject } from "../scripts/rules-target.mjs";

test("Rules recusa projeto real e endpoint remoto antes de criar clientes", () => {
  assert.throws(() => assertRulesTarget({ GCLOUD_PROJECT: "real-project" }, false));
  assert.throws(() => assertRulesTarget({ FIRESTORE_EMULATOR_HOST: "remote.test:8085" }, false));
  assert.throws(() => assertRulesTarget({}));
  assert.throws(() =>
    assertRulesTarget({ FIREBASE_STORAGE_EMULATOR_HOST: "127.0.0.1:9199" }, false),
  );
  assert.throws(() =>
    assertRulesTarget({ FIREBASE_AUTH_EMULATOR_HOST: "remote.test:9095" }, false),
  );
  assert.doesNotThrow(() =>
    assertRulesTarget({
      GCLOUD_PROJECT: rulesProject,
      FIRESTORE_EMULATOR_HOST: "127.0.0.1:8085",
      FIREBASE_STORAGE_EMULATOR_HOST: "127.0.0.1:9195",
      FIREBASE_AUTH_EMULATOR_HOST: "127.0.0.1:9095",
    }),
  );
});
