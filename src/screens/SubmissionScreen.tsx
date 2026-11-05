import React, { useCallback, useEffect, useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { randomUUID } from "expo-crypto";
import { Check, Send } from "lucide-react-native";
import {
  Alert,
  Animated,
  Easing,
  Keyboard,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View
} from "react-native";
import {
  formatVideoFileSize,
  getVideoTitleFromFileName
} from "../actions/appActions";
import { getLatestGalleryMedia } from "../actions/mediaLibraryActions";
import { BackButton, LabeledInput } from "../components/Navigation";
import {
  SelectedSubmissionMedia,
  SubmissionMediaStage
} from "../components/SubmissionMediaStage";
import { SubmissionMediaPreview } from "../components/SubmissionComponents";
import { SubmissionMentionPicker } from "../components/SubmissionMentionPicker";
import { TagPicker } from "../components/TagPicker";
import { USE_CENTERED_WEB_LAYOUT } from "../constants/layout";
import { getSafeFirebasePostMessage } from "../services/firebasePostService";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import {
  AppUser,
  PublicationMediaInput,
  ProfileAvatarsByProfile,
  TagCatalogEntry,
  VideoSubmission
} from "../types";
import { DIRECT_PUBLICATION_STATUS } from "../utils/publication";

type SubmissionStep = "details" | "media";

type SubmissionDraft = {
  hasGuardianConsent: boolean;
  highlight: string;
  mentions: string[];
  tags: string[];
  title: string;
};

const emptySubmissionDraft: SubmissionDraft = {
  hasGuardianConsent: false,
  highlight: "",
  mentions: [],
  tags: [],
  title: ""
};

export function SubmitVideoScreen({
  accounts,
  onBack,
  onPublished,
  onCreateTag,
  onSubmit,
  profileAvatars,
  tagCatalog,
  user
}: {
  accounts: AppUser[];
  onBack: () => void;
  onPublished: (submission: VideoSubmission) => void;
  onCreateTag?: (label: string) => Promise<unknown> | unknown;
  onSubmit: (
    submission: VideoSubmission,
    media: PublicationMediaInput,
    onProgress: (progress: number) => void
  ) => Promise<VideoSubmission>;
  profileAvatars: ProfileAvatarsByProfile;
  tagCatalog: TagCatalogEntry[];
  user: AppUser;
}) {
  const { width } = useWindowDimensions();
  const isCompact = USE_CENTERED_WEB_LAYOUT || width < 520;
  const [draft, setDraft] = useState<SubmissionDraft>(emptySubmissionDraft);
  const [selectedMedia, setSelectedMedia] =
    useState<SelectedSubmissionMedia | null>(null);
  const [galleryMedia, setGalleryMedia] =
    useState<SelectedSubmissionMedia | null>(null);
  const [step, setStep] = useState<SubmissionStep>("media");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);
  const submissionToastProgress = useRef(new Animated.Value(0)).current;
  const age = user.age ?? 0;
  const needsGuardianConsent = age > 0 && age < 18;
  const tags = draft.tags;

  const submissionIssues = [
    user.profileCompleted ? null : "Complete os dados do perfil antes de enviar.",
    age >= 12
      ? null
      : "Revise a idade no perfil. Envios são aceitos a partir de 12 anos.",
    selectedMedia ? null : "Escolha ou capture uma foto ou um vídeo.",
    draft.title.trim().length >= 4 && draft.title.trim().length <= 120
      ? null
      : "O título precisa ter entre 4 e 120 caracteres.",
    draft.highlight.trim().length >= 4 &&
    draft.highlight.trim().length <= 2000
      ? null
      : "A descrição precisa ter entre 4 e 2.000 caracteres.",
    !needsGuardianConsent || draft.hasGuardianConsent
      ? null
      : "Confirme a autorização do responsável legal."
  ].filter((issue): issue is string => Boolean(issue));
  const canSubmit = submissionIssues.length === 0 && !isSubmitting;

  useEffect(() => {
    const retainedUri = galleryMedia?.uri;

    return () => {
      if (
        Platform.OS === "web" &&
        retainedUri?.startsWith("blob:") &&
        typeof URL !== "undefined"
      ) {
        URL.revokeObjectURL(retainedUri);
      }
    };
  }, [galleryMedia?.uri]);

  const refreshGalleryThumbnail = useCallback(async () => {
    try {
      const latestMedia = await getLatestGalleryMedia();

      if (latestMedia) {
        setGalleryMedia(latestMedia);
      }
    } catch {
      // The gallery icon keeps its fallback when the device cannot expose a preview.
    }
  }, []);

  useEffect(() => {
    void refreshGalleryThumbnail();
  }, [refreshGalleryThumbnail]);

  useEffect(() => {
    if (!lastSubmittedId) {
      return;
    }

    submissionToastProgress.setValue(0);
    const toastAnimation = Animated.sequence([
      Animated.timing(submissionToastProgress, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
        toValue: 1,
        useNativeDriver: true
      }),
      Animated.delay(2460),
      Animated.timing(submissionToastProgress, {
        duration: 320,
        easing: Easing.in(Easing.cubic),
        toValue: 0,
        useNativeDriver: true
      })
    ]);

    toastAnimation.start(({ finished }) => {
      if (finished) {
        setLastSubmittedId((current) =>
          current === lastSubmittedId ? null : current
        );
      }
    });

    return () => toastAnimation.stop();
  }, [lastSubmittedId, submissionToastProgress]);

  function updateDraft<Field extends keyof SubmissionDraft>(
    field: Field,
    value: SubmissionDraft[Field]
  ) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function selectMedia(media: SelectedSubmissionMedia) {
    setSelectedMedia(media);
    if (Platform.OS === "web") {
      setGalleryMedia(media);
    }
    setDraft((current) => ({
      ...current,
      title:
        current.title.trim() ||
        (media.mediaType === "image"
          ? "Meu lance"
          : getVideoTitleFromFileName(media.fileName))
    }));
    setLastSubmittedId(null);
  }

  async function pickMediaFromLibrary() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permissão necessária",
          "Autorize o acesso à galeria para escolher uma foto ou um vídeo."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        mediaTypes: ["images", "videos"],
        quality: 1
      });

      if (result.canceled || !result.assets[0]) {
        if (Platform.OS !== "web") {
          void refreshGalleryThumbnail();
        }
        return;
      }

      const asset = result.assets[0];
      const mediaType = asset.type === "video" ? "video" : "image";
      const fallbackName =
        mediaType === "video"
          ? "video-selecionado.mp4"
          : "foto-selecionada.jpg";

      const pickedMedia: SelectedSubmissionMedia = {
        durationMs:
          mediaType === "video" ? asset.duration ?? undefined : undefined,
        file: asset.file,
        fileName: asset.fileName || fallbackName,
        fileSize: asset.fileSize,
        height: asset.height,
        mediaType,
        mimeType: asset.mimeType,
        uri: asset.uri,
        width: asset.width
      };

      selectMedia(pickedMedia);

      if (Platform.OS !== "web") {
        void refreshGalleryThumbnail();
      }
    } catch {
      Alert.alert(
        "Não foi possível abrir a galeria",
        "Tente novamente em alguns instantes."
      );
    }
  }

  async function submitDraft() {
    if (!canSubmit || !selectedMedia) {
      return;
    }

    const id = randomUUID();
    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const publishedSubmission = await onSubmit(
        {
          age,
          athleteName: user.name,
          city: user.city,
          club: user.club,
          hasGuardianConsent: draft.hasGuardianConsent,
          highlight: draft.highlight.trim(),
          id,
          mediaHeight: selectedMedia.height,
          mediaType: selectedMedia.mediaType,
          mediaWidth: selectedMedia.width,
          mentions: draft.mentions,
          mimeType: selectedMedia.mimeType,
          position: user.position,
          status: DIRECT_PUBLICATION_STATUS,
          submittedAt: new Date().toISOString(),
          tags,
          userId: user.id,
          videoDurationMs: selectedMedia.durationMs,
          videoFileName: selectedMedia.fileName,
          videoFileSize: selectedMedia.fileSize,
          videoLink: "",
          videoTitle: draft.title.trim()
        },
        selectedMedia,
        setUploadProgress
      );
      Keyboard.dismiss();
      setLastSubmittedId(publishedSubmission.id);
      setSelectedMedia(null);
      setDraft(emptySubmissionDraft);
      setStep("media");
      onPublished(publishedSubmission);
    } catch (error) {
      Alert.alert(
        "Não foi possível publicar",
        getSafeFirebasePostMessage(error)
      );
    } finally {
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  }

  return (
    <View style={styles.submitScreen}>
      {step === "media" ? (
        <SubmissionMediaStage
          galleryMedia={galleryMedia}
          onBack={onBack}
          onCapture={selectMedia}
          onClear={() => setSelectedMedia(null)}
          onContinue={() => {
            if (selectedMedia) {
              setStep("details");
            }
          }}
          onOpenGallery={pickMediaFromLibrary}
          selectedMedia={selectedMedia}
        />
      ) : (
        <ScrollView
          contentContainerStyle={[
            styles.screenContent,
            isCompact ? styles.screenContentCompact : null
          ]}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.submissionDetailsHeader}>
            <BackButton
              accessibilityLabel="Voltar para a mídia"
              onPress={() => setStep("media")}
            />
            <View style={styles.submissionDetailsTitleBlock}>
              <Text style={styles.discoveryTitle}>Nova publicação</Text>
              <Text style={styles.discoverySubtitle}>
                Adicione as informações que acompanharão sua mídia.
              </Text>
            </View>
          </View>

          {selectedMedia ? (
            <View style={styles.submissionDetailsPreview}>
              <SubmissionMediaPreview
                allowEphemeralBrowserUri
                compact
                mediaType={selectedMedia.mediaType}
                uri={selectedMedia.uri}
              />
              <View style={styles.submissionDetailsMediaMeta}>
                <Text numberOfLines={1} style={styles.selectedVideoName}>
                  {selectedMedia.fileName}
                </Text>
                <Text style={styles.selectedVideoMeta}>
                  {[
                    selectedMedia.mediaType === "image" ? "Foto" : "Vídeo",
                    formatVideoFileSize(selectedMedia.fileSize)
                  ]
                    .filter(Boolean)
                    .join(" | ")}
                </Text>
              </View>
            </View>
          ) : null}

          <View
            style={[
              styles.infoPanel,
              isCompact ? styles.submitInfoPanelCompact : null
            ]}
          >
            <Text style={styles.sectionTitle}>Detalhes</Text>
            <LabeledInput
              label="Título"
              maxLength={120}
              onChangeText={(value) => updateDraft("title", value)}
              placeholder="Meu melhor lance"
              value={draft.title}
            />
            <LabeledInput
              label="Descrição"
              maxLength={2000}
              multiline
              onChangeText={(value) => updateDraft("highlight", value)}
              placeholder="Descreva o que acontece nesta publicação"
              value={draft.highlight}
            />
            <TagPicker
              catalog={tagCatalog}
              hint="Adicione até dez hashtags. Digite e pressione Enter ou vírgula para criar uma nova."
              maxTags={10}
              onChange={(tags) => updateDraft("tags", tags)}
              onCreateTag={onCreateTag}
              selectedTags={draft.tags}
              title="Hashtags da publicação"
            />
            <SubmissionMentionPicker
              accounts={accounts}
              currentUserId={user.id}
              onChange={(mentions) => updateDraft("mentions", mentions)}
              profileAvatars={profileAvatars}
              value={draft.mentions}
            />

            {needsGuardianConsent ? (
              <Pressable
                onPress={() =>
                  updateDraft(
                    "hasGuardianConsent",
                    !draft.hasGuardianConsent
                  )
                }
                style={styles.checkRow}
              >
                <View
                  style={[
                    styles.checkBox,
                    draft.hasGuardianConsent ? styles.checkBoxActive : null
                  ]}
                >
                  {draft.hasGuardianConsent ? (
                    <Check color={colors.onPrimary} size={17} strokeWidth={3} />
                  ) : null}
                </View>
                <Text style={styles.checkText}>
                  Confirmo que o responsável legal autorizou a publicação.
                </Text>
              </Pressable>
            ) : null}

            {submissionIssues.length > 0 ? (
              <View style={styles.submissionValidationPanel}>
                <Text style={styles.submissionValidationTitle}>
                  Revise antes de publicar:
                </Text>
                {submissionIssues.map((issue) => (
                  <View key={issue} style={styles.submissionValidationRow}>
                    <Text style={styles.submissionValidationMarker}>-</Text>
                    <Text style={styles.submissionValidationText}>{issue}</Text>
                  </View>
                ))}
              </View>
            ) : null}

            <Pressable
              accessibilityRole="button"
              disabled={!canSubmit}
              onPress={submitDraft}
              style={[
                styles.primaryButton,
                !canSubmit ? styles.primaryButtonDisabled : null
              ]}
            >
              <Send color={colors.onAccent} size={19} />
              <Text style={styles.primaryButtonText}>
                {isSubmitting
                  ? uploadProgress > 0
                    ? `Publicando ${Math.round(uploadProgress * 100)}%`
                    : "Preparando..."
                  : "Publicar"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      )}

      {lastSubmittedId ? (
        <View pointerEvents="none" style={styles.submissionToastLayer}>
          <Animated.View
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
            style={[
              styles.submissionToast,
              { width: Math.min(width - 28, 440) },
              {
                opacity: submissionToastProgress,
                transform: [
                  {
                    translateY: submissionToastProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [18, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <View style={styles.submissionToastIcon}>
              <Check color={colors.primaryText} size={19} strokeWidth={3} />
            </View>
            <View style={styles.submissionToastTextBlock}>
              <Text style={styles.submissionToastTitle}>Publicação enviada</Text>
              <Text style={styles.submissionToastBody}>
                Ela já está disponível no Início e no seu perfil.
              </Text>
            </View>
          </Animated.View>
        </View>
      ) : null}
    </View>
  );
}
