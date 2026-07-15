import React, { useState } from "react";
import { Check } from "lucide-react-native";
import { Image, KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { LabeledInput } from "../components/Navigation";
import { ScreenBackdrop, ScreenTransition } from "../components/AppShell";
import { NEXTSTAR_WORDMARK } from "../constants/assets";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import { AppUser, UserRole } from "../types";

export function AuthScreen({
  onComplete
}: {
  onComplete: (user: AppUser) => void;
}) {
  const { width } = useWindowDimensions();
  const [mode, setMode] = useState<"create" | "login">("create");
  const [role, setRole] = useState<UserRole>("Usuario");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const isCompact = width < 380;
  const authModeLabel = mode === "create" ? "Cadastro" : "Login";
  const roleSummary = role === "Admin" ? "Moderacao" : "Feed, envio e carteira";

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const canContinue =
    cleanEmail.includes("@") &&
    (mode === "login" || cleanName.length >= 3) &&
    (mode === "login" || acceptedTerms);

  function buildUser() {
    const fallbackName =
      role === "Admin" ? "Admin NextStar" : cleanEmail.split("@")[0] || "Usuario";

    onComplete({
      id: `${role.toLowerCase()}-${cleanEmail}`,
      name: mode === "login" ? fallbackName : cleanName,
      email: cleanEmail,
      role,
      kycStatus: role === "Admin" ? "Aprovado" : "Nao iniciado",
      acceptedTerms: mode === "login" ? true : acceptedTerms
    });
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.authShell}
    >
      <ScreenBackdrop />
      <ScrollView contentContainerStyle={styles.authContent}>
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
                onPress={() => setRole(item)}
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
          <LabeledInput
            label="Nome completo"
            onChangeText={setName}
            placeholder="Seu nome"
            value={name}
          />
        ) : null}

        <LabeledInput
          autoCapitalize="none"
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          placeholder={
            role === "Admin" ? "admin@nextstar.local" : "voce@email.com"
          }
          value={email}
        />

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

        <Pressable
          disabled={!canContinue}
          onPress={buildUser}
          style={[
            styles.primaryButton,
            !canContinue ? styles.primaryButtonDisabled : null
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {mode === "create" ? "Criar conta" : "Entrar"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setMode(mode === "create" ? "login" : "create")}
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
