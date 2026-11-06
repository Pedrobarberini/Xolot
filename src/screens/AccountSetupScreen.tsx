import { BRAND } from "../config/brand.ts";
import React, { useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Camera, Check, ChevronLeft, ChevronRight, LogOut, UserRound } from "lucide-react-native";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { BackButton, LabeledInput } from "../components/Navigation";
import { ProfileAvatarImage } from "../components/ProfileAvatarImage";
import { TagPicker } from "../components/TagPicker";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import type { AccountProfile, AppUser, ProfileAvatar, TagCatalogEntry } from "../types";
import { DEFAULT_AVATAR_CROP_SCALE } from "../utils/avatarFocus";
import { isUsernameAvailable, normalizeUsername } from "../utils/userIdentity";
import { getProfilePresentationSuggestions } from "../features/profiles";

type AccountSetupProps = {
  accounts: AppUser[];
  avatar?: ProfileAvatar;
  isInitialSetup?: boolean;
  onBack?: () => void;
  onChangeAvatar?: (avatar: ProfileAvatar) => void;
  onCreateTag?: (label: string) => Promise<unknown> | unknown;
  onSave: (profile: AccountProfile) => Promise<boolean> | boolean;
  onSignOut?: () => void;
  tagCatalog: TagCatalogEntry[];
  user: AppUser;
};

const SETUP_STEPS = [
  {
    label: "Você",
    title: "Vamos criar seu perfil",
    subtitle: `Comece com as informações usadas para identificar você no ${BRAND.name}.`,
  },
  {
    label: "Seu espaço",
    title: "Conte um pouco sobre você",
    subtitle: "Apresente seu perfil e o que você quer compartilhar ou divulgar.",
  },
  {
    label: "Interesses",
    title: "Monte seu Para você",
    subtitle: "Escolha temas para priorizar conteúdos relevantes desde o primeiro acesso.",
  },
] as const;

