import { BRAND } from "../config/brand.ts";
import React, { useEffect, useState } from "react";
import { Check, LogIn, UserPlus, X } from "lucide-react-native";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View
} from "react-native";
import { ScreenBackdrop, ScreenTransition } from "../components/AppShell";
import { LabeledInput } from "../components/Navigation";
import { GOOGLE_SIGNIN_ICON } from "../constants/assets";
import { BrandMark } from "../shared/ui/BrandMark";
import { useGoogleSignIn } from "../hooks/useGoogleSignIn";
import {
  AccountCompletionRequiredError,
  completeCurrentFirebaseAccountRegistration,
  getCurrentFirebaseUser,
  getSafeFirebaseAuthMessage,
  hasFirebaseAccount,
  isGoogleFirebaseUser,
  registerWithEmailAndPassword,
  sendFirebasePasswordReset,
  signInWithEmailAndPasswordSecurely,
  signOutFirebaseSession
} from "../services/firebaseAccountService";
import { loadFirebaseAppUser } from "../services/firebaseProfileService";
import {
  GoogleAuthCancelledError,
  GoogleAuthConfigurationError
} from "../services/googleAuth";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import type { AppUser } from "../types";
import {
  getPasswordRequirements,
  isStrongPassword
} from "../utils/passwordValidation";

type AuthMode = "create" | "login";

