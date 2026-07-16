import React, { useState } from "react";
import { Check } from "lucide-react-native";
import {
  ActivityIndicator,
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
import { NEXTSTAR_WORDMARK } from "../constants/assets";
import {
  createPasswordCredential,
  hasPasswordCredential,
  verifyPassword
} from "../services/authCredentials";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import { AppUser, UserRole } from "../types";
import {
  getAccountIdentityConflict,
  isValidUsername,
  normalizeUsername
} from "../utils/userIdentity";

export function AuthScreen({
  accounts,
  onComplete
}: {
  accounts: AppUser[];
  onComplete: (user: AppUser) => void;
}) {
  const { width } = useWindowDimensions();
  const [mode, setMode] = useState<"create" | "login">("create");
  const [role, setRole] = useState<UserRole>("Usuario");
  const [name, setName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isCompact = width < 380;
  const authModeLabel = mode === "create" ? "Cadastro" : "Login";
  const roleSummary = role === "Admin" ? "Moderacao" : "Inicio, envio e perfis";
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim().replace(/\s+/g, " ");
  const cleanUsername = normalizeUsername(username);
  const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail);
  const hasValidPassword = password.length >= 6;
  const canContinue =
    hasValidEmail &&
    hasValidPassword &&
    (mode === "login" || cleanName.length >= 3) &&
    (mode === "login" || isValidUsername(cleanUsername)) &&
    (mode === "login" || password === passwordConfirmation) &&
    (mode === "login" || acceptedTerms) &&
    !isSubmitting;

  function changeMode(nextMode: "create" | "login") {
    setMode(nextMode);
    setErrorMessage("");
    setPassword("");
    setPasswordConfirmation("");
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

      if (mode === "create") {
        const identityConflict = getAccountIdentityConflict(
          accounts,
          cleanEmail,
          cleanUsername
        );

        if (identityConflict === "email") {
          setErrorMessage("Ja existe uma conta com este email.");
          return;
        }

        if (identityConflict === "username") {
          setErrorMessage("Este nome de usuario ja esta em uso.");
          return;
        }
      }

      if (mode === "login" && !existingAccount) {
        setErrorMessage("Conta nao encontrada. Confira o email ou crie uma conta.");
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
        onComplete({ ...existingAccount, ...credential });
        return;
      }

      const accountId = `${role.toLowerCase()}-${cleanEmail}`;
      const isAdmin = role === "Admin";
      onComplete({
        acceptedTerms,
        age: null,
        bio: "",
        city: "",
        club: "",
        email: cleanEmail,
        id: accountId,
        kycStatus: isAdmin ? "Aprovado" : "Nao iniciado",
        name: cleanName,
        ...credential,
        position: "",
        profileCompleted: isAdmin,
        role,
        username: cleanUsername
      });
    } catch {
      setErrorMessage("Nao foi possivel autenticar agora. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }

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
              <Text style={styles.authModeText}>{authModeLabel}</Text>
            </View>
          </View>
          <Image
            accessibilityLabel="Logo NextStar"
            resizeMode="contain"
            source={NEXTSTAR_WORDMARK}
            style={[styles.authLogo, isCompact ? styles.authLogoCompact : null]}
          />
          <Text style={styles.authEyebrow}>Descubra. Avalie. Conecte.</Text>
          <Text style={styles.authTitle}>
            {mode === "create" ? "Criar conta" : "Entrar"}
          </Text>
          <View style={styles.authSignalStrip}>
            <View style={styles.authSignalItem}>
              <Text style={styles.authSignalValue}>{role}</Text>
              <Text style={styles.authSignalLabel}>perfil</Text>
            </View>
            <View style={styles.authSignalItem}>
              <Text style={styles.authSignalValue}>{roleSummary}</Text>
              <Text style={styles.authSignalLabel}>fluxo</Text>
            </View>
          </View>

          <View style={styles.segmentedControl}>
            {(["Usuario", "Admin"] as UserRole[]).map((item) => {
              const isActive = role === item;

              return (
                <Pressable
                  key={item}
                  onPress={() => {
                    setRole(item);
                    setErrorMessage("");
                  }}
                  style={[
                    styles.segmentButton,
                    isActive ? styles.segmentButtonActive : null
                  ]}
                >
                  <Text
                    style={[
                      styles.segmentText,
                      isActive ? styles.segmentTextActive : null
                    ]}
                  >
                    {item}
                  </Text>
                </Pressable>
              );
            })}
          </View>

          {mode === "create" ? (
            <>
              <LabeledInput
                autoCapitalize="words"
                label="Nome do jogador"
                maxLength={80}
                onChangeText={(value) => {
                  setName(value);
                  setErrorMessage("");
                }}
                placeholder="Pedro Barberini"
                value={name}
              />
              <LabeledInput
                autoCapitalize="none"
                autoCorrect={false}
                label="Nome de usuario"
                maxLength={30}
                onChangeText={(value) => {
                  setUsername(
                    value.replace(/^@+/, "").replace(/[^a-zA-Z0-9._]/g, "")
                  );
                  setErrorMessage("");
                }}
                placeholder="pedrobarberini"
                value={username}
              />
              <Text style={styles.authIdentityHint}>
                Seu nome pode se repetir. O @usuario e unico e sera usado para
                encontrar seu perfil.
              </Text>
            </>
          ) : null}

          <LabeledInput
            autoCapitalize="none"
            autoComplete="email"
            keyboardType="email-address"
            label="Email"
            onChangeText={(value) => {
              setEmail(value);
              setErrorMessage("");
            }}
            placeholder={
              role === "Admin" ? "admin@nextstar.local" : "voce@email.com"
            }
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

          <Text style={styles.authHelperText}>
            {mode === "login"
              ? "Contas antigas definem a senha na primeira entrada."
              : "Depois do cadastro voce completa seus dados de perfil."}
          </Text>

          {mode === "create" ? (
            <Pressable
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
                Aceito que este ambiente e demonstrativo, sem dinheiro real,
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
            disabled={!canContinue}
            onPress={submitAuth}
            style={[
              styles.primaryButton,
              !canContinue ? styles.primaryButtonDisabled : null
            ]}
          >
            {isSubmitting ? (
              <ActivityIndicator color={colors.onPrimary} size="small" />
            ) : null}
            <Text style={styles.primaryButtonText}>
              {mode === "create" ? "Criar conta" : "Entrar"}
            </Text>
          </Pressable>

          <Pressable
            onPress={() => changeMode(mode === "create" ? "login" : "create")}
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>
              {mode === "create" ? "Ja tenho conta" : "Criar nova conta"}
            </Text>
          </Pressable>
        </ScreenTransition>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
