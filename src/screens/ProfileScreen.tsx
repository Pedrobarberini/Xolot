import { BRAND } from "../config/brand.ts";
import React, { useEffect, useMemo, useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  BadgeCheck,
  Bell,
  BriefcaseBusiness,
  Camera,
  LogOut,
  Moon,
  Menu,
  Play,
  ShieldCheck,
  Settings,
  Trash2,
  UserRoundPen
} from "lucide-react-native";
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  View
} from "react-native";
import { AvatarPositionModal } from "../components/AvatarPositionModal";
import { DeleteAccountModal } from "../components/DeleteAccountModal";
import { DeleteVideoModal } from "../components/DeleteVideoModal";
import { BackButton } from "../components/Navigation";
import { ProfileAvatarPreviewModal } from "../components/ProfileAvatarPreviewModal";
import {
  ProfileListModal,
  type ProfileListItemData
} from "../components/ProfileListModal";
import {
  ProfileGalleryVideo,
  ProfileVideoGallery
} from "../components/ProfileVideoGallery";
import { ProfileAvatarImage } from "../components/ProfileAvatarImage";
import { ScreenTransition } from "../components/AppShell";
import { styles } from "../styles/appStyles";
import { useTheme } from "../ThemeProvider";
import { colors } from "../theme";
import type {
  AccountProfile,
  AppUser,
  IdentityVerification,
  MessageContact,
  Player,
  ProfessionalSettings,
  ProfessionalSubscription,
  ProfileAvatar,
  ProfileAvatarsByProfile,
  PromotionCampaign,
  TagCatalogEntry,
  VideoSubmission
} from "../types";
import { formatProfileActivity } from "../utils/profileActivity";
import {
  cancelProfessionalSubscription,
  createPlusSubscriptionCheckout,
  subscribeToProfessionalSubscription,
  syncProfessionalSubscription
} from "../services/firebaseProfessionalService";
import { DEFAULT_AVATAR_CROP_SCALE } from "../utils/avatarFocus";
import { subscribeToIdentityVerification } from "../services/firebaseIdentityVerificationService";
import { getProfileVideoVisibilityIds } from "../utils/profileVideoSelection";
import { AccountSetupScreen } from "./AccountSetupScreen";
import { ProfessionalDashboardScreen } from "./ProfessionalDashboardScreen";
import { IdentityVerificationScreen } from "./IdentityVerificationScreen";
import { SecurityScreen } from "./SecurityScreen";

type ProfileView =
  | "edit-profile"
  | "identity-verification"
  | "overview"
  | "professional"
  | "security"
  | "settings";

