import React, { useEffect, useMemo, useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  Bell,
  Camera,
  LogOut,
  Menu,
  Play,
  Settings,
  UserRoundPen,
  WalletCards,
  X
} from "lucide-react-native";
import {
  Alert,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View
} from "react-native";
import { AvatarPositionModal } from "../components/AvatarPositionModal";
import { DeleteVideoModal } from "../components/DeleteVideoModal";
import { BackButton } from "../components/Navigation";
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
import { colors } from "../theme";
import {
  AccountProfile,
  AppUser,
  AthleteFund,
  Investment,
  MessageContact,
  Player,
  ProfileAvatar,
  ProfileAvatarsByProfile,
  VideoSubmission
} from "../types";
import { DEFAULT_AVATAR_CROP_SCALE } from "../utils/avatarFocus";
import { AccountSetupScreen } from "./AccountSetupScreen";
import { PortfolioScreen } from "./WalletScreen";

type ProfileView = "edit-profile" | "overview" | "wallet" | "settings";

export function ProfileScreen({
  accounts,
  avatar,
  balance,
  followers,
  followersCount,
  following,
  followingCount,
  fund,
  hiddenPlayerIds,
  investments,
  likeCountsByPlayer,
  onChangeAvatar,
  onDeleteVideo,
  onDeposit,
  onOpenFund,
  onOpenProfile,
  onOpenVideo,
  onSetVideoHidden,
  onShareVideo,
  onSignOut,
  onUpdateProfile,
  onWithdraw,
  player,
  profileAvatars,
  shareContacts,
  submissions,
  user,
  viewCountsByPlayer
}: {
  accounts: AppUser[];
  avatar?: ProfileAvatar;
  balance: number;
  followers: AppUser[];
  followersCount: number;
  following: AppUser[];
  followingCount: number;
  fund?: AthleteFund;
  hiddenPlayerIds: Set<string>;
  investments: Investment[];
  likeCountsByPlayer: Record<string, number>;
  onChangeAvatar: (avatar: ProfileAvatar | null) => void;
  onDeleteVideo: (video: VideoSubmission) => Promise<boolean>;
  onDeposit: (amount: number) => void;
  onOpenFund: (
    player: Player,
    goalAmount: number,
    minimumContribution: number
  ) => void;
  onOpenProfile: (account: AppUser) => void;
  onOpenVideo: (video: VideoSubmission) => void;
  onSetVideoHidden: (playerId: string, hidden: boolean) => void;
  onShareVideo: (
    video: VideoSubmission,
    contact: MessageContact
  ) => void;
  onSignOut: () => void;
  onUpdateProfile: (profile: AccountProfile) => void;
  onWithdraw: (amount: number) => void;
  player?: Player;
  profileAvatars: ProfileAvatarsByProfile;
  shareContacts: MessageContact[];
  submissions: VideoSubmission[];
  user: AppUser;
  viewCountsByPlayer: Record<string, number>;
}) {
  const [isFundModalVisible, setIsFundModalVisible] = useState(false);
  const [isFollowersVisible, setIsFollowersVisible] = useState(false);
  const [isFollowingVisible, setIsFollowingVisible] = useState(false);
  const [isAvatarPositionVisible, setIsAvatarPositionVisible] = useState(false);
  const [isDeletingVideo, setIsDeletingVideo] = useState(false);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [videoPendingDeletion, setVideoPendingDeletion] =
    useState<VideoSubmission | null>(null);
  const [profileView, setProfileView] = useState<ProfileView>("overview");
  const profileNavigationTimer = useRef<ReturnType<typeof setTimeout> | null>(
    null
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
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
  const profileInitials = user.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const profilePrimaryMetric = String(accountSubmissions.length);
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
    if (!videoPendingDeletion || isDeletingVideo) {
      return;
    }

    setIsDeletingVideo(true);

    try {
      const wasDeleted = await onDeleteVideo(videoPendingDeletion);

      if (!wasDeleted) {
        Alert.alert(
          "Não foi possível excluir",
          "Este vídeo não pertence a conta conectada."
        );
        return;
      }

      setVideoPendingDeletion(null);
    } catch {
      Alert.alert(
        "Não foi possível excluir",
        "Tente novamente em alguns instantes."
      );
    } finally {
      setIsDeletingVideo(false);
    }
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

  if (profileView === "wallet") {
    return (
      <>
        <ScreenTransition key="wallet" style={styles.profileViewScene}>
          <PortfolioScreen
            balance={balance}
            fund={fund}
            investments={investments}
            onBack={() => setProfileView("overview")}
            onDeposit={onDeposit}
            onRequestOpenFund={() => setIsFundModalVisible(true)}
            onWithdraw={onWithdraw}
            player={player}
            submissionsCount={accountSubmissions.length}
          />
        </ScreenTransition>
        {player ? (
          <OpenFundModal
            onClose={() => setIsFundModalVisible(false)}
            onConfirm={(goalAmount, minimumContribution) => {
              onOpenFund(player, goalAmount, minimumContribution);
              setIsFundModalVisible(false);
            }}
            player={player}
            visible={isFundModalVisible}
          />
        ) : null}
      </>
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
            onChangeAutoplay={setAutoplayEnabled}
            onChangeNotifications={setNotificationsEnabled}
            onRequestAvatarPosition={() => setIsAvatarPositionVisible(true)}
            onOpenEditProfile={() => setProfileView("edit-profile")}
            user={user}
          />
        </ScreenTransition>
        {avatarPositionModal}
      </>
    );
  }

  if (profileView === "edit-profile") {
    return (
      <ScreenTransition key="edit-profile" style={styles.profileViewScene}>
        <AccountSetupScreen
          accounts={accounts}
          onBack={() => setProfileView("settings")}
          onSave={(profile) => {
            onUpdateProfile(profile);
            setProfileView("settings");
          }}
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
                  avatar ? "Ajustar enquadramento da foto" : "Foto do perfil"
                }
                accessibilityRole={avatar ? "button" : undefined}
                disabled={!avatar}
                onPress={() => setIsAvatarPositionVisible(true)}
                style={styles.profileAvatar}
              >
                {avatar ? (
                  <ProfileAvatarImage avatar={avatar} />
                ) : (
                  <Text style={styles.profileAvatarText}>{profileInitials}</Text>
                )}
              </Pressable>
              <View style={styles.profileTitleBlock}>
                <Text numberOfLines={1} style={styles.profilePrimaryUsername}>
                  @{user.username}
                </Text>
                <Text numberOfLines={1} style={styles.profileSecondaryName}>
                  {user.name}
                </Text>
                <Text style={styles.profileMeta}>
                  {user.role === "Usuário" && user.profileCompleted
                    ? `${user.position} | ${user.city}`
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
                  {profilePrimaryMetric}
                </Text>
                <Text style={styles.profileQuickLabel}>envios</Text>
              </View>
              <View style={styles.profileQuickItem}>
                <Text style={styles.profileQuickValue}>
                  {publishedVideos.length}
                </Text>
                <Text style={styles.profileQuickLabel}>posts</Text>
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
                setVideoPendingDeletion(selectedVideo);
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
            onSetVideoHidden={(video, hidden) =>
              onSetVideoHidden(video.id, hidden)
            }
            onShareVideo={(video, contact) => {
              const selectedVideo = publishedVideos.find(
                (item) => item.id === video.sourceId
              );

              if (selectedVideo) {
                onShareVideo(selectedVideo, contact);
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
        onOpenSettings={() => openProfileView("settings")}
        onOpenWallet={() => openProfileView("wallet")}
        onSignOut={() => {
          setIsOptionsVisible(false);
          onSignOut();
        }}
        showWallet={user.role === "Usuário"}
        visible={isOptionsVisible}
      />
      <DeleteVideoModal
        isDeleting={isDeletingVideo}
        onClose={() => {
          if (!isDeletingVideo) {
            setVideoPendingDeletion(null);
          }
        }}
        onConfirm={confirmVideoDeletion}
        videoTitle={videoPendingDeletion?.videoTitle ?? ""}
        visible={Boolean(videoPendingDeletion)}
      />
      <ProfileListModal
        emptyBody="Quando alguem seguir seu perfil, ela aparecerá nesta lista."
        emptyTitle="Você ainda não tem seguidores"
        items={followerListItems}
        onClose={() => setIsFollowersVisible(false)}
        onSelectItem={(profile) => openListedProfile(profile.id)}
        title="Seguidores"
        visible={isFollowersVisible}
      />
      <ProfileListModal
        emptyBody="Quando você seguir outros perfis, eles apareceráo nesta lista."
        emptyTitle="Você ainda não segue perfis"
        items={followingListItems}
        onClose={() => setIsFollowingVisible(false)}
        onSelectItem={(profile) => openListedProfile(profile.id)}
        title="Seguindo"
        visible={isFollowingVisible}
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
      ? `${account.position} | ${account.city}`
      : account.role === "Admin"
        ? "Administrador Xolot"
        : "Usuário Xolot",
    username: account.username
  };
}

function ProfileOptionsMenu({
  onClose,
  onOpenSettings,
  onOpenWallet,
  onSignOut,
  showWallet,
  visible
}: {
  onClose: () => void;
  onOpenSettings: () => void;
  onOpenWallet: () => void;
  onSignOut: () => void;
  showWallet: boolean;
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
            <Text style={styles.profileMenuTitle}>Opcoes do perfil</Text>
            <Pressable
              accessibilityLabel="Abrir configuracoes"
              accessibilityRole="button"
              onPress={onOpenSettings}
              style={styles.profileMenuItem}
            >
              <Settings color={colors.text} size={20} />
              <Text style={styles.profileMenuItemText}>Configurações</Text>
            </Pressable>
            {showWallet ? (
              <Pressable
                accessibilityLabel="Abrir carteira"
                accessibilityRole="button"
                onPress={onOpenWallet}
                style={styles.profileMenuItem}
              >
                <WalletCards color={colors.text} size={20} />
                <Text style={styles.profileMenuItemText}>Carteira</Text>
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
  onRequestAvatarPosition: () => void;
  onOpenEditProfile: () => void;
  user: AppUser;
}) {
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
            "Autorize o acesso as fotos para escolher uma imagem de perfil."
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
              <UserRoundPen color={colors.primary} size={19} />
            </View>
            <View style={styles.settingsRowBody}>
              <Text style={styles.settingsRowTitle}>Editar perfil</Text>
              <Text style={styles.settingsRowDescription}>
                Nome, biografia, idade, posição, cidade e clube ou projeto.
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
              Exibida no Início, pesquisa, mensagens e no seu perfil.
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
        <Text style={styles.settingsSectionTitle}>Preferencias</Text>
        <View style={styles.settingsRow}>
          <View style={styles.settingsRowIcon}>
            <Bell color={colors.primary} size={19} />
          </View>
          <View style={styles.settingsRowBody}>
            <Text style={styles.settingsRowTitle}>Notificacoes</Text>
            <Text style={styles.settingsRowDescription}>
              Avisos sobre vídeos, mensagens e investimentos.
            </Text>
          </View>
          <Switch
            onValueChange={onChangeNotifications}
            thumbColor={colors.surface}
            trackColor={{ false: colors.borderStrong, true: colors.primary }}
            value={notificationsEnabled}
          />
        </View>
        <View style={styles.settingsRow}>
          <View style={styles.settingsRowIcon}>
            <Play color={colors.primary} size={19} />
          </View>
          <View style={styles.settingsRowBody}>
            <Text style={styles.settingsRowTitle}>Reprodução automática</Text>
            <Text style={styles.settingsRowDescription}>
              Iniciar videos automaticamente na tela Início.
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
        <Text style={styles.settingsSectionTitle}>Verificacao e KYC</Text>
        <View style={styles.profileRowNoBorder}>
          <Text style={styles.profileLabel}>Email</Text>
          <Text numberOfLines={1} style={styles.profileValue}>
            {user.email}
          </Text>
        </View>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Identidade</Text>
          <Text style={styles.profileValue}>{user.kycStatus}</Text>
        </View>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Termos</Text>
          <Text style={styles.profileValue}>
            {user.acceptedTerms ? "Aceitos" : "Pendente"}
          </Text>
        </View>
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

function OpenFundModal({
  onClose,
  onConfirm,
  player,
  visible
}: {
  onClose: () => void;
  onConfirm: (goalAmount: number, minimumContribution: number) => void;
  player: Player;
  visible: boolean;
}) {
  const [goalText, setGoalText] = useState("5000");
  const [minimumText, setMinimumText] = useState("50");
  const goalAmount = Number(goalText.replace(/\D/g, "")) || 0;
  const minimumContribution = Number(minimumText.replace(/\D/g, "")) || 0;
  const canOpenFund =
    goalAmount >= 1000 &&
    goalAmount <= 1000000 &&
    minimumContribution >= 10 &&
    minimumContribution <= goalAmount;

  function confirmFund() {
    if (!canOpenFund) {
      return;
    }

    onConfirm(goalAmount, minimumContribution);
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.depositModalRoot}>
        <Pressable
          accessibilityLabel="Fechar abertura da bolsa"
          onPress={onClose}
          style={styles.depositModalBackdrop}
        />
        <View accessibilityViewIsModal style={styles.depositDialog}>
          <View style={styles.depositDialogHeader}>
            <View style={styles.depositDialogTitleBlock}>
              <Text style={styles.depositDialogTitle}>Abrir bolsa</Text>
              <Text style={styles.depositDialogSubtitle}>
                Vinculada ao perfil de {player.name}.
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Fechar"
              hitSlop={8}
              onPress={onClose}
              style={styles.depositCloseButton}
            >
              <X color={colors.muted} size={20} />
            </Pressable>
          </View>

          <Text style={styles.inputLabel}>Meta de captação</Text>
          <View style={styles.depositInputRow}>
            <Text style={styles.depositCurrencyPrefix}>R$</Text>
            <TextInput
              keyboardType="number-pad"
              onChangeText={setGoalText}
              placeholder="5000"
              placeholderTextColor={colors.muted}
              style={styles.depositInput}
              value={goalText}
            />
          </View>

          <Text style={styles.openFundSecondLabel}>Aporte mínimo</Text>
          <View style={styles.depositInputRow}>
            <Text style={styles.depositCurrencyPrefix}>R$</Text>
            <TextInput
              keyboardType="number-pad"
              onChangeText={setMinimumText}
              placeholder="50"
              placeholderTextColor={colors.muted}
              style={styles.depositInput}
              value={minimumText}
            />
          </View>

          <View style={styles.openFundNotice}>
            <Text style={styles.openFundNoticeText}>
              Simulação sem dinheiro real. O atleta acompanha a meta, mas não
              pode sacar os recursos da bolsa.
            </Text>
          </View>

          {!canOpenFund ? (
            <Text style={styles.validationText}>
              Meta entre R$ 1.000 e R$ 1.000.000; aporte mínimo a partir de R$
              10 e menor que a meta.
            </Text>
          ) : null}

          <View style={styles.depositDialogActions}>
            <Pressable onPress={onClose} style={styles.depositCancelButton}>
              <Text style={styles.depositCancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              disabled={!canOpenFund}
              onPress={confirmFund}
              style={[
                styles.depositConfirmButton,
                !canOpenFund ? styles.primaryButtonDisabled : null
              ]}
            >
              <Text style={styles.depositConfirmText}>Abrir bolsa</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
