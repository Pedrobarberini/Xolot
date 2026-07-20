import React from "react";
import {
  CircleDollarSign,
  MessageCircle,
  UserCheck,
  UserPlus
} from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import { DetailHud } from "../components/Navigation";
import { ProfileAvatarImage } from "../components/ProfileAvatarImage";
import {
  ProfileGalleryVideo,
  ProfileVideoGallery
} from "../components/ProfileVideoGallery";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import { AppUser, AthleteFund, Player, ProfileAvatar } from "../types";

export function PublicProfileScreen({
  account,
  avatar,
  canInvest,
  fund,
  followersCount,
  isFollowing,
  onBack,
  onInvest,
  onMessage,
  onOpenVideo,
  onToggleFollow,
  player,
  showFollow,
  videos,
  walletBalance
}: {
  account?: AppUser;
  avatar?: ProfileAvatar;
  canInvest: boolean;
  fund?: AthleteFund;
  followersCount: number;
  isFollowing: boolean;
  onBack: () => void;
  onInvest: () => void;
  onMessage: () => void;
  onOpenVideo: (player: Player) => void;
  onToggleFollow: () => void;
  player?: Player;
  showFollow: boolean;
  videos: Player[];
  walletBalance: number;
}) {
  const profileName = account?.name ?? player?.name ?? "Perfil NextStar";
  const profileUsername = account?.username ?? player?.username;
  const initials = profileName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const profileMeta = account?.profileCompleted
    ? `${account.position} | ${account.city}`
    : player
      ? `${player.position} | ${player.city}`
      : "Usuário NextStar | Sem vídeos publicados";
  const profileBio = account?.bio ?? "";
  const profileClub = account?.club ?? player?.club ?? "";
  const fundProgress = fund
    ? Math.min(Math.max(fund.fundedAmount / fund.goalAmount, 0), 1)
    : 0;
  const hasOpenFund = Boolean(
    canInvest && fund && fund.status === "Captando"
  );
  const investmentLabel = !fund
    ? "Bolsa indisponível"
    : fund.status === "Concluída"
      ? "Bolsa concluída"
      : canInvest
        ? "Investir"
        : "Investimento indisponível";
  const galleryVideos: ProfileGalleryVideo[] = videos.map((video) => ({
    id: video.id,
    mediaType: video.mediaType ?? "video",
    title: video.videoTitle,
    uri: video.videoUri
  }));

  return (
    <View style={styles.publicProfileShell}>
      <ScrollView
        contentContainerStyle={[styles.screenContent, styles.publicProfileContent]}
      >
        <View style={styles.profileHero}>
          <View style={styles.profileHeroTopRow}>
            <View style={styles.profileAvatar}>
              {avatar ? (
                <ProfileAvatarImage avatar={avatar} />
              ) : (
                <Text style={styles.profileAvatarText}>{initials}</Text>
              )}
            </View>
            <View style={styles.profileTitleBlock}>
              <Text
                numberOfLines={1}
                style={styles.profilePrimaryUsername}
              >
                {profileUsername ? `@${profileUsername}` : profileName}
              </Text>
              {profileUsername ? (
                <Text numberOfLines={1} style={styles.profileSecondaryName}>
                  {profileName}
                </Text>
              ) : null}
              <Text
                numberOfLines={2}
                style={[styles.profileMeta, styles.publicProfileMeta]}
              >
                {profileMeta}
              </Text>
            </View>
            <Pressable
              accessibilityLabel={`Enviar mensagem para ${profileName}`}
              accessibilityRole="button"
              onPress={onMessage}
              style={styles.profileMenuButton}
            >
              <MessageCircle color={colors.primary} size={22} />
            </Pressable>
          </View>

          {profileBio ? (
            <Text style={styles.profileBio}>{profileBio}</Text>
          ) : null}
          {profileClub ? (
            <Text style={styles.profileClub}>{profileClub}</Text>
          ) : null}

          <View style={styles.publicProfileSocialRow}>
            <Text style={styles.publicProfileFollowerCount}>
              {followersCount} {followersCount === 1 ? "seguidor" : "seguidores"}
            </Text>
            {showFollow ? (
              <Pressable
                accessibilityLabel={
                  isFollowing
                    ? `Deixar de seguir ${profileName}`
                    : `Seguir ${profileName}`
                }
                accessibilityRole="button"
                onPress={onToggleFollow}
                style={[
                  styles.publicProfileFollowButton,
                  isFollowing ? styles.publicProfileFollowButtonActive : null
                ]}
              >
                {isFollowing ? (
                  <UserCheck color={colors.primary} size={17} strokeWidth={2.3} />
                ) : (
                  <UserPlus color={colors.onPrimary} size={17} strokeWidth={2.3} />
                )}
                <Text
                  style={[
                    styles.publicProfileFollowButtonText,
                    isFollowing
                      ? styles.publicProfileFollowButtonTextActive
                      : null
                  ]}
                >
                  {isFollowing ? "Seguindo" : "Seguir"}
                </Text>
              </Pressable>
            ) : null}
          </View>

          <View style={styles.profileQuickStats}>
            <View style={styles.profileQuickItem}>
              <Text style={styles.profileQuickValue}>{videos.length}</Text>
              <Text style={styles.profileQuickLabel}>publicações</Text>
            </View>
            <View style={styles.profileQuickItem}>
              <Text style={styles.profileQuickValue}>
                {Math.round(fundProgress * 100)}%
              </Text>
              <Text style={styles.profileQuickLabel}>captado</Text>
            </View>
            <View style={styles.profileQuickItem}>
              <Text numberOfLines={1} style={styles.profileQuickValue}>
                {fund?.status === "Captando"
                  ? "Aberta"
                  : fund?.status === "Concluída"
                    ? "Concluída"
                    : "Fechada"}
              </Text>
              <Text style={styles.profileQuickLabel}>bolsa</Text>
            </View>
          </View>

          <Pressable
            accessibilityLabel={investmentLabel}
            accessibilityRole="button"
            disabled={!hasOpenFund}
            onPress={onInvest}
            style={[
              styles.publicProfileInvestButton,
              !hasOpenFund ? styles.publicProfileInvestButtonDisabled : null
            ]}
          >
            <CircleDollarSign
              color={hasOpenFund ? colors.onPrimary : colors.muted}
              size={19}
            />
            <Text
              style={[
                styles.publicProfileInvestButtonText,
                !hasOpenFund
                  ? styles.publicProfileInvestButtonTextDisabled
                  : null
              ]}
            >
              {investmentLabel}
            </Text>
          </Pressable>
          {!fund ? (
            <Text style={styles.publicProfileInvestmentHint}>
              Este perfil não possui uma bolsa de investimento aberta.
            </Text>
          ) : null}
        </View>

        <ProfileVideoGallery
          emptyBody="Este usuário ainda não possui fotos ou vídeos publicados para mostrar no perfil."
          emptyTitle="Nenhuma publicação"
          onOpenVideo={(video) => {
            const selectedVideo = videos.find((item) => item.id === video.id);

            if (selectedVideo) {
              onOpenVideo(selectedVideo);
            }
          }}
          videos={galleryVideos}
        />
      </ScrollView>

      <DetailHud
        backLabel="Voltar"
        onBack={onBack}
        walletBalance={walletBalance}
      />
    </View>
  );
}
