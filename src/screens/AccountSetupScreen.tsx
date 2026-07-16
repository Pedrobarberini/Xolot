import React, { useState } from "react";
import { ArrowLeft, Check, LogOut } from "lucide-react-native";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View
} from "react-native";
import { LabeledInput } from "../components/Navigation";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import { AccountProfile, AppUser } from "../types";

export function AccountSetupScreen({
  isInitialSetup = false,
  onBack,
  onSave,
  onSignOut,
  user
}: {
  isInitialSetup?: boolean;
  onBack?: () => void;
  onSave: (profile: AccountProfile) => void;
  onSignOut?: () => void;
  user: AppUser;
}) {
  const { width } = useWindowDimensions();
  const [name, setName] = useState(user.profileCompleted ? user.name : "");
  const [bio, setBio] = useState(user.bio);
  const [ageText, setAgeText] = useState(user.age ? String(user.age) : "");
  const [position, setPosition] = useState(user.position);
  const [city, setCity] = useState(user.city);
  const [club, setClub] = useState(user.club);
  const age = Number(ageText);
  const cleanProfile: AccountProfile = {
    age: Number.isInteger(age) ? age : null,
    bio: bio.trim(),
    city: city.trim(),
    club: club.trim(),
    name: name.trim(),
    position: position.trim()
  };
  const canSave =
    cleanProfile.name.length >= 3 &&
    cleanProfile.bio.length >= 10 &&
    cleanProfile.bio.length <= 240 &&
    cleanProfile.age !== null &&
    cleanProfile.age >= 5 &&
    cleanProfile.age <= 100 &&
    cleanProfile.position.length >= 2 &&
    cleanProfile.city.length >= 2 &&
    cleanProfile.club.length >= 2;
  const isNarrow = width < 370;

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.accountSetupRoot}
    >
      <ScrollView
        contentContainerStyle={styles.accountSetupContent}
        keyboardShouldPersistTaps="handled"
      >
        {!isInitialSetup ? (
          <View style={styles.profileSubviewHeader}>
            <Pressable
              accessibilityLabel="Voltar para configuracoes"
              accessibilityRole="button"
              hitSlop={8}
              onPress={onBack}
              style={styles.profileSubviewBackButton}
            >
              <ArrowLeft color={colors.text} size={20} />
            </Pressable>
            <Text style={styles.profileSubviewTitle}>Editar perfil</Text>
            <View style={styles.profileSubviewSpacer} />
          </View>
        ) : (
          <View style={styles.accountSetupIntro}>
            <Text style={styles.accountSetupEyebrow}>Primeiro acesso</Text>
            <Text style={styles.accountSetupTitle}>Complete seu perfil</Text>
            <Text style={styles.accountSetupSubtitle}>
              Esses dados identificam voce no Inicio, na pesquisa e para outros
              usuarios da plataforma.
            </Text>
          </View>
        )}

        <View style={styles.accountSetupSection}>
          <View style={styles.accountSetupSectionHeader}>
            <Text style={styles.settingsSectionTitle}>Dados do atleta</Text>
            <Text style={styles.accountSetupRequired}>Obrigatorio</Text>
          </View>

          <LabeledInput
            autoCapitalize="words"
            label="Nome do atleta"
            maxLength={80}
            onChangeText={setName}
            placeholder="Nome completo"
            value={name}
          />

          <View
            style={[
              styles.accountSetupFieldRow,
              isNarrow ? styles.accountSetupFieldRowNarrow : null
            ]}
          >
            <View style={styles.accountSetupAgeField}>
              <LabeledInput
                keyboardType="number-pad"
                label="Idade"
                maxLength={3}
                onChangeText={(value) => setAgeText(value.replace(/\D/g, ""))}
                placeholder="17"
                value={ageText}
              />
            </View>
            <View style={styles.accountSetupPositionField}>
              <LabeledInput
                autoCapitalize="words"
                label="Posicao"
                maxLength={40}
                onChangeText={setPosition}
                placeholder="Ponta"
                value={position}
              />
            </View>
          </View>

          <LabeledInput
            autoCapitalize="words"
            label="Cidade"
            maxLength={80}
            onChangeText={setCity}
            placeholder="Cidade, UF"
            value={city}
          />

          <LabeledInput
            autoCapitalize="words"
            label="Clube ou projeto"
            maxLength={80}
            onChangeText={setClub}
            placeholder="Clube atual ou projeto"
            value={club}
          />

          <LabeledInput
            label="Biografia"
            maxLength={240}
            multiline
            numberOfLines={5}
            onChangeText={setBio}
            placeholder="Conte sua historia, objetivos e estilo de jogo."
            value={bio}
          />
          <View style={styles.accountSetupBioMeta}>
            <Text style={styles.accountSetupHint}>Minimo de 10 caracteres</Text>
            <Text style={styles.accountSetupCounter}>{bio.length}/240</Text>
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          disabled={!canSave}
          onPress={() => onSave(cleanProfile)}
          style={[
            styles.primaryButton,
            styles.accountSetupSaveButton,
            !canSave ? styles.primaryButtonDisabled : null
          ]}
        >
          <Check color={colors.onPrimary} size={19} strokeWidth={2.5} />
          <Text style={styles.primaryButtonText}>
            {isInitialSetup ? "Salvar e continuar" : "Salvar alteracoes"}
          </Text>
        </Pressable>

        {isInitialSetup && onSignOut ? (
          <Pressable
            accessibilityRole="button"
            onPress={onSignOut}
            style={styles.accountSetupSignOutButton}
          >
            <LogOut color={colors.muted} size={17} />
            <Text style={styles.accountSetupSignOutText}>Sair da conta</Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
