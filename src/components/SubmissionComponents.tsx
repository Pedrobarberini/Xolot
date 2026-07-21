import React, { useEffect, useRef, useState } from "react";
import { useEvent } from "expo";
import { VideoView, useVideoPlayer } from "expo-video";
import { Play } from "lucide-react-native";
import { Image, PanResponder, Pressable, Text, View } from "react-native";
import { getPointerLocationX } from "../actions/appActions";
import { useResolvedVideoSource } from "../actions/useResolvedVideoSource";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import { SubmissionMediaType, VideoSubmissionStatus } from "../types";
import { VideoVolumeControl } from "./VideoVolumeControl";

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
          <SubmissionVideoPlayer fill={fill} uri={resolvedVideo.source} />
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

function SubmissionVideoPlayer({
  fill,
  uri
}: {
  fill: boolean;
  uri: string | number;
}) {
  const [playbackTime, setPlaybackTime] = useState(0);
  const [seekTrackWidth, setSeekTrackWidth] = useState(0);
  const [volume, setVolume] = useState(0);
  const previewPlayer = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.muted = true;
    player.timeUpdateEventInterval = 0.1;
  });
  const { isPlaying } = useEvent(previewPlayer, "playingChange", {
    isPlaying: previewPlayer.playing
  });
  const { status: playerStatus } = useEvent(previewPlayer, "statusChange", {
    status: previewPlayer.status
  });
  const { muted } = useEvent(previewPlayer, "mutedChange", {
    muted: previewPlayer.muted
  });
  const { currentTime } = useEvent(previewPlayer, "timeUpdate", {
    bufferedPosition: previewPlayer.bufferedPosition,
    currentLiveTimestamp: null,
    currentOffsetFromLive: null,
    currentTime: previewPlayer.currentTime
  });
  const playbackDuration =
    playerStatus === "readyToPlay" &&
    Number.isFinite(previewPlayer.duration) &&
    previewPlayer.duration > 0
      ? previewPlayer.duration
      : 0;
  const safeCurrentTime = Number.isFinite(playbackTime)
    ? Math.min(Math.max(playbackTime, 0), playbackDuration || playbackTime)
    : 0;
  const playbackProgress =
    playbackDuration > 0 ? safeCurrentTime / playbackDuration : 0;
  const thumbOffset =
    seekTrackWidth > 12
      ? Math.min(
          Math.max(playbackProgress * seekTrackWidth, 6),
          seekTrackWidth - 6
        )
      : 0;
  const playerRef = useRef(previewPlayer);
  const durationRef = useRef(playbackDuration);
  const seekTrackWidthRef = useRef(seekTrackWidth);
  const seekToTimeRef = useRef<(targetTime: number) => void>(() => undefined);
  const seekToOffsetRef = useRef<(offsetX: number) => void>(() => undefined);

  playerRef.current = previewPlayer;
  durationRef.current = playbackDuration;
  seekTrackWidthRef.current = seekTrackWidth;
  seekToTimeRef.current = (targetTime: number) => {
    const duration = durationRef.current;

    if (duration <= 0) {
      return;
    }

    const nextTime = Math.min(Math.max(targetTime, 0), duration);
    setPlaybackTime(nextTime);
    playerRef.current.currentTime = nextTime;
  };
  seekToOffsetRef.current = (offsetX: number) => {
    const width = seekTrackWidthRef.current;
    const duration = durationRef.current;

    if (width <= 0 || duration <= 0) {
      return;
    }

    const progress = Math.min(Math.max(offsetX / width, 0), 1);
    seekToTimeRef.current(progress * duration);
  };

  const seekPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (event) => {
        const locationX = getPointerLocationX(event.nativeEvent);

        if (locationX !== null) {
          seekToOffsetRef.current(locationX);
        }
      },
      onPanResponderMove: (event) => {
        const locationX = getPointerLocationX(event.nativeEvent);

        if (locationX !== null) {
          seekToOffsetRef.current(locationX);
        }
      },
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onStartShouldSetPanResponder: () => false
    })
  ).current;

  useEffect(() => {
    if (Number.isFinite(currentTime)) {
      setPlaybackTime(currentTime);
    }
  }, [currentTime]);

  useEffect(() => () => previewPlayer.pause(), [previewPlayer]);

  function togglePlayback() {
    if (isPlaying) {
      previewPlayer.pause();
      return;
    }

    previewPlayer.play();
  }

  return (
    <View style={styles.submissionVideoPlayer}>
      <VideoView
        contentFit="contain"
        nativeControls={false}
        player={previewPlayer}
        playsInline
        style={styles.submissionVideoPreviewMedia}
        surfaceType="textureView"
      />
      <Pressable
        accessibilityLabel={isPlaying ? "Pausar vídeo" : "Reproduzir vídeo"}
        accessibilityRole="button"
        onPress={togglePlayback}
        style={styles.submissionVideoTapTarget}
      >
        {!isPlaying ? (
          <View style={styles.submissionVideoPlayButton}>
            <Play color={colors.onPrimary} fill={colors.onPrimary} size={24} />
          </View>
        ) : null}
      </Pressable>
      <View
        style={[
          styles.submissionVideoFloatingControls,
          fill ? styles.submissionVideoFloatingControlsFill : null
        ]}
      >
        <VideoVolumeControl
          muted={muted}
          onChange={(targetVolume) => {
            const nextVolume = Math.min(Math.max(targetVolume, 0), 1);

            setVolume(nextVolume);
            previewPlayer.volume = nextVolume;
            previewPlayer.muted = nextVolume <= 0;
          }}
          volume={volume}
        />
      </View>
      <View
        onLayout={(event) => {
          const nextWidth = event.nativeEvent.layout.width;

          seekTrackWidthRef.current = nextWidth;
          setSeekTrackWidth(nextWidth);
        }}
        style={[
          styles.submissionVideoSeekControl,
          fill ? styles.submissionVideoSeekControlFill : null
        ]}
        {...seekPanResponder.panHandlers}
      >
        <Pressable
          accessibilityActions={[
            { label: "Avançar 5 segundos", name: "increment" },
            { label: "Voltar 5 segundos", name: "decrement" }
          ]}
          accessibilityLabel="Posição do vídeo"
          accessibilityRole="adjustable"
          accessibilityValue={{
            max: Math.max(0, Math.round(playbackDuration)),
            min: 0,
            now: Math.max(0, Math.round(safeCurrentTime))
          }}
          onAccessibilityAction={(event) => {
            if (event.nativeEvent.actionName === "increment") {
              seekToTimeRef.current(safeCurrentTime + 5);
            }

            if (event.nativeEvent.actionName === "decrement") {
              seekToTimeRef.current(safeCurrentTime - 5);
            }
          }}
          onPress={(event) => {
            const locationX = getPointerLocationX(event.nativeEvent);

            if (locationX !== null) {
              seekToOffsetRef.current(locationX);
            }
          }}
          style={styles.submissionVideoSeekPressable}
        >
          <View
            pointerEvents="none"
            style={styles.submissionVideoScrubberTrack}
          >
            <View
              style={[
                styles.submissionVideoScrubberFill,
                { width: `${playbackProgress * 100}%` }
              ]}
            />
          </View>
          <View
            pointerEvents="none"
            style={[
              styles.submissionVideoScrubberThumb,
              { left: thumbOffset }
            ]}
          />
        </Pressable>
      </View>
    </View>
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
