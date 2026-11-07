import assert from "node:assert/strict";
import { createRequire } from "node:module";
import test from "node:test";

const require = createRequire(import.meta.url);
const {
  getVerifiedRequestContext,
  getAdminRequestContext,
  assertResourceOwner,
  assertRecentAuthentication,
} = require("../../functions/lib/auth.js");
const { requireCommandRecord, requireDocumentId } = require("../../functions/lib/validation.js");
const { mediaCommandFields } = require("../../functions/lib/modules/posts/mediaCommandFields.js");
const request = (token = {}, data = {}) => ({
  auth: { uid: "CaseUID", token: { email_verified: true, auth_time: 1000, ...token } },
  data,
});
const codeIs = (expected) => (error) => error?.code === expected;

test("contexto vem do token e não de UID, email ou papel enviado no payload", () => {
  const context = getVerifiedRequestContext(
    request({}, { uid: "another", role: "Admin", admin: true }),
  );
  assert.deepEqual(context, { uid: "CaseUID", authTimeSeconds: 1000, isAdmin: false });
  assert.equal(Object.isFrozen(context), true);
  assert.throws(() => getVerifiedRequestContext({}), codeIs("unauthenticated"));
  assert.throws(
    () => getVerifiedRequestContext(request({ email_verified: false })),
    codeIs("permission-denied"),
  );
  assert.throws(
    () =>
      getVerifiedRequestContext({ auth: { uid: "other/path", token: { email_verified: true } } }),
    codeIs("unauthenticated"),
  );
});

test("papel administrativo exige claim booleana confiável e email confirmado", () => {
  for (const token of [{ admin: false }, { admin: "true" }, { role: "Admin" }])
    assert.throws(
      () => getAdminRequestContext(request(token, { admin: true })),
      codeIs("permission-denied"),
    );
  assert.equal(getAdminRequestContext(request({ admin: true })).isAdmin, true);
  assert.throws(
    () => getAdminRequestContext(request({ admin: true, email_verified: false })),
    codeIs("permission-denied"),
  );
});

test("ownership não normaliza caixa nem aceita dados de proprietário ausentes", () => {
  const context = getVerifiedRequestContext(request());
  assertResourceOwner(context, "CaseUID", "Esta publicação pertence a outra conta.");
  for (const owner of ["another", "caseuid", undefined, { uid: "CaseUID" }])
    assert.throws(
      () => assertResourceOwner(context, owner, "Esta publicação pertence a outra conta."),
      (error) =>
        error.code === "permission-denied" &&
        error.message === "Esta publicação pertence a outra conta.",
    );
});

test("exclusão conserva janela de dez minutos e recusa auth_time inválido/antigo ou muito futuro", () => {
  const context = getVerifiedRequestContext(request());
  assertRecentAuthentication(context, 1600);
  assert.throws(() => assertRecentAuthentication(context, 1601), codeIs("failed-precondition"));
  for (const auth_time of [undefined, 0, "1000", Number.NaN, 5000])
    assert.throws(
      () => assertRecentAuthentication(getVerifiedRequestContext(request({ auth_time })), 1500),
      codeIs("failed-precondition"),
    );
});

test("comandos de mídia aceitam o contrato atual e rejeitam campos de sistema", () => {
  const fixtures = {
    create: {
      fileName: "photo.png",
      fileSize: 10,
      mediaType: "image",
      mimeType: "image/png",
      postId: "post-1",
    },
    finalize: {
      description: "Descrição",
      durationMs: 0,
      height: 100,
      mentions: [],
      tags: [],
      title: "Foto",
      uploadId: "upload-1",
      width: 100,
    },
    delete: { postId: "post-1" },
  };
  for (const name of Object.keys(fixtures)) {
    assert.equal(requireCommandRecord(fixtures[name], mediaCommandFields[name]), fixtures[name]);
    for (const key of ["role", "authorId", "ownerUid", "status", "identityVerified", "plusActive"])
      assert.throws(
        () => requireCommandRecord({ ...fixtures[name], [key]: true }, mediaCommandFields[name]),
        codeIs("invalid-argument"),
      );
  }
});

test("payload tem limite UTF-8 e identificadores não atravessam caminhos", () => {
  assert.doesNotThrow(() => requireCommandRecord({ title: "a".repeat(600) }, ["title"], 1024));
  assert.throws(
    () => requireCommandRecord({ title: "á".repeat(600) }, ["title"], 1024),
    codeIs("invalid-argument"),
  );
  const cyclic = {};
  cyclic.loop = cyclic;
  assert.throws(() => requireCommandRecord(cyclic, ["loop"]), codeIs("invalid-argument"));
  assert.equal(requireDocumentId("Case_1", "ID"), "Case_1");
  for (const value of ["../other", "post/child", " id ", "\n", ".", "..", "a".repeat(129)])
    assert.throws(() => requireDocumentId(value, "ID"), codeIs("invalid-argument"));
  assert.throws(() => requireDocumentId("a".repeat(81), "Upload", 80), codeIs("invalid-argument"));
});

test("exclusão usa UID autenticado e não chama a porta Auth em sessão inválida", async () => {
  const { createDeleteOwnAccountHandler } = require("../../functions/lib/accountDeletion.js");
  const deleted = [];
  const deleteOwnAccount = createDeleteOwnAccountHandler(async (uid) => {
    deleted.push(uid);
  });
  const now = Math.floor(Date.now() / 1000);
  assert.deepEqual(
    await deleteOwnAccount(request({ auth_time: now }, { uid: "another", role: "Admin" })),
    { deleted: true },
  );
  assert.deepEqual(deleted, ["CaseUID"]);
  for (const invalid of [
    request({ auth_time: now - 1000 }),
    request({ email_verified: false }),
    {},
  ])
    await assert.rejects(deleteOwnAccount(invalid));
  assert.deepEqual(deleted, ["CaseUID"]);
});
