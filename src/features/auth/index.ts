export type {
  AuthProvider,
  AuthenticatedUser,
  AuthIdentity,
  OnboardingAccount,
  UserRole,
} from "./domain/types";
export { authenticatedAccount, onboardingAccount } from "./application/accountView";
export {
  FirebaseUnavailableError,
  EmailVerificationRequiredError,
  AccountRegistrationRequiredError,
  AccountCompletionRequiredError,
} from "./domain/errors";
export type { SessionRepository, SessionState } from "./application/sessionRepository";
export { SessionProvider, useSession } from "./ui/SessionProvider";
