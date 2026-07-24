import React, { useEffect } from "react";
import { VideoView, useVideoPlayer } from "expo-video";
import { ImageIcon, Play } from "lucide-react-native";
import { Image, View } from "react-native";
import { useResolvedVideoSource } from "../actions/useResolvedVideoSource";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import type { Player, SubmissionMediaType } from "../types";

export function SharedPostThumbnail({
  isMine,
  mediaType,
  player
}: {
  isMine: boolean;
  mediaType: SubmissionMediaType;
  player?: Player;
}) {
  return (
    <View
      style={[
        styles.sharedPostMessageThumbnail,
        isMine ? styles.sharedPostMessageThumbnailMine : null
      ]}
    >
      {player ? (
        <ResolvedSharedPostThumbnail
          isMine={isMine}
          mediaType={mediaType}
          uri={player.videoUri}
        />
      ) : (
        <SharedPostThumbnailFallback isMine={isMine} mediaType={mediaType} />
      )}
    </View>
  );
}

function ResolvedSharedPostThumbnail({
  isMine,
  mediaType,
  uri
}: {
  isMine: boolean;
  mediaType: SubmissionMediaType;
  uri: string | number;
}) {
  const resolvedMedia = useResolvedVideoSource(uri);

  if (!resolvedMedia.source) {
    return <SharedPostThumbnailFallback isMine={isMine} mediaType={mediaType} />;
  }

  if (mediaType === "image") {
    return (
      <Image
        accessibilityLabel="Foto compartilhada"
        resizeMode="cover"
        source={
          typeof resolvedMedia.source === "number"
            ? resolvedMedia.source
            : { uri: resolvedMedia.source }
        }
        style={styles.sharedPostMessageThumbnailMedia}
      />
    );
  }

  return <SharedPostVideoThumbnail uri={resolvedMedia.source} />;
}

function SharedPostVideoThumbnail({ uri }: { uri: string | number }) {
  const thumbnailPlayer = useVideoPlayer(uri);

  useEffect(() => {
    thumbnailPlayer.pause();
  }, [thumbnailPlayer]);

  return (
    <VideoView
      contentFit="cover"
      nativeControls={false}
      player={thumbnailPlayer}
      pointerEvents="none"
      style={styles.sharedPostMessageThumbnailMedia}
      surfaceType="textureView"
    />
  );
}

function SharedPostThumbnailFallback({
  isMine = false,
  mediaType
}: {
  isMine?: boolean;
  mediaType: SubmissionMediaType;
}) {
  const color = isMine ? colors.primary : colors.onPrimary;

  return (
    <View style={styles.sharedPostMessageThumbnailFallback}>
      {mediaType === "image" ? (
        <ImageIcon color={color} size={18} />
      ) : (
        <Play color={color} fill={color} size={17} />
      )}
    </View>
  );
}
