import React, { useEffect, useRef, useState } from "react";
import * as ImagePicker from "expo-image-picker";
import {
  ArrowLeft,
  Bell,
  Camera,
  CircleDollarSign,
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
  Player,
  ProfileAvatar,
  VideoSubmission
} from "../types";
import { formatBRL } from "../utils/investment";
import { DEFAULT_AVATAR_CROP_SCALE } from "../utils/avatarFocus";
import { AccountSetupScreen } from "./AccountSetupScreen";
import { PortfolioScreen } from "./WalletScreen";

type ProfileView = "edit-profile" | "overview" | "wallet" | "settings";

export function ProfileScreen({
  avatar,
  balance,
  followersCount,
  followingCount,
  fund,
  investments,
  onChangeAvatar,
  onDeleteVideo,
  onDeposit,
  onOpenFund,
  onOpenVideo,
  onSignOut,
  onUpdateProfile,
  player,
  submissions,
  user
}: {
  avatar?: ProfileAvatar;
  balance: number;
  followersCount: number;
  followingCount: number;
  fund?: AthleteFund;
  investments: Investment[];
  onChangeAvatar: (avatar: ProfileAvatar | null) => void;
  onDeleteVideo: (video: VideoSubmission) => Promise<boolean>;
  onDeposit: (amount: number) => void;
  onOpenFund: (
    player: Player,
    goalAmount: number,
    minimumContribution: number
  ) => void;
  onOpenVideo: (video: VideoSubmission) => void;
  onSignOut: () => void;
  onUpdateProfile: (profile: AccountProfile) => void;
  player?: Player;
  submissions: VideoSubmission[];
  user: AppUser;
}) {
  const [isFundModalVisible, setIsFundModalVisible] = useState(false);
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
  const approved = accountSubmissions.filter(
    (item) => item.status === "Aprovado"
  ).length;
  const pending = accountSubmissions.filter(
    (item) => item.status === "Em revisao"
  ).length;
  const publishedVideos = mySubmissions.filter(
    (item) => item.status === "Aprovado" && item.videoLink.trim().length > 0
  );
  const galleryVideos: ProfileGalleryVideo[] = publishedVideos.map((video) => ({
    id: video.id,
    title: video.videoTitle,
    uri: video.videoLink
  }));
  const profileInitials = user.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const profilePrimaryMetric =
    user.role === "Admin" ? String(pending) : String(mySubmissions.length);
  const profilePrimaryLabel = user.role === "Admin" ? "pendentes" : "envios";

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
          "Nao foi possivel excluir",
          "Este video nao pertence a conta conectada."
        );
        return;
      }

      setVideoPendingDeletion(null);
    } catch {
      Alert.alert(
        "Nao foi possivel excluir",
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
      <ScreenTransition key="wallet" style={styles.profileViewScene}>
        <PortfolioScreen
          balance={balance}
          investments={investments}
          onBack={() => setProfileView("overview")}
          onDeposit={onDeposit}
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
            fund={fund}
            investments={investments}
            notificationsEnabled={notificationsEnabled}
            onBack={() => setProfileView("overview")}
            onChangeAvatar={onChangeAvatar}
            onChangeAutoplay={setAutoplayEnabled}
            onChangeNotifications={setNotificationsEnabled}
            onRequestOpenFund={() => setIsFundModalVisible(true)}
            onRequestAvatarPosition={() => setIsAvatarPositionVisible(true)}
            onOpenEditProfile={() => setProfileView("edit-profile")}
            player={player}
            user={user}
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
        {avatarPositionModal}
      </>
    );
  }

  if (profileView === "edit-profile") {
    return (
      <ScreenTransition key="edit-profile" style={styles.profileViewScene}>
        <AccountSetupScreen
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
                  {user.role === "Usuario" && user.profileCompleted
                    ? `${user.position} | ${user.city}`
                    : `${user.role} | ${user.email}`}
                </Text>
              </View>
              <Pressable
                accessibilityLabel="Abrir opcoes do perfil"
                accessibilityRole="button"
                hitSlop={8}
                onPress={() => setIsOptionsVisible(true)}
                style={styles.profileMenuButton}
              >
                <Menu color={colors.text} size={22} />
              </Pressable>
            </View>
            {user.role === "Usuario" && user.bio ? (
              <Text style={styles.profileBio}>{user.bio}</Text>
            ) : null}
            {user.role === "Usuario" && user.club ? (
              <Text style={styles.profileClub}>{user.club}</Text>
            ) : null}
            <View style={styles.profileQuickStats}>
              <View style={styles.profileQuickItem}>
                <Text style={styles.profileQuickValue}>
                  {profilePrimaryMetric}
                </Text>
                <Text style={styles.profileQuickLabel}>
                  {profilePrimaryLabel}
                </Text>
              </View>
              <View style={styles.profileQuickItem}>
                <Text style={styles.profileQuickValue}>{approved}</Text>
                <Text style={styles.profileQuickLabel}>publicados</Text>
              </View>
              <View style={styles.profileQuickItem}>
                <Text style={styles.profileQuickValue}>
                  {publishedVideos.length}
                </Text>
                <Text style={styles.profileQuickLabel}>publicados</Text>
              </View>
            </View>
            <View style={styles.profileSocialMetrics}>
              <Text style={styles.profileSocialMetricText}>
                <Text style={styles.profileSocialMetricValue}>
                  {followersCount}
                </Text>{" "}
                {followersCount === 1 ? "seguidor" : "seguidores"}
              </Text>
              <Text style={styles.profileSocialMetricDivider}>|</Text>
              <Text style={styles.profileSocialMetricText}>
                <Text style={styles.profileSocialMetricValue}>
                  {followingCount}
                </Text>{" "}
                seguindo
              </Text>
            </View>
          </View>

          <ProfileVideoGallery
            emptyBody="Seus videos publicados aparecerao nesta galeria."
            emptyTitle="Poste um video para mostra-lo aqui"
            onDeleteVideo={(video) => {
              const selectedVideo = publishedVideos.find(
                (item) => item.id === video.id
              );

              if (selectedVideo) {
                setVideoPendingDeletion(selectedVideo);
              }
            }}
            onOpenVideo={(video) => {
              const selectedVideo = publishedVideos.find(
                (item) => item.id === video.id
              );

              if (selectedVideo) {
                onOpenVideo(selectedVideo);
              }
            }}
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
        showWallet={user.role === "Usuario"}
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
      {avatarPositionModal}
    </>
  );
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
          accessibilityLabel="Fechar opcoes do perfil"
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
              <Text style={styles.profileMenuItemText}>Configuracoes</Text>
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
  fund,
  investments,
  notificationsEnabled,
  onBack,
  onChangeAvatar,
  onChangeAutoplay,
  onChangeNotifications,
  onRequestAvatarPosition,
  onOpenEditProfile,
  onRequestOpenFund,
  player,
  user
}: {
  accountSubmissions: VideoSubmission[];
  autoplayEnabled: boolean;
  avatar?: ProfileAvatar;
  fund?: AthleteFund;
  investments: Investment[];
  notificationsEnabled: boolean;
  onBack: () => void;
  onChangeAvatar: (avatar: ProfileAvatar | null) => void;
  onChangeAutoplay: (value: boolean) => void;
  onChangeNotifications: (value: boolean) => void;
  onRequestAvatarPosition: () => void;
  onOpenEditProfile: () => void;
  onRequestOpenFund: () => void;
  player?: Player;
  user: AppUser;
}) {
  const totalInvested = investments.reduce((sum, item) => sum + item.amount, 0);
  const approved = accountSubmissions.filter(
    (item) => item.status === "Aprovado"
  ).length;
  const pending = accountSubmissions.filter(
    (item) => item.status === "Em revisao"
  ).length;
  const fundProgress = fund
    ? Math.min(fund.fundedAmount / fund.goalAmount, 1)
    : 0;
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
            "Permissao necessaria",
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
        "Nao foi possivel abrir a galeria",
        "Tente novamente ou escolha outra imagem."
      );
    }
  }

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <View style={styles.profileSubviewHeader}>
        <Pressable
          accessibilityLabel="Voltar ao perfil"
          accessibilityRole="button"
          hitSlop={8}
          onPress={onBack}
          style={styles.profileSubviewBackButton}
        >
          <ArrowLeft color={colors.text} size={20} />
        </Pressable>
        <Text style={styles.profileSubviewTitle}>Configuracoes</Text>
        <View style={styles.profileSubviewSpacer} />
      </View>

      {user.role === "Usuario" ? (
        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>Perfil publico</Text>
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
                Nome, biografia, idade, posicao, cidade e clube ou projeto.
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
            <Text style={styles.settingsRowTitle}>Imagem publica</Text>
            <Text style={styles.settingsRowDescription}>
              Exibida no Inicio, pesquisa, mensagens e no seu perfil.
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
              Avisos sobre videos, mensagens e investimentos.
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
            <Text style={styles.settingsRowTitle}>Reproducao automatica</Text>
            <Text style={styles.settingsRowDescription}>
              Iniciar videos automaticamente na tela Inicio.
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

      {user.role === "Usuario" ? (
        <View style={styles.settingsSection}>
          <Text style={styles.settingsSectionTitle}>Conta NextStar</Text>
          <View style={styles.profileRowNoBorder}>
            <Text style={styles.profileLabel}>Reservas simuladas</Text>
            <Text style={styles.profileValue}>{investments.length}</Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Total</Text>
            <Text style={styles.profileValue}>{formatBRL(totalInvested)}</Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Videos enviados</Text>
            <Text style={styles.profileValue}>{accountSubmissions.length}</Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Status padrao</Text>
            <Text style={styles.profileValue}>Publicacao direta (teste)</Text>
          </View>
        </View>
      ) : (
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
      )}

      {user.role === "Usuario" ? (
        <View style={styles.settingsSection}>
          <View style={styles.fundTitleRow}>
            <Text style={styles.settingsSectionTitle}>
              Bolsa de investimento
            </Text>
            {fund ? (
              <Text
                style={[
                  styles.fundStatus,
                  fund.status === "Concluida"
                    ? styles.fundStatusComplete
                    : null
                ]}
              >
                {fund.status}
              </Text>
            ) : null}
          </View>

          {fund?.status === "Concluida" ? (
            <View style={styles.settingsFundComplete}>
              <Text style={styles.settingsFundCompleteTitle}>
                Investimento concluido
              </Text>
              <Text style={styles.settingsFundCompleteBody}>
                Sua meta foi atingida. Seu perfil esta em busca de contratantes.
              </Text>
            </View>
          ) : null}

          {fund ? (
            <>
              <View style={styles.fundProgressHeader}>
                <Text style={styles.fundProgressValue}>
                  {formatBRL(fund.fundedAmount)} captados
                </Text>
                <Text style={styles.fundProgressGoal}>
                  Meta {formatBRL(fund.goalAmount)}
                </Text>
              </View>
              <View style={styles.fundProgressTrack}>
                <View
                  style={[
                    styles.fundProgressFill,
                    { width: `${fundProgress * 100}%` }
                  ]}
                />
              </View>
              <Text style={styles.fundCustodyNote}>
                A bolsa fica sob custodia simulada do app. Voce acompanha a
                captacao, mas nao pode sacar os recursos.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.bodyText}>
                Abra uma bolsa vinculada ao perfil publico para receber aportes
                simulados de outros usuarios.
              </Text>
              {!player ? (
                <Text style={styles.validationText}>
                  Publique um video para criar seu perfil publico antes de abrir
                  a bolsa.
                </Text>
              ) : null}
              <Pressable
                accessibilityRole="button"
                disabled={!player}
                onPress={onRequestOpenFund}
                style={[
                  styles.primaryButton,
                  !player ? styles.primaryButtonDisabled : null
                ]}
              >
                <CircleDollarSign color={colors.onPrimary} size={18} />
                <Text style={styles.primaryButtonText}>
                  Abrir bolsa de investimento
                </Text>
              </Pressable>
            </>
          )}
        </View>
      ) : null}

      <View style={styles.settingsSection}>
        <Text style={styles.settingsSectionTitle}>Ambiente demonstrativo</Text>
        <Text style={styles.bodyText}>
          Cadastro, publicacao direta, aportes, KYC e distribuicao ainda sao
          simulados. Nenhuma operacao possui validade financeira ou juridica.
        </Text>
      </View>
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

          <Text style={styles.inputLabel}>Meta de captacao</Text>
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

          <Text style={styles.openFundSecondLabel}>Aporte minimo</Text>
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
              Simulacao sem dinheiro real. O atleta acompanha a meta, mas nao
              pode sacar os recursos da bolsa.
            </Text>
          </View>

          {!canOpenFund ? (
            <Text style={styles.validationText}>
              Meta entre R$ 1.000 e R$ 1.000.000; aporte minimo a partir de R$
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
