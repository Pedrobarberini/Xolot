import React, { useEffect, useRef, useState } from "react";
import {
  CameraView,
  useCameraPermissions,
  useMicrophonePermissions
} from "expo-camera";
import { VideoView, useVideoPlayer } from "expo-video";
import {
  ArrowLeft,
  ArrowRight,
  Camera,
  Images,
  ShieldAlert,
  SwitchCamera,
  X
} from "lucide-react-native";
import { Alert, Image, Platform, Pressable, Text, View } from "react-native";
import { startWebCameraRecording } from "../actions/webCameraRecorder";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import type { SubmissionMediaType } from "../types";
import { SubmissionMediaPreview } from "./SubmissionComponents";

const CAMERA_TEST_ID = "submission-camera-preview";
const MAX_RECORDING_DURATION_MS = 120_000;
const MAX_RECORDING_DURATION_SECONDS = MAX_RECORDING_DURATION_MS / 1000;

type CaptureMode = "photo" | "video";
type CameraOutputMode = "picture" | "video";
type RecordingTrigger = "hold" | "tap";

export type SelectedSubmissionMedia = {
  durationMs?: number;
  file?: File;
  fileName: string;
  fileSize?: number;
  height?: number;
  mediaType: SubmissionMediaType;
  mimeType?: string;
  uri: string;
  width?: number;
};