export function AuthScreen({
  onComplete
}: {
  onComplete: (user: AppUser) => void;
}) {
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [needsAccountCompletion, setNeedsAccountCompletion] = useState(false);
  const [needsGoogleAccountCompletion, setNeedsGoogleAccountCompletion] =
    useState(false);
  const [googleAccountEmail, setGoogleAccountEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    isAvailable: isGoogleAvailable,
    isReady: isGoogleReady,
    isSigningIn: isGoogleSigningIn,
    signInWithGoogle
  } = useGoogleSignIn();
  const cleanEmail = email.trim().toLowerCase();
  const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
  const passwordRequirements = getPasswordRequirements(password);
  const hasStrongPassword = isStrongPassword(password);
  const hasValidPassword = mode === "login" ? password.length >= 1 : hasStrongPassword;
  const isBusy = isSubmitting || isGoogleSigningIn;
  const mustAcceptTerms =
    mode === "create" ||
    needsAccountCompletion ||
    needsGoogleAccountCompletion;
  const canContinue = needsGoogleAccountCompletion
    ? acceptedTerms && !isBusy
    : hasValidEmail &&
      hasValidPassword &&
      (mode === "login" || password === passwordConfirmation) &&
      (!mustAcceptTerms || acceptedTerms) &&
      !isBusy;
  const canContinueWithGoogle =
    mode === "login" &&
    !needsGoogleAccountCompletion &&
    !isBusy &&
    isGoogleAvailable &&
    isGoogleReady;

  function clearFeedback() {
    setErrorMessage("");
    setSuccessMessage("");
  }

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    clearFeedback();
    setPassword("");
    setPasswordConfirmation("");
    setAcceptedTerms(false);
    setNeedsAccountCompletion(false);
    setNeedsGoogleAccountCompletion(false);
    setGoogleAccountEmail("");
  }

  useEffect(() => {
    let isMounted = true;
    const firebaseUser = getCurrentFirebaseUser();

    if (!firebaseUser || !isGoogleFirebaseUser(firebaseUser)) {
      return;
    }

    void hasFirebaseAccount(firebaseUser.uid)
      .then((hasAccount) => {
        if (!isMounted || hasAccount) {
          return;
        }

        setGoogleAccountEmail(firebaseUser.email ?? "");
        setNeedsGoogleAccountCompletion(true);
        setSuccessMessage(
          "Conta Google confirmada. Aceite os termos para concluir seu primeiro acesso."
        );
      })
      .catch(() => undefined);

    return () => {
      isMounted = false;
    };
  }, []);

  async function handleGooglePress() {
    clearFeedback();

    if (!isGoogleAvailable) {
      Alert.alert(
        "Login com o Google",
        "Configure o Firebase no arquivo .env e reinicie o Expo."
      );
      return;
    }

    if (mode !== "login") {
      return;
    }

    try {
      await signInWithGoogle();

      const firebaseUser = getCurrentFirebaseUser();

      if (!firebaseUser) {
        throw new Error("O Firebase não retornou uma sessão válida.");
      }

      const hasAccount = await hasFirebaseAccount(firebaseUser.uid);
      if (!hasAccount) {
        setAcceptedTerms(false);
        setGoogleAccountEmail(firebaseUser.email ?? "");
        setNeedsGoogleAccountCompletion(true);
        setSuccessMessage(
          "Conta Google confirmada. Aceite os termos para concluir seu primeiro acesso."
        );
        return;
      }

      onComplete(await loadFirebaseAppUser(firebaseUser));
    } catch (error) {
      if (error instanceof GoogleAuthCancelledError) {
        return;
      }

      if (error instanceof GoogleAuthConfigurationError) {
        setErrorMessage(error.message);
        return;
      }

      setErrorMessage(getSafeFirebaseAuthMessage(error));
    }
  }

  async function completeGoogleAccount() {
    if (!acceptedTerms || !needsGoogleAccountCompletion) {
      setErrorMessage("Aceite os Termos de Uso e a Política de Privacidade.");
      return;
    }

    clearFeedback();
    setIsSubmitting(true);

    try {
      const firebaseUser =
        await completeCurrentFirebaseAccountRegistration(true);
      setNeedsGoogleAccountCompletion(false);
      setGoogleAccountEmail("");
      onComplete(await loadFirebaseAppUser(firebaseUser));
    } catch (error) {
      setErrorMessage(getSafeFirebaseAuthMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function cancelGoogleAccountCompletion() {
    setIsSubmitting(true);

    try {
      await signOutFirebaseSession();
      setNeedsGoogleAccountCompletion(false);
      setGoogleAccountEmail("");
      setAcceptedTerms(false);
      clearFeedback();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function submitAuth() {
    if (!canContinue) {
      return;
    }

    clearFeedback();
    setIsSubmitting(true);

    try {
      if (mode === "create") {
        await registerWithEmailAndPassword(
          cleanEmail,
          password,
          acceptedTerms
        );
        setMode("login");
        setPassword("");
        setPasswordConfirmation("");
        setAcceptedTerms(false);
        setSuccessMessage(
          "Cadastro recebido. Confirme o link enviado ao seu e-mail para ativar sua conta."
        );
        return;
      }

      const firebaseUser = await signInWithEmailAndPasswordSecurely(
        cleanEmail,
        password,
        needsAccountCompletion && acceptedTerms
      );
      setNeedsAccountCompletion(false);
      onComplete(await loadFirebaseAppUser(firebaseUser));
    } catch (error) {
      if (error instanceof AccountCompletionRequiredError) {
        setNeedsAccountCompletion(true);
        setAcceptedTerms(false);
        setErrorMessage(
          `Sua identidade foi encontrada. Aceite os termos abaixo para concluir a conta ${BRAND.name}.`
        );
        return;
      }

      setErrorMessage(getSafeFirebaseAuthMessage(error));
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handlePasswordReset() {
    clearFeedback();

    if (!hasValidEmail) {
      setErrorMessage("Informe um e-mail válido para recuperar a senha.");
      return;
    }

    setIsSubmitting(true);
    try {
      await sendFirebasePasswordReset(cleanEmail);
      setSuccessMessage(
        "Se existir uma conta para este e-mail, enviaremos as instruções de recuperação."
      );
    } catch (error) {
      const message = getSafeFirebaseAuthMessage(error);
      if (
        message.includes("conexão") ||
        message.includes("tentativas") ||
        message.includes("configurado")
      ) {
        setErrorMessage(message);
      } else {
        setSuccessMessage(
          "Se existir uma conta para este e-mail, enviaremos as instruções de recuperação."
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const submitLabel = needsGoogleAccountCompletion
    ? "Aceitar e continuar"
    : needsAccountCompletion
      ? "Concluir cadastro"
      : mode === "login"
        ? "Entrar"
        : "Criar conta";
  const SubmitIcon =
    mode === "login" &&
    !needsAccountCompletion &&
    !needsGoogleAccountCompletion
      ? LogIn
      : UserPlus;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.authShell}
    >
      <ScreenBackdrop />
      <ScrollView
        contentContainerStyle={styles.authContent}
        keyboardShouldPersistTaps="handled"
      >
        <ScreenTransition style={styles.authCard}>
          <View style={styles.authTopRow}>
            <Text style={styles.authPanelKicker}>Seu espaço para compartilhar</Text>
            <View style={styles.authModePill}>
              <Text style={styles.authModeText}>
                {mode === "login" ? "Login" : "Cadastro"}
              </Text>
            </View>
          </View>
          <BrandMark hero />
          <Text style={styles.authEyebrow}>Publique. Divulgue. Conecte.</Text>
          <Text style={styles.authTitle}>
            {needsGoogleAccountCompletion
              ? "Conclua seu primeiro acesso"
              : mode === "login"
                ? "Entre na sua conta"
                : "Crie sua conta"}
          </Text>

          {mode === "login" && !needsGoogleAccountCompletion ? (
            <>
              <View style={styles.authSocialRow}>
            <Pressable
              accessibilityLabel="Continuar com o Google"
              accessibilityRole="button"
              disabled={!canContinueWithGoogle}
              onPress={() => void handleGooglePress()}
              style={[
                styles.authSocialButton,
                !canContinueWithGoogle ? styles.authSocialButtonDisabled : null
              ]}
            >
              {isGoogleSigningIn ? (
                <ActivityIndicator color={colors.text} size="small" />
              ) : (
                <Image
                  accessibilityIgnoresInvertColors
                  source={GOOGLE_SIGNIN_ICON}
                  style={styles.authSocialIcon}
                />
              )}
              <Text style={styles.authSocialButtonText}>Google</Text>
            </Pressable>
              </View>

              <View style={styles.authDivider}>
                <View style={styles.authDividerLine} />
                <Text style={styles.authDividerText}>ou use seu e-mail</Text>
                <View style={styles.authDividerLine} />
              </View>
            </>
          ) : null}

          {!needsGoogleAccountCompletion ? (
            <>
              <LabeledInput
                autoCapitalize="none"
                autoComplete="email"
            keyboardType="email-address"
            label="E-mail"
            onChangeText={(value) => {
              setEmail(value);
              setNeedsAccountCompletion(false);
              setAcceptedTerms(false);
              clearFeedback();
            }}
            placeholder="você@email.com"
            value={email}
          />
          {email.trim() && !hasValidEmail ? (
            <Text accessibilityRole="alert" style={styles.authFieldErrorText}>
              Digite um e-mail válido, como nome@dominio.com.
            </Text>
          ) : null}

          <LabeledInput
            autoCapitalize="none"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            label="Senha"
            onChangeText={(value) => {
              setPassword(value);
              clearFeedback();
            }}
            onSubmitEditing={mode === "login" ? submitAuth : undefined}
            placeholder={
              mode === "login" ? "Sua senha" : "8 caracteres, letra maiúscula, minúscula e número"
            }
            returnKeyType={mode === "login" ? "done" : "next"}
            secureTextEntry
            value={password}
          />

          {mode === "create" ? (
            <>
              <View
                accessibilityLabel="Requisitos da senha"
                style={styles.authPasswordRequirements}
              >
                {passwordRequirements.map((requirement) => (
                  <View
                    key={requirement.id}
                    style={styles.authPasswordRequirement}
                  >
                    <View
                      style={[
                        styles.authPasswordRequirementIcon,
                        requirement.met
                          ? styles.authPasswordRequirementIconMet
                          : null
                      ]}
                    >
                      {requirement.met ? (
                        <Check
                          color={colors.onPrimary}
                          size={10}
                          strokeWidth={3}
                        />
                      ) : null}
                    </View>
                    <Text
                      style={[
                        styles.authPasswordRequirementText,
                        requirement.met
                          ? styles.authPasswordRequirementTextMet
                          : null
                      ]}
                    >
                      {requirement.label}
                    </Text>
                  </View>
                ))}
              </View>
              <LabeledInput
                autoCapitalize="none"
                autoComplete="new-password"
                label="Confirmar senha"
                onChangeText={(value) => {
                  setPasswordConfirmation(value);
                  clearFeedback();
                }}
                onSubmitEditing={submitAuth}
                placeholder="Repita sua senha"
                returnKeyType="done"
                secureTextEntry
                value={passwordConfirmation}
              />
              {passwordConfirmation &&
              password !== passwordConfirmation ? (
                <Text accessibilityRole="alert" style={styles.authFieldErrorText}>
                  As senhas não coincidem.
                </Text>
              ) : null}
            </>
          ) : null}

              {mode === "login" ? (
                <Pressable
                  accessibilityRole="button"
                  onPress={handlePasswordReset}
                  style={styles.authInlineAction}
                >
                  <Text style={styles.authInlineActionText}>
                    Esqueci minha senha
                  </Text>
                </Pressable>
              ) : null}
            </>
          ) : (
            <View style={styles.authGoogleConfirmation}>
              <Image
                accessibilityIgnoresInvertColors
                source={GOOGLE_SIGNIN_ICON}
                style={styles.authGoogleConfirmationIcon}
              />
              <View style={styles.authGoogleConfirmationCopy}>
                <Text style={styles.authGoogleConfirmationTitle}>
                  Conta Google confirmada
                </Text>
                <Text
                  numberOfLines={1}
                  style={styles.authGoogleConfirmationEmail}
                >
                  {googleAccountEmail}
                </Text>
              </View>
            </View>
          )}

          {mustAcceptTerms ? (
            <Pressable
              accessibilityLabel="Aceitar Termos de Uso e Política de Privacidade"
              accessibilityRole="checkbox"
              accessibilityState={{ checked: acceptedTerms }}
              onPress={() => setAcceptedTerms((current) => !current)}
              style={styles.checkRow}
            >
              <View
                style={[
                  styles.checkBox,
                  acceptedTerms ? styles.checkBoxActive : null
                ]}
              >
                {acceptedTerms ? (
                  <Check color={colors.onPrimary} size={16} strokeWidth={3} />
                ) : null}
              </View>
              <Text style={styles.checkText}>
                Aceito os Termos de Uso e a Política de Privacidade do {BRAND.name}.
              </Text>
            </Pressable>
          ) : null}

          {needsAccountCompletion || needsGoogleAccountCompletion ? (
            <Text style={styles.authHelperText}>
              {needsGoogleAccountCompletion
                ? "Os termos serão registrados apenas neste primeiro acesso com o Google."
                : "Esta etapa recupera o cadastro sem alterar sua senha."}
            </Text>
          ) : null}

          {successMessage ? (
            <Text accessibilityRole="alert" style={styles.authSuccessText}>
              {successMessage}
            </Text>
          ) : null}

          {errorMessage ? (
            <Text accessibilityRole="alert" style={styles.authErrorText}>
              {errorMessage}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={!canContinue}
            onPress={() =>
              void (needsGoogleAccountCompletion
                ? completeGoogleAccount()
                : submitAuth())
            }
            style={[
              styles.primaryButton,
              !canContinue ? styles.primaryButtonDisabled : null
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.onAccent} size="small" />
            ) : (
              <SubmitIcon color={colors.onAccent} size={19} strokeWidth={2.3} />
            )}
            <Text style={styles.primaryButtonText}>{submitLabel}</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() =>
              needsGoogleAccountCompletion
                ? void cancelGoogleAccountCompletion()
                : changeMode(mode === "login" ? "create" : "login")
            }
            style={styles.secondaryButton}
          >
            {needsGoogleAccountCompletion ? (
              <X color={colors.primaryText} size={18} />
            ) : mode === "login" ? (
              <UserPlus color={colors.primaryText} size={18} />
            ) : (
              <LogIn color={colors.primaryText} size={18} />
            )}
            <Text style={styles.secondaryButtonText}>
              {needsGoogleAccountCompletion
                ? "Cancelar"
                : mode === "login"
                  ? "Cadastrar"
                  : "Voltar para login"}
            </Text>
          </Pressable>
        </ScreenTransition>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
