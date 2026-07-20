import React, { useEffect, useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { ArrowLeft, Check, Send } from "lucide-react-native";
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
import { LabeledInput } from "../components/Navigation";
import {
  SelectedSubmissionMedia,
  SubmissionMediaStage
} from "../components/SubmissionMediaStage";
import { SubmissionMediaPreview } from "../components/SubmissionComponents";
import { USE_CENTERED_WEB_LAYOUT } from "../constants/layout";
import { persistPickedVideo } from "../services/videoStorage";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import { AppUser, VideoSubmission } from "../types";
import { DIRECT_PUBLICATION_STATUS } from "../utils/publication";
import { parseSubmissionTokens } from "../utils/submissionMetadata";

type SubmissionStep = "details" | "media";

type SubmissionDraft = {
  hasGuardianConsent: boolean;
  highlight: string;
  mentionsText: string;
  tagsText: string;
  title: string;
};

const emptySubmissionDraft: SubmissionDraft = {
  hasGuardianConsent: false,
  highlight: "",
  mentionsText: "",
  tagsText: "",
  title: ""
};

export function SubmitVideoScreen({
  onSubmit,
  user
}: {
  onSubmit: (submission: VideoSubmission) => void;
  user: AppUser;
}) {
  const { width } = useWindowDimensions();
  const isCompact = USE_CENTERED_WEB_LAYOUT || width < 520;
  const [draft, setDraft] = useState<SubmissionDraft>(emptySubmissionDraft);
  const [selectedMedia, setSelectedMedia] =
    useState<SelectedSubmissionMedia | null>(null);
  const [lastMedia, setLastMedia] =
    useState<SelectedSubmissionMedia | null>(null);
  const [step, setStep] = useState<SubmissionStep>("media");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);
  const submissionToastProgress = useRef(new Animated.Value(0)).current;
  const age = user.age ?? 0;
  const needsGuardianConsent = age > 0 && age < 18;
  const tags = parseSubmissionTokens(draft.tagsText, "#");
  const mentions = parseSubmissionTokens(draft.mentionsText, "@");
  const submissionIssues = [
    user.profileCompleted ? null : "Complete os dados do perfil antes de enviar.",
    age >= 12
      ? null
      : "Revise a idade no perfil. Envios são aceitos a partir de 12 anos.",
    selectedMedia ? null : "Escolha ou capture uma foto ou vídeo.",
    draft.title.trim().length >= 4
      ? null
      : "O título precisa ter pelo menos 4 caracteres.",
    draft.highlight.trim().length >= 4
      ? null
      : "Escreva um texto para a publicação com pelo menos 4 caracteres.",
    !needsGuardianConsent || draft.hasGuardianConsent
      ? null
      : "Confirme a autorização do responsável legal."
  ].filter((issue): issue is string => Boolean(issue));
  const canSubmit = submissionIssues.length === 0 && !isSubmitting;

  useEffect(() => {
    const retainedUri = lastMedia?.uri;

    return () => {
      if (
        Platform.OS === "web" &&
        retainedUri?.startsWith("blob:") &&
        typeof URL !== "undefined"
      ) {
        URL.revokeObjectURL(retainedUri);
      }
    };
  }, [lastMedia?.uri]);

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

  function updateDraft(
    field: keyof SubmissionDraft,
    value: string | boolean
  ) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  function selectMedia(media: SelectedSubmissionMedia) {
    setSelectedMedia(media);
    setLastMedia(media);
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
          "Autorize o acesso à galeria para escolher uma foto ou vídeo."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        mediaTypes: ["images", "videos"],
        quality: 1
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];
      const mediaType = asset.type === "video" ? "video" : "image";
      const fallbackName =
        mediaType === "video"
          ? "video-selecionado.mp4"
          : "foto-selecionada.jpg";

      selectMedia({
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
      });
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

    const id = `media-${Date.now()}`;
    setIsSubmitting(true);

    try {
      const mediaLink = await persistPickedVideo(id, {
        file: selectedMedia.file,
        fileName: selectedMedia.fileName,
        mimeType: selectedMedia.mimeType,
        uri: selectedMedia.uri
      });

      onSubmit({
        age,
        approvedAt: new Date().toISOString(),
        athleteName: user.name,
        city: user.city,
        club: user.club,
        hasGuardianConsent: draft.hasGuardianConsent,
        highlight: draft.highlight.trim(),
        id,
        mediaType: selectedMedia.mediaType,
        mentions,
        position: user.position,
        status: DIRECT_PUBLICATION_STATUS,
        submittedAt: new Date().toISOString(),
        tags,
        userId: user.id,
        videoDurationMs: selectedMedia.durationMs,
        videoFileName: selectedMedia.fileName,
        videoFileSize: selectedMedia.fileSize,
        videoLink: mediaLink,
        videoTitle: draft.title.trim()
      });
      Keyboard.dismiss();
      setLastSubmittedId(id);
      setSelectedMedia(null);
      setDraft(emptySubmissionDraft);
      setStep("media");
    } catch {
      Alert.alert(
        "Não foi possível salvar a publicação",
        "A mídia não foi salva. Verifique o espaço do navegador e tente novamente."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <View style={styles.submitScreen}>
      {step === "media" ? (
        <SubmissionMediaStage
          lastMedia={lastMedia}
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
            <Pressable
              accessibilityLabel="Voltar para a mídia"
              accessibilityRole="button"
              onPress={() => setStep("media")}
              style={styles.submissionDetailsBackButton}
            >
              <ArrowLeft color={colors.text} size={21} />
            </Pressable>
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
              onChangeText={(value) => updateDraft("title", value)}
              placeholder="Meu melhor lance"
              value={draft.title}
            />
            <LabeledInput
              label="Texto da publicação"
              multiline
              onChangeText={(value) => updateDraft("highlight", value)}
              placeholder="Conte o que acontece nesta publicação"
              value={draft.highlight}
            />
            <LabeledInput
              autoCapitalize="none"
              label="Tags"
              onChangeText={(value) => updateDraft("tagsText", value)}
              placeholder="#treino #futebol #oportunidade"
              value={draft.tagsText}
            />
            <LabeledInput
              autoCapitalize="none"
              label="Marcações"
              onChangeText={(value) => updateDraft("mentionsText", value)}
              placeholder="@clube @projeto"
              value={draft.mentionsText}
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
              <Send color={colors.onPrimary} size={19} />
              <Text style={styles.primaryButtonText}>
                {isSubmitting ? "Publicando..." : "Publicar"}
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
              <Check color={colors.primary} size={19} strokeWidth={3} />
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
