import React from "react";
import { VideoView, useVideoPlayer } from "expo-video";
import { Text, View } from "react-native";
import { useResolvedVideoSource } from "../actions/useResolvedVideoSource";
import { styles } from "../styles/appStyles";
import { VideoSubmissionStatus } from "../types";

export function SubmissionVideoPreview({
  compact = false,
  uri
}: {
  compact?: boolean;
  uri: string;
}) {
  const resolvedVideo = useResolvedVideoSource(uri, {
    allowEphemeralBrowserUri: !compact
  });

  return (
    <View
      style={[
        styles.submissionVideoPreview,
        compact ? styles.submissionVideoPreviewCompact : null
      ]}
    >
      {resolvedVideo.source ? (
        <SubmissionVideoPlayer uri={resolvedVideo.source} />
      ) : (
        <VideoUnavailableState isLoading={resolvedVideo.status === "loading"} />
      )}
    </View>
  );
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

function VideoUnavailableState({ isLoading }: { isLoading: boolean }) {
  return (
    <View style={styles.videoUnavailableState}>
      <Text style={styles.videoUnavailableTitle}>
        {isLoading ? "Carregando vídeo..." : "Video indisponível"}
      </Text>
      {!isLoading ? (
        <Text style={styles.videoUnavailableBody}>
          Este arquivo era temporário. Envie o vídeo novamente.
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
