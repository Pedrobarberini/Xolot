import React, { useEffect, useState } from "react";
import { VideoView, useVideoPlayer } from "expo-video";
import {
  ArrowLeft,
  Bell,
  CircleDollarSign,
  LogOut,
  Menu,
  Play,
  Settings,
  WalletCards,
  X
} from "lucide-react-native";
import {
  Modal,
  Pressable,
  ScrollView,
  Switch,
  Text,
  TextInput,
  View
} from "react-native";
import { SubmissionVideoPreview } from "../components/SubmissionComponents";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import { AppUser, AthleteFund, Investment, Player, VideoSubmission } from "../types";
import { formatBRL } from "../utils/investment";
import { PortfolioScreen } from "./WalletScreen";

type ProfileView = "overview" | "wallet" | "settings";

export function ProfileScreen({
  balance,
  fund,
  investments,
  onDeposit,
  onOpenFund,
  onSignOut,
  player,
  submissions,
  user
}: {
  balance: number;
  fund?: AthleteFund;
  investments: Investment[];
  onDeposit: (amount: number) => void;
  onOpenFund: (
    player: Player,
    goalAmount: number,
    minimumContribution: number
  ) => void;
  onSignOut: () => void;
  player?: Player;
  submissions: VideoSubmission[];
  user: AppUser;
}) {
  const [isFundModalVisible, setIsFundModalVisible] = useState(false);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [profileView, setProfileView] = useState<ProfileView>("overview");
  const [selectedGalleryVideo, setSelectedGalleryVideo] =
    useState<VideoSubmission | null>(null);
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
  const profileInitials = user.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const profilePrimaryMetric =
    user.role === "Admin" ? String(pending) : String(mySubmissions.length);
  const profilePrimaryLabel = user.role === "Admin" ? "pendentes" : "envios";

  if (profileView === "wallet") {
    return (
      <PortfolioScreen
        balance={balance}
        investments={investments}
        onBack={() => setProfileView("overview")}
        onDeposit={onDeposit}
      />
    );
  }

  if (profileView === "settings") {
    return (
      <>
        <SettingsView
          accountSubmissions={accountSubmissions}
          autoplayEnabled={autoplayEnabled}
          fund={fund}
          investments={investments}
          notificationsEnabled={notificationsEnabled}
          onBack={() => setProfileView("overview")}
          onChangeAutoplay={setAutoplayEnabled}
          onChangeNotifications={setNotificationsEnabled}
          onRequestOpenFund={() => setIsFundModalVisible(true)}
          player={player}
          user={user}
        />
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

  return (
    <>
      <ScrollView contentContainerStyle={styles.screenContent}>
      <View style={styles.profileHero}>
        <View style={styles.profileHeroTopRow}>
          <View style={styles.profileAvatar}>
            <Text style={styles.profileAvatarText}>{profileInitials}</Text>
          </View>
          <View style={styles.profileTitleBlock}>
            <Text style={styles.profileName}>{user.name}</Text>
            <Text style={styles.profileMeta}>
              {user.role} | {user.email}
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
        <View style={styles.profileQuickStats}>
          <View style={styles.profileQuickItem}>
            <Text style={styles.profileQuickValue}>{profilePrimaryMetric}</Text>
            <Text style={styles.profileQuickLabel}>{profilePrimaryLabel}</Text>
          </View>
          <View style={styles.profileQuickItem}>
            <Text style={styles.profileQuickValue}>{approved}</Text>
            <Text style={styles.profileQuickLabel}>aprovados</Text>
          </View>
          <View style={styles.profileQuickItem}>
            <Text style={styles.profileQuickValue}>{publishedVideos.length}</Text>
            <Text style={styles.profileQuickLabel}>publicados</Text>
          </View>
        </View>
      </View>

      <ProfileVideoGallery
        onOpenVideo={setSelectedGalleryVideo}
        videos={publishedVideos}
      />

      </ScrollView>
      <ProfileOptionsMenu
        onClose={() => setIsOptionsVisible(false)}
        onOpenSettings={() => {
          setIsOptionsVisible(false);
          setProfileView("settings");
        }}
        onOpenWallet={() => {
          setIsOptionsVisible(false);
          setProfileView("wallet");
        }}
        onSignOut={() => {
          setIsOptionsVisible(false);
          onSignOut();
        }}
        showWallet={user.role === "Usuario"}
        visible={isOptionsVisible}
      />
      <ProfileVideoModal
        onClose={() => setSelectedGalleryVideo(null)}
        video={selectedGalleryVideo}
      />
    </>
  );
}

function ProfileVideoGallery({
  onOpenVideo,
  videos
}: {
  onOpenVideo: (video: VideoSubmission) => void;
  videos: VideoSubmission[];
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
          <Text style={styles.profileGalleryEmptyTitle}>
            Poste um video para mostra-lo aqui
          </Text>
          <Text style={styles.profileGalleryEmptyBody}>
            Videos aprovados pela moderacao aparecerao nesta galeria.
          </Text>
        </View>
      ) : (
        <View style={styles.profileGalleryGrid}>
          {videos.map((video) => (
            <Pressable
              accessibilityLabel={`Assistir ${video.videoTitle}`}
              accessibilityRole="button"
              key={video.id}
              onPress={() => onOpenVideo(video)}
              style={({ pressed }) => [
                styles.profileGalleryCard,
                pressed ? styles.buttonPressed : null
              ]}
            >
              <ProfileGalleryThumbnail uri={video.videoLink} />
              <View style={styles.profileGalleryCardShade} />
              <View style={styles.profileGalleryPlayBadge}>
                <Play color={colors.onPrimary} fill={colors.onPrimary} size={14} />
              </View>
              <Text numberOfLines={2} style={styles.profileGalleryCardTitle}>
                {video.videoTitle}
              </Text>
            </Pressable>
          ))}
        </View>
      )}
    </View>
  );
}