export function AccountSetupScreen({
  accounts,
  avatar,
  isInitialSetup = false,
  onBack,
  onChangeAvatar,
  onCreateTag,
  onSave,
  onSignOut,
  tagCatalog,
  user,
}: AccountSetupProps) {
  const { width } = useWindowDimensions();
  const scrollRef = useRef<ScrollView>(null);
  const stepOpacity = useRef(new Animated.Value(1)).current;
  const stepTranslateX = useRef(new Animated.Value(0)).current;
  const backButtonProgress = useRef(new Animated.Value(0)).current;
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [name, setName] = useState(user.name);
  const [username, setUsername] = useState(user.username);
  const [bio, setBio] = useState(user.bio);
  const [ageText, setAgeText] = useState(user.age ? String(user.age) : "");
  const [presentation, setPresentation] = useState(user.position);
  const [city, setCity] = useState(user.city);
  const [organization, setOrganization] = useState(user.club);
  const [interestTags, setInterestTags] = useState(user.interestTags);
  const [selectedAvatar, setSelectedAvatar] = useState<ProfileAvatar | undefined>(
    avatar ??
      (user.photoURL
        ? {
            cropScale: DEFAULT_AVATAR_CROP_SCALE,
            focusX: 50,
            focusY: 50,
            uri: user.photoURL,
          }
        : undefined),
  );
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const age = Number(ageText);
  const cleanUsername = normalizeUsername(username);
  const usernameAvailable = isUsernameAvailable(accounts, cleanUsername, user.id);
  // Área legada é preservada; os interesses são escolhidos apenas por hashtags.
  const cleanProfile: AccountProfile = {
    age: Number.isInteger(age) ? age : null,
    bio: bio.trim(),
    city: city.trim(),
    club: organization.trim(),
    interestTags,
    name: name.trim(),
    position: presentation.trim(),
    sport: user.sport.trim(),
    username: cleanUsername,
  };
  const identityValid =
    cleanProfile.name.length >= 3 &&
    usernameAvailable &&
    cleanProfile.age !== null &&
    cleanProfile.age >= 5 &&
    cleanProfile.age <= 100 &&
    cleanProfile.city.length >= 2;
  const activityValid =
    cleanProfile.position.length >= 2 &&
    cleanProfile.bio.length >= 10 &&
    cleanProfile.bio.length <= 240;
  const interestsValid = cleanProfile.interestTags.length >= 1;
  const stepValid = [identityValid, activityValid, interestsValid][currentStep];
  const canSave = identityValid && activityValid && interestsValid;
  const isNarrow = width < 370;
  const step = SETUP_STEPS[currentStep];
  const presentationSuggestions = getProfilePresentationSuggestions();

  function animateToStep(nextStep: number) {
    if (
      isTransitioning ||
      nextStep < 0 ||
      nextStep >= SETUP_STEPS.length ||
      nextStep === currentStep
    ) {
      return;
    }

    const direction = nextStep > currentStep ? 1 : -1;
    setIsTransitioning(true);
    Animated.parallel([
      Animated.timing(backButtonProgress, {
        duration: currentStep === 0 || nextStep === 0 ? 240 : 120,
        easing: Easing.out(Easing.cubic),
        toValue: nextStep > 0 ? 1 : 0,
        useNativeDriver: false,
      }),
      Animated.timing(stepOpacity, {
        duration: 120,
        easing: Easing.in(Easing.cubic),
        toValue: 0,
        useNativeDriver: true,
      }),
      Animated.timing(stepTranslateX, {
        duration: 120,
        easing: Easing.in(Easing.cubic),
        toValue: -18 * direction,
        useNativeDriver: true,
      }),
    ]).start(({ finished }) => {
      if (!finished) {
        setIsTransitioning(false);
        return;
      }

      setCurrentStep(nextStep);
      scrollRef.current?.scrollTo({ animated: false, y: 0 });
      stepTranslateX.setValue(18 * direction);
      requestAnimationFrame(() => {
        Animated.parallel([
          Animated.timing(stepOpacity, {
            duration: 210,
            easing: Easing.out(Easing.cubic),
            toValue: 1,
            useNativeDriver: true,
          }),
          Animated.timing(stepTranslateX, {
            duration: 210,
            easing: Easing.out(Easing.cubic),
            toValue: 0,
            useNativeDriver: true,
          }),
        ]).start(() => setIsTransitioning(false));
      });
    });
  }

  async function submitProfile() {
    if (!canSave || isSaving) {
      return;
    }

    setSaveError("");
    setIsSaving(true);
    try {
      const saved = await onSave(cleanProfile);
      if (!saved) {
        setSaveError("Revise os dados e tente salvar novamente.");
        return;
      }
      if (selectedAvatar && onChangeAvatar) {
        onChangeAvatar(selectedAvatar);
      }
    } catch {
      setSaveError("Não foi possível salvar o perfil agora.");
    } finally {
      setIsSaving(false);
    }
  }

  function goForward() {
    if (!stepValid || isSaving || isTransitioning) {
      return;
    }
    if (currentStep < SETUP_STEPS.length - 1) {
      setSaveError("");
      animateToStep(currentStep + 1);
      return;
    }
    void submitProfile();
  }

  function goBack() {
    if (currentStep > 0) {
      setSaveError("");
      animateToStep(currentStep - 1);
      return;
    }
    onBack?.();
  }

  async function pickProfilePhoto() {
    try {
      if (Platform.OS !== "web") {
        const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (!permission.granted) {
          Alert.alert(
            "Permissão necessária",
            "Autorize o acesso às fotos para escolher uma imagem de perfil.",
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        base64: true,
        mediaTypes: ["images"],
        quality: 0.6,
      });
      if (result.canceled || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];
      setSelectedAvatar({
        cropScale: DEFAULT_AVATAR_CROP_SCALE,
        focusX: 50,
        focusY: 50,
        sourceHeight: asset.height,
        sourceWidth: asset.width,
        uri: asset.base64
          ? `data:${asset.mimeType ?? "image/jpeg"};base64,${asset.base64}`
          : asset.uri,
      });
    } catch {
      Alert.alert("Não foi possível abrir a galeria", "Tente novamente ou escolha outra imagem.");
    }
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.accountSetupRoot}
    >
      <View style={styles.accountSetupHeader}>
        {!isInitialSetup ? (
          <View style={styles.profileSubviewHeader}>
            <BackButton accessibilityLabel="Voltar para configurações" onPress={goBack} />
            <Text style={styles.profileSubviewTitle}>Editar perfil</Text>
            <View style={styles.profileSubviewSpacer} />
          </View>
        ) : null}

        <View style={styles.accountSetupIntro}>
          <Text style={styles.accountSetupEyebrow}>
            Etapa {currentStep + 1} de {SETUP_STEPS.length}
          </Text>
          <Text style={styles.accountSetupTitle}>{step.title}</Text>
          <Text style={styles.accountSetupSubtitle}>{step.subtitle}</Text>
        </View>

        <View style={styles.accountSetupProgress}>
          {SETUP_STEPS.map((item, index) => (
            <View key={item.label} style={styles.accountSetupProgressItem}>
              <View
                style={[
                  styles.accountSetupProgressBar,
                  index <= currentStep ? styles.accountSetupProgressBarActive : null,
                ]}
              />
              <Text
                style={[
                  styles.accountSetupProgressLabel,
                  index === currentStep ? styles.accountSetupProgressLabelActive : null,
                ]}
              >
                {item.label}
              </Text>
            </View>
          ))}
        </View>
      </View>

      <Animated.View
        style={[
          styles.accountSetupStepViewport,
          {
            opacity: stepOpacity,
            transform: [{ translateX: stepTranslateX }],
          },
        ]}
      >
        <ScrollView
          contentContainerStyle={styles.accountSetupStepContent}
          keyboardShouldPersistTaps="handled"
          ref={scrollRef}
          showsVerticalScrollIndicator={false}
        >
          <View
            style={[
              styles.accountSetupSection,
              isInitialSetup ? styles.accountSetupSectionInitial : null,
            ]}
          >
            {currentStep === 0 ? (
              <>
                <View style={styles.accountSetupAvatarRow}>
                  <View style={styles.accountSetupAvatarPreview}>
                    {selectedAvatar ? (
                      <ProfileAvatarImage avatar={selectedAvatar} />
                    ) : (
                      <UserRound color={colors.primaryText} size={34} />
                    )}
                  </View>
                  <View style={styles.accountSetupAvatarCopy}>
                    <Text style={styles.accountSetupInterestTitle}>Foto de perfil</Text>
                    <Text style={styles.accountSetupHint}>
                      Opcional agora. Você poderá ajustar o enquadramento depois.
                    </Text>
                    <Pressable
                      accessibilityRole="button"
                      onPress={pickProfilePhoto}
                      style={styles.accountSetupAvatarButton}
                    >
                      <Camera color={colors.primaryText} size={16} />
                      <Text style={styles.accountSetupAvatarButtonText}>
                        {selectedAvatar ? "Trocar foto" : "Escolher foto"}
                      </Text>
                    </Pressable>
                  </View>
                </View>

                <LabeledInput
                  autoCapitalize="words"
                  label="Seu nome"
                  maxLength={80}
                  onChangeText={setName}
                  placeholder="Como você quer ser identificado"
                  value={name}
                />

                <LabeledInput
                  autoCapitalize="none"
                  autoCorrect={false}
                  label="Nome de usuário"
                  maxLength={30}
                  onChangeText={(value) =>
                    setUsername(value.replace(/^@+/, "").replace(/[^a-zA-Z0-9._]/g, ""))
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
                    : `Seu @ único no ${BRAND.name}.`}
                </Text>

                <View
                  style={[
                    styles.accountSetupFieldRow,
                    isNarrow ? styles.accountSetupFieldRowNarrow : null,
                  ]}
                >
                  <View style={styles.accountSetupAgeField}>
                    <LabeledInput
                      keyboardType="number-pad"
                      label="Idade"
                      maxLength={3}
                      onChangeText={(value) => setAgeText(value.replace(/\D/g, ""))}
                      placeholder="18"
                      value={ageText}
                    />
                  </View>
                  <View style={styles.accountSetupPositionField}>
                    <LabeledInput
                      autoCapitalize="words"
                      label="Cidade"
                      maxLength={80}
                      onChangeText={setCity}
                      placeholder="Cidade, UF"
                      value={city}
                    />
                  </View>
                </View>
              </>
            ) : null}

            {currentStep === 1 ? (
              <>
                <LabeledInput
                  autoCapitalize="words"
                  accessibilityLabel="Como você se apresenta"
                  label="Como você se apresenta"
                  maxLength={40}
                  onChangeText={setPresentation}
                  placeholder="Perfil pessoal, criador, artista, negócio..."
                  value={presentation}
                />
                {presentationSuggestions.length > 0 ? (
                  <View style={styles.accountSetupSuggestionBlock}>
                    <Text style={styles.accountSetupSuggestionLabel}>Você pode ser</Text>
                    <View style={styles.accountSetupSuggestionList}>
                      {presentationSuggestions.map((suggestion) => {
                        const selected =
                          suggestion.toLocaleLowerCase("pt-BR") ===
                          presentation.trim().toLocaleLowerCase("pt-BR");
                        return (
                          <Pressable
                            accessibilityRole="button"
                            accessibilityState={{ selected }}
                            key={suggestion}
                            onPress={() => setPresentation(suggestion)}
                            style={[
                              styles.accountSetupSuggestionChip,
                              selected ? styles.accountSetupSuggestionChipSelected : null,
                            ]}
                          >
                            <Text
                              style={[
                                styles.accountSetupSuggestionChipText,
                                selected ? styles.accountSetupSuggestionChipTextSelected : null,
                              ]}
                            >
                              {suggestion}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>
                ) : null}

                <LabeledInput
                  autoCapitalize="words"
                  accessibilityLabel="Marca, projeto ou organização (opcional)"
                  label="Marca, projeto ou organização (opcional)"
                  maxLength={80}
                  onChangeText={setOrganization}
                  placeholder="Nome da sua marca, projeto ou organização"
                  value={organization}
                />

                <LabeledInput
                  label="Biografia"
                  maxLength={240}
                  multiline
                  numberOfLines={5}
                  onChangeText={setBio}
                  placeholder="Conte brevemente quem você é e o que publica."
                  value={bio}
                />
                <View style={styles.accountSetupBioMeta}>
                  <Text style={styles.accountSetupHint}>Mínimo de 10 caracteres</Text>
                  <Text style={styles.accountSetupCounter}>{bio.length}/240</Text>
                </View>
              </>
            ) : null}

            {currentStep === 2 ? (
              <View style={styles.accountSetupInterestSectionCompact}>
                <TagPicker
                  catalog={tagCatalog}
                  hint="Escolha de uma a seis hashtags. Se não encontrar um tema, digite e crie o seu."
                  maxTags={6}
                  onChange={setInterestTags}
                  onCreateTag={onCreateTag}
                  selectedTags={interestTags}
                  title="O que você quer acompanhar?"
                />
              </View>
            ) : null}
          </View>
        </ScrollView>
      </Animated.View>

      <View style={styles.accountSetupFooter}>
        <View style={styles.accountSetupActions}>
          <Animated.View
            pointerEvents={currentStep === 0 ? "none" : "auto"}
            style={[
              styles.accountSetupActionSlot,
              styles.accountSetupBackButtonSlot,
              {
                flexGrow: backButtonProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 3],
                }),
                marginRight: backButtonProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 9],
                }),
                opacity: backButtonProgress,
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              disabled={currentStep === 0 || isSaving || isTransitioning}
              onPress={goBack}
              style={styles.accountSetupSecondaryButton}
            >
              <ChevronLeft color={colors.text} size={18} />
              <Text style={styles.accountSetupSecondaryButtonText}>Voltar</Text>
            </Pressable>
          </Animated.View>
          <Animated.View
            style={[
              styles.accountSetupActionSlot,
              {
                flexGrow: backButtonProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [10, 7],
                }),
              },
            ]}
          >
            <Pressable
              accessibilityRole="button"
              disabled={!stepValid || isSaving || isTransitioning}
              onPress={goForward}
              style={[
                styles.primaryButton,
                styles.accountSetupContinueButton,
                !stepValid || isSaving || isTransitioning ? styles.primaryButtonDisabled : null,
              ]}
            >
              {isSaving ? (
                <ActivityIndicator color={colors.onAccent} size="small" />
              ) : currentStep === SETUP_STEPS.length - 1 ? (
                <Check color={colors.onAccent} size={19} strokeWidth={2.5} />
              ) : (
                <ChevronRight color={colors.onAccent} size={19} strokeWidth={2.5} />
              )}
              <Text style={styles.primaryButtonText}>
                {currentStep === SETUP_STEPS.length - 1
                  ? isInitialSetup
                    ? "Concluir perfil"
                    : "Salvar alterações"
                  : "Continuar"}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
        {saveError ? (
          <Text accessibilityRole="alert" style={styles.authErrorText}>
            {saveError}
          </Text>
        ) : null}

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
      </View>
    </KeyboardAvoidingView>
  );
}

export function AccountSetupModal({ visible, ...props }: AccountSetupProps & { visible: boolean }) {
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
