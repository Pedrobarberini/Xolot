import React, { useEffect, useState } from "react";
import { VideoView, useVideoPlayer } from "expo-video";
import { ImageIcon, Images, MoreVertical, Play } from "lucide-react-native";
import { Image, Pressable, Text, View } from "react-native";
import { useResolvedVideoSource } from "../actions/useResolvedVideoSource";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import type {
  MessageContact,
  ProfileAvatarsByProfile,
  SubmissionMediaType
} from "../types";
import { SharePostModal } from "./SharePostModal";
import { VideoActionsModal } from "./VideoActionsModal";

export type ProfileGalleryVideo = {
  id: string;
  mediaType?: SubmissionMediaType;
  sourceId?: string;
  title: string;
  uri: string | number;
};

export function ProfileVideoGallery({
  emptyBody,
  emptyTitle,
  hiddenVideoIds = new Set<string>(),
  onDeleteVideo,
  onSetVideoHidden,
  onShareVideo,
  onOpenVideo,
  profileAvatars = {},
  shareContacts = [],
  videos
}: {
  emptyBody: string;
  emptyTitle: string;
  hiddenVideoIds?: Set<string>;
  onDeleteVideo?: (video: ProfileGalleryVideo) => void;
  onSetVideoHidden?: (video: ProfileGalleryVideo, hidden: boolean) => void;
  onShareVideo?: (
    video: ProfileGalleryVideo,
    contact: MessageContact
  ) => void;
  onOpenVideo: (video: ProfileGalleryVideo) => void;
  profileAvatars?: ProfileAvatarsByProfile;
  shareContacts?: MessageContact[];
  videos: ProfileGalleryVideo[];
}) {
  const [actionVideo, setActionVideo] =
    useState<ProfileGalleryVideo | null>(null);
  const [shareVideo, setShareVideo] =
    useState<ProfileGalleryVideo | null>(null);
  const hasVideoActions = Boolean(
    onDeleteVideo || onSetVideoHidden || onShareVideo
  );

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
                    hasVideoActions
                      ? styles.profileGalleryPlayBadgeWithMenu
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
              {hasVideoActions ? (
                <Pressable
                  accessibilityLabel={`Abrir opcoes de ${video.title}`}
                  accessibilityRole="button"
                  hitSlop={6}
                  onPress={() => setActionVideo(video)}
                  style={({ pressed }) => [
                    styles.profileGalleryMenuButton,
                    pressed ? styles.buttonPressed : null
                  ]}
                >
                  <MoreVertical color={colors.onPrimary} size={17} />
                </Pressable>
              ) : null}
            </View>
          ))}
        </View>
      )}

      <VideoActionsModal
        canDelete={Boolean(onDeleteVideo)}
        hidden={Boolean(actionVideo && hiddenVideoIds.has(actionVideo.id))}
        onClose={() => setActionVideo(null)}
        onDelete={() => {
          if (actionVideo && onDeleteVideo) {
            onDeleteVideo(actionVideo);
          }
          setActionVideo(null);
        }}
        onShare={() => {
          setShareVideo(actionVideo);
          setActionVideo(null);
        }}
        onToggleHidden={() => {
          if (actionVideo && onSetVideoHidden) {
            onSetVideoHidden(actionVideo, !hiddenVideoIds.has(actionVideo.id));
          }
          setActionVideo(null);
        }}
        videoTitle={actionVideo?.title ?? ""}
        visible={Boolean(actionVideo)}
      />
      <SharePostModal
        contacts={shareContacts}
        onClose={() => setShareVideo(null)}
        onShare={(contact) => {
          if (shareVideo && onShareVideo) {
            onShareVideo(shareVideo, contact);
          }
        }}
        profileAvatars={profileAvatars}
        videoId={shareVideo?.id ?? ""}
        videoTitle={shareVideo?.title ?? ""}
        visible={Boolean(shareVideo)}
      />
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
