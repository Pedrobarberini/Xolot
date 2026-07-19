import React, { useState } from "react";
import { ArrowLeft, Check, LogOut } from "lucide-react-native";
import {
  KeyboardAvoidingView,
  Modal,
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
import {
  isUsernameAvailable,
  normalizeUsername
} from "../utils/userIdentity";

type AccountSetupProps = {
  accounts: AppUser[];
  isInitialSetup?: boolean;
  onBack?: () => void;
  onSave: (profile: AccountProfile) => void;
  onSignOut?: () => void;
  user: AppUser;
};

export function AccountSetupScreen({
  accounts,
  isInitialSetup = false,
  onBack,
  onSave,
  onSignOut,
  user
}: AccountSetupProps) {
  const { width } = useWindowDimensions();
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio);
  const [ageText, setAgeText] = useState(user.age ? String(user.age) : "");
  const [position, setPosition] = useState(user.position);
  const [city, setCity] = useState(user.city);
  const [club, setClub] = useState(user.club);
  const age = Number(ageText);
  const cleanUsername = normalizeUsername(username);
  const usernameAvailable = isUsernameAvailable(
    accounts,
    cleanUsername,
    user.id
  );
  const cleanProfile: AccountProfile = {
    age: Number.isInteger(age) ? age : null,
    bio: bio.trim(),
    city: city.trim(),
    club: club.trim(),
    name: name.trim(),
    position: position.trim(),
    username: cleanUsername
  };
  const canSave =
    cleanProfile.name.length >= 3 &&
    usernameAvailable &&
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
            <Text style={styles.accountSetupTitle}>Configure seu perfil</Text>
            <Text style={styles.accountSetupSubtitle}>
              Escolha sua identidade pública e complete seus dados de atleta.
            </Text>
          </View>
        )}

        <View
          style={[
            styles.accountSetupSection,
            isInitialSetup ? styles.accountSetupSectionInitial : null
          ]}
        >
          <View style={styles.accountSetupSectionHeader}>
            <Text style={styles.settingsSectionTitle}>Perfil público</Text>
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

          <LabeledInput
            autoCapitalize="none"
            autoCorrect={false}
            label="Nome de usuário"
            maxLength={30}
            onChangeText={(value) =>
              setUsername(
                value.replace(/^@+/, "").replace(/[^a-zA-Z0-9._]/g, "")
              )
            }
            placeholder="seu.username"
            value={username}
          />
          <Text
            style={
              cleanUsername.length >= 3 && !usernameAvailable
                ? styles.accountSetupUsernameError
                : styles.accountSetupHint
            }
          >
            {cleanUsername.length >= 3 && !usernameAvailable
              ? "Este nome de usuário já está em uso ou não é válido."
              : "Identidade única usada no Início, pesquisa e mensagens."}
          </Text>

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
            {isInitialSetup ? "Concluir perfil" : "Salvar alteracoes"}
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

export function AccountSetupModal({
  visible,
  ...props
}: AccountSetupProps & { visible: boolean }) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={props.onSignOut}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.accountSetupModalRoot}>
        <View pointerEvents="none" style={styles.accountSetupModalBackdrop} />
        <View accessibilityViewIsModal style={styles.accountSetupModalDialog}>
          <AccountSetupScreen {...props} isInitialSetup />
        </View>
      </View>
    </Modal>
  );
}
