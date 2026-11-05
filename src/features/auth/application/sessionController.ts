import { BRAND } from "../../../config/brand.ts";
import type { AuthenticatedUser, AuthIdentity } from "../domain/types.ts";
import type { SessionRepository, SessionState } from "./sessionRepository.ts";

const initialState: SessionState = {
  status: "restoring",
  isSessionLoaded: false,
  sessionError: "",
  user: null,
};

function pause(milliseconds: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    if (signal.aborted) {
      resolve();
      return;
    }
    const finish = () => {
      clearTimeout(timer);
      signal.removeEventListener("abort", finish);
      resolve();
    };
    const timer = setTimeout(finish, milliseconds);
    signal.addEventListener("abort", finish, { once: true });
  });
}

export function createSessionController(repository: SessionRepository, retryDelayMs = 500) {
  let state = initialState;
  let generation = 0;
  let active = false;
  let observation = 0;
  let identity: AuthIdentity | null = null;
  let authCleanup: (() => void) | undefined;
  let profileCleanup: (() => void) | undefined;
  let cancellation: AbortController | undefined;
  const listeners = new Set<() => void>();
  function publish(next: SessionState) {
    state = next;
    listeners.forEach((listener) => listener());
  }
  function cancelAccount() {
    generation += 1;
    cancellation?.abort();
    cancellation = undefined;
    profileCleanup?.();
    profileCleanup = undefined;
  }
  function failed() {
    publish({
      status: "error",
      isSessionLoaded: true,
      sessionError: "Não foi possível restaurar a sessão com segurança.",
      user: null,
    });
  }
  async function restore(nextIdentity: AuthIdentity | null) {
    if (!active) return;
    cancelAccount();
    identity = nextIdentity;
    const current = generation;
    const isCurrent = () => active && generation === current;
    if (!nextIdentity?.emailVerified) {
      publish({ status: "signedOut", isSessionLoaded: true, sessionError: "", user: null });
      return;
    }
    publish({ ...initialState });
    cancellation = new AbortController();
    const signal = cancellation.signal;
    try {
      const account = await repository.loadAccount(nextIdentity);
      if (!isCurrent()) return;
      if (account.id !== nextIdentity.uid) throw new Error("Conta de outra identidade.");
      let hasAccount = account.profileCompleted;
      for (let attempt = 0; !hasAccount && attempt < 12 && isCurrent(); attempt += 1) {
        hasAccount = await repository.hasAccount(nextIdentity.uid);
        if (!isCurrent()) return;
        if (!hasAccount && attempt < 11) await pause(retryDelayMs, signal);
      }
      if (!isCurrent()) return;
      if (!hasAccount) {
        const canCompleteWithGoogle =
          nextIdentity.hasGoogleProvider ?? nextIdentity.provider === "google";
        publish({
          status: "registrationRequired",
          isSessionLoaded: true,
          user: null,
          sessionError: canCompleteWithGoogle
            ? ""
            : `A conta autenticada não possui cadastro ${BRAND.name}.`,
        });
        if (!canCompleteWithGoogle) await repository.signOut(nextIdentity.uid);
        return;
      }
      publish({ status: "authenticated", isSessionLoaded: true, sessionError: "", user: account });
      const cleanup = repository.watchAccount(
        nextIdentity,
        (updated) => {
          if (isCurrent() && updated.id === nextIdentity.uid) publish({ ...state, user: updated });
        },
        () => {
          if (isCurrent())
            publish({ ...state, sessionError: "Não foi possível sincronizar os perfis agora." });
        },
      );
      if (isCurrent()) profileCleanup = cleanup;
      else cleanup();
    } catch {
      if (isCurrent()) failed();
    }
  }
  return {
    getSnapshot: () => state,
    subscribe(listener: () => void) {
      listeners.add(listener);
      return () => {
        listeners.delete(listener);
      };
    },
    start() {
      if (active) return;
      active = true;
      const currentObservation = ++observation;
      publish({ ...initialState });
      if (!repository.isAvailable()) {
        publish({
          status: "error",
          isSessionLoaded: true,
          sessionError: "Firebase não configurado neste ambiente.",
          user: null,
        });
        return;
      }
      try {
        authCleanup = repository.observe(
          (next) => {
            if (active && observation === currentObservation) void restore(next);
          },
          () => {
            if (!active || observation !== currentObservation) return;
            cancelAccount();
            identity = null;
            failed();
          },
        );
      } catch {
        failed();
      }
    },
    stop() {
      active = false;
      observation += 1;
      cancelAccount();
      authCleanup?.();
      authCleanup = undefined;
      identity = null;
    },
    replaceAccount(account: AuthenticatedUser | null) {
      if (!active || !identity?.emailVerified || (account && account.id !== identity.uid)) return;
      if (!account) {
        cancelAccount();
        identity = null;
      }
      publish({
        ...state,
        status: account ? "authenticated" : "signedOut",
        isSessionLoaded: true,
        user: account,
      });
    },
  };
}
