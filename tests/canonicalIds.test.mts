import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import test from "node:test";
import {
  authUid,
  postId,
  profileReference,
  uidFromLegacyProfileReference,
  resolvePostReference,
  conversationId,
  userPostIdentity,
} from "../src/shared/primitives/ids.ts";

const digest = async (value: string) => createHash("sha256").update(value, "utf8").digest("hex");

test("identificadores preservam caixa e rejeitam caminhos, vazios e controles", () => {
  assert.equal(authUid("Abc_123"), "Abc_123");
  for (const invalid of [
    "",
    " ",
    "uid/other",
    ".",
    "..",
    " padded",
    "a\0b",
    "x".repeat(129),
    null,
  ]) {
    assert.throws(() => authUid(invalid));
    assert.throws(() => postId(invalid));
  }
});

test("referência legada de perfil faz round-trip sem alterar o UID", () => {
  const uid = authUid("profile-Owner");
  assert.equal(uidFromLegacyProfileReference(profileReference(uid)), uid);
  assert.throws(() => uidFromLegacyProfileReference("Owner"));
});

test("prefixo de publicação só é resolvido com inventário e não oculta colisão", () => {
  assert.deepEqual(resolvePostReference("approved-one", new Set(["one"])), {
    kind: "resolved",
    id: "one",
    source: "legacy",
  });
  assert.deepEqual(resolvePostReference("approved-one", new Set(["approved-one"])), {
    kind: "resolved",
    id: "approved-one",
    source: "canonical",
  });
  assert.deepEqual(resolvePostReference("approved-one", new Set(["approved-one", "one"])), {
    kind: "ambiguous",
    candidates: ["approved-one", "one"],
  });
  assert.deepEqual(resolvePostReference("unknown", new Set()), { kind: "missing" });
  assert.deepEqual(resolvePostReference("bad/path", new Set()), { kind: "invalid" });
});

test("conversa é comutativa, sem colisão por separador e sem autoconversa", async () => {
  const a = authUid("a_b"),
    b = authUid("c");
  const key = await conversationId(a, b, digest);
  assert.equal(key, await conversationId(b, a, digest));
  assert.notEqual(key, await conversationId(authUid("a"), authUid("b_c"), digest));
  assert.match(key, /^v1_[a-f0-9]{64}$/);
  await assert.rejects(conversationId(a, a, digest));
  await assert.rejects(conversationId(a, b, async () => "not-a-hash"));
});

test("deduplicação usa a tupla canônica de usuário/publicação, não soma aliases", () => {
  const uid = authUid("owner");
  const canonical = resolvePostReference("approved-one", new Set(["one"]));
  assert.equal(canonical.kind, "resolved");
  if (canonical.kind !== "resolved") throw new Error("Fixture inválida");
  const selections = new Set([
    userPostIdentity(uid, postId("one")),
    userPostIdentity(uid, canonical.id),
  ]);
  assert.equal(selections.size, 1);
});
