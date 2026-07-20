import React, { useRef, useState } from "react";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  ArrowRight,
  Camera,
  Film,
  Images,
  ShieldAlert,
  X
} from "lucide-react-native";
import { Alert, Image, Pressable, Text, View } from "react-native";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import type { SubmissionMediaType } from "../types";
import { SubmissionMediaPreview } from "./SubmissionComponents";

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
  lastMedia,
  onCapture,
  onClear,
  onContinue,
  onOpenGallery,
  selectedMedia
}: {
  lastMedia: SelectedSubmissionMedia | null;
  onCapture: (media: SelectedSubmissionMedia) => void;
  onClear: () => void;
  onContinue: () => void;
  onOpenGallery: () => void;
  selectedMedia: SelectedSubmissionMedia | null;
}) {
  const cameraRef = useRef<CameraView>(null);
  const [permission, requestPermission] = useCameraPermissions();
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);

  async function capturePhoto() {
    if (!cameraRef.current || !isCameraReady || isCapturing) {
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

  return (
    <View style={styles.submissionCaptureScreen}>
      <View style={styles.submissionCameraViewport}>
        {selectedMedia ? (
          <SubmissionMediaPreview
            fill
            mediaType={selectedMedia.mediaType}
            uri={selectedMedia.uri}
          />
        ) : permission?.granted ? (
          <CameraView
            facing="back"
            mode="picture"
            onCameraReady={() => setIsCameraReady(true)}
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
              Autorize o acesso para registrar uma foto com a câmera traseira.
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

        <View pointerEvents="none" style={styles.submissionCameraTopShade} />
        <View style={styles.submissionCameraTopBar}>
          <Text style={styles.submissionCameraBrand}>Nova publicação</Text>
          {selectedMedia ? (
            <Pressable
              accessibilityLabel="Remover mídia selecionada"
              accessibilityRole="button"
              onPress={onClear}
              style={styles.submissionCameraIconButton}
            >
              <X color={colors.onPrimary} size={22} />
            </Pressable>
          ) : null}
        </View>

        <View pointerEvents="none" style={styles.submissionCameraBottomShade} />
        <View style={styles.submissionCameraControls}>
          <GalleryButton media={lastMedia} onPress={onOpenGallery} />

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
              accessibilityLabel="Capturar foto"
              accessibilityRole="button"
              disabled={!permission?.granted || !isCameraReady || isCapturing}
              onPress={capturePhoto}
              style={[
                styles.submissionShutterOuter,
                !permission?.granted || !isCameraReady || isCapturing
                  ? styles.submissionShutterDisabled
                  : null
              ]}
            >
              <View style={styles.submissionShutterInner} />
            </Pressable>
          )}

          <View style={styles.submissionCameraControlSpacer} />
        </View>
      </View>
    </View>
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
        <Film color={colors.onPrimary} size={22} />
      ) : (
        <Images color={colors.onPrimary} size={22} />
      )}
    </Pressable>
  );
}