export function ProfileScreen({
  accounts,
  autoplayEnabled,
  avatar,
  blockedProfileIds,
  campaigns,
  followers,
  followersCount,
  following,
  followingCount,
  hiddenPlayerIds,
  likeCountsByPlayer,
  mutedContentKeys,
  messagesCount,
  notificationsEnabled,
  onChangeAutoplay,
  onChangeAvatar,
  onChangeNotifications,
  onDeleteAccount,
  onCreateTag,
  onDeleteVideo,
  onOpenProfile,
  onOpenVideo,
  onProfessionalOpenRequestHandled,
  onPromotePost,
  onRestoreMutedContent,
  onSetPlayerReported,
  onSetVideoHidden,
  onShareVideo,
  onSignOut,
  onToggleBlockedProfile,
  onToggleCampaign,
  onUpdateProfessionalSettings,
  onUpdateProfile,
  professionalOpenRequestId = 0,
  professionalPosts,
  professionalSettings,
  profileAvatars,
  reportedPlayerIds,
  securityPlayers,
  shareContacts,
  submissions,
  tagCatalog,
  user,
  viewCountsByPlayer
}: {
  accounts: AppUser[];
  autoplayEnabled: boolean;
  avatar?: ProfileAvatar;
  blockedProfileIds: Set<string>;
  campaigns: PromotionCampaign[];
  followers: AppUser[];
  followersCount: number;
  following: AppUser[];
  followingCount: number;
  hiddenPlayerIds: Set<string>;
  likeCountsByPlayer: Record<string, number>;
  mutedContentKeys: Set<string>;
  messagesCount: number;
  notificationsEnabled: boolean;
  onChangeAutoplay: (value: boolean) => void;
  onChangeAvatar: (avatar: ProfileAvatar | null) => void;
  onChangeNotifications: (value: boolean) => void;
  onDeleteAccount: () => Promise<boolean>;
  onCreateTag: (label: string) => Promise<unknown> | unknown;
  onDeleteVideo: (video: VideoSubmission) => Promise<boolean>;
  onOpenProfile: (account: AppUser) => void;
  onOpenVideo: (video: VideoSubmission) => void;
  onProfessionalOpenRequestHandled?: () => void;
  onPromotePost: (player: Player) => void;
  onRestoreMutedContent: (contentKey: string) => void;
  onSetPlayerReported: (playerId: string, reported: boolean) => void;
  onSetVideoHidden: (playerId: string, hidden: boolean) => void;
  onShareVideo: (
    video: VideoSubmission,
    contact: MessageContact,
    message: string
  ) => void;
  onSignOut: () => void;
  onToggleBlockedProfile: (profileId: string) => void;
  onToggleCampaign: (campaignId: string) => void;
  onUpdateProfessionalSettings: (settings: ProfessionalSettings) => void;
  onUpdateProfile: (profile: AccountProfile) => Promise<boolean>;
  professionalOpenRequestId?: number;
  professionalPosts: Player[];
  professionalSettings: ProfessionalSettings;
  profileAvatars: ProfileAvatarsByProfile;
  reportedPlayerIds: Set<string>;
  securityPlayers: Player[];
  shareContacts: MessageContact[];
  submissions: VideoSubmission[];
  tagCatalog: TagCatalogEntry[];
  user: AppUser;
  viewCountsByPlayer: Record<string, number>;
}) {
  const [isFollowersVisible, setIsFollowersVisible] = useState(false);
  const [isFollowingVisible, setIsFollowingVisible] = useState(false);
  const [isAvatarPreviewVisible, setIsAvatarPreviewVisible] = useState(false);
  const [isAvatarPositionVisible, setIsAvatarPositionVisible] = useState(false);
  const [isDeleteAccountVisible, setIsDeleteAccountVisible] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isDeletingVideo, setIsDeletingVideo] = useState(false);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [videosPendingDeletion, setVideosPendingDeletion] = useState<
    VideoSubmission[]
  >([]);
  const [profileView, setProfileView] = useState<ProfileView>("overview");
  const [professionalSubscription, setProfessionalSubscription] =
    useState<ProfessionalSubscription | null>(null);
  const [identityVerification, setIdentityVerification] =
    useState<IdentityVerification | null>(null);
  const [isProfessionalSubscriptionLoading, setIsProfessionalSubscriptionLoading] =
    useState(user.role === "Usuário");
  const profileNavigationTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );

  useEffect(() => {
    if (professionalOpenRequestId > 0) {
      setProfileView("professional");
      onProfessionalOpenRequestHandled?.();
    }
  }, [professionalOpenRequestId]);

  const mySubmissions = submissions.filter((item) => item.userId === user.id);
  const accountSubmissions = user.role === "Admin" ? submissions : mySubmissions;
  const publishedVideos = mySubmissions.filter(
    (item) => item.status === "Aprovado" && item.videoLink.trim().length > 0
  );
  const galleryVideos: ProfileGalleryVideo[] = publishedVideos.map((video) => ({
    id: `approved-${video.id}`,
    mediaType: video.mediaType ?? "video",
    sourceId: video.id,
    title: video.videoTitle,
    uri: video.videoLink
  }));
  const totalProfileLikes = galleryVideos.reduce(
    (total, video) => total + (likeCountsByPlayer[video.id] ?? 0),
    0
  );
  const totalProfileViews = galleryVideos.reduce(
    (total, video) => total + (viewCountsByPlayer[video.id] ?? 0),
    0
  );
  const isPlusSubscriber =
    (identityVerification?.status === "approved" || user.identityVerified === true) &&
    (professionalSubscription?.status === "authorized" || user.plusActive === true);
  const profileInitials = user.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const followerListItems = useMemo<ProfileListItemData[]>(
    () =>
      followers.map((follower) => toProfileListItem(follower, profileAvatars)),
    [followers, profileAvatars]
  );
  const followingListItems = useMemo<ProfileListItemData[]>(
    () =>
      following.map((account) => toProfileListItem(account, profileAvatars)),
    [following, profileAvatars]
  );

  useEffect(() => {
    if (user.role !== "Usuário") {
      setProfessionalSubscription(null);
      setIsProfessionalSubscriptionLoading(false);
      return;
    }

    setIsProfessionalSubscriptionLoading(true);
    return subscribeToProfessionalSubscription(
      user.id,
      (subscription) => {
        setProfessionalSubscription(subscription);
        setIsProfessionalSubscriptionLoading(false);
      },
      () => {
        setProfessionalSubscription(null);
        setIsProfessionalSubscriptionLoading(false);
      }
    );
  }, [user.id, user.role]);

  useEffect(() => {
    if (user.role !== "Usuário") {
      setIdentityVerification(null);
      return;
    }
    return subscribeToIdentityVerification(
      user.id,
      setIdentityVerification,
      () => setIdentityVerification(null)
    );
  }, [user.id, user.role]);

  useEffect(
    () => () => {
      if (profileNavigationTimer.current) {
        clearTimeout(profileNavigationTimer.current);
      }
    },
    []
  );

  function openProfileView(nextView: Exclude<ProfileView, "overview">) {
    setIsOptionsVisible(false);

    if (profileNavigationTimer.current) {
      clearTimeout(profileNavigationTimer.current);
    }

    profileNavigationTimer.current = setTimeout(() => {
      setProfileView(nextView);
      profileNavigationTimer.current = null;
    }, 220);
  }

  async function confirmVideoDeletion() {
    if (videosPendingDeletion.length === 0 || isDeletingVideo) {
      return;
    }

    setIsDeletingVideo(true);

    try {
      const deletionResults = await Promise.all(
        videosPendingDeletion.map((video) => onDeleteVideo(video))
      );
      const deletedCount = deletionResults.filter(Boolean).length;

      if (deletedCount === 0) {
        Alert.alert(
          "Não foi possível excluir",
          "As publicações selecionadas não pertencem à conta conectada."
        );
        return;
      }

      if (deletedCount < videosPendingDeletion.length) {
        Alert.alert(
          "Exclusão parcial",
          `${deletedCount} de ${videosPendingDeletion.length} publicações foram apagadas.`
        );
      }

      setVideosPendingDeletion([]);
    } catch {
      Alert.alert(
        "Não foi possível excluir",
        "Tente novamente em alguns instantes."
      );
    } finally {
      setIsDeletingVideo(false);
    }
  }

  async function confirmAccountDeletion() {
    if (isDeletingAccount) return;

    setIsDeletingAccount(true);
    const deleted = await onDeleteAccount();

    if (!deleted) {
      setIsDeletingAccount(false);
      return;
    }

    setIsDeleteAccountVisible(false);
  }
  const avatarPositionModal = (
    <AvatarPositionModal
      avatar={avatar}
      onClose={() => setIsAvatarPositionVisible(false)}
      onSave={(nextAvatar) => {
        onChangeAvatar(nextAvatar);
        setIsAvatarPositionVisible(false);
      }}
      visible={isAvatarPositionVisible}
    />
  );

  async function startPlusSubscription() {
    if (identityVerification?.status !== "approved") {
      setProfileView("identity-verification");
      return;
    }

    try {
      const checkout = await createPlusSubscriptionCheckout();

      if (checkout.status === "authorized") {
        Alert.alert(BRAND.subscriptionName, "Sua assinatura já está ativa.");
        return;
      }

      if (!checkout.checkoutUrl) {
        throw new Error("O link de pagamento não foi disponibilizado.");
      }

      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.location.assign(checkout.checkoutUrl);
        return;
      }

      await Linking.openURL(checkout.checkoutUrl);
    } catch (error) {
      Alert.alert(
        "Pagamento indisponível",
        error instanceof Error
          ? error.message
          : "Não foi possível abrir o Mercado Pago."
      );
    }
  }

  async function refreshPlusSubscription() {
    try {
      const result = await syncProfessionalSubscription();
      Alert.alert(
        "Assinatura atualizada",
        result.synced
          ? "O status mais recente do Mercado Pago foi carregado."
          : "Inicie a assinatura antes de atualizar o pagamento."
      );
    } catch (error) {
      Alert.alert(
        "Não foi possível atualizar",
        error instanceof Error
          ? error.message
          : "Tente novamente em alguns instantes."
      );
    }
  }

  async function cancelPlusSubscription() {
    try {
      await cancelProfessionalSubscription();
      Alert.alert(
        "Assinatura cancelada",
        `A renovação do ${BRAND.subscriptionName} foi cancelada com sucesso.`
      );
    } catch (error) {
      Alert.alert(
        "Não foi possível cancelar",
        error instanceof Error
          ? error.message
          : "Tente novamente em alguns instantes."
      );
    }
  }
  if (profileView === "identity-verification") {
    return (
      <ScreenTransition key="identity-verification" style={styles.profileViewScene}>
        <IdentityVerificationScreen
          age={user.age}
          onBack={() => setProfileView("professional")}
          onContinue={() => setProfileView("professional")}
          verification={identityVerification}
        />
      </ScreenTransition>
    );
  }

  if (profileView === "professional") {
    return (
      <ScreenTransition key="professional" style={styles.profileViewScene}>
        <ProfessionalDashboardScreen
          campaigns={campaigns}
          identityVerification={identityVerification}
          metrics={{
            likes: totalProfileLikes,
            messages: messagesCount,
            posts: publishedVideos.length,
            views: totalProfileViews
          }}
          onBack={() => setProfileView("overview")}
          onPromotePost={onPromotePost}
          onCancelSubscription={cancelPlusSubscription}
          onOpenIdentityVerification={() => setProfileView("identity-verification")}
          onStartSubscription={startPlusSubscription}
          onSyncSubscription={refreshPlusSubscription}
          onToggleCampaign={onToggleCampaign}
          onUpdateSettings={onUpdateProfessionalSettings}
          posts={professionalPosts}
          settings={professionalSettings}
          subscription={professionalSubscription}
          subscriptionLoading={isProfessionalSubscriptionLoading}
        />
      </ScreenTransition>
    );
  }

  function openListedProfile(accountId: string) {
    const account = accounts.find((item) => item.id === accountId);

    if (!account) {
      return;
    }

    setIsFollowersVisible(false);
    setIsFollowingVisible(false);
    onOpenProfile(account);
  }

  if (profileView === "security") {
    return (
      <ScreenTransition key="security" style={styles.profileViewScene}>
        <SecurityScreen
          blockedProfileIds={blockedProfileIds}
          hiddenPlayerIds={hiddenPlayerIds}
          mutedContentKeys={mutedContentKeys}
          onBack={() => setProfileView("overview")}
          onRestoreMutedContent={onRestoreMutedContent}
          onRestorePlayer={(playerId) => onSetVideoHidden(playerId, false)}
          onUnblockProfile={onToggleBlockedProfile}
          onWithdrawReport={(playerId) =>
            onSetPlayerReported(playerId, false)
          }
          players={securityPlayers}
          profileAvatars={profileAvatars}
          reportedPlayerIds={reportedPlayerIds}
          users={accounts}
        />
      </ScreenTransition>
    );
  }

  if (profileView === "settings") {
    return (
      <>
        <ScreenTransition key="settings" style={styles.profileViewScene}>
          <SettingsView
            accountSubmissions={accountSubmissions}
            autoplayEnabled={autoplayEnabled}
            avatar={avatar}
            notificationsEnabled={notificationsEnabled}
            onBack={() => setProfileView("overview")}
            onChangeAvatar={onChangeAvatar}
            onChangeAutoplay={onChangeAutoplay}
            onChangeNotifications={onChangeNotifications}
            onRequestAccountDeletion={() => setIsDeleteAccountVisible(true)}
            onRequestAvatarPosition={() => setIsAvatarPositionVisible(true)}
            onOpenEditProfile={() => setProfileView("edit-profile")}
            user={user}
          />
        </ScreenTransition>
        {avatarPositionModal}
        <DeleteAccountModal
          isDeleting={isDeletingAccount}
          onClose={() => setIsDeleteAccountVisible(false)}
          onConfirm={confirmAccountDeletion}
          visible={isDeleteAccountVisible}
        />
      </>
    );
  }

  if (profileView === "edit-profile") {
    return (
      <ScreenTransition key="edit-profile" style={styles.profileViewScene}>
        <AccountSetupScreen
          accounts={accounts}
          avatar={avatar}
          onBack={() => setProfileView("settings")}
          onChangeAvatar={onChangeAvatar}
          onCreateTag={onCreateTag}
          onSave={async (profile) => {
            const saved = await onUpdateProfile(profile);
            if (saved) {
              setProfileView("settings");
            }
            return saved;
          }}
          tagCatalog={tagCatalog}
          user={user}
        />
      </ScreenTransition>
    );
  }

  return (
    <>
      <ScreenTransition key="overview" style={styles.profileViewScene}>
        <ScrollView contentContainerStyle={styles.screenContent}>
          <View style={styles.profileHero}>
            <View style={styles.profileHeroTopRow}>
              <Pressable
                accessibilityLabel={
                  avatar ? "Ampliar foto do perfil" : "Foto do perfil"
                }
                accessibilityRole={avatar ? "button" : undefined}
                disabled={!avatar}
                onPress={() => setIsAvatarPreviewVisible(true)}
                style={styles.profileAvatar}
              >
                {avatar ? (
                  <ProfileAvatarImage avatar={avatar} />
                ) : (
                  <Text style={styles.profileAvatarText}>{profileInitials}</Text>
                )}
              </Pressable>
              <View style={styles.profileTitleBlock}>
                <View style={{ alignItems: "center", flexDirection: "row", gap: 6 }}>
                  <Text
                    numberOfLines={1}
                    style={[styles.profilePrimaryUsername, { flexShrink: 1 }]}
                  >
                    @{user.username}
                  </Text>
                  {isPlusSubscriber ? (
                    <View accessible accessibilityLabel={`Assinante ${BRAND.subscriptionName}`}>
                      <BadgeCheck color={colors.primaryText} size={18} />
                    </View>
                  ) : null}
                </View>
                <Text numberOfLines={1} style={styles.profileSecondaryName}>
                  {user.name}
                </Text>
                <Text style={styles.profileMeta}>
                  {user.role === "Usuário" && user.profileCompleted
                    ? formatProfileActivity(user.sport, user.position, user.city)
                    : `${user.role} | ${user.email}`}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Abrir opções do perfil"
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setIsOptionsVisible(true)}
                style={styles.profileMenuButton}
              >
                <Menu color={colors.text} size={22} />
              </Pressable>
            </View>
            {user.role === "Usuário" && user.bio ? (
              <Text style={styles.profileBio}>{user.bio}</Text>
            ) : null}
            {user.role === "Usuário" && user.club ? (
              <Text style={styles.profileClub}>{user.club}</Text>
            ) : null}
            <View style={styles.profileQuickStats}>
              <View style={styles.profileQuickItem}>
                <Text style={styles.profileQuickValue}>
                  {publishedVideos.length}
                </Text>
                <Text style={styles.profileQuickLabel}>posts</Text>
              </View>
              <View style={styles.profileQuickItem}>
                <Text style={styles.profileQuickValue}>
                  {totalProfileViews}
                </Text>
                <Text style={styles.profileQuickLabel}>visualizações</Text>
              </View>
              <View style={styles.profileQuickItem}>
                <Text style={styles.profileQuickValue}>
                  {totalProfileLikes}
                </Text>
                <Text style={styles.profileQuickLabel}>curtidas</Text>
              </View>
            </View>
            <View style={styles.profileSocialMetrics}>
              <Pressable
                accessibilityLabel="Ver lista de seguidores"
                accessibilityRole="button"
                onPress={() => setIsFollowersVisible(true)}
              >
                <Text style={styles.profileSocialMetricText}>
                  <Text style={styles.profileSocialMetricValue}>
                    {followersCount}
                  </Text>{" "}
                  {followersCount === 1 ? "seguidor" : "seguidores"}
                </Text>
              </Pressable>
              <Text style={styles.profileSocialMetricDivider}>|</Text>
              <Pressable
                accessibilityLabel="Ver lista de perfis seguidos"
                accessibilityRole="button"
                onPress={() => setIsFollowingVisible(true)}
              >
                <Text style={styles.profileSocialMetricText}>
                  <Text style={styles.profileSocialMetricValue}>
                    {followingCount}
                  </Text>{" "}
                  seguindo
                </Text>
              </Pressable>
            </View>
          </View>

          <ProfileVideoGallery
            emptyBody="Suas fotos e vídeos publicados aparecerão nesta galeria."
            emptyTitle="Publique uma mídia para mostrá-la aqui"
            hiddenVideoIds={hiddenPlayerIds}
            onDeleteVideo={(video) => {
              const selectedVideo = publishedVideos.find(
                (item) => item.id === video.sourceId
              );

              if (selectedVideo) {
                setVideosPendingDeletion([selectedVideo]);
              }
            }}
            onDeleteVideos={(videos) => {
              const selectedIds = new Set(
                videos.map((video) => video.sourceId).filter(Boolean)
              );
              const selectedVideos = publishedVideos.filter((video) =>
                selectedIds.has(video.id)
              );

              if (selectedVideos.length > 0) {
                setVideosPendingDeletion(selectedVideos);
              }
            }}
            onOpenVideo={(video) => {
              const selectedVideo = publishedVideos.find(
                (item) => item.id === video.sourceId
              );

              if (selectedVideo) {
                onOpenVideo(selectedVideo);
              }
            }}
            onSetVideoHidden={(video, hidden) => {
              if (hidden) {
                onSetVideoHidden(video.id, true);
                return;
              }

              getProfileVideoVisibilityIds(video).forEach((videoId) =>
                onSetVideoHidden(videoId, false)
              );
            }}
            onShareVideo={(video, contact, message) => {
              const selectedVideo = publishedVideos.find(
                (item) => item.id === video.sourceId
              );

              if (selectedVideo) {
                onShareVideo(selectedVideo, contact, message);
              }
            }}
            profileAvatars={profileAvatars}
            shareContacts={shareContacts}
            viewCountsByVideo={viewCountsByPlayer}
            videos={galleryVideos}
          />
        </ScrollView>
      </ScreenTransition>
      <ProfileOptionsMenu
        onClose={() => setIsOptionsVisible(false)}
        onOpenProfessional={() => openProfileView("professional")}
        onOpenSecurity={() => openProfileView("security")}
        onOpenSettings={() => openProfileView("settings")}
        onSignOut={() => {
          setIsOptionsVisible(false);
          onSignOut();
        }}
        showProfessional={user.role === "Usuário"}
        visible={isOptionsVisible}
      />
      <DeleteVideoModal
        isDeleting={isDeletingVideo}
        itemCount={videosPendingDeletion.length}
        onClose={() => {
          if (!isDeletingVideo) {
            setVideosPendingDeletion([]);
          }
        }}
        onConfirm={confirmVideoDeletion}
        videoTitle={
          videosPendingDeletion.length === 1
            ? videosPendingDeletion[0]?.videoTitle ?? ""
            : `${videosPendingDeletion.length} publicações selecionadas`
        }
        visible={videosPendingDeletion.length > 0}
      />
      <ProfileListModal
        emptyBody="Quando alguém seguir seu perfil, essa pessoa aparecerá nesta lista."
        emptyTitle="Você ainda não tem seguidores"
        items={followerListItems}
        onClose={() => setIsFollowersVisible(false)}
        onSelectItem={(profile) => openListedProfile(profile.id)}
        title="Seguidores"
        visible={isFollowersVisible}
      />
      <ProfileListModal
        emptyBody="Quando você seguir outros perfis, eles aparecerão nesta lista."
        emptyTitle="Você ainda não segue perfis"
        items={followingListItems}
        onClose={() => setIsFollowingVisible(false)}
        onSelectItem={(profile) => openListedProfile(profile.id)}
        title="Seguindo"
        visible={isFollowingVisible}
      />
      <ProfileAvatarPreviewModal
        avatar={avatar}
        onClose={() => setIsAvatarPreviewVisible(false)}
        visible={isAvatarPreviewVisible}
      />
      {avatarPositionModal}
    </>
  );
}

