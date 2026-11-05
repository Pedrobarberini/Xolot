import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { after, before, test } from "node:test";
import { initializeApp, deleteApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";
import { createFirebaseAccountGateway } from "../../src/features/auth/data/firebaseAccountGateway.ts";
import { createFirebaseSessionRepository } from "../../src/features/auth/data/firebaseSessionRepository.ts";
import { createFirebaseProfileReader } from "../../src/features/profiles/data/firebaseProfileReader.ts";
import { createSessionController } from "../../src/features/auth/application/sessionController.ts";
import { EmailVerificationRequiredError } from "../../src/features/auth/domain/errors.ts";
import { assertRulesTarget, rulesProject } from "../../scripts/rules-target.mjs";

assertRulesTarget(process.env);
const require = createRequire(import.meta.url);
const adminApp = require("firebase-admin/app") as typeof import("firebase-admin/app");
const adminAuth = require("firebase-admin/auth") as typeof import("firebase-admin/auth");
const adminFirestore =
  require("firebase-admin/firestore") as typeof import("firebase-admin/firestore");
const backend = adminApp.initializeApp({ projectId: rulesProject }, "auth-session-admin");
const database = adminFirestore.getFirestore(backend);
database.settings({ host: "127.0.0.1:8085", ssl: false });
const admin = adminAuth.getAuth(backend);
const client = initializeApp(
  { projectId: rulesProject, apiKey: "demo-only", authDomain: `${rulesProject}.firebaseapp.com` },
  "auth-session-client",
);
const auth = getAuth(client);
connectAuthEmulator(auth, "http://127.0.0.1:9095", { disableWarnings: true });
const firestore = getFirestore(client);
connectFirestoreEmulator(firestore, "127.0.0.1", 8085);
const accounts = createFirebaseAccountGateway({
  getFirebaseAuth: () => auth,
  getFirebaseFirestore: () => firestore,
  getFirebaseFunctions: () => {
    throw new Error("Este teste não usa callables implantados.");
  },
  getPublicAppUrl: () => "http://localhost",
  isFirebaseConfigured: () => true,
});
const repository = createFirebaseSessionRepository({
  accounts,
  profiles: createFirebaseProfileReader(() => firestore),
  isAvailable: () => true,
});
const controller = createSessionController(repository);
const suffix = Date.now().toString(36);
const email = `auth-session-${suffix}@example.test`;
const otherEmail = `auth-onboarding-${suffix}@example.test`;
const password = "SyntheticOnly42!";
let uid = "";
let otherUid = "";
async function until(check: () => boolean) {
  const deadline = Date.now() + 10_000;
  while (!check() && Date.now() < deadline) await new Promise((resolve) => setTimeout(resolve, 20));
  assert.ok(check(), `sessão inesperada: ${controller.getSnapshot().status}`);
}
before(() => controller.start());
after(async () => {
  controller.stop();
  await accounts.signOutFirebaseSession();
  await deleteApp(client);
  for (const id of [uid, otherUid].filter(Boolean)) {
    await database.doc(`profiles/${id}`).delete();
    await database.doc(`accounts/${id}`).delete();
    await database.doc(`pendingAccounts/${id}`).delete();
    await admin.deleteUser(id);
  }
  await database.terminate();
  await adminApp.deleteApp(backend);
});

test("auth SDK e Rules: cadastro pendente, verificação, login, atualização própria, logout e onboarding B", async () => {
  await accounts.registerWithEmailAndPassword(email.toUpperCase(), password, true);
  assert.equal(auth.currentUser, null);
  const synthetic = await admin.getUserByEmail(email);
  uid = synthetic.uid;
  const pending = (await database.doc(`pendingAccounts/${uid}`).get()).data();
  assert.equal(pending?.uid, uid);
  assert.equal(pending?.authProvider, "password");
  assert.ok(pending?.termsAcceptedAt);
  await assert.rejects(
    accounts.signInWithEmailAndPasswordSecurely(email, password),
    EmailVerificationRequiredError,
  );
  assert.equal(auth.currentUser, null);
  assert.equal(controller.getSnapshot().user, null);

  // O Admin local simula cadastro já ativado; o callable de ativação fica fora deste teste.
  await admin.updateUser(uid, { emailVerified: true });
  await database.doc(`accounts/${uid}`).set({ uid });
  await database.doc(`profiles/${uid}`).set({
    uid,
    username: "sintetico.auth",
    name: "Pessoa Sintética",
    bio: "Perfil de teste local",
    age: 25,
    city: "São Paulo",
    sport: "Futebol",
    position: "Atleta",
    club: "",
    photoURL: "",
    profileCompleted: true,
    createdAt: new Date(0),
    updatedAt: new Date(0),
  });
  const loggedIn = await accounts.signInWithEmailAndPasswordSecurely(
    `  ${email.toUpperCase()} `,
    password,
  );
  assert.equal(loggedIn.uid, uid);
  await until(() => controller.getSnapshot().user?.id === uid);
  assert.equal(controller.getSnapshot().user?.email, email);
  assert.equal(controller.getSnapshot().user?.profileCompleted, true);
  await database.doc(`profiles/${uid}`).update({ bio: "Perfil atualizado sintético" });
  await until(() => controller.getSnapshot().user?.bio === "Perfil atualizado sintético");

  const other = await admin.createUser({ email: otherEmail, password, emailVerified: true });
  otherUid = other.uid;
  await database.doc(`accounts/${otherUid}`).set({ uid: otherUid });
  await accounts.signOutFirebaseSession();
  await until(() => controller.getSnapshot().status === "signedOut");
  assert.equal(controller.getSnapshot().user, null);
  await accounts.signInWithEmailAndPasswordSecurely(otherEmail, password);
  await until(() => controller.getSnapshot().user?.id === otherUid);
  assert.equal(controller.getSnapshot().user?.profileCompleted, false);
  assert.equal(controller.getSnapshot().user?.email, otherEmail);
  // Guardar UID esperado impede um logout antigo de encerrar a conta B.
  await repository.signOut(uid);
  assert.equal(auth.currentUser?.uid, otherUid);
  await accounts.signOutFirebaseSession();
  await until(() => controller.getSnapshot().status === "signedOut");
});
