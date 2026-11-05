import React from "react";
import { Text } from "react-native";
import { act, render, screen } from "@testing-library/react-native";
import { SessionProvider, useSession } from "../../src/features/auth/ui/SessionProvider";
import { useFirebaseAccounts } from "../../src/actions/useFirebaseAccounts";
import { getCurrentFirebaseUser } from "../../src/services/firebaseAccountService";
import { subscribeFirebaseProfiles } from "../../src/services/firebaseProfileService";
import { onboardingAccount } from "../../src/features/auth/application/accountView";
import type { AuthIdentity, AuthenticatedUser } from "../../src/features/auth/domain/types";
import type { SessionRepository } from "../../src/features/auth/application/sessionRepository";
import type { User } from "firebase/auth";

jest.mock("../../src/services/firebaseAccountService", () => ({
  getCurrentFirebaseUser: jest.fn(),
}));
jest.mock("../../src/services/firebaseProfileService", () => ({
  subscribeFirebaseProfiles: jest.fn(),
}));

const identity = (uid: string): AuthIdentity => ({
  uid,
  email: `${uid}@example.test`,
  emailVerified: true,
  provider: "password",
  displayName: uid,
  photoURL: "",
  acceptedTerms: true,
});
function fixture() {
  let emit!: (identity: AuthIdentity | null) => void;
  const own: {
    next: (user: AuthenticatedUser) => void;
    error: (error: unknown) => void;
    cleanup: jest.Mock;
  }[] = [];
  const authCleanup = jest.fn();
  const repository: SessionRepository = {
    isAvailable: () => true,
    observe: (onIdentity) => {
      emit = onIdentity;
      return authCleanup;
    },
    loadAccount: async (user) => ({
      ...onboardingAccount(user),
      profileCompleted: user.uid !== "pending",
    }),
    hasAccount: async () => true,
    watchAccount: (_, next, error) => {
      const cleanup = jest.fn();
      own.push({ next, error, cleanup });
      return cleanup;
    },
    signOut: jest.fn(async () => undefined),
  };
  return {
    repository,
    authCleanup,
    own,
    emit: (user: AuthIdentity | null) => {
      jest
        .mocked(getCurrentFirebaseUser)
        .mockReturnValue(
          user ? ({ uid: user.uid, emailVerified: user.emailVerified } as User) : null,
        );
      emit(user);
    },
  };
}
function Probe() {
  const { user, isSessionLoaded } = useSession();
  return (
    <Text>
      {!isSessionLoaded
        ? "Carregando"
        : !user
          ? "Entrar"
          : !user.profileCompleted
            ? "Criar perfil"
            : `Conta ${user.id}`}
    </Text>
  );
}
function LegacyProbe() {
  const { registeredUsers, sessionError, user } = useFirebaseAccounts();
  return (
    <Text>{`Conta ${user?.id ?? "vazia"}; lista ${registeredUsers.map((item) => item.id).join(",")}; erro ${sessionError}`}</Text>
  );
}

test("provider distingue restauração, login, logout e cadastro sem perfil e cancela listeners", async () => {
  const f = fixture();
  const view = render(
    <SessionProvider repository={f.repository}>
      <Probe />
    </SessionProvider>,
  );
  expect(screen.getByText("Carregando")).toBeTruthy();
  await act(async () => f.emit(null));
  expect(screen.getByText("Entrar")).toBeTruthy();
  await act(async () => f.emit(identity("A")));
  expect(screen.getByText("Conta A")).toBeTruthy();
  await act(async () => f.emit(identity("pending")));
  expect(screen.getByText("Criar perfil")).toBeTruthy();
  expect(f.own[0].cleanup).toHaveBeenCalledTimes(1);
  await act(async () => f.emit(null));
  expect(screen.getByText("Entrar")).toBeTruthy();
  view.unmount();
  expect(f.authCleanup).toHaveBeenCalledTimes(1);
  expect(f.own[1].cleanup).toHaveBeenCalledTimes(1);
});

test("fachada de perfis ignora snapshot e erro de A depois de entrar em B", async () => {
  const subscribe = jest.mocked(subscribeFirebaseProfiles);
  const cleanups: jest.Mock[] = [];
  subscribe.mockImplementation(() => {
    const cleanup = jest.fn();
    cleanups.push(cleanup);
    return cleanup;
  });
  const f = fixture();
  const view = render(
    <SessionProvider repository={f.repository}>
      <LegacyProbe />
    </SessionProvider>,
  );
  await act(async () => f.emit(identity("A")));
  const old = subscribe.mock.calls[0];
  await act(async () => f.emit(identity("B")));
  expect(cleanups[0]).toHaveBeenCalledTimes(1);
  await act(async () => {
    old[1]([{ ...onboardingAccount(identity("A")), profileCompleted: true }]);
    old[2]?.(new Error("antigo"));
    f.own[0].error(new Error("antigo próprio"));
  });
  expect(screen.getByText("Conta B; lista B; erro ")).toBeTruthy();
  await act(async () => subscribe.mock.calls[1][2]?.(new Error("erro atual")));
  expect(screen.getByText(/Não foi possível sincronizar/)).toBeTruthy();
  view.unmount();
  expect(cleanups[1]).toHaveBeenCalledTimes(1);
});
