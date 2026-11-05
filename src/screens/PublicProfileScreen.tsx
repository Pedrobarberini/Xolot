import { BRAND } from "../config/brand.ts";
import React from "react";
import {
  BadgeCheck,
  ExternalLink,
  MessageCircle,
  UserCheck,
  UserPlus
} from "lucide-react-native";
import { Linking, Pressable, ScrollView, Text, View } from "react-native";
import { DetailHud } from "../components/Navigation";
import { ProfileAvatarImage } from "../components/ProfileAvatarImage";
import {
  ProfileGalleryVideo,
  ProfileVideoGallery
} from "../components/ProfileVideoGallery";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import type {
  AppUser,
  MessageContact,
  Player,
  ProfessionalSettings,
  ProfileAvatar,
  ProfileAvatarsByProfile
} from "../types";
import { formatProfileActivity } from "../utils/profileActivity";
import { getProfessionalCategoryLabel } from "../utils/professional";

export function PublicProfileScreen({
  account,
  avatar,
  followersCount,
  followingCount,
  hiddenPlayerIds,
  isFollowing,
  likeCountsByPlayer,
  onBack,
  onMessage,
  onOpenVideo,
  onSetVideoHidden,
  onShareVideo,
  onToggleFollow,
  player,
  professionalSettings,
  profileAvatars,
  shareContacts,
  showFollow,
  videos,
  viewCountsByPlayer
}: {
  account?: AppUser;
  avatar?: ProfileAvatar;
  followersCount: number;
  followingCount: number;
  hiddenPlayerIds: Set<string>;
  isFollowing: boolean;
  likeCountsByPlayer: Record<string, number>;
  onBack: () => void;
  onMessage: () => void;
  onOpenVideo: (player: Player) => void;
  onSetVideoHidden: (playerId: string, hidden: boolean) => void;
  onShareVideo: (player: Player, contact: MessageContact, message: string) => void;
  onToggleFollow: () => void;
  player?: Player;
  professionalSettings?: ProfessionalSettings;
  profileAvatars: ProfileAvatarsByProfile;
  shareContacts: MessageContact[];
  showFollow: boolean;
  videos: Player[];
  viewCountsByPlayer: Record<string, number>;
}) {
  const profileName = account?.name ?? player?.name ?? `Perfil ${BRAND.name}`;
  const profileUsername = account?.username ?? player?.username;
  const initials = profileName.split(" ").slice(0, 2).map((part) => part[0]).join("").toUpperCase();
  const profileMeta = account?.profileCompleted
    ? formatProfileActivity(account.sport, account.position, account.city)
    : player
      ? formatProfileActivity(player.sport, player.position, player.city)
      : `Usuário ${BRAND.name} | Sem publicações`;
  const visibleProfileMeta =
    profileMeta || "Informações do perfil ainda não preenchidas";
  const profileBio = account?.bio ?? "";
  const profileClub = account?.club ?? player?.club ?? "";
  const isProfessional = professionalSettings?.enabled === true;
  const isPlusSubscriber =
    account?.identityVerified === true && account.plusActive === true;
  const totalViews = videos.reduce(
    (total, video) => total + (viewCountsByPlayer[video.id] ?? 0),
    0
  );
  const totalLikes = videos.reduce(
    (total, video) => total + (likeCountsByPlayer[video.id] ?? 0),
    0
  );
  const galleryVideos: ProfileGalleryVideo[] = videos.map((video) => ({
    id: video.id,
    mediaType: video.mediaType ?? "video",
    title: video.videoTitle,
    uri: video.videoUri
  }));

  function openExternalLink() {
    const url = professionalSettings?.externalLink.trim();
    if (!url) {
      return;
    }

    const normalizedUrl = /^https?:\/\//i.test(url) ? url : `https://${url}`;
    void Linking.openURL(normalizedUrl).catch(() => undefined);
  }

  return (
    <View style={styles.publicProfileShell}>
      <ScrollView contentContainerStyle={[styles.screenContent, styles.publicProfileContent]}>
        <View style={styles.profileHero}>
          <View style={styles.profileHeroTopRow}>
            <View style={styles.profileAvatar}>
              {avatar ? <ProfileAvatarImage avatar={avatar} /> : <Text style={styles.profileAvatarText}>{initials}</Text>}
            </View>
            <View style={styles.profileTitleBlock}>
              <View style={{ alignItems: "center", flexDirection: "row", gap: 6 }}>
                <Text numberOfLines={1} style={[styles.profilePrimaryUsername, { flexShrink: 1 }]}>
                  {profileUsername ? `@${profileUsername}` : profileName}
                </Text>
                {isPlusSubscriber ? <BadgeCheck color={colors.primaryText} size={18} /> : null}
              </View>
              {profileUsername ? <Text numberOfLines={1} style={styles.profileSecondaryName}>{profileName}</Text> : null}
              <Text numberOfLines={2} style={[styles.profileMeta, styles.publicProfileMeta]}>
                {visibleProfileMeta}
              </Text>
            </View>
            <Pressable accessibilityLabel={`Enviar mensagem para ${profileName}`} accessibilityRole="button" onPress={onMessage} style={styles.profileMenuButton}>
              <MessageCircle color={colors.primaryText} size={22} />
            </Pressable>
          </View>

          {isProfessional ? (
            <Text style={[styles.profileClub, { color: colors.primaryText }]}>{getProfessionalCategoryLabel(professionalSettings.category)} · Perfil profissional</Text>
          ) : null}
          {profileBio ? <Text style={styles.profileBio}>{profileBio}</Text> : null}
          {profileClub ? <Text style={styles.profileClub}>{profileClub}</Text> : null}

          <View style={styles.profileQuickStats}>
            <View style={styles.profileQuickItem}>
              <Text style={styles.profileQuickValue}>{videos.length}</Text>
              <Text style={styles.profileQuickLabel}>posts</Text>
            </View>
            <View style={styles.profileQuickItem}>
              <Text style={styles.profileQuickValue}>{totalViews}</Text>
              <Text style={styles.profileQuickLabel}>visualizações</Text>
            </View>
            <View style={styles.profileQuickItem}>
              <Text style={styles.profileQuickValue}>{totalLikes}</Text>
              <Text style={styles.profileQuickLabel}>curtidas</Text>
            </View>
          </View>

          <View style={styles.publicProfileSocialRow}>
            <View style={styles.profileSocialMetrics}>
              <Text style={styles.profileSocialMetricText}>
                <Text style={styles.profileSocialMetricValue}>{followersCount}</Text>{" "}
                {followersCount === 1 ? "seguidor" : "seguidores"}
              </Text>
              <Text style={styles.profileSocialMetricDivider}>|</Text>
              <Text style={styles.profileSocialMetricText}>
                <Text style={styles.profileSocialMetricValue}>{followingCount}</Text>{" "}
                seguindo
              </Text>
            </View>
            {showFollow ? (
              <Pressable
                accessibilityLabel={isFollowing ? `Deixar de seguir ${profileName}` : `Seguir ${profileName}`}
                accessibilityRole="button"
                onPress={onToggleFollow}
                style={[styles.publicProfileFollowButton, isFollowing ? styles.publicProfileFollowButtonActive : null]}
              >
                {isFollowing ? <UserCheck color={colors.primaryText} size={17} strokeWidth={2.3} /> : <UserPlus color={colors.onPrimary} size={17} strokeWidth={2.3} />}
                <Text style={[styles.publicProfileFollowButtonText, isFollowing ? styles.publicProfileFollowButtonTextActive : null]}>{isFollowing ? "Seguindo" : "Seguir"}</Text>
              </Pressable>
            ) : null}
          </View>

          {isProfessional && professionalSettings.externalLink ? (
            <Pressable accessibilityRole="link" onPress={openExternalLink} style={styles.publicProfileLinkButton}>
              <ExternalLink color={colors.onPrimary} size={18} />
              <Text style={styles.publicProfileLinkButtonText}>Abrir link profissional</Text>
            </Pressable>
          ) : null}
        </View>

        <ProfileVideoGallery
          emptyBody="Este usuário ainda não possui fotos ou vídeos publicados no perfil."
          emptyTitle="Nenhuma publicação"
          hiddenVideoIds={hiddenPlayerIds}
          onOpenVideo={(video) => {
            const selectedVideo = videos.find((item) => item.id === video.id);
            if (selectedVideo) onOpenVideo(selectedVideo);
          }}
          onSetVideoHidden={(video, hidden) => onSetVideoHidden(video.id, hidden)}
          onShareVideo={(video, contact, message) => {
            const selectedVideo = videos.find((item) => item.id === video.id);
            if (selectedVideo) onShareVideo(selectedVideo, contact, message);
          }}
          profileAvatars={profileAvatars}
          shareContacts={shareContacts}
          viewCountsByVideo={viewCountsByPlayer}
          videos={galleryVideos}
        />
      </ScrollView>
      <DetailHud backLabel="Voltar" onBack={onBack} />
    </View>
  );
}
