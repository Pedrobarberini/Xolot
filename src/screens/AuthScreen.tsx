import React, { useState } from "react";
import { Check, LogIn, UserPlus } from "lucide-react-native";
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View
} from "react-native";
import { ScreenBackdrop, ScreenTransition } from "../components/AppShell";
import { LabeledInput } from "../components/Navigation";
import { XOLOT_WORDMARK } from "../constants/assets";
import { useGoogleSignIn } from "../hooks/useGoogleSignIn";
import {
  createPasswordCredential,
  hasPasswordCredential,
  verifyPassword
} from "../services/authCredentials";
import {
  GoogleAuthCancelledError,
  GoogleAuthConfigurationError,
  GoogleIdentity
} from "../services/googleAuth";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import { AppUser } from "../types";
import {
  claimUniqueUsername,
  normalizeUsername
} from "../utils/userIdentity";

type AuthMode = "create" | "login";

export function AuthScreen({
  accounts,
  onComplete
}: {
  accounts: AppUser[];
  onComplete: (user: AppUser) => void;
}) {
  const { width } = useWindowDimensions();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    isAvailable: isGoogleAvailable,
    isReady: isGoogleReady,
    isSigningIn: isGoogleSigningIn,
    signInWithGoogle
  } = useGoogleSignIn();
  const isCompact = width < 380;
  const cleanEmail = email.trim().toLowerCase();
  const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
  const hasValidPassword = password.length >= 6;
  const isBusy = isSubmitting || isGoogleSigningIn;
  const canContinue =
    hasValidEmail &&
    hasValidPassword &&
    (mode === "login" || password === passwordConfirmation) &&
    (mode === "login" || acceptedTerms) &&
    !isBusy;
  const canContinueWithGoogle = !isBusy && (Platform.OS === "web" || isGoogleReady);

  function changeMode(nextMode: AuthMode) {
    setMode(nextMode);
    setErrorMessage("");
    setPassword("");
    setPasswordConfirmation("");
    setAcceptedTerms(false);
  }

  function completeWithGoogleIdentity(identity: GoogleIdentity) {
    const existingAccount = accounts.find(
      (account) =>
        account.googleUid === identity.uid ||
        account.email.toLowerCase() === identity.email
    );

    if (existingAccount) {
      onComplete({
        ...existingAccount,
        authProvider: "google",
        email: identity.email,
        googleUid: identity.uid,
        name: existingAccount.name || identity.name,
        ...(identity.photoURL ? { photoURL: identity.photoURL } : {})
      });
      return;
    }

    const accountId = `google-${identity.uid}`;
    const takenUsernames = new Set(
      accounts.map((account) => normalizeUsername(account.username))
    );
    const provisionalUsername = claimUniqueUsername(
      identity.email.split("@")[0],
      takenUsernames,
      accountId
    );

    onComplete({
      acceptedTerms: true,
      age: null,
      authProvider: "google",
      bio: "",
      city: "",
      club: "",
      email: identity.email,
      googleUid: identity.uid,
      id: accountId,
      kycStatus: "Não iniciado",
      name: identity.name,
      ...(identity.photoURL ? { photoURL: identity.photoURL } : {}),
      position: "",
      profileCompleted: false,
      role: "Usuário",
      username: provisionalUsername
    });
  }

  async function handleGooglePress() {
    setErrorMessage("");

    if (!isGoogleAvailable) {
      Alert.alert(
        "Login com Google",
        "Configure o Firebase no arquivo .env (veja .env.example) e reinicie o Expo."
      );
      return;
    }

    if (mode === "create" && !acceptedTerms) {
      setErrorMessage("Aceite os termos para criar a conta com Google.");
      return;
    }

    try {
      const identity = await signInWithGoogle();
      completeWithGoogleIdentity(identity);
    } catch (error) {
      if (error instanceof GoogleAuthCancelledError) {
        return;
      }

      if (error instanceof GoogleAuthConfigurationError) {
        setErrorMessage(error.message);
        return;
      }

      const message =
        error instanceof Error
          ? error.message
          : "Não foi possível autenticar com Google.";
      setErrorMessage(message);
    }
  }

  async function submitAuth() {
    if (!canContinue) {
      return;
    }

    setErrorMessage("");
    setIsSubmitting(true);

    try {
      const existingAccount = accounts.find(
        (account) => account.email.toLowerCase() === cleanEmail
      );

      if (mode === "create" && existingAccount) {
        setErrorMessage("Já existe uma conta com este email.");
        return;
      }

      if (mode === "login" && !existingAccount) {
        setErrorMessage("Conta não encontrada. Confira o email ou cadastre-se.");
        return;
      }

      if (existingAccount?.authProvider === "google" && !hasPasswordCredential(existingAccount)) {
        setErrorMessage(
          "Esta conta usa Google. Toque em Continuar com Google para entrar."
        );
        return;
      }

      if (existingAccount && hasPasswordCredential(existingAccount)) {
        const isPasswordValid = await verifyPassword(existingAccount, password);

        if (!isPasswordValid) {
          setErrorMessage("Senha incorreta. Tente novamente.");
          return;
        }

        onComplete(existingAccount);
        return;
      }

      const credential = await createPasswordCredential(password);

      if (existingAccount) {
        onComplete({
          ...existingAccount,
          ...credential,
          authProvider: "password"
        });
        return;
      }

      const accountId = `usuario-${cleanEmail}`;
      const takenUsernames = new Set(
        accounts.map((account) => normalizeUsername(account.username))
      );
      const provisionalUsername = claimUniqueUsername(
        cleanEmail.split("@")[0],
        takenUsernames,
        accountId
      );

      onComplete({
        acceptedTerms,
        age: null,
        authProvider: "password",
        bio: "",
        city: "",
        club: "",
        email: cleanEmail,
        id: accountId,
        kycStatus: "Não iniciado",
        name: cleanEmail.split("@")[0],
        ...credential,
        position: "",
        profileCompleted: false,
        role: "Usuário",
        username: provisionalUsername
      });
    } catch {
      setErrorMessage("Não foi possível autenticar agora. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

  const submitLabel = mode === "login" ? "Entrar" : "Criar conta";
  const SubmitIcon = mode === "login" ? LogIn : UserPlus;

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
            <Text style={styles.authPanelKicker}>Talentos em movimento</Text>
            <View style={styles.authModePill}>
              <Text style={styles.authModeText}>
                {mode === "login" ? "Login" : "Cadastro"}
              </Text>
            </View>
          </View>
          <Image
            accessibilityLabel="Logo Xolot"
            resizeMode="contain"
            source={XOLOT_WORDMARK}
            style={[styles.authLogo, isCompact ? styles.authLogoCompact : null]}
          />
          <Text style={styles.authEyebrow}>Descubra. Avalie. Conecte.</Text>
          <Text style={styles.authTitle}>
            {mode === "login" ? "Entre na sua conta" : "Crie sua conta"}
          </Text>

          <Pressable
            accessibilityLabel="Continuar com Google"
            accessibilityRole="button"
            disabled={!canContinueWithGoogle}
            onPress={handleGooglePress}
            style={[
              styles.authGoogleButton,
              !canContinueWithGoogle ? styles.authGoogleButtonDisabled : null
            ]}
          >
            {isGoogleSigningIn ? (
              <ActivityIndicator color={colors.text} size="small" />
            ) : (
              <View style={styles.authGoogleIcon}>
                <Text style={styles.authGoogleIconText}>G</Text>
              </View>
            )}
            <Text style={styles.authGoogleButtonText}>Continuar com Google</Text>
          </Pressable>

          <View style={styles.authDivider}>
            <View style={styles.authDividerLine} />
            <Text style={styles.authDividerText}>ou use seu email</Text>
            <View style={styles.authDividerLine} />
          </View>

          <LabeledInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            label="Email"
            onChangeText={(value) => {
              setEmail(value);
              setErrorMessage("");
            }}
            placeholder="você@email.com"
            value={email}
          />

          <LabeledInput
            autoCapitalize="none"
            autoComplete={mode === "login" ? "current-password" : "new-password"}
            label="Senha"
            onChangeText={(value) => {
              setPassword(value);
              setErrorMessage("");
            }}
            onSubmitEditing={mode === "login" ? submitAuth : undefined}
            placeholder="Minimo de 6 caracteres"
            returnKeyType={mode === "login" ? "done" : "next"}
            secureTextEntry
            value={password}
          />

          {mode === "create" ? (
            <LabeledInput
              autoCapitalize="none"
              autoComplete="new-password"
              label="Confirmar senha"
              onChangeText={(value) => {
                setPasswordConfirmation(value);
                setErrorMessage("");
              }}
              onSubmitEditing={submitAuth}
              placeholder="Repita sua senha"
              returnKeyType="done"
              secureTextEntry
              value={passwordConfirmation}
            />
          ) : null}

          {mode === "create" ? (
            <Pressable
              accessibilityLabel="Aceitar termos do ambiente demonstrativo"
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
                Aceito que este ambiente é demonstrativo, sem dinheiro real,
                contrato real ou promessa de retorno.
              </Text>
            </Pressable>
          ) : null}

          {errorMessage ? (
            <Text accessibilityRole="alert" style={styles.authErrorText}>
              {errorMessage}
            </Text>
          ) : null}

          <Pressable
            accessibilityRole="button"
            disabled={!canContinue}
            onPress={submitAuth}
            style={[
              styles.primaryButton,
              !canContinue ? styles.primaryButtonDisabled : null
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.onPrimary} size="small" />
            ) : (
              <SubmitIcon color={colors.onPrimary} size={19} strokeWidth={2.3} />
            )}
            <Text style={styles.primaryButtonText}>{submitLabel}</Text>
          </Pressable>

          <Pressable
            accessibilityRole="button"
            onPress={() => changeMode(mode === "login" ? "create" : "login")}
            style={styles.secondaryButton}
          >
            {mode === "login" ? (
              <UserPlus color={colors.primary} size={18} />
            ) : (
              <LogIn color={colors.primary} size={18} />
            )}
            <Text style={styles.secondaryButtonText}>
              {mode === "login" ? "Cadastrar" : "Voltar para login"}
            </Text>
          </Pressable>
        </ScreenTransition>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
