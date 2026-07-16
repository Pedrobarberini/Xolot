import React, { useEffect, useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import { Check, Send, Upload, X } from "lucide-react-native";
import { Alert, Animated, Easing, Keyboard, Platform, Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import { formatVideoDuration, formatVideoFileSize, getVideoTitleFromFileName } from "../actions/appActions";
import { LabeledInput } from "../components/Navigation";
import { SubmissionList, SubmissionVideoPreview } from "../components/SubmissionComponents";
import { USE_CENTERED_WEB_LAYOUT } from "../constants/layout";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import { AppUser, VideoSubmission } from "../types";

type SubmissionDraft = {
  videoTitle: string;
  videoLink: string;
  highlight: string;
  goals: string;
  hasGuardianConsent: boolean;
};

type SelectedVideoMeta = {
  durationMs?: number;
  fileName: string;
  fileSize?: number;
};

const emptySubmissionDraft: SubmissionDraft = {
  videoTitle: "",
  videoLink: "",
  highlight: "",
  goals: "",
  hasGuardianConsent: false
};

export function SubmitVideoScreen({
  onSubmit,
  submissions,
  user
}: {
  onSubmit: (submission: VideoSubmission) => void;
  submissions: VideoSubmission[];
  user: AppUser;
}) {
  const { width } = useWindowDimensions();
  const isCompact = USE_CENTERED_WEB_LAYOUT || width < 520;
  const [draft, setDraft] = useState<SubmissionDraft>(emptySubmissionDraft);
  const [selectedVideo, setSelectedVideo] = useState<SelectedVideoMeta | null>(
    null
  );
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);
  const submissionToastProgress = useRef(new Animated.Value(0)).current;
  const age = user.age ?? 0;
  const needsGuardianConsent = age > 0 && age < 18;
  const hasRemoteVideoLink = /^https?:\/\/\S+$/i.test(draft.videoLink.trim());
  const hasVideoSource = selectedVideo !== null || hasRemoteVideoLink;
  const submissionIssues = [
    user.profileCompleted ? null : "Complete os dados do perfil antes de enviar.",
    age >= 12
      ? null
      : "Revise a idade no perfil. Envios sao aceitos a partir de 12 anos.",
    draft.videoTitle.trim().length >= 4
      ? null
      : "O titulo do video precisa ter pelo menos 4 caracteres.",
    hasVideoSource ? null : "Selecione um video ou informe um link direto.",
    draft.highlight.trim().length >= 4
      ? null
      : "Descreva o principal destaque com pelo menos 4 caracteres.",
    !needsGuardianConsent || draft.hasGuardianConsent
      ? null
      : "Confirme a autorizacao do responsavel legal."
  ].filter((issue): issue is string => Boolean(issue));
  const canSubmit = submissionIssues.length === 0;

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

  function updateDraft(field: keyof SubmissionDraft, value: string | boolean) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function pickVideoFromLibrary() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permissao necessaria",
          "Autorize o acesso aos videos para escolher um lance da galeria."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        mediaTypes: ["videos"],
        quality: 1
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];
      const fileName = asset.fileName || "video-selecionado.mp4";

      if (asset.type && asset.type !== "video") {
        Alert.alert("Arquivo invalido", "Escolha um arquivo de video.");
        return;
      }

      setSelectedVideo({
        durationMs: asset.duration ?? undefined,
        fileName,
        fileSize: asset.fileSize
      });
      setDraft((current) => ({
        ...current,
        videoLink: asset.uri,
        videoTitle:
          current.videoTitle.trim() || getVideoTitleFromFileName(fileName)
      }));
      setLastSubmittedId(null);
    } catch {
      Alert.alert(
        "Nao foi possivel abrir a galeria",
        "Tente novamente ou use um link direto para o arquivo de video."
      );
    }
  }

  function removeSelectedVideo() {
    setSelectedVideo(null);
    updateDraft("videoLink", "");
  }

  function submitDraft() {
    const id = `video-${Date.now()}`;

    onSubmit({
      id,
      userId: user.id,
      athleteName: user.name,
      age,
      city: user.city,
      position: user.position,
      club: user.club,
      videoTitle: draft.videoTitle.trim(),
      videoLink: draft.videoLink.trim(),
      videoDurationMs: selectedVideo?.durationMs,
      videoFileName: selectedVideo?.fileName,
      videoFileSize: selectedVideo?.fileSize,
      highlight: draft.highlight.trim(),
      goals: draft.goals.trim() || "Objetivos ainda nao informados",
      hasGuardianConsent: draft.hasGuardianConsent,
      status: "Em revisao",
      submittedAt: new Date().toISOString()
    });
    Keyboard.dismiss();
    setLastSubmittedId(id);
    setSelectedVideo(null);
    setDraft(emptySubmissionDraft);
  }

  return (
    <View style={styles.submitScreen}>
      <ScrollView
        contentContainerStyle={[
          styles.screenContent,
          isCompact ? styles.screenContentCompact : null
        ]}
      >
      <View style={styles.submitHero}>
        <Text style={styles.heroKicker}>Area do atleta</Text>
        <Text style={styles.heroTitle}>Envie seu video para analise.</Text>
        <Text style={styles.heroBody}>
          O admin aprova, reprova ou pede ajustes. So oportunidades aprovadas
          entram no feed dos investidores.
        </Text>
      </View>

      <View
        style={[
          styles.infoPanel,
          isCompact ? styles.submitInfoPanelCompact : null
        ]}
      >
        <Text style={styles.sectionTitle}>Video</Text>
        <LabeledInput
          label="Titulo do video"
          onChangeText={(value) => updateDraft("videoTitle", value)}
          placeholder="Melhores lances"
          value={draft.videoTitle}
        />
        <Pressable
          accessibilityLabel="Escolher video da galeria"
          accessibilityRole="button"
          onPress={pickVideoFromLibrary}
          style={({ pressed }) => [
            styles.videoPickerButton,
            pressed ? styles.feedReelButtonPressed : null
          ]}
        >
          <Upload color={colors.primary} size={21} />
          <Text style={styles.videoPickerButtonText}>
            Escolher video da galeria
          </Text>
        </Pressable>
        <Text style={styles.videoPickerHint}>
          Para o primeiro teste, prefira um MP4 vertical de ate 60 segundos.
        </Text>

        {selectedVideo ? (
          <View style={styles.selectedVideoPanel}>
            <View style={styles.selectedVideoTextBlock}>
              <Text numberOfLines={1} style={styles.selectedVideoName}>
                {selectedVideo.fileName}
              </Text>
              <Text style={styles.selectedVideoMeta}>
                {[
                  formatVideoDuration(selectedVideo.durationMs),
                  formatVideoFileSize(selectedVideo.fileSize)
                ]
                  .filter(Boolean)
                  .join(" | ") || "Video pronto para visualizar"}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Remover video selecionado"
              accessibilityRole="button"
              onPress={removeSelectedVideo}
              style={styles.removeVideoButton}
            >
              <X color={colors.danger} size={19} />
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.videoSourceDivider}>
              <View style={styles.videoSourceDividerLine} />
              <Text style={styles.videoSourceDividerText}>ou</Text>
              <View style={styles.videoSourceDividerLine} />
            </View>
            <LabeledInput
              autoCapitalize="none"
              label="Link direto do video"
              onChangeText={(value) => {
                setSelectedVideo(null);
                updateDraft("videoLink", value);
              }}
              placeholder="https://.../video.mp4"
              value={draft.videoLink}
            />
          </>
        )}

        {hasVideoSource ? (
          <SubmissionVideoPreview uri={draft.videoLink.trim()} />
        ) : null}
        <LabeledInput
          label="Principal destaque"
          multiline
          onChangeText={(value) => updateDraft("highlight", value)}
          placeholder="Descreva o lance, qualidade ou competicao"
          value={draft.highlight}
        />
        <LabeledInput
          label="Objetivo do aporte"
          multiline
          onChangeText={(value) => updateDraft("goals", value)}
          placeholder="Ex: viagem, material, avaliacao, treino"
          value={draft.goals}
        />

        {needsGuardianConsent ? (
          <Pressable
            onPress={() =>
              updateDraft("hasGuardianConsent", !draft.hasGuardianConsent)
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
              Confirmo que o responsavel legal autorizou o envio.
            </Text>
          </Pressable>
        ) : null}

        {submissionIssues.length > 0 ? (
          <View style={styles.submissionValidationPanel}>
            <Text style={styles.submissionValidationTitle}>
              Revise antes de enviar:
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
          disabled={!canSubmit}
          onPress={submitDraft}
          style={[
            styles.primaryButton,
            !canSubmit ? styles.primaryButtonDisabled : null
          ]}
        >
          <Send color={colors.onPrimary} size={19} />
          <Text style={styles.primaryButtonText}>Enviar para moderacao</Text>
        </Pressable>
      </View>

        <SubmissionList submissions={submissions} />
      </ScrollView>

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
              <Text style={styles.submissionToastTitle}>Video enviado</Text>
              <Text style={styles.submissionToastBody}>
                Recebido. Agora ele esta em revisao.
              </Text>
            </View>
          </Animated.View>
        </View>
      ) : null}
    </View>
  );
}
