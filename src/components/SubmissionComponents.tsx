import React from "react";
import { VideoView, useVideoPlayer } from "expo-video";
import { Image, Text, View } from "react-native";
import { useResolvedVideoSource } from "../actions/useResolvedVideoSource";
import { styles } from "../styles/appStyles";
import { SubmissionMediaType, VideoSubmissionStatus } from "../types";

export function SubmissionMediaPreview({
  allowEphemeralBrowserUri,
  compact = false,
  fill = false,
  mediaType = "video",
  uri
}: {
  allowEphemeralBrowserUri?: boolean;
  compact?: boolean;
  fill?: boolean;
  mediaType?: SubmissionMediaType;
  uri: string;
}) {
  const resolvedVideo = useResolvedVideoSource(uri, {
    allowEphemeralBrowserUri: allowEphemeralBrowserUri ?? !compact
  });

  return (
    <View
      style={[
        fill ? styles.submissionMediaPreviewFill : styles.submissionVideoPreview,
        !fill && compact ? styles.submissionVideoPreviewCompact : null
      ]}
    >
      {resolvedVideo.source ? (
        mediaType === "image" ? (
          <Image
            accessibilityLabel="Foto selecionada"
            resizeMode="contain"
            source={
              typeof resolvedVideo.source === "number"
                ? resolvedVideo.source
                : { uri: resolvedVideo.source }
            }
            style={styles.submissionVideoPreviewMedia}
          />
        ) : (
          <SubmissionVideoPlayer uri={resolvedVideo.source} />
        )
      ) : (
        <MediaUnavailableState
          isLoading={resolvedVideo.status === "loading"}
          mediaType={mediaType}
        />
      )}
    </View>
  );
}

export function SubmissionVideoPreview(props: {
  allowEphemeralBrowserUri?: boolean;
  compact?: boolean;
  fill?: boolean;
  mediaType?: SubmissionMediaType;
  uri: string;
}) {
  return <SubmissionMediaPreview {...props} />;
}

function SubmissionVideoPlayer({ uri }: { uri: string | number }) {
  const previewPlayer = useVideoPlayer(uri, (player) => {
    player.loop = true;
  });

  return (
    <VideoView
      allowsFullscreen
      contentFit="contain"
      nativeControls
      player={previewPlayer}
      playsInline
      style={styles.submissionVideoPreviewMedia}
      surfaceType="textureView"
    />
  );
}

function MediaUnavailableState({
  isLoading,
  mediaType
}: {
  isLoading: boolean;
  mediaType: SubmissionMediaType;
}) {
  return (
    <View style={styles.videoUnavailableState}>
      <Text style={styles.videoUnavailableTitle}>
        {isLoading
          ? "Carregando mídia..."
          : mediaType === "image"
            ? "Foto indisponível"
            : "Vídeo indisponível"}
      </Text>
      {!isLoading ? (
        <Text style={styles.videoUnavailableBody}>
          Este arquivo era temporário. Envie a mídia novamente.
        </Text>
      ) : null}
    </View>
  );
}

export function StatusPill({ status }: { status: VideoSubmissionStatus }) {
  const styleByStatus =
    status === "Aprovado"
      ? styles.statusApproved
      : status === "Reprovado"
        ? styles.statusRejected
        : status === "Ajustes solicitados"
          ? styles.statusAdjust
          : styles.statusReview;

  return (
    <View style={[styles.statusPill, styleByStatus]}>
      <Text style={styles.statusPillText}>
        {status === "Aprovado" ? "Publicado" : status}
      </Text>
    </View>
  );
}
