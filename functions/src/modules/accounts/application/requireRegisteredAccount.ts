import { OperationError } from "../../../domain/OperationError";

export type AccountRegistrationReader = {
  read: (uid: string) => Promise<{ accountExists: boolean; profileCompleted: boolean }>;
};

export async function requireRegisteredAccount(uid: string, accounts: AccountRegistrationReader) {
  const state = await accounts.read(uid);
  if (!state.accountExists && !state.profileCompleted)
    throw new OperationError(
      "permission-denied",
      "Complete o cadastro da sua conta antes de publicar.",
    );
}