export function SubmissionMediaStage({
  galleryMedia,
  onBack,
  onCapture,
  onClear,
  onContinue,
  onOpenGallery,
  selectedMedia
}: {
  galleryMedia: SelectedSubmissionMedia | null;
  onBack: () => void;
  onCapture: (media: SelectedSubmissionMedia) => void;
  onClear: () => void;
  onContinue: () => void;
  onOpenGallery: () => void;
  selectedMedia: SelectedSubmissionMedia | null;
}) {
  const cameraRef = useRef<CameraView>(null);
  const cameraReadyRef = useRef(false);
  const cameraReadyResolverRef = useRef<((ready: boolean) => void) | null>(null);
  const cameraReadyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const ignorePressAfterLongRef = useRef(false);
  const recordingStartedAtRef = useRef(0);
  const recordingTriggerRef = useRef<RecordingTrigger | null>(null);
  const stopAfterPreparationRef = useRef(false);
  const stopWebRecordingRef = useRef<(() => void) | null>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [microphonePermission, requestMicrophonePermission] =
    useMicrophonePermissions();
  const [captureMode, setCaptureMode] = useState<CaptureMode>("photo");
  const [cameraFacing, setCameraFacing] = useState<"back" | "front">("back");
  const [cameraMode, setCameraMode] =
    useState<CameraOutputMode>("picture");
  const [cameraSessionKey, setCameraSessionKey] = useState(0);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isPreparingRecording, setIsPreparingRecording] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingMuted, setRecordingMuted] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const isBusy = isCapturing || isPreparingRecording || isRecording;

  useEffect(() => {
    if (!isRecording) {
      setRecordingSeconds(0);
      return;
    }

    const updateElapsedTime = () => {
      setRecordingSeconds(
        Math.min(
          Math.floor((Date.now() - recordingStartedAtRef.current) / 1000),
          MAX_RECORDING_DURATION_SECONDS
        )
      );
    };
    const timer = setInterval(updateElapsedTime, 250);

    updateElapsedTime();
    return () => clearInterval(timer);
  }, [isRecording]);

  useEffect(
    () => () => {
      if (cameraReadyTimeoutRef.current) {
        clearTimeout(cameraReadyTimeoutRef.current);
      }

      stopWebRecordingRef.current?.();
      cameraRef.current?.stopRecording();
    },
    []
  );

  function handleCameraReady() {
    cameraReadyRef.current = true;
    setIsCameraReady(true);

    if (cameraReadyTimeoutRef.current) {
      clearTimeout(cameraReadyTimeoutRef.current);
      cameraReadyTimeoutRef.current = null;
    }

    cameraReadyResolverRef.current?.(true);
    cameraReadyResolverRef.current = null;
  }

  function remountCameraForRecording(muted: boolean) {
    cameraReadyRef.current = false;
    setIsCameraReady(false);
    setCameraMode("video");
    setRecordingMuted(muted);
    setCameraSessionKey((current) => current + 1);

    return new Promise<boolean>((resolve) => {
      cameraReadyResolverRef.current = resolve;
      cameraReadyTimeoutRef.current = setTimeout(() => {
        cameraReadyTimeoutRef.current = null;
        cameraReadyResolverRef.current = null;
        resolve(cameraReadyRef.current);
      }, 2500);
    });
  }

  function restoreSelectedCameraMode(mode: CaptureMode) {
    const nextCameraMode = mode === "video" ? "video" : "picture";

    setCameraMode(nextCameraMode);
    setRecordingMuted(false);
    cameraReadyRef.current = false;
    setIsCameraReady(false);
    setCameraSessionKey((current) => current + 1);
  }

  function changeCaptureMode(mode: CaptureMode) {
    if (isBusy || mode === captureMode) {
      return;
    }

    setCaptureMode(mode);
    restoreSelectedCameraMode(mode);
  }

  function toggleCameraFacing() {
    if (isBusy || selectedMedia) {
      return;
    }

    cameraReadyRef.current = false;
    setIsCameraReady(false);
    setCameraFacing((current) => (current === "back" ? "front" : "back"));
    setCameraSessionKey((current) => current + 1);
  }

  async function capturePhoto() {
    if (
      !cameraRef.current ||
      !isCameraReady ||
      isBusy ||
      cameraMode !== "picture"
    ) {
      return;
    }

    setIsCapturing(true);

    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });

      if (!photo?.uri) {
        return;
      }

      onCapture({
        fileName: `nextstar-${Date.now()}.jpg`,
        height: photo.height,
        mediaType: "image",
        mimeType: "image/jpeg",
        uri: photo.uri,
        width: photo.width
      });
    } catch {
      Alert.alert(
        "Não foi possível capturar a foto",
        "Verifique a permissão da câmera e tente novamente."
      );
    } finally {
      setIsCapturing(false);
    }
  }

  async function startVideoRecording(trigger: RecordingTrigger) {
    if (
      !cameraRef.current ||
      !permission?.granted ||
      !isCameraReady ||
      isBusy
    ) {
      return;
    }

    recordingTriggerRef.current = trigger;
    stopAfterPreparationRef.current = false;
    setIsPreparingRecording(true);

    const captureModeAtStart = captureMode;

    try {
      let recordingResult: Promise<SelectedSubmissionMedia>;

      if (Platform.OS === "web") {
        const session = await startWebCameraRecording({
          cameraTestId: CAMERA_TEST_ID,
          maxDurationMs: MAX_RECORDING_DURATION_MS
        });

        stopWebRecordingRef.current = session.stop;
        recordingResult = session.result;
      } else {
        const nextMicrophonePermission = microphonePermission?.granted
          ? microphonePermission
          : await requestMicrophonePermission();
        const shouldMute = !nextMicrophonePermission.granted;
        const cameraReady = await remountCameraForRecording(shouldMute);

        if (!cameraReady || !cameraRef.current) {
          throw new Error("A câmera ainda não está pronta para gravar.");
        }

        const startedAt = Date.now();
        const nativeRecording = cameraRef.current.recordAsync({
          maxDuration: MAX_RECORDING_DURATION_SECONDS
        });

        if (!nativeRecording) {
          throw new Error("A gravação não pôde ser iniciada.");
        }

        recordingResult = nativeRecording.then((result) => {
          if (!result?.uri) {
            throw new Error("A gravação não gerou um arquivo.");
          }

          return {
            durationMs: Math.min(
              Date.now() - startedAt,
              MAX_RECORDING_DURATION_MS
            ),
            fileName: `nextstar-${Date.now()}.mp4`,
            mediaType: "video",
            mimeType: "video/mp4",
            uri: result.uri
          };
        });
      }

      recordingStartedAtRef.current = Date.now();
      setIsPreparingRecording(false);
      setIsRecording(true);

      if (stopAfterPreparationRef.current) {
        stopActiveRecording();
      }

      const media = await recordingResult;
      onCapture(media);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Verifique as permissões e tente novamente.";

      Alert.alert("Não foi possível gravar o vídeo", message);
    } finally {
      stopWebRecordingRef.current = null;
      recordingTriggerRef.current = null;
      stopAfterPreparationRef.current = false;
      setIsPreparingRecording(false);
      setIsRecording(false);
      restoreSelectedCameraMode(captureModeAtStart);
    }
  }

  function stopVideoRecording() {
    if (isPreparingRecording) {
      stopAfterPreparationRef.current = true;
      return;
    }

    if (!isRecording) {
      return;
    }

    stopActiveRecording();
  }

  function stopActiveRecording() {
    if (Platform.OS === "web") {
      stopWebRecordingRef.current?.();
      return;
    }

    cameraRef.current?.stopRecording();
  }

  function handleShutterPress() {
    if (ignorePressAfterLongRef.current) {
      ignorePressAfterLongRef.current = false;
      return;
    }

    if (captureMode === "photo") {
      void capturePhoto();
      return;
    }

    if (isRecording || isPreparingRecording) {
      stopVideoRecording();
      return;
    }

    void startVideoRecording("tap");
  }

  function handleShutterLongPress() {
    if (captureMode !== "photo" || isBusy) {
      return;
    }

    ignorePressAfterLongRef.current = true;
    void startVideoRecording("hold");
  }

  function handleShutterPressOut() {
    if (recordingTriggerRef.current !== "hold") {
      return;
    }

    stopAfterPreparationRef.current = true;
    stopVideoRecording();
  }

  const shutterLabel = isRecording
    ? "Encerrar gravação"
    : captureMode === "video"
      ? "Iniciar gravação"
      : "Capturar foto";
  const shutterDisabled =
    !permission?.granted || (!isCameraReady && !isRecording) || isCapturing;

  return (
    <View style={styles.submissionCaptureScreen}>
      <View
        nativeID={CAMERA_TEST_ID}
        style={styles.submissionCameraViewport}
        testID={CAMERA_TEST_ID}
      >
        {selectedMedia ? (
          <SubmissionMediaPreview
            fill
            mediaType={selectedMedia.mediaType}
            uri={selectedMedia.uri}
          />
        ) : permission?.granted ? (
          <CameraView
            facing={cameraFacing}
            key={`${cameraSessionKey}-${cameraMode}-${cameraFacing}-${recordingMuted}`}
            mode={cameraMode}
            mute={recordingMuted}
            onCameraReady={handleCameraReady}
            ref={cameraRef}
            style={styles.submissionCameraPreview}
          />
        ) : (
          <View style={styles.submissionCameraPermission}>
            <View style={styles.submissionCameraPermissionIcon}>
              <ShieldAlert color={colors.onPrimary} size={28} />
            </View>
            <Text style={styles.submissionCameraPermissionTitle}>
              Permitir câmera
            </Text>
            <Text style={styles.submissionCameraPermissionBody}>
              Autorize o acesso para fotografar e gravar com a câmera traseira.
            </Text>
            <Pressable
              accessibilityRole="button"
              onPress={requestPermission}
              style={styles.submissionCameraPermissionButton}
            >
              <Camera color={colors.onPrimary} size={18} />
              <Text style={styles.submissionCameraPermissionButtonText}>
                Ativar câmera
              </Text>
            </Pressable>
          </View>
        )}

        <View style={styles.submissionCameraTopBar}>
          <Pressable
            accessibilityLabel="Voltar para o Início"
            accessibilityRole="button"
            disabled={isBusy}
            hitSlop={10}
            onPress={onBack}
            style={[
              styles.submissionCameraBackButton,
              isBusy ? styles.submissionShutterDisabled : null
            ]}
          >
            <ArrowLeft color={colors.onPrimary} size={20} />
          </Pressable>
          <View pointerEvents="none" style={styles.submissionCameraStatusSlot}>
            {isPreparingRecording || isRecording ? (
              <Text style={styles.submissionRecordingStatus}>
                {isPreparingRecording
                  ? "PREPARANDO"
                  : `GRAVANDO ${formatRecordingTime(recordingSeconds)} / 2:00`}
              </Text>
            ) : null}
          </View>
          {selectedMedia ? (
            <Pressable
              accessibilityLabel="Remover mídia selecionada"
              accessibilityRole="button"
              hitSlop={10}
              onPress={onClear}
              style={styles.submissionCameraIconButton}
            >
              <X color={colors.onPrimary} size={19} />
            </Pressable>
          ) : (
            <View style={styles.submissionCameraTopSpacer} />
          )}
        </View>

        <View
          style={[
            styles.submissionCameraControls,
            selectedMedia ? styles.submissionCameraControlsSelected : null
          ]}
        >
          <GalleryButton media={galleryMedia} onPress={onOpenGallery} />

          {selectedMedia ? (
            <Pressable
              accessibilityLabel="Avançar para os detalhes da publicação"
              accessibilityRole="button"
              onPress={onContinue}
              style={styles.submissionContinueButton}
            >
              <ArrowRight color={colors.onPrimary} size={28} />
            </Pressable>
          ) : (
            <Pressable
              accessibilityHint={
                captureMode === "photo"
                  ? "Toque para fotografar ou segure para gravar um vídeo"
                  : "Toque para iniciar ou encerrar a gravação"
              }
              accessibilityLabel={shutterLabel}
              accessibilityRole="button"
              delayLongPress={350}
              disabled={shutterDisabled}
              onLongPress={handleShutterLongPress}
              onPress={handleShutterPress}
              onPressOut={handleShutterPressOut}
              style={[
                styles.submissionShutterOuter,
                isRecording ? styles.submissionShutterOuterRecording : null,
                shutterDisabled ? styles.submissionShutterDisabled : null
              ]}
            >
              <View
                style={[
                  styles.submissionShutterInner,
                  captureMode === "video"
                    ? styles.submissionShutterInnerVideo
                    : null,
                  isRecording ? styles.submissionShutterInnerRecording : null
                ]}
              />
            </Pressable>
          )}

          {selectedMedia ? (
            <View style={styles.submissionCameraControlSpacer} />
          ) : (
            <Pressable
              accessibilityLabel={
                cameraFacing === "back"
                  ? "Usar câmera frontal"
                  : "Usar câmera traseira"
              }
              accessibilityRole="button"
              disabled={isBusy}
              onPress={toggleCameraFacing}
              style={[
                styles.submissionCameraSwitchButton,
                isBusy ? styles.submissionShutterDisabled : null
              ]}
            >
              <SwitchCamera color={colors.onPrimary} size={23} />
            </Pressable>
          )}
        </View>

        {!selectedMedia ? (
          <View style={styles.submissionCaptureModes}>
            <CaptureModeButton
              active={captureMode === "photo"}
              disabled={isBusy}
              label="Foto"
              onPress={() => changeCaptureMode("photo")}
            />
            <CaptureModeButton
              active={captureMode === "video"}
              disabled={isBusy}
              label="Vídeo"
              onPress={() => changeCaptureMode("video")}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}

function CaptureModeButton({
  active,
  disabled,
  label,
  onPress
}: {
  active: boolean;
  disabled: boolean;
  label: string;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: active }}
      disabled={disabled}
      onPress={onPress}
      style={styles.submissionCaptureModeButton}
    >
      <Text
        style={[
          styles.submissionCaptureModeText,
          active ? styles.submissionCaptureModeTextActive : null
        ]}
      >
        {label}
      </Text>
      <View
        style={[
          styles.submissionCaptureModeIndicator,
          active ? styles.submissionCaptureModeIndicatorActive : null
        ]}
      />
    </Pressable>
  );
}

