import assert from "node:assert/strict";
import test from "node:test";
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
const {
  assertInteractionPolicy,
} = require("../../functions/lib/modules/safety/domain/interactionPolicy.js");

test("bloqueio impede interação nos dois sentidos sem revelar quem bloqueou", () => {
  const blocked = { ownerUid: "alice", blockedProfileIds: ["profile-bruno"] };
  for (const pair of [
    ["alice", "bruno", blocked, undefined],
    ["bruno", "alice", undefined, blocked],
  ])
    assert.throws(
      () => assertInteractionPolicy(...pair),
      (error) => error instanceof Error && "code" in error && error.code === "permission-denied",
    );
  assert.doesNotThrow(() => assertInteractionPolicy("alice", "carla", blocked, undefined));
  assert.doesNotThrow(() => assertInteractionPolicy("alice", "alice", blocked, blocked));
});

test("preferência inválida falha fechada e preferência legada ausente permanece compatível", () => {
  for (const bad of [
    { ownerUid: "wrong" },
    { blockedProfileIds: "profile-bruno" },
    { blockedProfileIds: [4] },
    { blockedProfileIds: Array(501).fill("x") },
  ])
    assert.throws(() => assertInteractionPolicy("alice", "bruno", bad, undefined));
  assert.doesNotThrow(() => assertInteractionPolicy("alice", "bruno", {}, undefined));
});
