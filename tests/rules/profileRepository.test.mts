import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { after, before, beforeEach, test } from "node:test";
import { initializeTestEnvironment, type RulesTestEnvironment } from "@firebase/rules-unit-testing";
import { initializeApp, deleteApp, type FirebaseApp } from "firebase/app";
import { connectFirestoreEmulator, getFirestore, Timestamp } from "firebase/firestore";
import { createFirebaseProfileRepository } from "../../src/features/profiles/data/firebaseProfileRepository.ts";
import {
  createProfileCommands,
  normalizeProfileWrite,
} from "../../src/features/profiles/application/saveProfile.ts";
import {
  UsernameAlreadyInUseError,
  InvalidPublicProfileError,
} from "../../src/features/profiles/domain/errors.ts";
import { assertRulesTarget, rulesProject } from "../../scripts/rules-target.mjs";

assertRulesTarget(process.env);
let environment: RulesTestEnvironment;
const clients: FirebaseApp[] = [];
const form = {
  age: 25,
  bio: "Perfil sintético para testes",
  city: "São Paulo",
  club: "",
  interestTags: ["treino"],
  name: "Pessoa Sintética",
  position: "Atleta",
  sport: "Futebol",
  username: "nome.disputado",
};
function actor(uid: string) {
  const app = initializeApp({ projectId: rulesProject }, `profile-repository-${clients.length}`);
  clients.push(app);
  const db = getFirestore(app);
  connectFirestoreEmulator(db, "127.0.0.1", 8085, {
    mockUserToken: { sub: uid, email_verified: true, firebase: { sign_in_provider: "password" } },
  });
  const repository = createFirebaseProfileRepository(() => db);
  return {
    repository,
    ...createProfileCommands({ repository, currentIdentity: () => ({ uid, emailVerified: true }) }),
  };
}
before(async () => {
  environment = await initializeTestEnvironment({
    projectId: rulesProject,
    firestore: { host: "127.0.0.1", port: 8085, rules: readFileSync("firestore.rules", "utf8") },
  });
});
after(async () => {
  await Promise.all(clients.map((app) => deleteApp(app)));
  await environment?.cleanup();
});
beforeEach(async () => {
  await environment.clearFirestore();
  await environment.withSecurityRulesDisabled(async (context) => {
    for (const uid of ["alice", "bruno"])
      await context.firestore().doc(`accounts/${uid}`).set({ uid });
  });
});

test("cadastro e edição aceitam área vazia com múltiplas hashtags sem alterar a reserva", async () => {
  const alice = actor("alice");
  await alice.save("alice", { ...form, sport: "", interestTags: ["arte", "tecnologia"] });
  const created = await alice.repository.read("alice");
  assert.equal(created?.sport, "");
  assert.deepEqual(created?.interestTags, ["arte", "tecnologia"]);
  await alice.save("alice", {
    ...form,
    sport: "",
    interestTags: ["arte", "musica"],
    bio: "Biografia atualizada sem categoria duplicada",
  });
  const updated = await alice.repository.read("alice");
  assert.equal(updated?.sport, "");
  assert.deepEqual(updated?.interestTags, ["arte", "musica"]);
  assert.equal(updated?.username, form.username);
});

test("dois clientes disputam username: somente um perfil e uma reserva são gravados", async () => {
  const alice = actor("alice"),
    bruno = actor("bruno");
  const results = await Promise.allSettled([alice.save("alice", form), bruno.save("bruno", form)]);
  assert.equal(results.filter((result) => result.status === "fulfilled").length, 1);
  const failure = results.find((result) => result.status === "rejected");
  assert.ok(
    failure?.status === "rejected" && failure.reason instanceof UsernameAlreadyInUseError,
    failure?.status === "rejected"
      ? JSON.stringify({ name: failure.reason?.name, code: failure.reason?.code })
      : "faltou conflito",
  );
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    const reservation = (await db.doc("usernames/nome.disputado").get()).data();
    const profiles = await db.collection("profiles").get();
    assert.equal(profiles.size, 1);
    assert.equal(profiles.docs[0].id, reservation?.uid);
    assert.equal(profiles.docs[0].data().username, "nome.disputado");
  });
});

test("renomear e repetir conserva criação e campos de selo; libera nome antigo atomicamente", async () => {
  const alice = actor("alice");
  await alice.save("alice", { ...form, username: "nome.antigo" });
  let created!: { seconds: number; nanoseconds: number };
  await environment.withSecurityRulesDisabled(async (context) => {
    const ref = context.firestore().doc("profiles/alice");
    await ref.update({ identityVerified: true, plusActive: true });
    created = (await ref.get()).data()?.createdAt;
  });
  await alice.save("alice", form, "https://example.test/avatar.png");
  await alice.save("alice", form, "https://example.test/avatar.png");
  const read = await actor("alice").repository.read("alice");
  assert.equal(read?.username, "nome.disputado");
  assert.equal(read?.identityVerified, true);
  assert.equal(read?.plusActive, true);
  assert.equal(read?.photoURL, "https://example.test/avatar.png");
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    assert.equal((await db.doc("usernames/nome.antigo").get()).exists, false);
    const current = (await db.doc("profiles/alice").get()).data();
    assert.ok(current?.createdAt.isEqual(created));
    assert.equal((await db.doc("usernames/nome.disputado").get()).data()?.uid, "alice");
  });
});

test("nome reservado ou reserva antiga alheia não deixa alteração parcial", async () => {
  const alice = actor("alice"),
    bruno = actor("bruno");
  await alice.save("alice", { ...form, username: "nome.alice" });
  await bruno.save("bruno", { ...form, username: "nome.bruno" });
  await assert.rejects(
    alice.save("alice", { ...form, username: "nome.bruno" }),
    UsernameAlreadyInUseError,
  );
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    assert.equal((await db.doc("profiles/alice").get()).data()?.username, "nome.alice");
    assert.equal((await db.doc("usernames/nome.alice").get()).data()?.uid, "alice");
    await db.doc("usernames/nome.alice").set({ uid: "bruno", createdAt: Timestamp.fromMillis(0) });
  });
  await assert.rejects(
    alice.save("alice", { ...form, username: "outro.nome" }),
    InvalidPublicProfileError,
  );
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    assert.equal((await db.doc("profiles/alice").get()).data()?.username, "nome.alice");
    assert.equal((await db.doc("usernames/outro.nome").get()).exists, false);
  });
});

test("negação real das Rules mantém permission-denied e não é convertida em conflito de nome", async () => {
  const alice = actor("alice");
  await alice.save("alice", form);
  // Exercita a defesa do banco mesmo se um consumidor contornar a validação da aplicação.
  await assert.rejects(
    alice.repository.saveWithUsername({ ...normalizeProfileWrite("alice", form), bio: "x" }),
    (error: unknown) =>
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "permission-denied",
  );
  assert.equal((await alice.repository.read("alice"))?.bio, form.bio);
});
