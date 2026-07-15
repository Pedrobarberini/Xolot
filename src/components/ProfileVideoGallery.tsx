import React, { useEffect } from "react";
import { VideoView, useVideoPlayer } from "expo-video";
import { Play } from "lucide-react-native";
import { Pressable, Text, View } from "react-native";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";

export type ProfileGalleryVideo = {
  id: string;
  title: string;
  uri: string | number;
};

export function ProfileVideoGallery({
  emptyBody,
  emptyTitle,
  onOpenVideo,
  videos
}: {
  emptyBody: string;
  emptyTitle: string;
  onOpenVideo: (video: ProfileGalleryVideo) => void;
  videos: ProfileGalleryVideo[];
}) {
  return (
    <View style={styles.profileGallerySection}>
      <View style={styles.profileGalleryHeader}>
        <Text style={styles.profileGalleryTitle}>Videos publicados</Text>
        {videos.length > 0 ? (
          <Text style={styles.profileGalleryCount}>{videos.length}</Text>
        ) : null}
      </View>

      {videos.length === 0 ? (
        <View style={styles.profileGalleryEmpty}>
          <Play color={colors.muted} size={28} />
          <Text style={styles.profileGalleryEmptyTitle}>{emptyTitle}</Text>
          <Text style={styles.profileGalleryEmptyBody}>{emptyBody}</Text>
        </View>
      ) : (
        <View style={styles.profileGalleryGrid}>
          {videos.map((video) => (
            <Pressable
              accessibilityLabel={`Abrir ${video.title} no Inicio`}
              accessibilityRole="button"
              key={video.id}
              onPress={() => onOpenVideo(video)}
              style={({ pressed }) => [
                styles.profileGalleryCard,
                pressed ? styles.buttonPressed : null
              ]}
            >
              <ProfileGalleryThumbnail uri={video.uri} />
              <View style={styles.profileGalleryCardShade} />
              <View style={styles.profileGalleryPlayBadge}>
                <Play color={colors.onPrimary} fill={colors.onPrimary} size={14} />
              </View>
              <Text numberOfLines={2} style={styles.profileGalleryCardTitle}>
                {video.title}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function ProfileGalleryThumbnail({ uri }: { uri: string | number }) {
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
