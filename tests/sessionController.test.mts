import assert from "node:assert/strict";
import test from "node:test";
import { createSessionController } from "../src/features/auth/application/sessionController.ts";
import { onboardingAccount } from "../src/features/auth/application/accountView.ts";
import type { AuthIdentity, AuthenticatedUser } from "../src/features/auth/domain/types.ts";
import type { SessionRepository } from "../src/features/auth/application/sessionRepository.ts";

const identity = (uid: string, provider: AuthIdentity["provider"] = "password"): AuthIdentity => ({
  uid,
  provider,
  email: `${uid}@example.test`,
  emailVerified: true,
  displayName: uid,
  photoURL: "",
  acceptedTerms: true,
});
const account = (uid: string, complete = true): AuthenticatedUser => ({
  ...onboardingAccount(identity(uid)),
  profileCompleted: complete,
});
const settle = () => new Promise<void>((resolve) => setImmediate(resolve));
async function until(check: () => boolean) {
  for (let count = 0; count < 100 && !check(); count += 1)
    await new Promise((resolve) => setTimeout(resolve, 2));
  assert.ok(check(), "estado de sessão não chegou ao resultado esperado");
}
function fixture(overrides: Partial<SessionRepository> = {}) {
  let emit!: (identity: AuthIdentity | null) => void;
  let emitError!: (error: unknown) => void;
  const watched: {
    uid: string;
    next: (user: AuthenticatedUser) => void;
    error: (error: unknown) => void;
    cancelled: boolean;
  }[] = [];
  let authCancelled = false;
  const signedOut: string[] = [];
  const repository: SessionRepository = {
    isAvailable: () => true,
    observe(onIdentity, onError) {
      emit = onIdentity;
      emitError = onError;
      return () => {
        authCancelled = true;
      };
    },
    loadAccount: async (user) => account(user.uid),
    hasAccount: async () => true,
    watchAccount(user, next, error) {
      const watch = { uid: user.uid, next, error, cancelled: false };
      watched.push(watch);
      return () => {
        watch.cancelled = true;
      };
    },
    signOut: async (uid) => {
      signedOut.push(uid);
    },
    ...overrides,
  };
  const controller = createSessionController(repository, 0);
  controller.start();
  return {
    controller,
    watched,
    signedOut,
    emit: (user: AuthIdentity | null) => emit(user),
    error: (error: unknown) => emitError(error),
    authCancelled: () => authCancelled,
  };
}

test("perfil legado concluído restaura sem documento privado; logout limpa conta e listener", async () => {
  let reads = 0;
  const f = fixture({
    hasAccount: async () => {
      reads += 1;
      return false;
    },
  });
  f.emit(identity("Alice"));
  await settle();
  assert.equal(f.controller.getSnapshot().user?.id, "Alice");
  assert.equal(reads, 0);
  f.emit(null);
  assert.equal(f.controller.getSnapshot().status, "signedOut");
  assert.equal(f.controller.getSnapshot().user, null);
  assert.equal(f.watched[0].cancelled, true);
  f.controller.stop();
  assert.equal(f.authCancelled(), true);
});

test("conta registrada sem perfil segue para onboarding; email não verificado não carrega dados", async () => {
  let loads = 0;
  const f = fixture({
    loadAccount: async (user) => {
      loads += 1;
      return account(user.uid, false);
    },
  });
  f.emit({ ...identity("pending"), emailVerified: false });
  await settle();
  assert.equal(loads, 0);
  assert.equal(f.controller.getSnapshot().user, null);
  f.emit(identity("pending"));
  await settle();
  assert.equal(f.controller.getSnapshot().user?.profileCompleted, false);
  assert.equal(f.controller.getSnapshot().status, "authenticated");
  f.controller.stop();
});

