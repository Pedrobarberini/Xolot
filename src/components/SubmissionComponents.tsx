import React from "react";
import { VideoView, useVideoPlayer } from "expo-video";
import { Text, View } from "react-native";
import { useResolvedVideoSource } from "../actions/useResolvedVideoSource";
import { styles } from "../styles/appStyles";
import { VideoSubmission, VideoSubmissionStatus } from "../types";

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

export function SubmissionList({
  submissions
}: {
  submissions: VideoSubmission[];
}) {
  return (
    <View style={styles.infoPanel}>
      <Text style={styles.sectionTitle}>Minhas publicações</Text>
      {submissions.length === 0 ? (
        <Text style={styles.bodyText}>
          Nenhum vídeo publicado por esta conta ainda.
        </Text>
      ) : (
        submissions.map((submission) => (
          <View key={submission.id} style={styles.submissionItem}>
            <View style={styles.submissionTopRow}>
              <View style={styles.submissionTextBlock}>
                <Text style={styles.submissionTitle}>
                  {submission.videoTitle}
                </Text>
                <Text style={styles.submissionMeta}>
                  {submission.position} | {submission.city}
                </Text>
              </View>
              <StatusPill status={submission.status} />
            </View>
            <Text style={styles.submissionBody}>{submission.highlight}</Text>
            {submission.reviewNote ? (
              <Text style={styles.reviewNote}>{submission.reviewNote}</Text>
            ) : null}
          </View>
        ))
      )}
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