function toProfileListItem(
  account: AppUser,
  profileAvatars: ProfileAvatarsByProfile
): ProfileListItemData {
  return {
    avatar: profileAvatars[`profile-${account.id}`],
    id: account.id,
    name: account.name,
    subtitle: account.profileCompleted
      ? formatProfileActivity(account.sport, account.position, account.city)
      : account.role === "Admin"
        ? `Administrador ${BRAND.name}`
        : `Usuário ${BRAND.name}`,
    username: account.username
  };
}

function ProfileOptionsMenu({
  onClose,
  onOpenProfessional,
  onOpenSecurity,
  onOpenSettings,
  onSignOut,
  showProfessional,
  visible
}: {
  onClose: () => void;
  onOpenProfessional: () => void;
  onOpenSecurity: () => void;
  onOpenSettings: () => void;
  onSignOut: () => void;
  showProfessional: boolean;
  visible: boolean;
}) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.profileMenuModalRoot}>
        <Pressable
          accessibilityLabel="Fechar opções do perfil"
          accessibilityRole="button"
          onPress={onClose}
          style={styles.profileMenuBackdrop}
        />
        <View pointerEvents="box-none" style={styles.profileMenuLayer}>
          <View accessibilityViewIsModal style={styles.profileMenuPanel}>
            <Text style={styles.profileMenuTitle}>Opções do perfil</Text>
            <Pressable
              accessibilityLabel="Abrir configurações"
              accessibilityRole="button"
              onPress={onOpenSettings}
              style={styles.profileMenuItem}
            >
              <Settings color={colors.text} size={20} />
              <Text style={styles.profileMenuItemText}>Configurações</Text>
            </Pressable>
            <Pressable
              accessibilityLabel="Abrir segurança"
              accessibilityRole="button"
              onPress={onOpenSecurity}
              style={styles.profileMenuItem}
            >
              <ShieldCheck color={colors.text} size={20} />
              <Text style={styles.profileMenuItemText}>Segurança</Text>
            </Pressable>
            {showProfessional ? (
              <Pressable
                accessibilityLabel="Abrir painel profissional"
                accessibilityRole="button"
                onPress={onOpenProfessional}
                style={styles.profileMenuItem}
              >
                <BriefcaseBusiness color={colors.text} size={20} />
                <Text style={styles.profileMenuItemText}>Painel profissional</Text>
              </Pressable>
            ) : null}
            <Pressable
              accessibilityLabel="Sair da conta"
              accessibilityRole="button"
              onPress={onSignOut}
              style={[styles.profileMenuItem, styles.profileMenuSignOut]}
            >
              <LogOut color={colors.danger} size={20} />
              <Text style={styles.profileMenuSignOutText}>Sair da conta</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
