import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const avatarFunctions = readFileSync(
  new URL("../functions/src/avatar.ts", import.meta.url),
  "utf8",
);
const avatarService = readFileSync(
  new URL("../src/services/firebaseAvatarService.ts", import.meta.url),
  "utf8",
);
const profileActions = readFileSync(
  new URL("../src/actions/useProfileActions.ts", import.meta.url),
  "utf8",
);

test("ajuste de enquadramento atualiza metadados sem reenviar a foto", () => {
  assert.match(avatarFunctions, /export const updateAvatarCrop = protectedOnCall/);
  assert.match(avatarFunctions, /profileMedia\/\$\{uid\}/);
  assert.match(
    avatarFunctions,
    /transaction\.update\(profileMediaReference, \{[\s\S]*cropScale,[\s\S]*focusX,[\s\S]*focusY,[\s\S]*updatedAt:/,
  );
  assert.match(avatarService, /"updateAvatarCrop"/);
  assert.match(profileActions, /canUpdateCropOnly/);
  assert.match(profileActions, /saveFirebaseAvatarCrop\(user\.id, avatarToSave\)/);
});