test("Google incompleto conserva identidade para termos; senha sem cadastro solicita logout", async () => {
  for (const [provider, hasGoogleProvider] of [
    ["google", true],
    ["password", false],
    ["apple", true],
  ] as const) {
    let attempts = 0;
    const f = fixture({
      loadAccount: async (user) => account(user.uid, false),
      hasAccount: async () => {
        attempts += 1;
        return false;
      },
    });
    f.emit({ ...identity("missing", provider), hasGoogleProvider });
    await until(() => f.controller.getSnapshot().status === "registrationRequired");
    assert.equal(attempts, 12);
    assert.equal(f.controller.getSnapshot().user, null);
    assert.deepEqual(f.signedOut, hasGoogleProvider ? [] : ["missing"]);
    assert.equal(f.controller.getSnapshot().sessionError === "", hasGoogleProvider);
    f.controller.stop();
  }
});

test("troca A/B limpa estado imediatamente e ignora resultado e erro antigos", async () => {
  let resolveA!: (user: AuthenticatedUser) => void;
  const f = fixture({
    loadAccount: (user) =>
      user.uid === "A"
        ? new Promise((resolve) => {
            resolveA = resolve;
          })
        : Promise.resolve(account(user.uid)),
  });
  f.emit(identity("A"));
  f.emit(identity("B"));
  assert.equal(f.controller.getSnapshot().user, null);
  await settle();
  resolveA(account("A"));
  await settle();
  assert.equal(f.controller.getSnapshot().user?.id, "B");
  assert.deepEqual(
    f.watched.map((watch) => watch.uid),
    ["B"],
  );
  f.emit(identity("C"));
  assert.equal(f.watched[0].cancelled, true);
  assert.equal(f.controller.getSnapshot().user, null);
  await settle();
  f.watched[0].next(account("B"));
  f.watched[0].error(new Error("erro atrasado de B"));
  assert.equal(f.controller.getSnapshot().user?.id, "C");
  assert.equal(f.controller.getSnapshot().sessionError, "");
  f.controller.replaceAccount(account("B"));
  assert.equal(f.controller.getSnapshot().user?.id, "C");
  f.controller.stop();
});

test("logout cancela polling e rejeição atrasada não altera nova sessão", async () => {
  let fail!: (error: Error) => void;
  let reads = 0;
  const f = fixture({
    loadAccount: (user) =>
      user.uid === "A"
        ? new Promise((_, reject) => {
            fail = reject;
          })
        : Promise.resolve(account(user.uid, false)),
    hasAccount: async () => {
      reads += 1;
      return false;
    },
  });
  f.emit(identity("A"));
  f.emit(identity("B"));
  await settle();
  f.emit(null);
  const readsBefore = reads;
  fail(new Error("erro antigo"));
  await new Promise((resolve) => setTimeout(resolve, 10));
  assert.equal(reads, readsBefore);
  assert.equal(f.controller.getSnapshot().status, "signedOut");
  f.controller.stop();
});

test("callbacks depois do unmount não publicam nem reinstalam listeners", async () => {
  const f = fixture();
  let notifications = 0;
  f.controller.subscribe(() => {
    notifications += 1;
  });
  f.emit(identity("A"));
  await settle();
  f.controller.stop();
  const before = notifications;
  f.emit(identity("B"));
  f.error(new Error("auth antigo"));
  f.watched[0].next(account("A"));
  f.watched[0].error(new Error("perfil antigo"));
  await settle();
  assert.equal(notifications, before);
  assert.equal(f.watched.length, 1);
});

test("falha ou conta de UID diferente bloqueia restauração com mensagem segura", async () => {
  for (const loadAccount of [
    async () => {
      throw new Error("token privado");
    },
    async () => account("wrong"),
  ]) {
    const f = fixture({ loadAccount });
    f.emit(identity("A"));
    await settle();
    assert.equal(f.controller.getSnapshot().status, "error");
    assert.equal(f.controller.getSnapshot().user, null);
    assert.equal(f.controller.getSnapshot().sessionError.includes("privado"), false);
    assert.equal(f.watched.length, 0);
    f.controller.stop();
  }
  const absent = fixture({ isAvailable: () => false });
  assert.equal(absent.controller.getSnapshot().isSessionLoaded, true);
  assert.equal(absent.controller.getSnapshot().status, "error");
  absent.controller.stop();
});
