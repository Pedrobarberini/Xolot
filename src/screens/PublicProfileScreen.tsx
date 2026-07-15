import React from "react";
import { ArrowLeft, CircleDollarSign } from "lucide-react-native";
import { Pressable, ScrollView, Text, View } from "react-native";
import {
  ProfileGalleryVideo,
  ProfileVideoGallery
} from "../components/ProfileVideoGallery";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import { AppUser, AthleteFund, Player } from "../types";
import { formatBRL } from "../utils/investment";

export function PublicProfileScreen({
  account,
  canInvest,
  fund,
  onBack,
  onInvest,
  onOpenVideo,
  player,
  videos,
  walletBalance
}: {
  account?: AppUser;
  canInvest: boolean;
  fund?: AthleteFund;
  onBack: () => void;
  onInvest: () => void;
  onOpenVideo: (player: Player) => void;
  player?: Player;
  videos: Player[];
  walletBalance: number;
}) {
  const profileName = player?.name ?? account?.name ?? "Perfil NextStar";
  const initials = profileName
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const profileMeta = player
    ? `${player.position} | ${player.city}`
    : "Usuario NextStar | Sem videos publicados";
  const fundProgress = fund
    ? Math.min(Math.max(fund.fundedAmount / fund.goalAmount, 0), 1)
    : 0;
  const hasOpenFund = Boolean(
    canInvest && fund && fund.status === "Captando"
  );
  const investmentLabel = !fund
    ? "Bolsa indisponivel"
    : fund.status === "Concluida"
      ? "Bolsa concluida"
      : canInvest
        ? "Investir"
        : "Investimento indisponivel";
  const galleryVideos: ProfileGalleryVideo[] = videos.map((video) => ({
    id: video.id,
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
              <Text style={styles.profileAvatarText}>{initials}</Text>
            </View>
            <View style={styles.profileTitleBlock}>
              <Text
                numberOfLines={2}
                style={[styles.profileName, styles.publicProfileName]}
              >
                {profileName}
              </Text>
              <Text
                numberOfLines={2}
                style={[styles.profileMeta, styles.publicProfileMeta]}
              >
                {profileMeta}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Abrir investimento"
              accessibilityRole="button"
              disabled={!hasOpenFund}
              onPress={onInvest}
              style={[
                styles.profileMenuButton,
                !hasOpenFund ? styles.profileActionButtonDisabled : null
              ]}
            >
              <CircleDollarSign
                color={hasOpenFund ? colors.primary : colors.muted}
                size={22}
              />
            </Pressable>
          </View>

          <View style={styles.profileQuickStats}>
            <View style={styles.profileQuickItem}>
              <Text style={styles.profileQuickValue}>{videos.length}</Text>
              <Text style={styles.profileQuickLabel}>videos</Text>
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
                  : fund?.status === "Concluida"
                    ? "Concluida"
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
              Este perfil nao possui uma bolsa de investimento aberta.
            </Text>
          ) : null}
        </View>

        <ProfileVideoGallery
          emptyBody="Este usuario ainda nao possui videos aprovados para mostrar no perfil."
          emptyTitle="Nenhum video publicado"
          onOpenVideo={(video) => {
            const selectedVideo = videos.find((item) => item.id === video.id);

            if (selectedVideo) {
              onOpenVideo(selectedVideo);
            }
          }}
          videos={galleryVideos}
        />
      </ScrollView>

      <View style={styles.detailFixedHud}>
        <Pressable
          accessibilityLabel="Voltar"
          accessibilityRole="button"
          hitSlop={6}
          onPress={onBack}
          style={styles.detailHudBackButton}
        >
          <ArrowLeft color={colors.text} size={21} strokeWidth={2.1} />
        </Pressable>
        <Text
          accessibilityLabel={`Saldo disponivel ${formatBRL(walletBalance)}`}
          numberOfLines={1}
          style={styles.detailHudBalance}
        >
          {formatBRL(walletBalance)}
        </Text>
      </View>
    </View>
  );
}