function GalleryButton({
  media,
  onPress
}: {
  media: SelectedSubmissionMedia | null;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel="Escolher foto ou vídeo da galeria"
      accessibilityRole="button"
      onPress={onPress}
      style={styles.submissionGalleryButton}
    >
      {media?.mediaType === "image" ? (
        <Image
          accessibilityIgnoresInvertColors
          resizeMode="cover"
          source={{ uri: media.uri }}
          style={styles.submissionGalleryThumbnail}
        />
      ) : media?.mediaType === "video" ? (
        <GalleryVideoThumbnail uri={media.uri} />
      ) : (
        <Images color={colors.onPrimary} size={22} />
      )}
    </Pressable>
  );
}

function GalleryVideoThumbnail({ uri }: { uri: string }) {
  const player = useVideoPlayer(uri, (videoPlayer) => {
    videoPlayer.loop = false;
    videoPlayer.muted = true;
    videoPlayer.currentTime = 0.01;
  });

  useEffect(() => {
    player.pause();
    player.currentTime = 0.01;
  }, [player]);

  return (
    <VideoView
      contentFit="cover"
      nativeControls={false}
      player={player}
      pointerEvents="none"
      style={styles.submissionGalleryThumbnail}
      surfaceType="textureView"
    />
  );
}

function formatRecordingTime(seconds: number) {
  const safeSeconds = Math.max(0, Math.min(seconds, 120));
  const minutes = Math.floor(safeSeconds / 60);
  const remainingSeconds = safeSeconds % 60;

  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}
