import React, { useEffect, useRef, useState } from "react";
import { VideoView, useVideoPlayer } from "expo-video";
import { Check, Eye, Images, MoreVertical, X } from "lucide-react-native";
import { Image, Pressable, Text, View } from "react-native";
import { useResolvedVideoSource } from "../actions/useResolvedVideoSource";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import type {
  MessageContact,
  ProfileAvatarsByProfile,
  SubmissionMediaType
} from "../types";
import {
  addProfileVideoSelection,
  toggleProfileVideoSelection
} from "../utils/profileVideoSelection";
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
  onDeleteVideos,
  onSetVideoHidden,
  onShareVideo,
  onOpenVideo,
  profileAvatars = {},
  shareContacts = [],
  viewCountsByVideo = {},
  videos
}: {
  emptyBody: string;
  emptyTitle: string;
  hiddenVideoIds?: Set<string>;
  onDeleteVideo?: (video: ProfileGalleryVideo) => void;
  onDeleteVideos?: (videos: ProfileGalleryVideo[]) => void;
  onSetVideoHidden?: (video: ProfileGalleryVideo, hidden: boolean) => void;
  onShareVideo?: (
    video: ProfileGalleryVideo,
    contact: MessageContact
  ) => void;
  onOpenVideo: (video: ProfileGalleryVideo) => void;
  profileAvatars?: ProfileAvatarsByProfile;
  shareContacts?: MessageContact[];
  viewCountsByVideo?: Record<string, number>;
  videos: ProfileGalleryVideo[];
}) {
  const [actionVideo, setActionVideo] =
    useState<ProfileGalleryVideo | null>(null);
  const [isBatchActionsVisible, setIsBatchActionsVisible] = useState(false);
  const [selectedVideoIds, setSelectedVideoIds] = useState<string[]>([]);
  const [shareVideos, setShareVideos] = useState<ProfileGalleryVideo[]>([]);
  const longPressedVideoId = useRef<string | null>(null);
  const hasVideoActions = Boolean(
    onDeleteVideo || onSetVideoHidden || onShareVideo
  );
  const canSelectMultiple = Boolean(onDeleteVideos);
  const selectedVideos = videos.filter((video) =>
    selectedVideoIds.includes(video.id)
  );
  const isSelectionMode = selectedVideoIds.length > 0;
  const areAllSelectedVideosHidden =
    selectedVideos.length > 0 &&
    selectedVideos.every((video) => hiddenVideoIds.has(video.id));

  useEffect(() => {
    setSelectedVideoIds((current) => {
      const next = current.filter((videoId) =>
        videos.some((video) => video.id === videoId)
      );

      return next.length === current.length ? current : next;
    });
  }, [videos]);

  function clearSelection() {
    setIsBatchActionsVisible(false);
    setSelectedVideoIds([]);
  }

  function selectVideo(videoId: string) {
    setSelectedVideoIds((current) =>
      addProfileVideoSelection(current, videoId)
    );
  }

  function toggleVideo(videoId: string) {
    setSelectedVideoIds((current) =>
      toggleProfileVideoSelection(current, videoId)
    );
  }

  return (
    <View style={styles.profileGallerySection}>
      <View style={styles.profileGalleryHeader}>
        <View style={styles.profileGalleryHeaderTitleBlock}>
          <Text style={styles.profileGalleryTitle}>Publicações</Text>
          {isSelectionMode ? (
            <Text style={styles.profileGallerySelectionCount}>
              {selectedVideoIds.length}{" "}
              {selectedVideoIds.length === 1 ? "selecionada" : "selecionadas"}
            </Text>
          ) : null}
        </View>
        {isSelectionMode ? (
          <View style={styles.profileGallerySelectionActions}>
            <Pressable
              accessibilityLabel="Cancelar seleção"
              accessibilityRole="button"
              hitSlop={8}
              onPress={clearSelection}
              style={({ pressed }) => [
                styles.profileGalleryHeaderIconButton,
                pressed ? styles.buttonPressed : null
              ]}
            >
              <X color={colors.muted} size={19} />
            </Pressable>
            <Pressable
              accessibilityLabel="Abrir ações das publicações selecionadas"
              accessibilityRole="button"
              hitSlop={8}
              onPress={() => setIsBatchActionsVisible(true)}
              style={({ pressed }) => [
                styles.profileGalleryHeaderIconButton,
                pressed ? styles.buttonPressed : null
              ]}
            >
              <MoreVertical color={colors.text} size={20} />
            </Pressable>
          </View>
        ) : videos.length > 0 ? (
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
          {videos.map((video) => {
            const isSelected = selectedVideoIds.includes(video.id);

            return (
              <View key={video.id} style={styles.profileGalleryCard}>
                <Pressable
                  accessibilityLabel={
                    isSelectionMode
                      ? `${isSelected ? "Remover" : "Adicionar"} ${video.title} da seleção`
                      : `Abrir ${video.title} no Início`
                  }
                  accessibilityRole="button"
                  accessibilityState={{ selected: isSelected }}
                  delayLongPress={320}
                  onLongPress={
                    canSelectMultiple
                      ? () => {
                          longPressedVideoId.current = video.id;
                          selectVideo(video.id);
                        }
                      : undefined
                  }
                  onPress={() => {
                    if (longPressedVideoId.current === video.id) {
                      longPressedVideoId.current = null;
                      return;
                    }

                    if (isSelectionMode) {
                      toggleVideo(video.id);
                      return;
                    }

                    onOpenVideo(video);
                  }}
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
                  <Text numberOfLines={2} style={styles.profileGalleryCardTitle}>
                    {video.title}
                  </Text>
                  <View style={styles.profileGalleryViewCount}>
                    <Eye color={colors.onPrimary} size={13} strokeWidth={2.2} />
                    <Text style={styles.profileGalleryViewCountText}>
                      {viewCountsByVideo[video.id] ?? 0}
                    </Text>
                  </View>
                  {isSelectionMode ? (
                    <View
                      pointerEvents="none"
                      style={[
                        styles.profileGallerySelectionOverlay,
                        isSelected
                          ? styles.profileGallerySelectionOverlayActive
                          : null
                      ]}
                    >
                      {isSelected ? (
                        <View style={styles.profileGallerySelectionBadge}>
                          <Check
                            color={colors.onPrimary}
                            size={17}
                            strokeWidth={3}
                          />
                        </View>
                      ) : null}
                    </View>
                  ) : null}
                </Pressable>
                {hasVideoActions && !isSelectionMode ? (
                  <Pressable
                    accessibilityLabel={`Abrir opções de ${video.title}`}
                    accessibilityRole="button"
                    hitSlop={6}
                    onPress={() => setActionVideo(video)}
                    style={({ pressed }) => [
                      styles.profileGalleryMenuButton,
                      pressed ? styles.buttonPressed : null
                    ]}
                  >
                    <MoreVertical color={colors.onPrimary} size={18} />
                  </Pressable>
                ) : null}
              </View>
            );
          })}
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
          setShareVideos(actionVideo ? [actionVideo] : []);
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
      <VideoActionsModal
        batchMode
        canDelete={Boolean(onDeleteVideos)}
        hidden={areAllSelectedVideosHidden}
        onClose={() => setIsBatchActionsVisible(false)}
        onDelete={() => {
          if (selectedVideos.length > 0 && onDeleteVideos) {
            onDeleteVideos(selectedVideos);
          }
          clearSelection();
        }}
        onShare={() => {
          setShareVideos(selectedVideos);
          clearSelection();
        }}
        onToggleHidden={() => {
          if (onSetVideoHidden) {
            selectedVideos.forEach((video) =>
              onSetVideoHidden(video, !areAllSelectedVideosHidden)
            );
          }
          clearSelection();
        }}
        selectionCount={selectedVideos.length}
        videoTitle=""
        visible={isBatchActionsVisible && selectedVideos.length > 0}
      />
      <SharePostModal
        contacts={shareContacts}
        onClose={() => setShareVideos([])}
        onShare={(contact) => {
          if (onShareVideo) {
            shareVideos.forEach((video) => onShareVideo(video, contact));
          }
        }}
        profileAvatars={profileAvatars}
        videoId={shareVideos.map((video) => video.id).join(":")}
        videoTitle={
          shareVideos.length > 1
            ? `${shareVideos.length} publicações selecionadas`
            : shareVideos[0]?.title ?? ""
        }
        visible={shareVideos.length > 0}
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