function SettingsView({
  accountSubmissions,
  autoplayEnabled,
  avatar,
  notificationsEnabled,
  onBack,
  onChangeAvatar,
  onChangeAutoplay,
  onChangeNotifications,
  onRequestAccountDeletion,
  onRequestAvatarPosition,
  onOpenEditProfile,
  user
}: {
  accountSubmissions: VideoSubmission[];
  autoplayEnabled: boolean;
  avatar?: ProfileAvatar;
  notificationsEnabled: boolean;
  onBack: () => void;
  onChangeAvatar: (avatar: ProfileAvatar | null) => void;
  onChangeAutoplay: (value: boolean) => void;
  onChangeNotifications: (value: boolean) => void;
  onRequestAccountDeletion: () => void;
  onRequestAvatarPosition: () => void;
  onOpenEditProfile: () => void;
  user: AppUser;
}) {
  const { setThemeMode, themeMode } = useTheme();
  const approved = accountSubmissions.filter(
    (item) => item.status === "Aprovado"
  ).length;
  const pending = accountSubmissions.filter(
    (item) => item.status === "Em revisão"
  ).length;
  const profileInitials = user.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  async function pickProfilePhoto() {
    try {
      if (Platform.OS !== "web") {
        const permission =
          await ImagePicker.requestMediaLibraryPermissionsAsync();

        if (!permission.granted) {
          Alert.alert(
            "Permissão necessária",
            "Autorize o acesso às fotos para escolher uma imagem de perfil."
          );
          return;
        }
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        base64: true,
        mediaTypes: ["images"],
        quality: 0.5
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];
      const persistentUri = asset.base64
        ? `data:${asset.mimeType ?? "image/jpeg"};base64,${asset.base64}`
        : asset.uri;

      onChangeAvatar({
        cropScale: DEFAULT_AVATAR_CROP_SCALE,
        focusX: 50,
        focusY: 50,
        sourceHeight: asset.height,
        sourceWidth: asset.width,
        uri: persistentUri
      });
      onRequestAvatarPosition();
    } catch {
      Alert.alert(
        "Não foi possível abrir a galeria",
        "Tente novamente ou escolha outra imagem."
      );
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <View style={styles.profileSubviewHeader}>
        <BackButton
          accessibilityLabel="Voltar ao perfil"
          onPress={onBack}
        />
        <Text style={styles.profileSubviewTitle}>Configurações</Text>
        <View style={styles.profileSubviewSpacer} />
      </View>

      {user.role === "Usuário" ? (
        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>Perfil público</Text>
          <Pressable
            accessibilityLabel="Editar dados do perfil"
            accessibilityRole="button"
            onPress={onOpenEditProfile}
            style={styles.settingsRow}
          >
            <View style={styles.settingsRowIcon}>
              <UserRoundPen color={colors.primaryText} size={19} />
            </View>
            <View style={styles.settingsRowBody}>
              <Text style={styles.settingsRowTitle}>Editar perfil</Text>
              <Text style={styles.settingsRowDescription}>
                Nome, biografia, apresentação, cidade, organização e hashtags de interesse.
              </Text>
            </View>
          </Pressable>
        </View>
      ) : null}

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>Foto do perfil</Text>
        <View style={styles.settingsAvatarRow}>
          <Pressable
            accessibilityLabel={
              avatar ? "Ajustar enquadramento da foto" : "Foto do perfil"
            }
            accessibilityRole={avatar ? "button" : undefined}
            disabled={!avatar}
            onPress={onRequestAvatarPosition}
            style={styles.settingsAvatarPreview}
          >
            {avatar ? (
              <ProfileAvatarImage avatar={avatar} />
            ) : (
              <Text style={styles.settingsAvatarInitials}>
                {profileInitials}
              </Text>
            )}
          </Pressable>
          <View style={styles.settingsAvatarBody}>
            <Text style={styles.settingsRowTitle}>Imagem pública</Text>
            <Text style={styles.settingsRowDescription}>
              Exibida no Início, na pesquisa, nas mensagens e no seu perfil.
            </Text>
          </View>
        </View>
        <View style={styles.settingsAvatarActions}>
          <Pressable
            accessibilityLabel={avatar ? "Trocar foto do perfil" : "Escolher foto do perfil"}
            accessibilityRole="button"
            onPress={pickProfilePhoto}
            style={styles.settingsAvatarButton}
          >
            <Camera color={colors.onPrimary} size={18} />
            <Text style={styles.settingsAvatarButtonText}>
              {avatar ? "Trocar foto" : "Escolher foto"}
            </Text>
          </Pressable>
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>Preferências</Text>
        <View style={styles.settingsRow}>
          <View style={styles.settingsRowIcon}>
            <Moon color={colors.primaryText} size={19} />
          </View>
          <View style={styles.settingsRowBody}>
            <Text style={styles.settingsRowTitle}>Tema escuro</Text>
            <Text style={styles.settingsRowDescription}>
              Usar superfícies escuras em todas as telas.
            </Text>
          </View>
          <Switch
            accessibilityLabel="Ativar tema escuro"
            onValueChange={(enabled) =>
              setThemeMode(enabled ? "dark" : "light")
            }
            thumbColor={colors.surface}
            trackColor={{ false: colors.borderStrong, true: colors.primary }}
            value={themeMode === "dark"}
          />
        </View>
        <View style={styles.settingsRow}>
          <View style={styles.settingsRowIcon}>
            <Bell color={colors.primaryText} size={19} />
          </View>
          <View style={styles.settingsRowBody}>
            <Text style={styles.settingsRowTitle}>Notificações do dispositivo</Text>
            <Text style={styles.settingsRowDescription}>
              Mostrar novos avisos como pop-ups no celular ou computador.
            </Text>
          </View>
          <Switch
            accessibilityLabel="Ativar pop-ups de notificação"
            onValueChange={onChangeNotifications}
            thumbColor={colors.surface}
            trackColor={{ false: colors.borderStrong, true: colors.primary }}
            value={notificationsEnabled}
          />
        </View>
        <View style={styles.settingsRow}>
          <View style={styles.settingsRowIcon}>
            <Play color={colors.primaryText} size={19} />
          </View>
          <View style={styles.settingsRowBody}>
            <Text style={styles.settingsRowTitle}>Reprodução automática</Text>
            <Text style={styles.settingsRowDescription}>
              Iniciar vídeos automaticamente na tela Início.
            </Text>
          </View>
          <Switch
            onValueChange={onChangeAutoplay}
            thumbColor={colors.surface}
            trackColor={{ false: colors.borderStrong, true: colors.primary }}
            value={autoplayEnabled}
          />
        </View>
      </View>

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>Conta e segurança</Text>
        <View style={styles.profileRowNoBorder}>
          <Text style={styles.profileLabel}>E-mail</Text>
          <Text numberOfLines={1} style={styles.profileValue}>
            {user.email}
          </Text>
        </View>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Acesso</Text>
          <Text style={styles.profileValue}>
            {user.authProvider === "apple"
              ? "Apple"
              : user.authProvider === "google"
                ? "Google"
                : "E-mail e senha"}
          </Text>
        </View>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Termos</Text>
          <Text style={styles.profileValue}>
            {user.acceptedTerms ? "Aceitos" : "Pendente"}
          </Text>
        </View>
      </View>

      <View style={[styles.settingsSection, styles.settingsDangerSection]}>
        <Text style={styles.settingsSectionTitle}>Excluir conta</Text>
        <Text style={styles.settingsDangerDescription}>
          Remove permanentemente seu perfil, suas publicações e seus dados do
          {BRAND.name}. Uma assinatura ativa será cancelada.
        </Text>
        <Pressable
          accessibilityLabel="Excluir minha conta"
          accessibilityRole="button"
          onPress={onRequestAccountDeletion}
          style={styles.settingsDeleteAccountButton}
        >
          <Trash2 color={colors.danger} size={18} />
          <Text style={styles.settingsDeleteAccountButtonText}>
            Excluir minha conta
          </Text>
        </Pressable>
      </View>
      {user.role === "Admin" ? (
        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>Conta administrativa</Text>
          <View style={styles.profileRowNoBorder}>
            <Text style={styles.profileLabel}>Pendentes</Text>
            <Text style={styles.profileValue}>{pending}</Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Publicados</Text>
            <Text style={styles.profileValue}>{approved}</Text>
          </View>
        </View>
      ) : null}

    </ScrollView>
  );
}
