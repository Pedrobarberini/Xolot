import React, { useState } from "react";
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
  useWindowDimensions,
  View
} from "react-native";
import { USE_CENTERED_WEB_LAYOUT } from "../constants/layout";
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
  const { width } = useWindowDimensions();
  const [isFundModalVisible, setIsFundModalVisible] = useState(false);
  const [isOptionsVisible, setIsOptionsVisible] = useState(false);
  const [profileView, setProfileView] = useState<ProfileView>("overview");
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [autoplayEnabled, setAutoplayEnabled] = useState(true);
  const isWide = !USE_CENTERED_WEB_LAYOUT && width >= 840;
  const totalInvested = investments.reduce((sum, item) => sum + item.amount, 0);
  const mySubmissions = submissions.filter((item) => item.userId === user.id);
  const approved = submissions.filter((item) => item.status === "Aprovado").length;
  const pending = submissions.filter((item) => item.status === "Em revisao").length;
  const profileInitials = user.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const profilePrimaryMetric =
    user.role === "Admin" ? String(pending) : String(mySubmissions.length);
  const profilePrimaryLabel = user.role === "Admin" ? "pendentes" : "envios";
  const fundProgress = fund
    ? Math.min(fund.fundedAmount / fund.goalAmount, 1)
    : 0;

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
      <SettingsView
        autoplayEnabled={autoplayEnabled}
        notificationsEnabled={notificationsEnabled}
        onBack={() => setProfileView("overview")}
        onChangeAutoplay={setAutoplayEnabled}
        onChangeNotifications={setNotificationsEnabled}
        user={user}
      />
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
            <Text style={styles.profileQuickValue}>
              {user.acceptedTerms ? "OK" : "Pendente"}
            </Text>
            <Text style={styles.profileQuickLabel}>termos</Text>
          </View>
          <View style={styles.profileQuickItem}>
            <Text style={styles.profileQuickValue}>{approved}</Text>
            <Text style={styles.profileQuickLabel}>aprovados</Text>
          </View>
        </View>
      </View>

      {fund?.status === "Concluida" ? (
        <View style={styles.profileFundAlert}>
          <Text style={styles.profileFundAlertTitle}>Investimento concluido</Text>
          <Text style={styles.profileFundAlertBody}>
            Sua meta foi atingida. Seu perfil esta em busca de contratantes.
          </Text>
        </View>
      ) : null}

      <View style={isWide ? styles.profileDesktopGrid : null}>
        <View style={[styles.profilePanel, isWide ? styles.profilePanelGridItem : null]}>
          <Text style={styles.sectionTitle}>Verificacao</Text>
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
          <View style={[styles.profilePanel, isWide ? styles.profilePanelGridItem : null]}>
            <Text style={styles.sectionTitle}>Conta NextStar</Text>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Reservas simuladas</Text>
              <Text style={styles.profileValue}>{investments.length}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Total</Text>
              <Text style={styles.profileValue}>{formatBRL(totalInvested)}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Videos enviados</Text>
              <Text style={styles.profileValue}>{mySubmissions.length}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Status padrao</Text>
              <Text style={styles.profileValue}>Moderacao manual</Text>
            </View>
          </View>
        ) : null}

        {user.role === "Admin" ? (
          <View style={[styles.profilePanel, isWide ? styles.profilePanelGridItem : null]}>
            <Text style={styles.sectionTitle}>Admin</Text>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Pendentes</Text>
              <Text style={styles.profileValue}>{pending}</Text>
            </View>
            <View style={styles.profileRow}>
              <Text style={styles.profileLabel}>Aprovados</Text>
              <Text style={styles.profileValue}>{approved}</Text>
            </View>
          </View>
        ) : null}
      </View>

      {user.role === "Usuario" ? (
        <View style={styles.profilePanel}>
          <View style={styles.fundTitleRow}>
            <Text style={styles.sectionTitle}>Bolsa do atleta</Text>
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
                A bolsa fica sob custodia simulada do app. Voce pode acompanhar
                a captacao, mas nao pode sacar os recursos.
              </Text>
            </>
          ) : (
            <>
              <Text style={styles.bodyText}>
                Abra uma bolsa vinculada ao seu perfil publico para receber
                aportes simulados de outros usuarios.
              </Text>
              {!player ? (
                <Text style={styles.validationText}>
                  Envie um video e aguarde a aprovacao para criar seu perfil
                  publico antes de abrir a bolsa.
                </Text>
              ) : null}
              <Pressable
                disabled={!player}
                onPress={() => setIsFundModalVisible(true)}
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

      <View style={styles.profilePanel}>
        <Text style={styles.sectionTitle}>Maquete ativa</Text>
        <Text style={styles.bodyText}>
          Esta etapa simula cadastro, moderacao, feed aprovado, reserva de
          aporte, KYC, contrato, pagamento e distribuicao. Nenhuma etapa tem
          validade financeira ou juridica.
        </Text>
      </View>

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
          onPress={onClose}
          style={styles.profileMenuBackdrop}
        />
        <View style={styles.profileMenuLayer}>
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
  autoplayEnabled,
  notificationsEnabled,
  onBack,
  onChangeAutoplay,
  onChangeNotifications,
  user
}: {
  autoplayEnabled: boolean;
  notificationsEnabled: boolean;
  onBack: () => void;
  onChangeAutoplay: (value: boolean) => void;
  onChangeNotifications: (value: boolean) => void;
  user: AppUser;
}) {
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
        <Text style={styles.settingsSectionTitle}>Conta</Text>
        <View style={styles.profileRowNoBorder}>
          <Text style={styles.profileLabel}>Email</Text>
          <Text numberOfLines={1} style={styles.profileValue}>
            {user.email}
          </Text>
        </View>
        <View style={styles.profileRow}>
          <Text style={styles.profileLabel}>Verificacao</Text>
          <Text style={styles.profileValue}>{user.kycStatus}</Text>
        </View>
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
