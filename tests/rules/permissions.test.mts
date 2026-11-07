import { readFileSync } from "node:fs";
import { after, before, beforeEach, test } from "node:test";
import {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
  type RulesTestEnvironment,
} from "@firebase/rules-unit-testing";
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import { assertRulesTarget, rulesProject } from "../../scripts/rules-target.mjs";

// A guarda executa antes de inicializar SDKs ou limpar fixtures.
assertRulesTarget(process.env);
let environment: RulesTestEnvironment;
const profile = (uid: string) => ({
  uid,
  username: uid,
  name: "Pessoa Sintética",
  bio: "Perfil de teste local",
  age: 25,
  position: "Atleta",
  sport: "Futebol",
  city: "São Paulo",
  club: "",
  photoURL: "",
  profileCompleted: true,
  identityVerified: false,
  plusActive: false,
  createdAt: new Date(0),
  updatedAt: new Date(0),
});
const actor = (uid: string, verified = true) =>
  environment.authenticatedContext(uid, {
    email_verified: verified,
    firebase: { sign_in_provider: "password" },
  });

before(async () => {
  environment = await initializeTestEnvironment({
    projectId: rulesProject,
    firestore: { host: "127.0.0.1", port: 8085, rules: readFileSync("firestore.rules", "utf8") },
    storage: { host: "127.0.0.1", port: 9195, rules: readFileSync("storage.rules", "utf8") },
  });
});
after(async () => {
  await environment?.cleanup();
});
beforeEach(async () => {
  await environment.clearFirestore();
  await environment.clearStorage();
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    for (const uid of ["alice", "bruno", "carla"]) {
      await db.doc(`accounts/${uid}`).set({ uid });
      await db.doc(`profiles/${uid}`).set(profile(uid));
      await db.doc(`usernames/${uid}`).set({ uid });
      await db.doc(`subscriptions/${uid}`).set({ plusActive: false });
      await db.doc(`identityVerifications/${uid}`).set({ status: "pending" });
    }
    await db
      .doc("directMessages/one")
      .set({ senderUserId: "alice", recipientUserId: "bruno", body: "Sintética" });
    await db.doc("notifications/one").set({ recipientUserId: "alice", body: "Sintética" });
    await db.doc("userPostLikes/alice/posts/one").set({ liked: true });
    await db.doc("userPostViews/alice/posts/one").set({ viewed: true });
  });
});

test("conta privada: dono lê; outro/anônimo não leem; ninguém lista ou altera", async () => {
  const owner = actor("alice").firestore();
  await assertSucceeds(owner.doc("accounts/alice").get());
  await assertFails(actor("bruno").firestore().doc("accounts/alice").get());
  await assertFails(environment.unauthenticatedContext().firestore().doc("accounts/alice").get());
  await assertFails(owner.collection("accounts").get());
  await assertFails(owner.doc("accounts/alice").update({ role: "admin" }));
  await assertFails(owner.doc("accounts/bruno").delete());
});

