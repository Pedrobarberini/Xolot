import { BRAND } from "../../../config/brand.ts";
export class FirebaseUnavailableError extends Error {
  constructor() {
    super("O serviço de contas ainda não está configurado neste ambiente.");
    this.name = "FirebaseUnavailableError";
  }
}

export class EmailVerificationRequiredError extends Error {
  constructor() {
    super(`Confirme o e-mail enviado pela ${BRAND.name} antes de entrar.`);
    this.name = "EmailVerificationRequiredError";
  }
}

export class AccountRegistrationRequiredError extends Error {
  constructor() {
    super(`Esta identidade ainda não possui uma conta ${BRAND.name} cadastrada.`);
    this.name = "AccountRegistrationRequiredError";
  }
}

export class AccountCompletionRequiredError extends Error {
  constructor() {
    super(`Esta identidade existe, mas o cadastro ${BRAND.name} precisa ser concluído.`);
    this.name = "AccountCompletionRequiredError";
  }
}
