import React, { useEffect } from "react";
import { VideoView, useVideoPlayer } from "expo-video";
import { ImageIcon, Images, Play, Trash2 } from "lucide-react-native";
import { Image, Pressable, Text, View } from "react-native";
import { useResolvedVideoSource } from "../actions/useResolvedVideoSource";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import type { SubmissionMediaType } from "../types";

export type ProfileGalleryVideo = {
  id: string;
  mediaType?: SubmissionMediaType;
  title: string;
  uri: string | number;
};

export function ProfileVideoGallery({
  emptyBody,
  emptyTitle,
  onDeleteVideo,
  onOpenVideo,
  videos
}: {
  emptyBody: string;
  emptyTitle: string;
  onDeleteVideo?: (video: ProfileGalleryVideo) => void;
  onOpenVideo: (video: ProfileGalleryVideo) => void;
  videos: ProfileGalleryVideo[];
}) {
  return (
    <View style={styles.profileGallerySection}>
      <View style={styles.profileGalleryHeader}>
        <Text style={styles.profileGalleryTitle}>Publicações</Text>
        {videos.length > 0 ? (
          <Text style={styles.profileGalleryCount}>{videos.length}</Text>
        ) : null}
      </View>

      {videos.length === 0 ? (
        <View style={styles.profileGalleryEmpty}>
          <Images color={colors.muted} size={28} />
          <Text style={styles.profileGalleryEmptyTitle}>{emptyTitle}</Text>
          <Text style={styles.profileGalleryEmptyBody}>{emptyBody}</Text>
        </View>
      ) : (
        <View style={styles.profileGalleryGrid}>
          {videos.map((video) => (
            <View key={video.id} style={styles.profileGalleryCard}>
              <Pressable
                accessibilityLabel={`Abrir ${video.title} no Início`}
                accessibilityRole="button"
                onPress={() => onOpenVideo(video)}
                style={({ pressed }) => [
                  styles.profileGalleryOpenButton,
                  pressed ? styles.buttonPressed : null
                ]}
              >
                <ProfileGalleryThumbnail
                  mediaType={video.mediaType}
                  uri={video.uri}
                />
                <View style={styles.profileGalleryCardShade} />
                <View
                  style={[
                    styles.profileGalleryPlayBadge,
                    onDeleteVideo
                      ? styles.profileGalleryPlayBadgeWithDelete
                      : null
                  ]}
                >
                  {video.mediaType === "image" ? (
                    <ImageIcon color={colors.onPrimary} size={15} />
                  ) : (
                    <Play
                      color={colors.onPrimary}
                      fill={colors.onPrimary}
                      size={14}
                    />
                  )}
                </View>
                <Text numberOfLines={2} style={styles.profileGalleryCardTitle}>
                  {video.title}
                </Text>
              </Pressable>
              {onDeleteVideo ? (
                <Pressable
                  accessibilityLabel={`Excluir ${video.title}`}
                  accessibilityRole="button"
                  hitSlop={6}
                  onPress={() => onDeleteVideo(video)}
                  style={({ pressed }) => [
                    styles.profileGalleryDeleteButton,
                    pressed ? styles.buttonPressed : null
                  ]}
                >
                  <Trash2 color={colors.onPrimary} size={15} />
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function ProfileGalleryThumbnail({
  mediaType = "video",
  uri
}: {
  mediaType?: SubmissionMediaType;
  uri: string | number;
}) {
  const resolvedMedia = useResolvedVideoSource(uri);

  if (!resolvedMedia.source) {
    return (
      <View style={[styles.profileGalleryMedia, styles.videoUnavailableState]}>
        <Text style={styles.videoUnavailableCompactText}>
          {resolvedMedia.status === "loading"
            ? "Carregando..."
            : `Reenvie ${mediaType === "image" ? "a foto" : "o vídeo"}`}
        </Text>
      </View>
    );
  }

  if (mediaType === "image") {
    return (
      <Image
        accessibilityLabel="Foto publicada"
        resizeMode="cover"
        source={
          typeof resolvedMedia.source === "number"
            ? resolvedMedia.source
            : { uri: resolvedMedia.source }
        }
        style={styles.profileGalleryMedia}
      />
    );
  }

  return <ResolvedProfileGalleryThumbnail uri={resolvedMedia.source} />;
}

function ResolvedProfileGalleryThumbnail({ uri }: { uri: string | number }) {
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
      style={styles.profileGalleryMedia}
      surfaceType="textureView"
    />
  );
}
