import { BRAND } from "../../../config/brand.ts";
import { FirebaseError } from "firebase/app";
import {
  FirebaseUnavailableError,
  EmailVerificationRequiredError,
  AccountRegistrationRequiredError,
  AccountCompletionRequiredError,
} from "../domain/errors.ts";
export function getSafeFirebaseAccountDeletionMessage(error: unknown) {
  if (error instanceof FirebaseError) {
    if (error.code === "functions/failed-precondition") {
      return "Por segurança, saia e entre novamente antes de excluir a conta.";
    }
    if (error.code === "functions/unauthenticated") {
      return "Sua sessão expirou. Entre novamente antes de excluir a conta.";
    }
    if (error.code === "functions/unavailable") {
      return "O serviço de exclusão está indisponível. Tente novamente em instantes.";
    }
  }

  return error instanceof Error && error.message
    ? error.message
    : "Não foi possível excluir a conta agora. Tente novamente.";
}

export function getSafeFirebaseAuthMessage(error: unknown) {
  if (
    error instanceof FirebaseUnavailableError ||
    error instanceof EmailVerificationRequiredError ||
    error instanceof AccountRegistrationRequiredError ||
    error instanceof AccountCompletionRequiredError
  ) {
    return error.message;
  }

  if (!(error instanceof FirebaseError)) {
    return "Não foi possível concluir a autenticação. Tente novamente.";
  }

  if (error.code === "auth/too-many-requests") {
    return "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.";
  }

  if (error.code === "auth/network-request-failed") {
    return "Sem conexão com o serviço de contas. Verifique sua internet.";
  }

  if (error.code === "auth/weak-password") {
    return "A senha precisa ter pelo menos 8 caracteres, com letra maiúscula, minúscula e número.";
  }

  if (error.code === "auth/email-already-in-use") {
    return `Este e-mail já possui uma conta ${BRAND.name}. Use Entrar e escolha o mesmo método usado no primeiro acesso, como Google.`;
  }

  if (error.code === "auth/invalid-email") {
    return "O e-mail informado não é válido. Verifique o endereço e tente novamente.";
  }

  if (error.code === "auth/missing-password") {
    return "Digite uma senha para criar sua conta.";
  }

  if (error.code === "auth/user-disabled") {
    return `Esta conta foi desativada. Entre em contato com o suporte da ${BRAND.name}.`;
  }

  if (error.code === "auth/credential-already-in-use") {
    return `Esta forma de acesso já está vinculada a outra conta ${BRAND.name}.`;
  }

  if (error.code === "auth/operation-not-allowed") {
    return "Este método de acesso ainda não foi habilitado no Firebase.";
  }

  if (error.code === "auth/unauthorized-domain") {
    return "Este domínio ainda não foi autorizado no Firebase Authentication. Adicione xolot.com.br em Configurações > Domínios autorizados.";
  }

  if (error.code === "auth/popup-blocked") {
    return `O navegador bloqueou a janela de autenticação. Permita pop-ups para a ${BRAND.name} e tente novamente.`;
  }

  if (error.code === "auth/account-exists-with-different-credential") {
    return "Já existe uma conta para este e-mail usando outro método de entrada. Entre pelo método usado no cadastro.";
  }

  if (
    error.code === "auth/invalid-continue-uri" ||
    error.code === "auth/unauthorized-continue-uri"
  ) {
    return "O endereço de retorno da autenticação não está autorizado no Firebase.";
  }

  if (
    error.code === "auth/invalid-credential" ||
    error.code === "auth/wrong-password" ||
    error.code === "auth/user-not-found"
  ) {
    return "E-mail ou senha inválidos.";
  }

  return "Não foi possível concluir a autenticação. Confira os dados e tente novamente.";
}