function ProfileGalleryThumbnail({ uri }: { uri: string }) {
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

function ProfileVideoModal({
  onClose,
  video
}: {
  onClose: () => void;
  video: VideoSubmission | null;
}) {
  return (
    <Modal
      animationType="fade"
      onRequestClose={onClose}
      statusBarTranslucent
      transparent
      visible={Boolean(video)}
    >
      <View style={styles.profileVideoModalRoot}>
        <Pressable
          accessibilityLabel="Fechar video"
          onPress={onClose}
          style={styles.profileVideoModalBackdrop}
        />
        {video ? (
          <View accessibilityViewIsModal style={styles.profileVideoDialog}>
            <View style={styles.profileVideoDialogHeader}>
              <Text numberOfLines={1} style={styles.profileVideoDialogTitle}>
                {video.videoTitle}
              </Text>
              <Pressable
                accessibilityLabel="Fechar video"
                accessibilityRole="button"
                hitSlop={8}
                onPress={onClose}
                style={styles.depositCloseButton}
              >
                <X color={colors.muted} size={20} />
              </Pressable>
            </View>
            <SubmissionVideoPreview uri={video.videoLink} />
          </View>
        ) : null}
      </View>
    </Modal>
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
  fund,
  investments,
  notificationsEnabled,
  onBack,
  onChangeAutoplay,
  onChangeNotifications,
  onRequestOpenFund,
  player,
  user
}: {
  accountSubmissions: VideoSubmission[];
  autoplayEnabled: boolean;
  fund?: AthleteFund;
  investments: Investment[];
  notificationsEnabled: boolean;
  onBack: () => void;
  onChangeAutoplay: (value: boolean) => void;
  onChangeNotifications: (value: boolean) => void;
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
            <Text style={styles.profileValue}>Moderacao manual</Text>
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
            <Text style={styles.profileLabel}>Aprovados</Text>
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
                  Envie um video e aguarde a aprovacao para criar seu perfil
                  publico antes de abrir a bolsa.
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
          Cadastro, moderacao, aportes, KYC e distribuicao ainda sao simulados.
          Nenhuma operacao possui validade financeira ou juridica.
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