test("bloqueio impede follows/comentários nos dois sentidos; histórico e remoção próprios continuam disponíveis", async () => {
  await environment.withSecurityRulesDisabled(async (context) => {
    const db = context.firestore();
    await db
      .doc("socialPreferences/bruno")
      .set({ ownerUid: "bruno", blockedProfileIds: ["profile-alice"] });
    await db.doc("posts/safety-post").set({ status: "published", authorId: "alice" });
    await db.doc("follows/alice_bruno").set({ followerUid: "alice", targetUid: "bruno" });
  });
  const follow = (from: string, to: string) => ({
    followerUid: from,
    targetUid: to,
    targetProfileId: `profile-${to}`,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
  await assertFails(
    actor("bruno").firestore().doc("follows/bruno_alice").set(follow("bruno", "alice")),
  );
  await assertSucceeds(actor("alice").firestore().doc("follows/alice_bruno").delete());
  await assertFails(
    actor("alice").firestore().doc("follows/alice_bruno").set(follow("alice", "bruno")),
  );
  const comment = (uid: string) => ({
    authorName: "Pessoa Sintética",
    authorProfileId: `profile-${uid}`,
    authorUserId: uid,
    authorUsername: uid,
    body: "Comentário sintético",
    playerId: "approved-safety-post",
    postId: "safety-post",
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });
  await assertFails(
    actor("bruno").firestore().doc("postComments/blocked-comment").set(comment("bruno")),
  );
  await assertSucceeds(
    actor("carla").firestore().doc("postComments/allowed-comment").set(comment("carla")),
  );
  await assertSucceeds(actor("alice").firestore().doc("directMessages/one").get());
  await assertFails(
    actor("carla").firestore().doc("moderationReports/private").set({ status: "resolved" }),
  );
  await assertFails(
    environment
      .authenticatedContext("alice", { email_verified: true, admin: true })
      .firestore()
      .collection("moderationReports")
      .get(),
  );
});

test("perfil social exige registro e email confirmado para get e list", async () => {
  await assertSucceeds(actor("alice").firestore().doc("profiles/bruno").get());
  await assertSucceeds(actor("alice").firestore().collection("profiles").get());
  for (const context of [
    actor("alice", false),
    actor("outsider"),
    environment.unauthenticatedContext(),
  ]) {
    await assertFails(context.firestore().doc("profiles/bruno").get());
    await assertFails(context.firestore().collection("profiles").get());
  }
});

test("dono edita bio válida mas não concede selo/plano, papel ou campos inválidos", async () => {
  const owner = actor("alice").firestore();
  const updatedAt = firebase.firestore.FieldValue.serverTimestamp();
  await assertSucceeds(
    owner.doc("profiles/alice").update({ bio: "Nova biografia válida", updatedAt }),
  );
  for (const patch of [
    { identityVerified: true },
    { plusActive: true },
    { role: "Admin" },
    { age: "25" },
    { bio: "a" },
    { bio: "a".repeat(241) },
  ]) {
    await assertFails(owner.doc("profiles/alice").update({ ...patch, updatedAt }));
  }
  await assertFails(
    actor("bruno")
      .firestore()
      .doc("profiles/alice")
      .update({ bio: "Biografia invadida", updatedAt }),
  );
  await assertFails(owner.doc("profiles/alice").delete());
});

test("criação não pode conceder selo/plano mesmo com reserva de username atômica", async () => {
  const db = actor("newuser").firestore();
  await environment.withSecurityRulesDisabled(async (context) => {
    await context.firestore().doc("accounts/newuser").set({ uid: "newuser" });
  });
  for (const badge of [{ identityVerified: true }, { plusActive: true }]) {
    const batch = db.batch();
    batch.set(db.doc("usernames/newuser"), {
      uid: "newuser",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    batch.set(db.doc("profiles/newuser"), {
      ...profile("newuser"),
      ...badge,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
    await assertFails(batch.commit());
  }
});

test("mensagens: participantes leem e consultam sua direção; estranho e query global falham", async () => {
  for (const [uid, field] of [
    ["alice", "senderUserId"],
    ["bruno", "recipientUserId"],
  ]) {
    const db = actor(uid).firestore();
    await assertSucceeds(db.doc("directMessages/one").get());
    await assertSucceeds(db.collection("directMessages").where(field, "==", uid).get());
    await assertFails(db.collection("directMessages").get());
    await assertFails(db.doc("directMessages/one").update({ recipientUserId: "carla" }));
    await assertFails(
      db.doc("directMessages/forged").set({ senderUserId: "bruno", recipientUserId: "carla" }),
    );
  }
  await assertFails(actor("carla").firestore().doc("directMessages/one").get());
  await assertFails(
    actor("carla")
      .firestore()
      .collection("directMessages")
      .where("senderUserId", "==", "alice")
      .get(),
  );
  await assertFails(
    environment.unauthenticatedContext().firestore().doc("directMessages/one").get(),
  );
});

test("notificações e métricas privadas não vazam para outra conta", async () => {
  const owner = actor("alice").firestore();
  await assertSucceeds(
    owner.collection("notifications").where("recipientUserId", "==", "alice").get(),
  );
  await assertFails(owner.collection("notifications").get());
  await assertFails(actor("bruno").firestore().doc("notifications/one").get());
  for (const name of ["userPostLikes", "userPostViews"]) {
    await assertSucceeds(owner.collection(`${name}/alice/posts`).get());
    await assertFails(actor("bruno").firestore().collection(`${name}/alice/posts`).get());
    await assertFails(owner.doc(`${name}/alice/posts/one`).set({ count: 1000 }));
  }
});

test("assinatura e verificação são privadas e somente servidor escreve", async () => {
  for (const name of ["subscriptions", "identityVerifications"]) {
    const db = actor("alice").firestore();
    await assertSucceeds(db.doc(`${name}/alice`).get());
    await assertFails(db.collection(name).get());
    await assertFails(actor("bruno").firestore().doc(`${name}/alice`).get());
    await assertFails(db.doc(`${name}/alice`).set({ plusActive: true, status: "approved" }));
    await assertFails(db.doc(`${name}/alice`).delete());
  }
});

test("rascunhos são privados do autor; query do feed permite apenas publicados", async () => {
  await environment.withSecurityRulesDisabled(async (context) => {
    await context.firestore().doc("posts/draft").set({ authorId: "alice", status: "draft" });
    await context
      .firestore()
      .doc("posts/published")
      .set({ authorId: "alice", status: "published" });
  });
  const owner = actor("alice").firestore();
  const visitor = actor("bruno").firestore();
  await assertSucceeds(owner.doc("posts/draft").get());
  await assertFails(visitor.doc("posts/draft").get());
  await assertFails(visitor.collection("posts").get());
  await assertSucceeds(visitor.collection("posts").where("status", "==", "published").get());
  await assertFails(
    environment
      .unauthenticatedContext()
      .firestore()
      .collection("posts")
      .where("status", "==", "published")
      .get(),
  );
});

test("quotas, credenciais e intenções operacionais nunca são acessíveis pelo cliente", async () => {
  const db = actor("alice").firestore();
  for (const collection of [
    "callableRateLimits",
    "socialRateLimits",
    "uploadIntents",
    "avatarUploadIntents",
    "secrets",
  ]) {
    await assertFails(db.collection(collection).get());
    await assertFails(db.doc(`${collection}/alice`).get());
    await assertFails(
      db.doc(`${collection}/alice`).set({ ownerUid: "alice", count: 0, admin: true }),
    );
  }
});

test("Storage: owner cria mídia válida; outro não escreve; get confirmado e list negado", async (t) => {
  const path = "posts/alice/one/media";
  const metadata = {
    contentType: "image/png",
    customMetadata: { ownerUid: "alice", postId: "one", mediaType: "image" },
  };
  const owner = actor("alice").storage();
  await assertFails(
    actor("bruno")
      .storage()
      .ref(path)
      .put(new Uint8Array([1]), metadata),
  );
  await assertSucceeds(owner.ref(path).put(new Uint8Array([1]), metadata));
  await assertSucceeds(actor("bruno").storage().ref(path).getMetadata());
  await t.test("email não confirmado não lê metadados", async () => {
    await assertFails(actor("alice", false).storage().ref(path).getMetadata());
  });
  await t.test("anônimo não lê metadados", async () => {
    await assertFails(environment.unauthenticatedContext().storage().ref(path).getMetadata());
  });
  await t.test("nem o dono lista objetos", async () => {
    await assertFails(owner.ref("posts/alice").listAll());
  });
  await t.test("Rules atuais permitem novo upload válido no mesmo caminho", async () => {
    // Upload de conteúdo usa create; update protege a alteração isolada de metadados.
    // Limitação registrada em docs/architecture/rules-assessment.json para SEC02.
    await assertSucceeds(owner.ref(path).put(new Uint8Array([2]), metadata));
    await assertFails(owner.ref(path).updateMetadata({ customMetadata: { ownerUid: "bruno" } }));
    await assertFails(
      actor("bruno")
        .storage()
        .ref(path)
        .put(new Uint8Array([3]), metadata),
    );
    await assertFails(
      owner.ref(path).put(new Uint8Array([3]), { ...metadata, contentType: "text/html" }),
    );
  });
  await t.test("outro usuário não apaga mídia", async () => {
    await assertFails(actor("bruno").storage().ref(path).delete());
  });
  await assertSucceeds(owner.ref(path).delete());
});

test("Storage: MIME/metadados inválidos e caminho desconhecido são negados", async () => {
  const owner = actor("alice").storage();
  const target = owner.ref("posts/alice/bad/media");
  await assertFails(
    target.put(new Uint8Array([1]), {
      contentType: "text/html",
      customMetadata: { ownerUid: "alice", postId: "bad", mediaType: "image" },
    }),
  );
  await assertFails(
    target.put(new Uint8Array([1]), {
      contentType: "image/png",
      customMetadata: { ownerUid: "bruno", postId: "bad", mediaType: "image" },
    }),
  );
  await assertFails(owner.ref("unknown/object").put(new Uint8Array([1])));
  const db = actor("alice").firestore();
  await assertFails(db.doc("unknown/document").get());
  await assertFails(db.doc("unknown/document").set({ allowed: true }));
});

test("Storage: dono atualiza avatar; outro não altera e nem dono apaga", async () => {
  const path = "avatars/alice/profile";
  const metadata = { contentType: "image/png", customMetadata: { ownerUid: "alice" } };
  const owner = actor("alice").storage().ref(path);
  await assertSucceeds(owner.put(new Uint8Array([1]), metadata));
  await assertSucceeds(owner.put(new Uint8Array([2]), metadata));
  await assertFails(
    actor("bruno")
      .storage()
      .ref(path)
      .put(new Uint8Array([3]), metadata),
  );
  await assertFails(owner.delete());
});
