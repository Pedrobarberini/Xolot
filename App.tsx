import React, { useEffect, useMemo, useRef, useState } from "react";
import { useEvent } from "expo";
import { BlurView } from "expo-blur";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { VideoView, useVideoPlayer } from "expo-video";
import {
  ArrowLeft,
  Check,
  CircleDollarSign,
  Expand,
  LogOut,
  Play,
  RefreshCw,
  Send,
  ShieldCheck,
  Upload,
  UserRound,
  Video,
  Volume2,
  VolumeX,
  WalletCards,
  X
} from "lucide-react-native";
import {
  AccessibilityInfo,
  Alert,
  Animated,
  Easing,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  PanResponder,
  Platform,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  useWindowDimensions,
  View
} from "react-native";
import { demoPlayer } from "./src/data/demoPlayer";
import { colors } from "./src/theme";
import {
  AppUser,
  AthleteFund,
  Investment,
  Player,
  UserRole,
  VideoSubmission,
  VideoSubmissionStatus
} from "./src/types";
import { formatBRL, formatPercent } from "./src/utils/investment";

const NEXTSTAR_SYMBOL = require("./assets/brand/nextstar-symbol.png");
const NEXTSTAR_WORDMARK = require("./assets/brand/nextstar-wordmark.png");

SplashScreen.preventAutoHideAsync().catch(() => undefined);

const SYSTEM_NAV_CLEARANCE =
  Platform.select({
    android: 58,
    ios: 34,
    default: 24
  }) ?? 24;
const TAB_BAR_SAFE_PADDING =
  Platform.select({
    android: 18,
    ios: 18,
    default: 10
  }) ?? 10;
const TAB_BAR_CONTENT_PADDING = 24;
const DETAIL_CONTENT_PADDING = SYSTEM_NAV_CLEARANCE + 36;
const FEED_TEXT_LIMIT_COMPACT = 76;
const FEED_TEXT_LIMIT_WIDE = 230;
const USE_CENTERED_WEB_LAYOUT = Platform.OS === "web";

type Tab = "feed" | "portfolio" | "submit" | "admin" | "profile";

type CardPalette = {
  name: string;
  card: string;
  media: string;
  border: string;
  accent: string;
  accentSoft: string;
  text: string;
  muted: string;
  tagBackground: string;
  progressTrack: string;
  onAccent: string;
};

type SubmissionDraft = {
  athleteName: string;
  age: string;
  city: string;
  position: string;
  club: string;
  videoTitle: string;
  videoLink: string;
  highlight: string;
  goals: string;
  hasGuardianConsent: boolean;
};

type SelectedVideoMeta = {
  durationMs?: number;
  fileName: string;
  fileSize?: number;
};

const emptySubmissionDraft: SubmissionDraft = {
  athleteName: "",
  age: "",
  city: "",
  position: "",
  club: "",
  videoTitle: "",
  videoLink: "",
  highlight: "",
  goals: "",
  hasGuardianConsent: false
};

const CARD_PALETTE: CardPalette = {
  name: "NextStar",
  card: colors.surface,
  media: colors.media,
  border: colors.border,
  accent: colors.primary,
  accentSoft: colors.primarySoft,
  text: colors.text,
  muted: colors.muted,
  tagBackground: colors.surfaceMuted,
  progressTrack: colors.border,
  onAccent: colors.onPrimary
};

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isBrandLaunchVisible, setIsBrandLaunchVisible] = useState(true);
  const [tab, setTab] = useState<Tab>("feed");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [athleteFunds, setAthleteFunds] = useState<AthleteFund[]>(() => [
    {
      id: "demo-athlete-fund",
      profileId: demoPlayer.profileId,
      ownerUserId: "demo-athlete",
      athleteName: demoPlayer.name,
      goalAmount: 5000,
      fundedAmount: 0,
      minimumContribution: 50,
      status: "Captando",
      createdAt: new Date().toISOString()
    }
  ]);
  const [walletBalances, setWalletBalances] = useState<Record<string, number>>(
    {}
  );
  const [submissions, setSubmissions] = useState<VideoSubmission[]>([]);
  const walletBalance = user ? (walletBalances[user.id] ?? 0) : 0;

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => undefined);
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);

  const approvedSubmissionPlayers = useMemo(
    () =>
      submissions
        .filter(
          (submission) =>
            submission.status === "Aprovado" && submission.videoLink.trim().length > 0
        )
        .map(buildPlayerFromSubmission),
    [submissions]
  );

  const availablePlayers = useMemo(
    () =>
      approvedSubmissionPlayers.length > 0
        ? approvedSubmissionPlayers
        : [demoPlayer],
    [approvedSubmissionPlayers]
  );

  const pendingReviews = submissions.filter(
    (submission) => submission.status === "Em revisao"
  ).length;
  const currentUserInvestments = user
    ? investments.filter((investment) => investment.investorUserId === user.id)
    : [];

  function handleAuth(nextUser: AppUser) {
    setUser(nextUser);
    if (nextUser.role === "Admin") {
      setTab("admin");
      return;
    }
    setTab("feed");
  }

  function handleSignOut() {
    setSelectedPlayer(null);
    setUser(null);
    setTab("feed");
  }

  function handleInvest(player: Player, amount: number) {
    const fund = athleteFunds.find(
      (item) => item.profileId === player.profileId
    );

    if (!fund) {
      Alert.alert(
        "Bolsa indisponivel",
        "Este perfil ainda nao abriu uma bolsa de investimento."
      );
      return;
    }

    if (fund.status === "Concluida") {
      Alert.alert(
        "Bolsa concluida",
        "A meta deste perfil ja foi atingida e novos aportes estao bloqueados."
      );
      return;
    }

    const remainingAmount = Math.max(0, fund.goalAmount - fund.fundedAmount);

    if (amount < fund.minimumContribution || amount > remainingAmount) {
      Alert.alert(
        "Valor invalido",
        `O aporte deve ficar entre ${formatBRL(fund.minimumContribution)} e ${formatBRL(remainingAmount)}.`
      );
      return;
    }

    if (amount > walletBalance) {
      Alert.alert(
        "Saldo insuficiente",
        `Seu saldo disponivel e ${formatBRL(walletBalance)}. Deposite um valor simulado na Carteira antes de criar a reserva.`
      );
      return;
    }

    const nextFundedAmount = Math.min(
      fund.goalAmount,
      fund.fundedAmount + amount
    );
    const isFundComplete = nextFundedAmount >= fund.goalAmount;

    setInvestments((current) => [
      {
        id: `simulation-${Date.now()}`,
        fundId: fund.id,
        investorUserId: user?.id ?? "",
        profileId: player.profileId,
        playerName: player.name,
        amount,
        sharePercent: (amount / fund.goalAmount) * 100,
        status: "Confirmada",
        createdAt: new Date().toISOString()
      },
      ...current
    ]);
    setAthleteFunds((current) =>
      current.map((item) =>
        item.id === fund.id
          ? {
              ...item,
              fundedAmount: nextFundedAmount,
              status: isFundComplete ? "Concluida" : "Captando",
              completedAt: isFundComplete
                ? new Date().toISOString()
                : item.completedAt
            }
          : item
      )
    );
    if (user) {
      setWalletBalances((current) => ({
        ...current,
        [user.id]: Math.max(0, (current[user.id] ?? 0) - amount)
      }));
    }
    setSelectedPlayer(null);
    setTab("portfolio");
    Alert.alert(
      isFundComplete ? "Bolsa concluida" : "Transferencia confirmada",
      isFundComplete
        ? "A meta do atleta foi atingida. O perfil agora aparece como em busca de contratantes."
        : `${formatBRL(amount)} foram transferidos para a bolsa de ${player.name}.`
    );
  }

  function handleDeposit(amount: number) {
    if (!user) {
      return;
    }

    setWalletBalances((current) => ({
      ...current,
      [user.id]: (current[user.id] ?? 0) + amount
    }));
  }

  function handleOpenFund(
    player: Player,
    goalAmount: number,
    minimumContribution: number
  ) {
    if (athleteFunds.some((item) => item.profileId === player.profileId)) {
      Alert.alert("Bolsa ja existente", "Este perfil ja possui uma bolsa aberta.");
      return;
    }

    setAthleteFunds((current) => [
      {
        id: `athlete-fund-${Date.now()}`,
        profileId: player.profileId,
        ownerUserId: player.ownerUserId ?? user?.id ?? "",
        athleteName: player.name,
        goalAmount,
        fundedAmount: 0,
        minimumContribution,
        status: "Captando",
        createdAt: new Date().toISOString()
      },
      ...current
    ]);
  }

  function handleSubmitVideo(submission: VideoSubmission) {
    setSubmissions((current) => [submission, ...current]);
  }

  function handleReviewSubmission(
    submissionId: string,
    status: VideoSubmissionStatus,
    reviewNote: string
  ) {
    setSubmissions((current) =>
      current.map((submission) => {
        if (submission.id !== submissionId) {
          return submission;
        }

        return {
          ...submission,
          status,
          reviewNote,
          approvedAt:
            status === "Aprovado" ? new Date().toISOString() : submission.approvedAt
        };
      })
    );
  }

  if (!user) {
    return (
      <View style={styles.appRoot}>
        <SafeAreaView style={styles.safeArea}>
          <StatusBar
            backgroundColor={colors.background}
            barStyle="dark-content"
          />
          <AuthScreen onComplete={handleAuth} />
        </SafeAreaView>
        {isBrandLaunchVisible ? (
          <BrandLaunchScreen onFinish={() => setIsBrandLaunchVisible(false)} />
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.appRoot}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          backgroundColor={colors.background}
          barStyle="dark-content"
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardView}
        >
          {selectedPlayer ? (
            <>
              <ScreenFrame>
                <PlayerDetail
                  canInvest={user.role === "Usuario"}
                  fund={athleteFunds.find(
                    (item) => item.profileId === selectedPlayer.profileId
                  )}
                  onBack={() => setSelectedPlayer(null)}
                  onInvest={handleInvest}
                  player={selectedPlayer}
                  profileVideos={availablePlayers.filter(
                    (item) => item.profileId === selectedPlayer.profileId
                  )}
                  walletBalance={walletBalance}
                />
              </ScreenFrame>
              <BottomTabs
                activeTab={tab}
                onChange={(nextTab) => {
                  setSelectedPlayer(null);
                  setTab(nextTab);
                }}
                role={user.role}
              />
            </>
          ) : (
            <>
              {tab !== "feed" ? (
                <Header
                  onSignOut={handleSignOut}
                  pendingReviews={pendingReviews}
                  showBalance={
                    user.role === "Usuario" &&
                    (tab === "portfolio" || tab === "profile")
                  }
                  user={user}
                  walletBalance={walletBalance}
                />
              ) : null}
              {tab === "feed" ? (
                <FeedScreen
                  balance={user.role === "Usuario" ? walletBalance : null}
                  funds={athleteFunds}
                  onOpenPlayer={setSelectedPlayer}
                  players={availablePlayers}
                />
              ) : null}
              {tab === "portfolio" ? (
                <ScreenFrame>
                  <PortfolioScreen
                    balance={walletBalance}
                    investments={currentUserInvestments}
                    onDeposit={handleDeposit}
                  />
                </ScreenFrame>
              ) : null}
              {tab === "submit" ? (
                <ScreenFrame>
                  <SubmitVideoScreen
                    onSubmit={handleSubmitVideo}
                    submissions={submissions.filter(
                      (item) => item.userId === user.id
                    )}
                    user={user}
                  />
                </ScreenFrame>
              ) : null}
              {tab === "admin" ? (
                <ScreenFrame>
                  <AdminScreen
                    onReview={handleReviewSubmission}
                    submissions={submissions}
                  />
                </ScreenFrame>
              ) : null}
              {tab === "profile" ? (
                <ScreenFrame>
                  <ProfileScreen
                    fund={athleteFunds.find(
                      (item) => item.ownerUserId === user.id
                    )}
                    investments={currentUserInvestments}
                    onOpenFund={handleOpenFund}
                    onSignOut={handleSignOut}
                    player={availablePlayers.find(
                      (item) => item.ownerUserId === user.id
                    )}
                    submissions={submissions}
                    user={user}
                  />
                </ScreenFrame>
              ) : null}
              <BottomTabs activeTab={tab} onChange={setTab} role={user.role} />
            </>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
      {isBrandLaunchVisible ? (
        <BrandLaunchScreen onFinish={() => setIsBrandLaunchVisible(false)} />
      ) : null}
    </View>
  );
}

function buildPlayerFromSubmission(submission: VideoSubmission): Player {
  return {
    id: `approved-${submission.id}`,
    profileId: `profile-${submission.userId}`,
    ownerUserId: submission.userId,
    name: submission.athleteName,
    age: submission.age,
    city: submission.city,
    position: submission.position,
    club: submission.club,
    videoTitle: submission.videoTitle,
    videoLength: formatVideoDuration(submission.videoDurationMs) ?? "",
    videoUri: submission.videoLink,
    hasAudio: true,
    highlight: submission.highlight,
    objective: submission.goals,
    tags: ["Novo", "Video aprovado"]
  };
}

function formatVideoDuration(milliseconds?: number | null) {
  if (!milliseconds || milliseconds <= 0) {
    return null;
  }

  const totalSeconds = Math.max(1, Math.round(milliseconds / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function formatPlaybackTime(seconds: number) {
  const totalSeconds = Number.isFinite(seconds)
    ? Math.max(0, Math.floor(seconds))
    : 0;
  const minutes = Math.floor(totalSeconds / 60);
  const remainingSeconds = totalSeconds % 60;

  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function getPointerLocationX(nativeEvent: unknown) {
  if (!nativeEvent || typeof nativeEvent !== "object") {
    return null;
  }

  const { locationX, offsetX } = nativeEvent as {
    locationX?: unknown;
    offsetX?: unknown;
  };

  if (typeof locationX === "number" && Number.isFinite(locationX)) {
    return locationX;
  }

  if (typeof offsetX === "number" && Number.isFinite(offsetX)) {
    return offsetX;
  }

  return null;
}

function getPointerLocationY(nativeEvent: unknown) {
  if (!nativeEvent || typeof nativeEvent !== "object") {
    return null;
  }

  const { locationY, offsetY } = nativeEvent as {
    locationY?: unknown;
    offsetY?: unknown;
  };

  if (typeof locationY === "number" && Number.isFinite(locationY)) {
    return locationY;
  }

  if (typeof offsetY === "number" && Number.isFinite(offsetY)) {
    return offsetY;
  }

  return null;
}

function formatVideoFileSize(bytes?: number) {
  if (!bytes || bytes <= 0) {
    return null;
  }

  const megabytes = bytes / (1024 * 1024);
  return `${megabytes < 10 ? megabytes.toFixed(1) : Math.round(megabytes)} MB`;
}

function getVideoTitleFromFileName(fileName?: string | null) {
  if (!fileName) {
    return "Meus melhores lances";
  }

  return fileName.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim();
}

function getCardPalette(index: number) {
  return CARD_PALETTE;
}

function getCardPaletteFromId(id: string) {
  const total = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return getCardPalette(total);
}

function getScoreColor(score: number) {
  if (score >= 85) {
    return colors.primary;
  }

  if (score >= 78) {
    return colors.warning;
  }

  return colors.danger;
}

function BrandLaunchScreen({ onFinish }: { onFinish: () => void }) {
  const opacity = useRef(new Animated.Value(1)).current;
  const scale = useRef(new Animated.Value(0.96)).current;

  useEffect(() => {
    let isMounted = true;
    let animation: Animated.CompositeAnimation | null = null;

    AccessibilityInfo.isReduceMotionEnabled()
      .then((reduceMotion) => {
        if (!isMounted) {
          return;
        }

        animation = reduceMotion
          ? Animated.sequence([
              Animated.delay(500),
              Animated.timing(opacity, {
                duration: 180,
                toValue: 0,
                useNativeDriver: true
              })
            ])
          : Animated.sequence([
              Animated.timing(scale, {
                duration: 420,
                easing: Easing.out(Easing.cubic),
                toValue: 1,
                useNativeDriver: true
              }),
              Animated.delay(650),
              Animated.timing(opacity, {
                duration: 330,
                easing: Easing.inOut(Easing.cubic),
                toValue: 0,
                useNativeDriver: true
              })
            ]);

        animation.start(({ finished }) => {
          if (finished && isMounted) {
            onFinish();
          }
        });
      })
      .catch(() => onFinish());

    return () => {
      isMounted = false;
      animation?.stop();
    };
  }, [onFinish, opacity, scale]);

  return (
    <Animated.View
      accessibilityLabel="Carregando NextStar"
      accessibilityRole="progressbar"
      style={[styles.brandLaunch, { opacity }]}
    >
      <Animated.Image
        resizeMode="contain"
        source={NEXTSTAR_WORDMARK}
        style={[styles.brandLaunchLogo, { transform: [{ scale }] }]}
      />
    </Animated.View>
  );
}

function ScreenBackdrop() {
  return <View pointerEvents="none" style={styles.screenBackdrop} />;
}

function ScreenTransition({
  children,
  style
}: {
  children: React.ReactNode;
  style?: object;
}) {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    progress.setValue(0);

    Animated.timing(progress, {
      duration: 360,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: true
    }).start();
  }, [progress]);

  return (
    <Animated.View
      style={[
        style,
        {
          opacity: progress,
          transform: [
            {
              translateY: progress.interpolate({
                inputRange: [0, 1],
                outputRange: [16, 0]
              })
            }
          ]
        }
      ]}
    >
      {children}
    </Animated.View>
  );
}

function ScreenFrame({ children }: { children: React.ReactNode }) {
  return (
    <ScreenTransition style={styles.tabScene}>
      <ScreenBackdrop />
      {children}
    </ScreenTransition>
  );
}

function AuthScreen({
  onComplete
}: {
  onComplete: (user: AppUser) => void;
}) {
  const { width } = useWindowDimensions();
  const [mode, setMode] = useState<"create" | "login">("create");
  const [role, setRole] = useState<UserRole>("Usuario");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const isCompact = width < 380;
  const authModeLabel = mode === "create" ? "Cadastro" : "Login";
  const roleSummary = role === "Admin" ? "Moderacao" : "Feed, envio e carteira";

  const cleanName = name.trim();
  const cleanEmail = email.trim().toLowerCase();
  const canContinue =
    cleanEmail.includes("@") &&
    (mode === "login" || cleanName.length >= 3) &&
    (mode === "login" || acceptedTerms);

  function buildUser() {
    const fallbackName =
      role === "Admin" ? "Admin NextStar" : cleanEmail.split("@")[0] || "Usuario";

    onComplete({
      id: `${role.toLowerCase()}-${cleanEmail}`,
      name: mode === "login" ? fallbackName : cleanName,
      email: cleanEmail,
      role,
      kycStatus: role === "Admin" ? "Aprovado" : "Nao iniciado",
      acceptedTerms: mode === "login" ? true : acceptedTerms
    });
  }

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      style={styles.authShell}
    >
      <ScreenBackdrop />
      <ScrollView contentContainerStyle={styles.authContent}>
        <ScreenTransition style={styles.authCard}>
          <View style={styles.authTopRow}>
            <Text style={styles.authPanelKicker}>Talentos em movimento</Text>
            <View style={styles.authModePill}>
              <Text style={styles.authModeText}>{authModeLabel}</Text>
            </View>
          </View>
        <Image
          accessibilityLabel="Logo NextStar"
          resizeMode="contain"
          source={NEXTSTAR_WORDMARK}
          style={[styles.authLogo, isCompact ? styles.authLogoCompact : null]}
        />
        <Text style={styles.authEyebrow}>Descubra. Avalie. Conecte.</Text>
        <Text style={styles.authTitle}>
          {mode === "create" ? "Criar conta" : "Entrar"}
        </Text>
        <View style={styles.authSignalStrip}>
          <View style={styles.authSignalItem}>
            <Text style={styles.authSignalValue}>{role}</Text>
            <Text style={styles.authSignalLabel}>perfil</Text>
          </View>
          <View style={styles.authSignalItem}>
            <Text style={styles.authSignalValue}>{roleSummary}</Text>
            <Text style={styles.authSignalLabel}>fluxo</Text>
          </View>
        </View>

        <View style={styles.segmentedControl}>
          {(["Usuario", "Admin"] as UserRole[]).map((item) => {
            const isActive = role === item;

            return (
              <Pressable
                key={item}
                onPress={() => setRole(item)}
                style={[
                  styles.segmentButton,
                  isActive ? styles.segmentButtonActive : null
                ]}
              >
                <Text
                  style={[
                    styles.segmentText,
                    isActive ? styles.segmentTextActive : null
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {mode === "create" ? (
          <LabeledInput
            label="Nome completo"
            onChangeText={setName}
            placeholder="Seu nome"
            value={name}
          />
        ) : null}

        <LabeledInput
          autoCapitalize="none"
          keyboardType="email-address"
          label="Email"
          onChangeText={setEmail}
          placeholder={
            role === "Admin" ? "admin@nextstar.local" : "voce@email.com"
          }
          value={email}
        />

        {mode === "create" ? (
          <Pressable
            onPress={() => setAcceptedTerms((current) => !current)}
            style={styles.checkRow}
          >
            <View
              style={[
                styles.checkBox,
                acceptedTerms ? styles.checkBoxActive : null
              ]}
            >
              {acceptedTerms ? (
                <Check color={colors.onPrimary} size={16} strokeWidth={3} />
              ) : null}
            </View>
            <Text style={styles.checkText}>
              Aceito que este ambiente e demonstrativo, sem dinheiro real,
              contrato real ou promessa de retorno.
            </Text>
          </Pressable>
        ) : null}

        <Pressable
          disabled={!canContinue}
          onPress={buildUser}
          style={[
            styles.primaryButton,
            !canContinue ? styles.primaryButtonDisabled : null
          ]}
        >
          <Text style={styles.primaryButtonText}>
            {mode === "create" ? "Criar conta" : "Entrar"}
          </Text>
        </Pressable>

        <Pressable
          onPress={() => setMode(mode === "create" ? "login" : "create")}
          style={styles.secondaryButton}
        >
          <Text style={styles.secondaryButtonText}>
            {mode === "create" ? "Ja tenho conta" : "Criar nova conta"}
          </Text>
        </Pressable>
        </ScreenTransition>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Header({
  onSignOut,
  pendingReviews,
  showBalance,
  user,
  walletBalance
}: {
  onSignOut: () => void;
  pendingReviews: number;
  showBalance: boolean;
  user: AppUser;
  walletBalance: number;
}) {
  const { width } = useWindowDimensions();
  const isCompact = USE_CENTERED_WEB_LAYOUT || width < 520;

  return (
    <View style={[styles.header, isCompact ? styles.headerCompact : null]}>
      <View
        style={[
          styles.headerIdentity,
          isCompact ? styles.headerIdentityCompact : null
        ]}
      >
        <Image
          accessibilityLabel="Logo NextStar"
          resizeMode="contain"
          source={NEXTSTAR_SYMBOL}
          style={[
            styles.headerLogo,
            isCompact ? styles.headerLogoCompact : null
          ]}
        />
        <View style={styles.headerTitleBlock}>
          <Text style={styles.brand}>NextStar</Text>
          <Text numberOfLines={1} style={styles.headerSubtitle}>
            {user.role} | {user.name}
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.headerActions,
          isCompact ? styles.headerActionsCompact : null
        ]}
      >
        {showBalance ? <BalanceLine balance={walletBalance} /> : null}
        {user.role === "Admin" ? (
          <Text style={styles.headerReviewLine}>{pendingReviews} pend.</Text>
        ) : null}
        <Pressable
          accessibilityLabel="Sair da conta"
          onPress={onSignOut}
          style={[
            styles.signOutButton,
            isCompact ? styles.signOutButtonCompact : null
          ]}
        >
          <LogOut color={colors.primary} size={20} strokeWidth={2.2} />
        </Pressable>
      </View>
    </View>
  );
}

function BalanceLine({
  balance,
  overlay = false
}: {
  balance: number;
  overlay?: boolean;
}) {
  return (
    <View
      accessibilityLabel={`Saldo disponivel ${formatBRL(balance)}`}
      style={[styles.balanceLine, overlay ? styles.balanceLineOverlay : null]}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.balanceLineValue,
          overlay ? styles.balanceLineValueOverlay : null
        ]}
      >
        {formatBRL(balance)}
      </Text>
    </View>
  );
}

function FeedScreen({
  balance,
  funds,
  onOpenPlayer,
  players: feedPlayers
}: {
  balance: number | null;
  funds: AthleteFund[];
  onOpenPlayer: (player: Player) => void;
  players: Player[];
}) {
  const { height } = useWindowDimensions();
  const [feedHeight, setFeedHeight] = useState(0);
  const [activeFeedIndex, setActiveFeedIndex] = useState(0);
  const feedScrollRef = useRef<ScrollView | null>(null);
  const activeFeedIndexRef = useRef(0);
  const gestureStartIndexRef = useRef(0);
  const gestureStartOffsetRef = useRef(0);
  const gestureSettledRef = useRef(false);
  const sectionOffsetsRef = useRef<Record<number, number>>({});
  const pageHeight = feedHeight || height;
  const lastFeedIndex = Math.max(feedPlayers.length - 1, 0);

  useEffect(() => {
    if (activeFeedIndex > lastFeedIndex) {
      activeFeedIndexRef.current = lastFeedIndex;
      setActiveFeedIndex(lastFeedIndex);
    }
  }, [activeFeedIndex, lastFeedIndex]);

  function scrollToFeed(index: number) {
    const safeIndex = Math.min(Math.max(index, 0), lastFeedIndex);
    const sectionOffset = sectionOffsetsRef.current[safeIndex];

    feedScrollRef.current?.scrollTo({
      animated: true,
      y: sectionOffset ?? safeIndex * pageHeight
    });
  }

  function getNearestFeedIndex(offsetY: number) {
    let nearestIndex = activeFeedIndexRef.current;
    let nearestDistance = Number.POSITIVE_INFINITY;

    for (let index = 0; index < feedPlayers.length; index += 1) {
      const sectionOffset = sectionOffsetsRef.current[index] ?? index * pageHeight;
      const distance = Math.abs(sectionOffset - offsetY);

      if (distance < nearestDistance) {
        nearestDistance = distance;
        nearestIndex = index;
      }
    }

    return Math.min(Math.max(nearestIndex, 0), lastFeedIndex);
  }

  function settleFeedGesture(offsetY: number) {
    if (!pageHeight || feedPlayers.length === 0) {
      return;
    }

    if (gestureSettledRef.current) {
      scrollToFeed(activeFeedIndexRef.current);
      return;
    }

    const delta = offsetY - gestureStartOffsetRef.current;
    const threshold = Math.max(pageHeight * 0.12, 48);
    const direction = Math.abs(delta) < threshold ? 0 : delta > 0 ? 1 : -1;
    const nextIndex = Math.min(
      Math.max(gestureStartIndexRef.current + direction, 0),
      lastFeedIndex
    );

    activeFeedIndexRef.current = nextIndex;
    setActiveFeedIndex(nextIndex);
    gestureSettledRef.current = true;
    scrollToFeed(nextIndex);
  }

  return (
    <View
      onLayout={(event) => {
        const nextHeight = event.nativeEvent.layout.height;

        if (Math.abs(nextHeight - feedHeight) > 1) {
          setFeedHeight(nextHeight);
        }
      }}
      style={styles.feedPagerShell}
    >
      <ScrollView
        bounces={false}
        decelerationRate="normal"
        nativeID="nextstar-feed-scroll"
        ref={feedScrollRef}
        onMomentumScrollEnd={(event) => {
          settleFeedGesture(event.nativeEvent.contentOffset.y);
        }}
        onScrollBeginDrag={(event) => {
          const offsetY = event.nativeEvent.contentOffset.y;

          gestureStartIndexRef.current = Math.min(
            Math.max(getNearestFeedIndex(offsetY), 0),
            lastFeedIndex
          );
          activeFeedIndexRef.current = gestureStartIndexRef.current;
          setActiveFeedIndex(gestureStartIndexRef.current);
          gestureStartOffsetRef.current = offsetY;
          gestureSettledRef.current = false;
        }}
        onScrollEndDrag={(event) => {
          settleFeedGesture(event.nativeEvent.contentOffset.y);
        }}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={styles.feedPager}
      >
        {feedPlayers.map((player, index) => (
          <View
            collapsable={false}
            key={player.id}
            nativeID={`nextstar-feed-section-${index}`}
            onLayout={(event) => {
              sectionOffsetsRef.current[index] = event.nativeEvent.layout.y;
            }}
          >
            <FeedReel
              fund={funds.find((item) => item.profileId === player.profileId)}
              isActive={index === activeFeedIndex}
              onOpen={() => onOpenPlayer(player)}
              palette={getCardPalette(index)}
              player={player}
              reelHeight={pageHeight}
            />
          </View>
        ))}
      </ScrollView>
      <View pointerEvents="none" style={styles.feedFixedBrand}>
        <Image
          accessibilityLabel="NextStar"
          resizeMode="contain"
          source={NEXTSTAR_SYMBOL}
          style={styles.feedReelBrandMark}
        />
      </View>
      {balance !== null ? <BalanceLine balance={balance} overlay /> : null}
    </View>
  );
}

function FeedReel({
  fund,
  isActive,
  onOpen,
  palette,
  player,
  reelHeight
}: {
  fund?: AthleteFund;
  isActive: boolean;
  onOpen: () => void;
  palette: CardPalette;
  player: Player;
  reelHeight: number;
}) {
  const { width } = useWindowDimensions();
  const [isExpanded, setIsExpanded] = useState(false);
  const revealProgress = useRef(new Animated.Value(0)).current;
  const isWide = !USE_CENTERED_WEB_LAYOUT && width >= 900;
  const evaluation = player.evaluation;
  const progress = evaluation
    ? Math.min(evaluation.funded / evaluation.fundingGoal, 1)
    : 0;
  const scoreColor = evaluation
    ? getScoreColor(evaluation.score)
    : colors.muted;
  const presentationText = `${player.highlight} ${player.objective}`.trim();
  const textLimit = isWide ? FEED_TEXT_LIMIT_WIDE : FEED_TEXT_LIMIT_COMPACT;
  const hasMoreText = presentationText.length > textLimit;
  const visibleText =
    !isExpanded && hasMoreText
      ? `${presentationText.slice(0, textLimit).trim()}...`
      : presentationText;
  const compactPreview =
    presentationText.length > FEED_TEXT_LIMIT_COMPACT
      ? `${presentationText.slice(0, FEED_TEXT_LIMIT_COMPACT).trim()}...`
      : presentationText;
  const fundingProgressLabel = evaluation
    ? `${Math.round(progress * 100)}%`
    : null;
  const fundProgress = fund
    ? Math.min(Math.max(fund.fundedAmount / fund.goalAmount, 0), 1)
    : 0;
  const minimumTicketLabel = evaluation
    ? formatBRL(evaluation.minimumTicket)
    : null;
  const projectedMonthlyLabel = evaluation
    ? formatBRL(evaluation.projectedMonthlyEarnings)
    : null;
  const initials = player.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const canvasHeight = isWide
    ? Math.max(540, Math.min(reelHeight - 44, 700))
    : reelHeight;
  const canvasWidth = isWide ? Math.min(width - 80, 1080) : width;
  useEffect(() => {
    revealProgress.setValue(0);

    Animated.timing(revealProgress, {
      duration: 420,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: true
    }).start();
  }, [player.id, revealProgress]);

  useEffect(() => {
    if (!isActive) {
      setIsExpanded(false);
    }
  }, [isActive]);

  return (
    <View style={[styles.feedReel, { height: reelHeight }]}>
      <Animated.View
        style={[
          styles.feedReelStage,
          isWide ? styles.feedReelStageWide : null,
          {
            opacity: revealProgress,
            transform: [
              {
                translateY: revealProgress.interpolate({
                  inputRange: [0, 1],
                  outputRange: [18, 0]
                })
              }
            ]
          }
        ]}
      >
        <View
          style={[
            styles.feedReelCanvas,
            isWide
              ? [
                  styles.feedReelCanvasWide,
                  {
                    flexBasis: canvasHeight,
                    flexGrow: 0,
                    flexShrink: 0,
                    height: canvasHeight,
                    width: canvasWidth
                  }
                ]
              : null
          ]}
        >
          <View style={styles.feedVideoBackground} />

          <FeedVideoBox
            fundingProgressLabel={fundingProgressLabel}
            isActive={isActive}
            isWide={isWide}
            palette={palette}
            player={player}
            scoreColor={scoreColor}
          />

          {!isWide && evaluation ? (
            <View style={styles.feedReelHeaderOverlay}>
              <View
                style={[
                  styles.scoreBadge,
                  styles.feedScoreBadge,
                  { borderColor: scoreColor }
                ]}
              >
                <Text style={[styles.scoreValue, { color: scoreColor }]}>
                  {evaluation.score}
                </Text>
                <Text style={[styles.scoreLabel, { color: palette.muted }]}>
                  score
                </Text>
              </View>
            </View>
          ) : null}

          <View
            style={[
              styles.feedTextOverlay,
              isWide
                ? [
                    styles.feedTextOverlayWide,
                    { right: Math.max(300, canvasWidth - 360) }
                  ]
                : [
                    styles.feedTextOverlayCompact,
                    isExpanded ? styles.feedTextOverlayCompactExpanded : null
                  ]
            ]}
          >
            {!isWide && isExpanded ? (
              <>
                <BlurView
                  experimentalBlurMethod={
                    Platform.OS === "android" ? "dimezisBlurView" : "none"
                  }
                  intensity={24}
                  pointerEvents="none"
                  style={styles.feedCompactBlur}
                  tint="dark"
                />
                <LinearGradient
                  colors={["rgba(5, 18, 12, 0)", "rgba(5, 18, 12, 1)"]}
                  end={{ x: 0.5, y: 1 }}
                  locations={[0, 1]}
                  pointerEvents="none"
                  start={{ x: 0.5, y: 0 }}
                  style={styles.feedCompactGradient}
                />
              </>
            ) : null}
            {isWide ? (
              <Text style={[styles.feedOverlayEyebrow, { color: palette.accent }]}>
                Ficha de observacao
              </Text>
            ) : null}
            <View
              style={[
                styles.feedProfileRow,
                !isWide ? styles.feedProfileRowCompact : null
              ]}
            >
              <Pressable
                accessibilityLabel={`Abrir perfil de ${player.name}`}
                accessibilityRole="button"
                hitSlop={6}
                onPress={onOpen}
                style={({ pressed }) => [
                  styles.feedProfileButton,
                  isWide
                    ? [styles.feedAvatar, { borderColor: palette.accent }]
                    : styles.feedProfileButtonCompact,
                  pressed ? styles.buttonPressed : null
                ]}
              >
                {isWide ? (
                  <Text
                    style={[styles.feedAvatarText, { color: palette.accent }]}
                  >
                    {initials}
                  </Text>
                ) : (
                  <UserRound color={colors.onPrimary} size={20} strokeWidth={2.2} />
                )}
              </Pressable>
              <View style={styles.feedProfileTextBlock}>
                {!isWide ? (
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.feedSponsorLabel,
                      styles.feedSponsorLabelCompact,
                      { color: "rgba(255, 255, 255, 0.82)" }
                    ]}
                  >
                    {player.position} | {player.city}
                  </Text>
                ) : null}
                <Text
                  numberOfLines={1}
                  style={[
                    styles.feedProfileName,
                    !isWide ? styles.feedProfileNameCompact : null,
                    { color: isWide ? palette.text : colors.onPrimary }
                  ]}
                >
                  {player.name}
                </Text>
                {isWide ? (
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.feedSponsorLabel,
                      { color: palette.muted }
                    ]}
                  >
                    {player.position} | {player.city}
                  </Text>
                ) : null}
              </View>
              {isWide ? (
                <View
                  style={[styles.feedStatusPill, { borderColor: palette.border }]}
                >
                  <Text style={[styles.feedStatusText, { color: palette.accent }]}>
                    {player.isDemo ? "Demonstracao" : "Aprovado"}
                  </Text>
                </View>
              ) : null}
            </View>

            {isWide ? (
              <>
                <Text
                  numberOfLines={2}
                  style={[
                    styles.feedReelVideoTitle,
                    styles.feedReelVideoTitleWide,
                    { color: palette.text }
                  ]}
                >
                  {player.videoTitle}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[styles.feedReelMeta, { color: palette.muted }]}
                >
                  {player.age} anos | {player.club}
                  {evaluation ? ` | risco ${evaluation.riskLevel}` : ""}
                </Text>
                <View style={styles.feedTagRow}>
                  {player.tags.slice(0, 3).map((tag) => (
                    <Text
                      key={tag}
                      numberOfLines={1}
                      style={[
                        styles.feedTag,
                        { borderColor: palette.border, color: palette.text }
                      ]}
                    >
                      {tag}
                    </Text>
                  ))}
                </View>
                <Text style={[styles.feedReelHighlight, { color: palette.text }]}>
                  {visibleText}
                </Text>
                {hasMoreText ? (
                  <Pressable
                    onPress={() => setIsExpanded((current) => !current)}
                    style={styles.feedReadMoreButton}
                  >
                    <Text
                      style={[styles.feedReadMoreText, { color: palette.accent }]}
                    >
                      {isExpanded ? "Ver menos" : "Ver mais"}
                    </Text>
                  </Pressable>
                ) : null}
              </>
            ) : (
              <>
                <Text style={styles.feedCompactDescription}>
                  <Text style={styles.feedCompactDescriptionTitle}>
                    {player.videoTitle}
                  </Text>
                  {presentationText
                    ? ` - ${isExpanded ? presentationText : compactPreview}`
                    : ""}
                  {!isExpanded ? (
                    <Text
                      accessibilityRole="button"
                      onPress={() => setIsExpanded(true)}
                      style={styles.feedCompactInlineAction}
                    >
                      {"  "}mais
                    </Text>
                  ) : null}
                </Text>

                {isExpanded ? (
                  <>
                    <Text style={styles.feedCompactExpandedMeta}>
                      {player.age} anos | {player.club}
                    </Text>
                    {player.tags.length > 0 ? (
                      <View style={styles.feedCompactHashtagRow}>
                        {player.tags.slice(0, 4).map((tag) => (
                          <Text key={tag} style={styles.feedCompactHashtag}>
                            #{tag}
                          </Text>
                        ))}
                      </View>
                    ) : null}
                    {fund ? (
                      <View style={styles.feedCompactFundSection}>
                        <Text style={styles.feedCompactFundTitle}>
                          {fund.status === "Captando"
                            ? "Bolsa de investimento aberta"
                            : "Bolsa de investimento concluida"}
                        </Text>
                        <View style={styles.feedCompactFundValues}>
                          <Text style={styles.feedCompactFundValue}>
                            {formatBRL(fund.fundedAmount)} captados
                          </Text>
                          <Text style={styles.feedCompactFundGoal}>
                            Meta {formatBRL(fund.goalAmount)}
                          </Text>
                        </View>
                        <View style={styles.feedCompactFundTrack}>
                          <View
                            style={[
                              styles.feedCompactFundFill,
                              { width: `${fundProgress * 100}%` }
                            ]}
                          />
                        </View>
                      </View>
                    ) : (
                      <Text style={styles.feedCompactFundEmpty}>
                        Este perfil nao possui um investimento aberto.
                      </Text>
                    )}
                    <View style={styles.feedCompactExpandedActions}>
                      <Pressable
                        accessibilityRole="button"
                        hitSlop={8}
                        onPress={onOpen}
                        style={styles.feedCompactTextButton}
                      >
                        <Text style={styles.feedCompactTextButtonLabel}>
                          Ver perfil
                        </Text>
                      </Pressable>
                      <Pressable
                        accessibilityLabel="Recolher descricao"
                        accessibilityRole="button"
                        hitSlop={8}
                        onPress={() => setIsExpanded(false)}
                        style={styles.feedCompactTextButton}
                      >
                        <Text style={styles.feedCompactTextButtonLabel}>
                          menos
                        </Text>
                      </Pressable>
                    </View>
                  </>
                ) : null}
              </>
            )}

            {isWide && evaluation ? (
              <View style={styles.feedInsightStrip}>
                <View style={styles.feedInsightItem}>
                  <Text style={[styles.feedInsightValue, { color: scoreColor }]}>
                    {evaluation.score}
                  </Text>
                  <Text
                    style={[styles.feedInsightLabel, { color: palette.muted }]}
                  >
                    score
                  </Text>
                </View>
                <View style={styles.feedInsightItem}>
                  <Text
                    style={[styles.feedInsightValue, { color: palette.accent }]}
                  >
                    {fundingProgressLabel}
                  </Text>
                  <Text
                    style={[styles.feedInsightLabel, { color: palette.muted }]}
                  >
                    captado
                  </Text>
                </View>
                <View style={styles.feedInsightItem}>
                  <Text
                    style={[styles.feedInsightValue, { color: palette.accent }]}
                  >
                    {minimumTicketLabel}
                  </Text>
                  <Text
                    style={[styles.feedInsightLabel, { color: palette.muted }]}
                  >
                    ticket
                  </Text>
                </View>
              </View>
            ) : null}

            {isWide && evaluation ? (
              <View style={styles.feedReelMetricRow}>
                {evaluation.metrics.slice(0, 3).map((metric) => (
                  <View
                    key={metric.label}
                    style={[
                      styles.feedReelMetric,
                      {
                        backgroundColor: palette.accentSoft,
                        borderColor: palette.border
                      }
                    ]}
                  >
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.feedReelMetricValue,
                        { color: palette.accent }
                      ]}
                    >
                      {metric.value}
                    </Text>
                    <Text
                      numberOfLines={1}
                      style={[
                        styles.feedReelMetricLabel,
                        { color: palette.muted }
                      ]}
                    >
                      {metric.label}
                    </Text>
                  </View>
                ))}
              </View>
            ) : null}

            {isWide && evaluation ? (
              <View style={styles.progressLabelRow}>
                <Text style={[styles.progressText, { color: palette.muted }]}>
                  {formatBRL(evaluation.funded)}
                </Text>
                <Text style={[styles.progressText, { color: palette.muted }]}>
                  {formatBRL(evaluation.fundingGoal)}
                </Text>
              </View>
            ) : null}
            {isWide && evaluation ? (
              <View
                style={[
                  styles.progressTrack,
                  { backgroundColor: palette.progressTrack }
                ]}
              >
                <View
                  style={[
                    styles.progressFill,
                    {
                      backgroundColor: palette.accent,
                      width: `${progress * 100}%`
                    }
                  ]}
                />
              </View>
            ) : null}

            {isWide ? (
              <Pressable
                onPress={onOpen}
                style={({ pressed }) => [
                  styles.feedLearnMoreButton,
                  pressed ? styles.feedReelButtonPressed : null
                ]}
              >
                <Text style={styles.feedLearnMoreText}>
                  {player.isDemo
                    ? "Abrir perfil demonstrativo"
                    : "Abrir ficha completa"}
                </Text>
              </Pressable>
            ) : null}
          </View>

          {isWide && evaluation ? (
            <View style={styles.feedDesktopPanel}>
              <Text style={styles.feedDesktopPanelTitle}>
                Leitura de investimento
              </Text>
              <View style={styles.feedDesktopPanelRow}>
                <Text style={styles.feedDesktopPanelLabel}>Projecao mensal</Text>
                <Text style={styles.feedDesktopPanelValue}>{projectedMonthlyLabel}</Text>
              </View>
              <View style={styles.feedDesktopPanelRow}>
                <Text style={styles.feedDesktopPanelLabel}>Participacao atleta</Text>
                <Text style={styles.feedDesktopPanelValue}>
                  {formatPercent(evaluation.athleteSharePercent)}
                </Text>
              </View>
              <View style={styles.feedDesktopPanelRow}>
                <Text style={styles.feedDesktopPanelLabel}>Perfil de risco</Text>
                <Text style={styles.feedDesktopPanelValue}>
                  {evaluation.riskLevel}
                </Text>
              </View>
            </View>
          ) : null}
        </View>
      </Animated.View>
    </View>
  );
}

function FeedVideoBox({
  fundingProgressLabel,
  isActive,
  isWide,
  palette,
  player,
  scoreColor
}: {
  fundingProgressLabel: string | null;
  isActive: boolean;
  isWide: boolean;
  palette: CardPalette;
  player: Player;
  scoreColor: string;
}) {
  const evaluation = player.evaluation;

  return (
    <View
      style={[
        styles.feedVideoBox,
        isWide ? styles.feedVideoBoxWide : styles.feedVideoBoxCompact,
        { backgroundColor: palette.media, borderColor: palette.border }
      ]}
    >
      <FeedVideoPlayback
        accent={palette.accent}
        caption={player.videoTitle}
        durationLabel={player.videoLength}
        hasAudio={player.hasAudio !== false}
        isActive={isActive}
        isWide={isWide}
        onAccent={palette.onAccent}
        trackColor={palette.progressTrack}
        uri={player.videoUri}
      />

      {evaluation && fundingProgressLabel ? (
        <View style={styles.feedVideoActionRail}>
          <View style={styles.feedVideoActionButton}>
            <Text style={[styles.feedVideoActionValue, { color: scoreColor }]}>
              {evaluation.score}
            </Text>
            <Text style={styles.feedVideoActionLabel}>SC</Text>
          </View>
          <View style={styles.feedVideoActionButton}>
            <Text style={styles.feedVideoActionValue}>{fundingProgressLabel}</Text>
            <Text style={styles.feedVideoActionLabel}>CAP</Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function FeedVideoPlayback({
  accent,
  caption,
  durationLabel,
  hasAudio,
  isActive,
  isWide,
  onAccent,
  trackColor,
  uri
}: {
  accent: string;
  caption: string;
  durationLabel: string;
  hasAudio: boolean;
  isActive: boolean;
  isWide: boolean;
  onAccent: string;
  trackColor: string;
  uri: string | number;
}) {
  const videoViewRef = useRef<VideoView | null>(null);
  const [playbackTime, setPlaybackTime] = useState(0);
  const [seekTrackWidth, setSeekTrackWidth] = useState(0);
  const [isVolumeControlVisible, setIsVolumeControlVisible] = useState(false);
  const [volume, setVolume] = useState(0);
  const [volumeTrackHeight, setVolumeTrackHeight] = useState(0);
  const videoPlayer = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.muted = true;
    player.timeUpdateEventInterval = 0.1;
  });
  const { isPlaying } = useEvent(videoPlayer, "playingChange", {
    isPlaying: videoPlayer.playing
  });
  const { muted } = useEvent(videoPlayer, "mutedChange", {
    muted: videoPlayer.muted
  });
  const { status: playerStatus } = useEvent(videoPlayer, "statusChange", {
    status: videoPlayer.status
  });
  const { currentTime } = useEvent(videoPlayer, "timeUpdate", {
    bufferedPosition: videoPlayer.bufferedPosition,
    currentLiveTimestamp: null,
    currentOffsetFromLive: null,
    currentTime: videoPlayer.currentTime
  });
  const playbackDuration =
    playerStatus === "readyToPlay" &&
    Number.isFinite(videoPlayer.duration) &&
    videoPlayer.duration > 0
      ? videoPlayer.duration
      : 0;
  const safeCurrentTime = Number.isFinite(playbackTime)
    ? Math.min(Math.max(playbackTime, 0), playbackDuration || playbackTime)
    : 0;
  const playbackProgress =
    playbackDuration > 0 ? safeCurrentTime / playbackDuration : 0;
  const totalTimeLabel =
    durationLabel || formatPlaybackTime(Math.ceil(playbackDuration));
  const effectiveVolume = muted ? 0 : volume;
  const thumbOffset =
    seekTrackWidth > 12
      ? Math.min(
          Math.max(playbackProgress * seekTrackWidth, 6),
          seekTrackWidth - 6
        )
      : 0;
  const videoPlayerRef = useRef(videoPlayer);
  const playbackDurationRef = useRef(playbackDuration);
  const seekTrackWidthRef = useRef(seekTrackWidth);
  const volumeTrackHeightRef = useRef(volumeTrackHeight);
  const seekToTimeRef = useRef<(targetTime: number) => number>(() => 0);
  const seekToOffsetRef = useRef<(offsetX: number) => number>(() => 0);
  const setVolumeRef = useRef<(targetVolume: number) => void>(() => undefined);
  const setVolumeFromOffsetRef = useRef<(offsetY: number) => void>(
    () => undefined
  );

  videoPlayerRef.current = videoPlayer;
  playbackDurationRef.current = playbackDuration;
  seekTrackWidthRef.current = seekTrackWidth;
  volumeTrackHeightRef.current = volumeTrackHeight;
  seekToTimeRef.current = (targetTime: number) => {
    const duration = playbackDurationRef.current;

    if (duration <= 0) {
      return 0;
    }

    const nextTime = Math.min(Math.max(targetTime, 0), duration);
    setPlaybackTime(nextTime);
    videoPlayerRef.current.currentTime = nextTime;
    return nextTime;
  };
  seekToOffsetRef.current = (offsetX: number) => {
    const width = seekTrackWidthRef.current;
    const duration = playbackDurationRef.current;

    if (width <= 0 || duration <= 0) {
      return 0;
    }

    const progress = Math.min(Math.max(offsetX / width, 0), 1);
    return seekToTimeRef.current(progress * duration);
  };
  setVolumeRef.current = (targetVolume: number) => {
    const nextVolume = Math.min(Math.max(targetVolume, 0), 1);

    setVolume(nextVolume);
    videoPlayerRef.current.volume = nextVolume;
    videoPlayerRef.current.muted = nextVolume <= 0;
  };
  setVolumeFromOffsetRef.current = (offsetY: number) => {
    const height = volumeTrackHeightRef.current;

    if (height <= 0) {
      return;
    }

    setVolumeRef.current(1 - Math.min(Math.max(offsetY / height, 0), 1));
  };

  const seekPanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (event) => {
        const locationX = getPointerLocationX(event.nativeEvent);

        if (locationX !== null) {
          seekToOffsetRef.current(locationX);
        }
      },
      onPanResponderMove: (event) => {
        const locationX = getPointerLocationX(event.nativeEvent);

        if (locationX !== null) {
          seekToOffsetRef.current(locationX);
        }
      },
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onStartShouldSetPanResponder: () => false
    })
  ).current;
  const volumePanResponder = useRef(
    PanResponder.create({
      onMoveShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponderCapture: () => true,
      onPanResponderGrant: (event) => {
        const locationY = getPointerLocationY(event.nativeEvent);

        if (locationY !== null) {
          setVolumeFromOffsetRef.current(locationY);
        }
      },
      onPanResponderMove: (event) => {
        const locationY = getPointerLocationY(event.nativeEvent);

        if (locationY !== null) {
          setVolumeFromOffsetRef.current(locationY);
        }
      },
      onPanResponderTerminationRequest: () => false,
      onShouldBlockNativeResponder: () => true,
      onStartShouldSetPanResponder: () => false
    })
  ).current;

  const volumeThumbOffset =
    volumeTrackHeight > 10
      ? Math.min(
          Math.max(effectiveVolume * volumeTrackHeight - 5, 0),
          volumeTrackHeight - 10
        )
      : 0;

  useEffect(() => {
    if (Number.isFinite(currentTime)) {
      setPlaybackTime(currentTime);
    }
  }, [currentTime]);

  useEffect(() => {
    if (isActive) {
      videoPlayer.play();
      return;
    }

    videoPlayer.pause();
  }, [isActive, videoPlayer]);

  function togglePlayback() {
    if (isPlaying) {
      videoPlayer.pause();
      return;
    }

    videoPlayer.play();
  }

  function openFullscreen() {
    videoViewRef.current?.enterFullscreen().catch(() => {
      Alert.alert("Tela cheia indisponivel", "Tente abrir o video novamente.");
    });
  }

  return (
    <View style={styles.feedVideoPlayback}>
      <VideoView
        allowsFullscreen
        contentFit="cover"
        nativeControls={false}
        player={videoPlayer}
        playsInline
        ref={videoViewRef}
        style={styles.feedVideoMedia}
        surfaceType="textureView"
      />
      <Pressable
        accessibilityLabel={isPlaying ? "Pausar video" : "Reproduzir video"}
        accessibilityRole="button"
        onPress={togglePlayback}
        style={styles.feedVideoTapTarget}
      >
        {!isPlaying ? (
          <View
            style={[
              styles.feedVideoPlayCircle,
              styles.feedVideoPlaybackPlay,
              { backgroundColor: accent }
            ]}
          >
            <Play color={onAccent} fill={onAccent} size={24} />
          </View>
        ) : null}
      </Pressable>
      <View style={styles.feedVideoFloatingControls}>
        <Pressable
          accessibilityLabel="Abrir video em tela cheia"
          accessibilityRole="button"
          onPress={openFullscreen}
          style={styles.feedVideoControlButton}
        >
          <Expand color="#FFFFFF" size={20} />
        </Pressable>
        {hasAudio ? (
          <View style={styles.feedVideoVolumeControl}>
            <Pressable
              accessibilityLabel={
                isVolumeControlVisible
                  ? "Fechar controle de volume"
                  : "Abrir controle de volume"
              }
              accessibilityRole="button"
              onPress={() =>
                setIsVolumeControlVisible((current) => !current)
              }
              style={styles.feedVideoControlButton}
            >
              {muted || effectiveVolume === 0 ? (
                <VolumeX color="#FFFFFF" size={20} />
              ) : (
                <Volume2 color="#FFFFFF" size={20} />
              )}
            </Pressable>
            {isVolumeControlVisible ? (
              <View style={styles.feedVideoVolumeSlider}>
                <Pressable
                  accessibilityActions={[
                    { label: "Aumentar volume", name: "increment" },
                    { label: "Diminuir volume", name: "decrement" }
                  ]}
                  accessibilityLabel="Volume do video"
                  accessibilityRole="adjustable"
                  accessibilityValue={{
                    max: 100,
                    min: 0,
                    now: Math.round(effectiveVolume * 100),
                    text: `${Math.round(effectiveVolume * 100)}%`
                  }}
                  onAccessibilityAction={(event) => {
                    if (event.nativeEvent.actionName === "increment") {
                      setVolumeRef.current(effectiveVolume + 0.1);
                    }

                    if (event.nativeEvent.actionName === "decrement") {
                      setVolumeRef.current(effectiveVolume - 0.1);
                    }
                  }}
                  onLayout={(event) => {
                    const nextHeight = event.nativeEvent.layout.height;

                    volumeTrackHeightRef.current = nextHeight;
                    setVolumeTrackHeight(nextHeight);
                  }}
                  onPress={(event) => {
                    const locationY = getPointerLocationY(event.nativeEvent);

                    if (locationY !== null) {
                      setVolumeFromOffsetRef.current(locationY);
                    }
                  }}
                  style={styles.feedVideoVolumePressable}
                  {...volumePanResponder.panHandlers}
                >
                  <View
                    pointerEvents="none"
                    style={styles.feedVideoVolumeTrack}
                  >
                    <View
                      style={[
                        styles.feedVideoVolumeFill,
                        { height: `${effectiveVolume * 100}%` }
                      ]}
                    />
                  </View>
                  <View
                    pointerEvents="none"
                    style={[
                      styles.feedVideoVolumeThumb,
                      { bottom: volumeThumbOffset }
                    ]}
                  />
                </Pressable>
              </View>
            ) : null}
          </View>
        ) : null}
      </View>
      {isWide ? (
        <View pointerEvents="none" style={styles.feedVideoCaptionStrip}>
          <Text
            numberOfLines={1}
            style={[styles.feedVideoCaption, { color: colors.onPrimary }]}
          >
            {caption}
          </Text>
          <Text style={[styles.feedVideoDuration, { color: colors.onPrimary }]}>
            {formatPlaybackTime(safeCurrentTime)} / {totalTimeLabel}
          </Text>
        </View>
      ) : null}
      <View
        onLayout={(event) => {
          const nextWidth = event.nativeEvent.layout.width;
          seekTrackWidthRef.current = nextWidth;
          setSeekTrackWidth(nextWidth);
        }}
        style={[
          styles.feedVideoSeekControl,
          !isWide ? styles.feedVideoSeekControlCompact : null
        ]}
        {...seekPanResponder.panHandlers}
      >
        <Pressable
          accessibilityActions={[
            { label: "Avancar 5 segundos", name: "increment" },
            { label: "Voltar 5 segundos", name: "decrement" }
          ]}
          accessibilityLabel="Posicao do video"
          accessibilityRole="adjustable"
          accessibilityValue={{
            max: Math.max(0, Math.round(playbackDuration)),
            min: 0,
            now: Math.max(0, Math.round(safeCurrentTime)),
            text: `${formatPlaybackTime(safeCurrentTime)} de ${totalTimeLabel}`
          }}
          onAccessibilityAction={(event) => {
            if (event.nativeEvent.actionName === "increment") {
              seekToTimeRef.current(safeCurrentTime + 5);
            }

            if (event.nativeEvent.actionName === "decrement") {
              seekToTimeRef.current(safeCurrentTime - 5);
            }
          }}
          onPress={(event) => {
            const locationX = getPointerLocationX(event.nativeEvent);

            if (locationX !== null) {
              seekToOffsetRef.current(locationX);
            }
          }}
          style={styles.feedVideoSeekPressable}
        >
          <View
            pointerEvents="none"
            style={[
              styles.feedVideoScrubberTrack,
              { backgroundColor: trackColor }
            ]}
          >
            <View
              style={[
                styles.feedVideoScrubberFill,
                {
                  backgroundColor: accent,
                  width: `${playbackProgress * 100}%`
                }
              ]}
            />
          </View>
          <View
            pointerEvents="none"
            style={[styles.feedVideoScrubberThumb, { left: thumbOffset }]}
          />
        </Pressable>
      </View>
    </View>
  );
}

function PlayerCard({
  onPress,
  palette,
  player
}: {
  onPress: () => void;
  palette: CardPalette;
  player: Player;
}) {
  const evaluation = player.evaluation;

  if (!evaluation) {
    return null;
  }

  const progress = Math.min(evaluation.funded / evaluation.fundingGoal, 1);
  const scoreColor = getScoreColor(evaluation.score);

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.card,
        { backgroundColor: palette.card, borderColor: palette.border }
      ]}
    >
      <View
        style={[
          styles.videoPreview,
          { backgroundColor: palette.media, borderBottomColor: palette.border }
        ]}
      >
        <View style={[styles.playButton, { backgroundColor: palette.accent }]}>
          <Text style={[styles.playText, { color: palette.onAccent }]}>PLAY</Text>
        </View>
        <View style={[styles.paletteBadge, { borderColor: palette.border }]}>
          <Text style={[styles.paletteBadgeText, { color: palette.accent }]}>
            NEXTSTAR
          </Text>
        </View>
        <View style={styles.videoMeta}>
          <Text style={[styles.videoTitle, { color: palette.text }]}>
            {player.videoTitle}
          </Text>
          <Text style={[styles.videoLength, { color: palette.text }]}>
            {player.videoLength}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.cardTopRow}>
          <View style={styles.playerTitleBlock}>
            <Text style={[styles.playerName, { color: palette.text }]}>
              {player.name}
            </Text>
            <Text style={[styles.playerMeta, { color: palette.muted }]}>
              {player.age} anos | {player.position} | {player.city}
            </Text>
          </View>
          <View style={[styles.scoreBadge, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreValue, { color: scoreColor }]}>
              {evaluation.score}
            </Text>
            <Text style={[styles.scoreLabel, { color: palette.muted }]}>
              score
            </Text>
          </View>
        </View>

        <Text style={[styles.highlight, { color: palette.text }]}>
          {player.highlight}
        </Text>

        <View style={styles.cardMetricRow}>
          {evaluation.metrics.slice(0, 3).map((metric) => (
            <View
              key={metric.label}
              style={[
                styles.cardMetric,
                {
                  backgroundColor: palette.accentSoft,
                  borderColor: palette.border
                }
              ]}
            >
              <Text style={[styles.cardMetricValue, { color: palette.accent }]}>
                {metric.value}
              </Text>
              <Text style={[styles.cardMetricLabel, { color: palette.muted }]}>
                {metric.label}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.tagRow}>
          {player.tags.map((tag) => (
            <View
              key={tag}
              style={[
                styles.tag,
                { backgroundColor: palette.tagBackground, borderColor: palette.border }
              ]}
            >
              <Text style={[styles.tagText, { color: palette.accent }]}>{tag}</Text>
            </View>
          ))}
        </View>

        <View style={styles.progressLabelRow}>
          <Text style={[styles.progressText, { color: palette.muted }]}>
            {formatBRL(evaluation.funded)}
          </Text>
          <Text style={[styles.progressText, { color: palette.muted }]}>
            {formatBRL(evaluation.fundingGoal)}
          </Text>
        </View>
        <View
          style={[styles.progressTrack, { backgroundColor: palette.progressTrack }]}
        >
          <View
            style={[
              styles.progressFill,
              {
                backgroundColor: palette.accent,
                width: `${progress * 100}%`
              }
            ]}
          />
        </View>
      </View>
    </Pressable>
  );
}

function PlayerDetail({
  canInvest,
  fund,
  onBack,
  onInvest,
  player,
  profileVideos,
  walletBalance
}: {
  canInvest: boolean;
  fund?: AthleteFund;
  onBack: () => void;
  onInvest: (player: Player, amount: number) => void;
  player: Player;
  profileVideos: Player[];
  walletBalance: number;
}) {
  const [activeVideo, setActiveVideo] = useState(player);
  const palette = getCardPaletteFromId(activeVideo.id);
  const evaluation = activeVideo.evaluation;
  const scoreColor = evaluation
    ? getScoreColor(evaluation.score)
    : colors.muted;
  const [amountText, setAmountText] = useState(
    fund ? String(fund.minimumContribution) : ""
  );
  const amount = Number(amountText.replace(/\D/g, "")) || 0;
  const remainingAmount = fund
    ? Math.max(0, fund.goalAmount - fund.fundedAmount)
    : 0;
  const fundingProgress = fund
    ? Math.min(fund.fundedAmount / fund.goalAmount, 1)
    : 0;
  const hasMinimumTicket = fund
    ? amount >= fund.minimumContribution && amount <= remainingAmount
    : false;
  const hasAvailableBalance = amount <= walletBalance;
  const canSubmitInvestment = Boolean(
    fund &&
      fund.status === "Captando" &&
      canInvest &&
      hasMinimumTicket &&
      hasAvailableBalance
  );

  useEffect(() => {
    setActiveVideo(player);
  }, [player]);

  return (
    <View style={styles.playerDetailShell}>
      <ScrollView contentContainerStyle={styles.detailContent}>
      {activeVideo.isDemo ? (
        <View style={styles.demoNotice}>
          <Text style={styles.demoNoticeTitle}>Perfil demonstrativo</Text>
          <Text style={styles.demoNoticeBody}>
            O video e os dados deste perfil sao exclusivamente demonstrativos.
          </Text>
        </View>
      ) : null}

      <View
        style={[
          styles.detailVideo,
          {
            backgroundColor: palette.media,
            borderColor: palette.border,
            borderWidth: 1
          }
        ]}
      >
        <DetailVideoPlayback
          key={activeVideo.id}
          uri={activeVideo.videoUri}
        />
      </View>

      <View style={styles.detailTitleRow}>
        <View style={styles.detailTitleBlock}>
          <Text style={styles.detailName}>{player.name}</Text>
          <Text style={styles.detailMeta}>
            {player.age} anos | {player.position} | {player.club}
          </Text>
        </View>
        {evaluation ? (
          <View style={[styles.scoreBadge, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreValue, { color: scoreColor }]}>
              {evaluation.score}
            </Text>
            <Text style={[styles.scoreLabel, { color: palette.muted }]}>score</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.profileVideosSection}>
        <View style={styles.profileVideosHeader}>
          <Text style={styles.sectionTitle}>Videos publicados</Text>
          <Text style={styles.profileVideosCount}>
            {profileVideos.length} {profileVideos.length === 1 ? "video" : "videos"}
          </Text>
        </View>
        <ScrollView
          contentContainerStyle={styles.profileVideosRail}
          horizontal
          showsHorizontalScrollIndicator={false}
        >
          {profileVideos.map((video) => (
            <ProfileVideoCard
              isSelected={video.id === activeVideo.id}
              key={video.id}
              onPress={() => setActiveVideo(video)}
              video={video}
            />
          ))}
        </ScrollView>
      </View>

      {evaluation ? (
        <View style={styles.metricGrid}>
        {evaluation.metrics.map((metric) => (
          <View
            key={metric.label}
            style={[
              styles.metricBox,
              { backgroundColor: palette.accentSoft, borderColor: palette.border }
            ]}
          >
            <Text style={[styles.metricValue, { color: palette.accent }]}>
              {metric.value}
            </Text>
            <Text style={[styles.metricLabel, { color: palette.muted }]}>
              {metric.label}
            </Text>
          </View>
        ))}
        </View>
      ) : null}

      <View style={styles.infoPanel}>
        <Text style={styles.sectionTitle}>Principal destaque</Text>
        <Text style={styles.bodyText}>{activeVideo.highlight}</Text>
      </View>

      <View style={styles.infoPanel}>
        <Text style={styles.sectionTitle}>
          {activeVideo.isDemo ? "Objetivo do video" : "Objetivo do aporte"}
        </Text>
        <Text style={styles.bodyText}>{activeVideo.objective}</Text>
      </View>

      {evaluation ? (
      <View style={styles.infoPanel}>
        <Text style={styles.sectionTitle}>Avaliacao</Text>
        <Text style={styles.bodyText}>{evaluation.thesis}</Text>
      </View>
      ) : null}

      {fund ? (
        <View style={styles.infoPanel}>
          <View style={styles.fundTitleRow}>
            <Text style={styles.sectionTitle}>Bolsa do atleta</Text>
            <Text
              style={[
                styles.fundStatus,
                fund.status === "Concluida" ? styles.fundStatusComplete : null
              ]}
            >
              {fund.status}
            </Text>
          </View>
          <Text style={styles.bodyText}>
            A bolsa pertence ao perfil de {player.name}. O video acima apenas
            demonstra o talento do atleta.
          </Text>

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
                { width: `${fundingProgress * 100}%` }
              ]}
            />
          </View>
          <View style={styles.fundStatsRow}>
            <View style={styles.fundStatItem}>
              <Text style={styles.fundStatValue}>{formatBRL(remainingAmount)}</Text>
              <Text style={styles.fundStatLabel}>restante</Text>
            </View>
            <View style={styles.fundStatItem}>
              <Text style={styles.fundStatValue}>
                {formatBRL(fund.minimumContribution)}
              </Text>
              <Text style={styles.fundStatLabel}>aporte minimo</Text>
            </View>
          </View>

          {fund.status === "Concluida" ? (
            <View style={styles.fundCompleteNotice}>
              <Text style={styles.fundCompleteNoticeTitle}>
                Investimento concluido
              </Text>
              <Text style={styles.fundCompleteNoticeBody}>
                Meta atingida. Este atleta esta em busca de contratantes.
              </Text>
            </View>
          ) : (
            <>
              <Text style={styles.availableBalanceText}>
                Saldo disponivel: {formatBRL(walletBalance)}
              </Text>
              <View style={styles.inputRow}>
                <Text style={styles.currencyPrefix}>R$</Text>
                <TextInput
                  keyboardType="number-pad"
                  onChangeText={setAmountText}
                  placeholder="Valor"
                  placeholderTextColor={colors.muted}
                  style={styles.amountInput}
                  value={amountText}
                />
              </View>
              <Text style={styles.fundCustodyNote}>
                Transferencia simulada para custodia da bolsa. O atleta pode
                acompanhar a captacao, mas nao pode sacar os recursos.
              </Text>
              {!hasMinimumTicket ? (
                <Text style={styles.validationText}>
                  Informe entre {formatBRL(fund.minimumContribution)} e{" "}
                  {formatBRL(remainingAmount)}.
                </Text>
              ) : null}
              {!canInvest ? (
                <Text style={styles.validationText}>
                  Aportes estao disponiveis apenas para contas de usuario.
                </Text>
              ) : null}
              {!hasAvailableBalance ? (
                <Text style={styles.validationText}>
                  Saldo insuficiente. Use o botao Depositar na Carteira.
                </Text>
              ) : null}
              <Pressable
                disabled={!canSubmitInvestment}
                onPress={() => onInvest(player, amount)}
                style={[
                  styles.primaryButton,
                  !canSubmitInvestment ? styles.primaryButtonDisabled : null
                ]}
              >
                <Text style={styles.primaryButtonText}>
                  Transferir para a bolsa
                </Text>
              </Pressable>
            </>
          )}
        </View>
      ) : (
        <View style={styles.infoPanel}>
          <Text style={styles.sectionTitle}>Bolsa do atleta</Text>
          <Text style={styles.bodyText}>
            Este perfil ainda nao abriu uma bolsa de investimento.
          </Text>
        </View>
      )}
      </ScrollView>
      <View style={styles.detailFixedHud}>
        <Pressable
          accessibilityLabel="Voltar ao feed"
          accessibilityRole="button"
          hitSlop={6}
          onPress={onBack}
          style={styles.detailHudBackButton}
        >
          <ArrowLeft color={colors.primary} size={25} strokeWidth={2.2} />
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

function DetailVideoPlayback({ uri }: { uri: string | number }) {
  const detailPlayer = useVideoPlayer(uri, (player) => {
    player.loop = true;
  });

  return (
    <VideoView
      allowsFullscreen
      contentFit="contain"
      nativeControls
      player={detailPlayer}
      playsInline
      style={styles.detailVideoMedia}
      surfaceType="textureView"
    />
  );
}

function ProfileVideoCard({
  isSelected,
  onPress,
  video
}: {
  isSelected: boolean;
  onPress: () => void;
  video: Player;
}) {
  const previewPlayer = useVideoPlayer(video.videoUri, (player) => {
    player.loop = false;
    player.muted = true;
  });

  return (
    <Pressable
      accessibilityLabel={`Reproduzir ${video.videoTitle}`}
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.profileVideoCard,
        isSelected ? styles.profileVideoCardSelected : null,
        pressed ? styles.buttonPressed : null
      ]}
    >
      <View style={styles.profileVideoThumbnail}>
        <VideoView
          contentFit="cover"
          nativeControls={false}
          player={previewPlayer}
          pointerEvents="none"
          style={styles.profileVideoThumbnailMedia}
          surfaceType="textureView"
        />
        <View style={styles.profileVideoPlayIcon}>
          <Play color={colors.onPrimary} fill={colors.onPrimary} size={16} />
        </View>
      </View>
      <Text numberOfLines={2} style={styles.profileVideoTitle}>
        {video.videoTitle}
      </Text>
      <Text style={styles.profileVideoDuration}>
        {video.videoLength || "Video aprovado"}
      </Text>
    </Pressable>
  );
}

function SubmitVideoScreen({
  onSubmit,
  submissions,
  user
}: {
  onSubmit: (submission: VideoSubmission) => void;
  submissions: VideoSubmission[];
  user: AppUser;
}) {
  const { width } = useWindowDimensions();
  const isCompact = USE_CENTERED_WEB_LAYOUT || width < 520;
  const [draft, setDraft] = useState<SubmissionDraft>({
    ...emptySubmissionDraft,
    athleteName: user.name
  });
  const [selectedVideo, setSelectedVideo] = useState<SelectedVideoMeta | null>(
    null
  );
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);
  const submissionToastProgress = useRef(new Animated.Value(0)).current;
  const age = Number(draft.age.replace(/\D/g, ""));
  const needsGuardianConsent = age > 0 && age < 18;
  const hasRemoteVideoLink = /^https?:\/\/\S+$/i.test(draft.videoLink.trim());
  const hasVideoSource = selectedVideo !== null || hasRemoteVideoLink;
  const submissionIssues = [
    draft.athleteName.trim().length >= 3
      ? null
      : "Informe o nome completo do atleta.",
    age >= 12 ? null : "Informe uma idade valida a partir de 12 anos.",
    draft.position.trim().length >= 2 ? null : "Informe a posicao do atleta.",
    draft.city.trim().length >= 2 ? null : "Informe a cidade do atleta.",
    draft.videoTitle.trim().length >= 4
      ? null
      : "O titulo do video precisa ter pelo menos 4 caracteres.",
    hasVideoSource ? null : "Selecione um video ou informe um link direto.",
    draft.highlight.trim().length >= 4
      ? null
      : "Descreva o principal destaque com pelo menos 4 caracteres.",
    !needsGuardianConsent || draft.hasGuardianConsent
      ? null
      : "Confirme a autorizacao do responsavel legal."
  ].filter((issue): issue is string => Boolean(issue));
  const canSubmit = submissionIssues.length === 0;

  useEffect(() => {
    if (!lastSubmittedId) {
      return;
    }

    submissionToastProgress.setValue(0);
    const toastAnimation = Animated.sequence([
      Animated.timing(submissionToastProgress, {
        duration: 220,
        easing: Easing.out(Easing.cubic),
        toValue: 1,
        useNativeDriver: true
      }),
      Animated.delay(2460),
      Animated.timing(submissionToastProgress, {
        duration: 320,
        easing: Easing.in(Easing.cubic),
        toValue: 0,
        useNativeDriver: true
      })
    ]);

    toastAnimation.start(({ finished }) => {
      if (finished) {
        setLastSubmittedId((current) =>
          current === lastSubmittedId ? null : current
        );
      }
    });

    return () => toastAnimation.stop();
  }, [lastSubmittedId, submissionToastProgress]);

  function updateDraft(field: keyof SubmissionDraft, value: string | boolean) {
    setDraft((current) => ({ ...current, [field]: value }));
  }

  async function pickVideoFromLibrary() {
    try {
      const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permission.granted) {
        Alert.alert(
          "Permissao necessaria",
          "Autorize o acesso aos videos para escolher um lance da galeria."
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: false,
        mediaTypes: ["videos"],
        quality: 1
      });

      if (result.canceled || !result.assets[0]) {
        return;
      }

      const asset = result.assets[0];
      const fileName = asset.fileName || "video-selecionado.mp4";

      if (asset.type && asset.type !== "video") {
        Alert.alert("Arquivo invalido", "Escolha um arquivo de video.");
        return;
      }

      setSelectedVideo({
        durationMs: asset.duration ?? undefined,
        fileName,
        fileSize: asset.fileSize
      });
      setDraft((current) => ({
        ...current,
        videoLink: asset.uri,
        videoTitle:
          current.videoTitle.trim() || getVideoTitleFromFileName(fileName)
      }));
      setLastSubmittedId(null);
    } catch {
      Alert.alert(
        "Nao foi possivel abrir a galeria",
        "Tente novamente ou use um link direto para o arquivo de video."
      );
    }
  }

  function removeSelectedVideo() {
    setSelectedVideo(null);
    updateDraft("videoLink", "");
  }

  function submitDraft() {
    const id = `video-${Date.now()}`;

    onSubmit({
      id,
      userId: user.id,
      athleteName: draft.athleteName.trim(),
      age,
      city: draft.city.trim(),
      position: draft.position.trim(),
      club: draft.club.trim() || "Sem clube informado",
      videoTitle: draft.videoTitle.trim(),
      videoLink: draft.videoLink.trim(),
      videoDurationMs: selectedVideo?.durationMs,
      videoFileName: selectedVideo?.fileName,
      videoFileSize: selectedVideo?.fileSize,
      highlight: draft.highlight.trim(),
      goals: draft.goals.trim() || "Objetivos ainda nao informados",
      hasGuardianConsent: draft.hasGuardianConsent,
      status: "Em revisao",
      submittedAt: new Date().toISOString()
    });
    Keyboard.dismiss();
    setLastSubmittedId(id);
    setSelectedVideo(null);
    setDraft({
      ...emptySubmissionDraft,
      athleteName: user.name
    });
  }

  return (
    <View style={styles.submitScreen}>
      <ScrollView
        contentContainerStyle={[
          styles.screenContent,
          isCompact ? styles.screenContentCompact : null
        ]}
      >
      <View style={styles.submitHero}>
        <Text style={styles.heroKicker}>Area do atleta</Text>
        <Text style={styles.heroTitle}>Envie seu video para analise.</Text>
        <Text style={styles.heroBody}>
          O admin aprova, reprova ou pede ajustes. So oportunidades aprovadas
          entram no feed dos investidores.
        </Text>
      </View>

      <View
        style={[
          styles.infoPanel,
          isCompact ? styles.submitInfoPanelCompact : null
        ]}
      >
        <Text style={styles.sectionTitle}>Dados do atleta</Text>
        <LabeledInput
          label="Nome do atleta"
          onChangeText={(value) => updateDraft("athleteName", value)}
          placeholder="Nome completo"
          value={draft.athleteName}
        />
        <View style={styles.twoColumnRow}>
          <View style={styles.columnField}>
            <LabeledInput
              keyboardType="number-pad"
              label="Idade"
              onChangeText={(value) => updateDraft("age", value)}
              placeholder="17"
              value={draft.age}
            />
          </View>
          <View style={styles.columnField}>
            <LabeledInput
              label="Posicao"
              onChangeText={(value) => updateDraft("position", value)}
              placeholder="Ponta"
              value={draft.position}
            />
          </View>
        </View>
        <LabeledInput
          label="Cidade"
          onChangeText={(value) => updateDraft("city", value)}
          placeholder="Cidade, UF"
          value={draft.city}
        />
        <LabeledInput
          label="Clube ou projeto"
          onChangeText={(value) => updateDraft("club", value)}
          placeholder="Clube atual"
          value={draft.club}
        />
      </View>

      <View
        style={[
          styles.infoPanel,
          isCompact ? styles.submitInfoPanelCompact : null
        ]}
      >
        <Text style={styles.sectionTitle}>Video</Text>
        <LabeledInput
          label="Titulo do video"
          onChangeText={(value) => updateDraft("videoTitle", value)}
          placeholder="Melhores lances"
          value={draft.videoTitle}
        />
        <Pressable
          accessibilityLabel="Escolher video da galeria"
          accessibilityRole="button"
          onPress={pickVideoFromLibrary}
          style={({ pressed }) => [
            styles.videoPickerButton,
            pressed ? styles.feedReelButtonPressed : null
          ]}
        >
          <Upload color={colors.primary} size={21} />
          <Text style={styles.videoPickerButtonText}>
            Escolher video da galeria
          </Text>
        </Pressable>
        <Text style={styles.videoPickerHint}>
          Para o primeiro teste, prefira um MP4 vertical de ate 60 segundos.
        </Text>

        {selectedVideo ? (
          <View style={styles.selectedVideoPanel}>
            <View style={styles.selectedVideoTextBlock}>
              <Text numberOfLines={1} style={styles.selectedVideoName}>
                {selectedVideo.fileName}
              </Text>
              <Text style={styles.selectedVideoMeta}>
                {[
                  formatVideoDuration(selectedVideo.durationMs),
                  formatVideoFileSize(selectedVideo.fileSize)
                ]
                  .filter(Boolean)
                  .join(" | ") || "Video pronto para visualizar"}
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Remover video selecionado"
              accessibilityRole="button"
              onPress={removeSelectedVideo}
              style={styles.removeVideoButton}
            >
              <X color={colors.danger} size={19} />
            </Pressable>
          </View>
        ) : (
          <>
            <View style={styles.videoSourceDivider}>
              <View style={styles.videoSourceDividerLine} />
              <Text style={styles.videoSourceDividerText}>ou</Text>
              <View style={styles.videoSourceDividerLine} />
            </View>
            <LabeledInput
              autoCapitalize="none"
              label="Link direto do video"
              onChangeText={(value) => {
                setSelectedVideo(null);
                updateDraft("videoLink", value);
              }}
              placeholder="https://.../video.mp4"
              value={draft.videoLink}
            />
          </>
        )}

        {hasVideoSource ? (
          <SubmissionVideoPreview uri={draft.videoLink.trim()} />
        ) : null}
        <LabeledInput
          label="Principal destaque"
          multiline
          onChangeText={(value) => updateDraft("highlight", value)}
          placeholder="Descreva o lance, qualidade ou competicao"
          value={draft.highlight}
        />
        <LabeledInput
          label="Objetivo do aporte"
          multiline
          onChangeText={(value) => updateDraft("goals", value)}
          placeholder="Ex: viagem, material, avaliacao, treino"
          value={draft.goals}
        />

        {needsGuardianConsent ? (
          <Pressable
            onPress={() =>
              updateDraft("hasGuardianConsent", !draft.hasGuardianConsent)
            }
            style={styles.checkRow}
          >
            <View
              style={[
                styles.checkBox,
                draft.hasGuardianConsent ? styles.checkBoxActive : null
              ]}
            >
              {draft.hasGuardianConsent ? (
                <Check color={colors.onPrimary} size={17} strokeWidth={3} />
              ) : null}
            </View>
            <Text style={styles.checkText}>
              Confirmo que o responsavel legal autorizou o envio.
            </Text>
          </Pressable>
        ) : null}

        {submissionIssues.length > 0 ? (
          <View style={styles.submissionValidationPanel}>
            <Text style={styles.submissionValidationTitle}>
              Revise antes de enviar:
            </Text>
            {submissionIssues.map((issue) => (
              <View key={issue} style={styles.submissionValidationRow}>
                <Text style={styles.submissionValidationMarker}>-</Text>
                <Text style={styles.submissionValidationText}>{issue}</Text>
              </View>
            ))}
          </View>
        ) : null}

        <Pressable
          disabled={!canSubmit}
          onPress={submitDraft}
          style={[
            styles.primaryButton,
            !canSubmit ? styles.primaryButtonDisabled : null
          ]}
        >
          <Send color={colors.onPrimary} size={19} />
          <Text style={styles.primaryButtonText}>Enviar para moderacao</Text>
        </Pressable>
      </View>

        <SubmissionList submissions={submissions} />
      </ScrollView>

      {lastSubmittedId ? (
        <View pointerEvents="none" style={styles.submissionToastLayer}>
          <Animated.View
            accessibilityLiveRegion="polite"
            accessibilityRole="alert"
            style={[
              styles.submissionToast,
              { width: Math.min(width - 28, 440) },
              {
                opacity: submissionToastProgress,
                transform: [
                  {
                    translateY: submissionToastProgress.interpolate({
                      inputRange: [0, 1],
                      outputRange: [18, 0]
                    })
                  }
                ]
              }
            ]}
          >
            <View style={styles.submissionToastIcon}>
              <Check color={colors.primary} size={19} strokeWidth={3} />
            </View>
            <View style={styles.submissionToastTextBlock}>
              <Text style={styles.submissionToastTitle}>Video enviado</Text>
              <Text style={styles.submissionToastBody}>
                Recebido. Agora ele esta em revisao.
              </Text>
            </View>
          </Animated.View>
        </View>
      ) : null}
    </View>
  );
}

function SubmissionVideoPreview({
  compact = false,
  uri
}: {
  compact?: boolean;
  uri: string;
}) {
  const previewPlayer = useVideoPlayer(uri, (player) => {
    player.loop = true;
  });

  return (
    <View
      style={[
        styles.submissionVideoPreview,
        compact ? styles.submissionVideoPreviewCompact : null
      ]}
    >
      <VideoView
        allowsFullscreen
        contentFit="contain"
        nativeControls
        player={previewPlayer}
        playsInline
        style={styles.submissionVideoPreviewMedia}
        surfaceType="textureView"
      />
    </View>
  );
}

function AdminScreen({
  onReview,
  submissions
}: {
  onReview: (
    submissionId: string,
    status: VideoSubmissionStatus,
    reviewNote: string
  ) => void;
  submissions: VideoSubmission[];
}) {
  const reviewQueue = submissions.filter(
    (item) => item.status === "Em revisao"
  );
  const pending = reviewQueue.length;
  const approved = submissions.filter((item) => item.status === "Aprovado").length;
  const changes = submissions.filter(
    (item) => item.status === "Ajustes solicitados"
  ).length;

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <View style={styles.adminHero}>
        <Text style={styles.heroKicker}>Painel admin</Text>
        <Text style={styles.heroTitle}>Moderacao de videos.</Text>
        <Text style={styles.heroBody}>
          Revise os envios dos atletas e publique somente os videos que atendem
          aos criterios da plataforma.
        </Text>
      </View>

      <View style={styles.metricGrid}>
        <SummaryMetric label="Pendentes" value={String(pending)} />
        <SummaryMetric label="Aprovados" value={String(approved)} />
        <SummaryMetric label="Ajustes" value={String(changes)} />
      </View>

      <View style={styles.infoPanel}>
        <Text style={styles.sectionTitle}>Fila de revisao</Text>
        {reviewQueue.length === 0 ? (
          <Text style={styles.bodyText}>Nenhuma solicitacao pendente.</Text>
        ) : (
          reviewQueue.map((submission) => (
            <View key={submission.id} style={styles.adminItem}>
              <View style={styles.submissionTopRow}>
                <View style={styles.submissionTextBlock}>
                  <Text style={styles.submissionTitle}>
                    {submission.athleteName}
                  </Text>
                  <Text style={styles.submissionMeta}>
                    {submission.age} anos | {submission.position} |{" "}
                    {submission.city}
                  </Text>
                </View>
                <StatusPill status={submission.status} />
              </View>

              {submission.videoLink ? (
                <SubmissionVideoPreview compact uri={submission.videoLink} />
              ) : null}
              <Text style={styles.submissionBody}>{submission.highlight}</Text>
              <Text style={styles.adminFinePrint}>
                Video: {submission.videoTitle} | Consentimento:{" "}
                {submission.hasGuardianConsent ? "Sim" : "Nao aplicavel"}
              </Text>
              {submission.reviewNote ? (
                <Text style={styles.reviewNote}>{submission.reviewNote}</Text>
              ) : null}

              <View style={styles.actionRow}>
                <Pressable
                  onPress={() =>
                    onReview(
                      submission.id,
                      "Aprovado",
                      "Aprovado pela moderacao e publicado no feed."
                    )
                  }
                  style={[styles.smallButton, styles.approveButton]}
                >
                  <Check color={colors.onPrimary} size={17} />
                  <Text style={styles.smallButtonText}>Aprovar</Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    onReview(
                      submission.id,
                      "Ajustes solicitados",
                      "Pedir video com mais contexto de jogo e dados do responsavel."
                    )
                  }
                  style={[styles.smallButton, styles.adjustButton]}
                >
                  <RefreshCw color={colors.onPrimary} size={16} />
                  <Text style={styles.smallButtonTextDark}>Ajustes</Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    onReview(
                      submission.id,
                      "Reprovado",
                      "Reprovado por falta de informacoes suficientes."
                    )
                  }
                  style={[styles.smallButton, styles.rejectButton]}
                >
                  <X color={colors.onPrimary} size={17} />
                  <Text style={styles.smallButtonText}>Reprovar</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  );
}

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.metricBox}>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </View>
  );
}

function SubmissionList({
  submissions
}: {
  submissions: VideoSubmission[];
}) {
  return (
    <View style={styles.infoPanel}>
      <Text style={styles.sectionTitle}>Meus envios</Text>
      {submissions.length === 0 ? (
        <Text style={styles.bodyText}>
          Nenhum video enviado por esta conta ainda.
        </Text>
      ) : (
        submissions.map((submission) => (
          <View key={submission.id} style={styles.submissionItem}>
            <View style={styles.submissionTopRow}>
              <View style={styles.submissionTextBlock}>
                <Text style={styles.submissionTitle}>
                  {submission.videoTitle}
                </Text>
                <Text style={styles.submissionMeta}>
                  {submission.position} | {submission.city}
                </Text>
              </View>
              <StatusPill status={submission.status} />
            </View>
            <Text style={styles.submissionBody}>{submission.highlight}</Text>
            {submission.reviewNote ? (
              <Text style={styles.reviewNote}>{submission.reviewNote}</Text>
            ) : null}
          </View>
        ))
      )}
    </View>
  );
}

function StatusPill({ status }: { status: VideoSubmissionStatus }) {
  const styleByStatus =
    status === "Aprovado"
      ? styles.statusApproved
      : status === "Reprovado"
        ? styles.statusRejected
        : status === "Ajustes solicitados"
          ? styles.statusAdjust
          : styles.statusReview;

  return (
    <View style={[styles.statusPill, styleByStatus]}>
      <Text style={styles.statusPillText}>{status}</Text>
    </View>
  );
}

function PortfolioScreen({
  balance,
  investments,
  onDeposit
}: {
  balance: number;
  investments: Investment[];
  onDeposit: (amount: number) => void;
}) {
  const { width } = useWindowDimensions();
  const [isDepositVisible, setIsDepositVisible] = useState(false);
  const isWide = !USE_CENTERED_WEB_LAYOUT && width >= 840;
  const totalInvested = investments.reduce((sum, item) => sum + item.amount, 0);
  const supportedAthletes = new Set(
    investments.map((investment) => investment.profileId)
  ).size;

  return (
    <>
      <ScrollView contentContainerStyle={styles.screenContent}>
        <View style={styles.summaryBand}>
          <View style={styles.summaryTopRow}>
            <Text style={styles.summaryLabel}>Saldo disponivel</Text>
            <Pressable
              accessibilityRole="button"
              onPress={() => setIsDepositVisible(true)}
              style={({ pressed }) => [
                styles.depositButton,
                pressed ? styles.buttonPressed : null
              ]}
            >
              <CircleDollarSign color={colors.onPrimary} size={18} />
              <Text style={styles.depositButtonText}>Depositar</Text>
            </Pressable>
          </View>
          <Text style={styles.summaryValue}>{formatBRL(balance)}</Text>
          <View style={styles.summaryInsightStrip}>
            <View style={styles.summaryInsightItem}>
              <Text style={styles.summaryInsightValue}>
                {formatBRL(totalInvested)}
              </Text>
              <Text style={styles.summaryInsightLabel}>reservado</Text>
            </View>
            <View style={styles.summaryInsightItem}>
              <Text style={styles.summaryInsightValue}>{investments.length}</Text>
              <Text style={styles.summaryInsightLabel}>reservas</Text>
            </View>
            <View style={styles.summaryInsightItem}>
              <Text style={styles.summaryInsightValue}>{supportedAthletes}</Text>
              <Text style={styles.summaryInsightLabel}>atletas</Text>
            </View>
          </View>
          <Text style={styles.summaryBody}>
            Saldo, depositos e reservas sao simulacoes locais. Nenhuma cobranca
            ou transferencia bancaria sera realizada.
          </Text>
        </View>

        <View style={isWide ? styles.portfolioDesktopGrid : null}>
          <View style={isWide ? styles.portfolioDesktopColumn : null}>
            <View style={styles.infoPanel}>
              <Text style={styles.sectionTitle}>Custodia da bolsa</Text>
              <Text style={styles.bodyText}>
                Cada aporte fica vinculado ao perfil do atleta. Nesta
                simulacao, o atleta acompanha a captacao, mas nao possui opcao
                de saque.
              </Text>
            </View>
          </View>

          <View style={isWide ? styles.portfolioDesktopColumn : null}>
            {investments.length === 0 ? (
              <View style={styles.emptyState}>
                <Text style={styles.emptyTitle}>Nenhuma reserva ainda</Text>
                <Text style={styles.emptyBody}>
                  Deposite saldo simulado e abra um perfil no feed para criar
                  uma reserva.
                </Text>
              </View>
            ) : (
              investments.map((investment) => {
                return (
                  <View key={investment.id} style={styles.portfolioItemBlock}>
                    <View style={styles.portfolioItemHeader}>
                      <View style={styles.submissionTextBlock}>
                        <Text style={styles.portfolioName}>
                          {investment.playerName}
                        </Text>
                        <Text style={styles.portfolioMeta}>
                          {investment.status}
                        </Text>
                      </View>
                      <View style={styles.portfolioNumbers}>
                        <Text style={styles.portfolioAmount}>
                          {formatBRL(investment.amount)}
                        </Text>
                        <Text style={styles.portfolioShare}>
                          Cota {formatPercent(investment.sharePercent)}
                        </Text>
                      </View>
                    </View>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </ScrollView>
      <DepositModal
        balance={balance}
        onClose={() => setIsDepositVisible(false)}
        onConfirm={onDeposit}
        visible={isDepositVisible}
      />
    </>
  );
}

function DepositModal({
  balance,
  onClose,
  onConfirm,
  visible
}: {
  balance: number;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  visible: boolean;
}) {
  const [amountText, setAmountText] = useState("");
  const amount = Number(amountText.replace(/\D/g, "")) || 0;
  const canDeposit = amount >= 10 && amount <= 100000;

  function closeModal() {
    setAmountText("");
    onClose();
  }

  function confirmDeposit() {
    if (!canDeposit) {
      return;
    }

    onConfirm(amount);
    closeModal();
  }

  return (
    <Modal
      animationType="fade"
      onRequestClose={closeModal}
      statusBarTranslucent
      transparent
      visible={visible}
    >
      <View style={styles.depositModalRoot}>
        <Pressable
          accessibilityLabel="Fechar deposito"
          onPress={closeModal}
          style={styles.depositModalBackdrop}
        />
        <View accessibilityViewIsModal style={styles.depositDialog}>
          <View style={styles.depositDialogHeader}>
            <View style={styles.depositDialogTitleBlock}>
              <Text style={styles.depositDialogTitle}>Depositar saldo</Text>
              <Text style={styles.depositDialogSubtitle}>
                Operacao demonstrativa, sem cobranca real.
              </Text>
            </View>
            <Pressable
              accessibilityLabel="Fechar"
              hitSlop={8}
              onPress={closeModal}
              style={styles.depositCloseButton}
            >
              <X color={colors.muted} size={20} />
            </Pressable>
          </View>

          <Text style={styles.depositBalanceLabel}>Saldo atual</Text>
          <Text style={styles.depositBalanceValue}>{formatBRL(balance)}</Text>

          <Text style={styles.inputLabel}>Valor do deposito</Text>
          <View style={styles.depositInputRow}>
            <Text style={styles.depositCurrencyPrefix}>R$</Text>
            <TextInput
              autoFocus
              keyboardType="number-pad"
              onChangeText={setAmountText}
              placeholder="0"
              placeholderTextColor={colors.muted}
              selectTextOnFocus
              style={styles.depositInput}
              value={amountText}
            />
          </View>

          <View style={styles.depositPresetRow}>
            {[50, 100, 250, 500].map((preset) => (
              <Pressable
                key={preset}
                onPress={() => setAmountText(String(preset))}
                style={[
                  styles.depositPresetButton,
                  amount === preset ? styles.depositPresetButtonActive : null
                ]}
              >
                <Text
                  style={[
                    styles.depositPresetText,
                    amount === preset ? styles.depositPresetTextActive : null
                  ]}
                >
                  {formatBRL(preset)}
                </Text>
              </Pressable>
            ))}
          </View>

          {amount > 0 && !canDeposit ? (
            <Text style={styles.validationText}>
              Informe um valor entre R$ 10 e R$ 100.000.
            </Text>
          ) : null}

          <View style={styles.depositDialogActions}>
            <Pressable onPress={closeModal} style={styles.depositCancelButton}>
              <Text style={styles.depositCancelText}>Cancelar</Text>
            </Pressable>
            <Pressable
              disabled={!canDeposit}
              onPress={confirmDeposit}
              style={[
                styles.depositConfirmButton,
                !canDeposit ? styles.primaryButtonDisabled : null
              ]}
            >
              <Text style={styles.depositConfirmText}>Confirmar deposito</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function ProfileScreen({
  fund,
  investments,
  onOpenFund,
  onSignOut,
  player,
  submissions,
  user
}: {
  fund?: AthleteFund;
  investments: Investment[];
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
          <View style={styles.profileStatusPill}>
            <Text style={styles.profileStatusText}>{user.kycStatus}</Text>
          </View>
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

      <Pressable
        accessibilityRole="button"
        onPress={onSignOut}
        style={styles.secondaryButton}
      >
        <LogOut color={colors.primary} size={18} />
        <Text style={styles.secondaryButtonText}>Sair da conta</Text>
      </Pressable>
      </ScrollView>
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

function LabeledInput({
  label,
  multiline,
  ...props
}: React.ComponentProps<typeof TextInput> & { label: string }) {
  return (
    <View style={styles.labeledInputBlock}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        multiline={multiline}
        placeholderTextColor={colors.muted}
        style={[styles.formInput, multiline ? styles.formInputMultiline : null]}
        textAlignVertical={multiline ? "top" : "center"}
        {...props}
      />
    </View>
  );
}

function BottomTabs({
  activeTab,
  onChange,
  role
}: {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
  role: UserRole;
}) {
  const tabs: Array<{
    id: Tab;
    label: string;
  }> =
    role === "Admin"
        ? [
            { id: "admin", label: "Admin" },
            { id: "feed", label: "Feed" },
            { id: "profile", label: "Perfil" }
          ]
        : [
            { id: "feed", label: "Feed" },
            { id: "submit", label: "Envio" },
            { id: "portfolio", label: "Carteira" },
            { id: "profile", label: "Perfil" }
          ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((item) => {
        const isActive = item.id === activeTab;
        const TabIcon =
          item.id === "submit"
            ? Upload
            : item.id === "admin"
              ? ShieldCheck
              : item.id === "portfolio"
                ? WalletCards
                : item.id === "profile"
                  ? UserRound
                  : Video;

        return (
          <Pressable
            accessibilityLabel={item.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            key={item.id}
            onPress={() => onChange(item.id)}
            style={[styles.tabButton, isActive ? styles.tabButtonActive : null]}
          >
            <TabIcon
              color={isActive ? colors.primary : colors.muted}
              size={22}
              strokeWidth={isActive ? 2.4 : 2}
            />
            <Text style={[styles.tabText, isActive ? styles.tabTextActive : null]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    alignItems: "center",
    backgroundColor: USE_CENTERED_WEB_LAYOUT
      ? colors.surfaceMuted
      : colors.background,
    flex: 1
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
    width: "100%",
    ...(USE_CENTERED_WEB_LAYOUT
      ? {
          borderLeftColor: colors.border,
          borderLeftWidth: 1,
          borderRightColor: colors.border,
          borderRightWidth: 1,
          maxWidth: 480,
          shadowColor: "#10261A",
          shadowOffset: { height: 0, width: 0 },
          shadowOpacity: 0.12,
          shadowRadius: 22
        }
      : {})
  },
  brandLaunch: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: "#F7FAF7",
    justifyContent: "center",
    paddingHorizontal: 36,
    zIndex: 100
  },
  brandLaunchLogo: {
    height: 230,
    maxWidth: 420,
    width: "86%"
  },
  keyboardView: {
    flex: 1
  },
  tabScene: {
    backgroundColor: colors.background,
    flex: 1,
    overflow: "hidden"
  },
  submitScreen: {
    flex: 1
  },
  screenBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    overflow: "hidden"
  },
  screenBackdropAccent: {
    backgroundColor: "rgba(247, 200, 75, 0.1)",
    borderColor: "rgba(247, 200, 75, 0.16)",
    borderRadius: 8,
    borderWidth: 1,
    height: "46%",
    position: "absolute",
    right: "-18%",
    top: "7%",
    transform: [{ rotate: "-7deg" }],
    width: "68%"
  },
  screenBackdropFrame: {
    borderColor: "rgba(255, 255, 255, 0.07)",
    borderRadius: 8,
    borderWidth: 1,
    bottom: "18%",
    left: "8%",
    position: "absolute",
    right: "8%",
    top: "12%"
  },
  screenBackdropLaneLeft: {
    borderColor: "rgba(247, 200, 75, 0.08)",
    borderRadius: 8,
    borderWidth: 1,
    height: "44%",
    left: "-14%",
    position: "absolute",
    top: "22%",
    width: "32%"
  },
  screenBackdropLaneRight: {
    borderColor: "rgba(247, 200, 75, 0.08)",
    borderRadius: 8,
    borderWidth: 1,
    height: "44%",
    position: "absolute",
    right: "-14%",
    top: "22%",
    width: "32%"
  },
  screenBackdropShade: {
    backgroundColor: "rgba(5, 5, 3, 0.78)",
    bottom: 0,
    height: "62%",
    left: 0,
    position: "absolute",
    right: 0
  },
  authShell: {
    backgroundColor: colors.background,
    flex: 1,
    overflow: "hidden"
  },
  authContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
    maxWidth: 520,
    alignSelf: "center",
    width: "100%"
  },
  authCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 2,
    padding: 16,
    shadowColor: "#10261A",
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    width: "100%"
  },
  authTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8
  },
  authPanelKicker: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  authModePill: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  authModeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  authLogo: {
    alignSelf: "center",
    height: 138,
    marginBottom: 2,
    width: "100%"
  },
  authLogoCompact: {
    height: 122
  },
  authBrand: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0,
    textAlign: "center"
  },
  authEyebrow: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900",
    marginTop: 2,
    textAlign: "center",
    textTransform: "uppercase"
  },
  authTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 10,
    marginBottom: 10
  },
  authSignalStrip: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    padding: 8
  },
  authSignalItem: {
    flex: 1,
    minWidth: 0
  },
  authSignalValue: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "900"
  },
  authSignalLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "900",
    marginTop: 3,
    textTransform: "uppercase"
  },
  segmentedControl: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: "row",
    gap: 6,
    marginBottom: 10,
    padding: 5
  },
  segmentButton: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    paddingVertical: 10
  },
  segmentButtonActive: {
    backgroundColor: colors.surface
  },
  segmentText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900"
  },
  segmentTextActive: {
    color: colors.primary
  },
  header: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-between",
    maxWidth: 1180,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    position: "relative",
    width: "100%"
  },
  headerCompact: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: 0,
    paddingBottom: 10,
    paddingHorizontal: 14,
    paddingTop: 10
  },
  headerIdentity: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    minWidth: 168,
    paddingRight: 8
  },
  headerIdentityCompact: {
    flex: 1,
    minHeight: 48,
    minWidth: 0,
    paddingRight: 156
  },
  headerLogo: {
    height: 42,
    marginRight: 8,
    width: 54
  },
  headerLogoCompact: {
    height: 38,
    width: 48
  },
  headerTitleBlock: {
    flex: 1
  },
  brand: {
    color: colors.primary,
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: 0
  },
  headerSubtitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  headerActionsCompact: {
    gap: 6,
    position: "absolute",
    right: 14,
    top: 11
  },
  balanceLine: {
    alignItems: "flex-end",
    justifyContent: "center",
    minHeight: 38,
    minWidth: 86
  },
  balanceLineOverlay: {
    minHeight: 30,
    minWidth: 0,
    position: "absolute",
    right: 72,
    top: 18,
    zIndex: 6
  },
  balanceLineValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  balanceLineValueOverlay: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: "900",
    textShadowColor: "rgba(0, 0, 0, 0.82)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 3
  },
  headerReviewLine: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  signOutButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: 38,
    paddingHorizontal: 10
  },
  signOutButtonCompact: {
    minHeight: 46,
    paddingHorizontal: 18
  },
  signOutText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900"
  },
  screenContent: {
    alignSelf: "center",
    maxWidth: 1080,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: TAB_BAR_CONTENT_PADDING,
    width: "100%"
  },
  screenContentCompact: {
    paddingHorizontal: 14
  },
  feedPagerShell: {
    backgroundColor: colors.background,
    flex: 1,
    position: "relative"
  },
  feedFixedBrand: {
    alignItems: "center",
    height: 42,
    justifyContent: "center",
    left: 10,
    position: "absolute",
    top: 10,
    width: 42,
    zIndex: 7
  },
  feedPager: {
    backgroundColor: colors.background,
    flex: 1
  },
  feedReel: {
    alignSelf: "stretch",
    width: "100%"
  },
  feedReelStage: {
    backgroundColor: colors.background,
    alignItems: "stretch",
    flex: 1,
    justifyContent: "center",
    overflow: "hidden"
  },
  feedReelStageWide: {
    alignItems: "center"
  },
  feedReelCanvas: {
    alignSelf: "stretch",
    flex: 1,
    overflow: "hidden"
  },
  feedReelCanvasWide: {
    alignSelf: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1
  },
  feedVideoBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden"
  },
  feedVideoAccent: {
    borderRadius: 8,
    borderWidth: 1,
    height: "58%",
    opacity: 0.62,
    position: "absolute",
    right: -48,
    top: 42,
    transform: [{ rotate: "-8deg" }],
    width: "68%"
  },
  feedVideoFrame: {
    borderRadius: 8,
    borderWidth: 1,
    bottom: "17%",
    left: "6%",
    opacity: 0.34,
    position: "absolute",
    right: "6%",
    top: "10%"
  },
  feedVideoTexture: {
    backgroundColor: "rgba(255, 255, 255, 0.025)",
    height: "100%",
    left: "50%",
    position: "absolute",
    top: 0,
    transform: [{ rotate: "12deg" }],
    width: 1
  },
  feedVideoLane: {
    borderColor: "rgba(247, 200, 75, 0.11)",
    borderWidth: 1,
    height: "62%",
    position: "absolute",
    top: "13%",
    width: "26%"
  },
  feedVideoLaneLeft: {
    borderBottomRightRadius: 8,
    borderTopRightRadius: 8,
    left: "-8%"
  },
  feedVideoLaneRight: {
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 8,
    right: "-8%"
  },
  feedVideoFocusBox: {
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 8,
    borderWidth: 1,
    height: "18%",
    left: "24%",
    position: "absolute",
    top: "26%",
    width: "52%"
  },
  feedVideoShadeTop: {
    backgroundColor: "rgba(5, 5, 3, 0.22)",
    height: "34%",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  },
  feedVideoShadeBottom: {
    backgroundColor: "rgba(5, 5, 3, 0.9)",
    bottom: 0,
    height: "64%",
    left: 0,
    position: "absolute",
    right: 0
  },
  feedVideoBox: {
    overflow: "hidden",
    position: "absolute",
    zIndex: 2
  },
  feedVideoBoxCompact: {
    bottom: 0,
    left: 0,
    right: 0,
    top: 0
  },
  feedVideoBoxWide: {
    alignSelf: "center",
    aspectRatio: 9 / 16,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: 292,
    top: 30,
    width: 292
  },
  feedVideoPlayback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000"
  },
  feedVideoMedia: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
    height: "100%",
    width: "100%"
  },
  feedVideoTapTarget: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1
  },
  feedVideoPlaybackPlay: {
    position: "relative",
    top: 0
  },
  feedVideoFloatingControls: {
    alignItems: "center",
    gap: 7,
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 3
  },
  feedVideoControlButton: {
    alignItems: "center",
    backgroundColor: "rgba(5, 5, 3, 0.72)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 999,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34
  },
  feedVideoVolumeControl: {
    alignItems: "center",
    gap: 7
  },
  feedVideoVolumeSlider: {
    alignItems: "center",
    backgroundColor: "rgba(5, 5, 3, 0.72)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 999,
    borderWidth: 1,
    height: 76,
    justifyContent: "center",
    width: 34
  },
  feedVideoVolumePressable: {
    alignItems: "center",
    height: 58,
    justifyContent: "center",
    position: "relative",
    width: 34
  },
  feedVideoVolumeTrack: {
    backgroundColor: "rgba(255, 255, 255, 0.32)",
    borderRadius: 999,
    height: "100%",
    justifyContent: "flex-end",
    overflow: "hidden",
    width: 4
  },
  feedVideoVolumeFill: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    width: "100%"
  },
  feedVideoVolumeThumb: {
    backgroundColor: colors.onPrimary,
    borderRadius: 999,
    height: 10,
    position: "absolute",
    width: 10
  },
  feedVideoControlIcon: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: "900"
  },
  feedVideoBoxGlow: {
    borderRadius: 8,
    height: "48%",
    opacity: 0.9,
    position: "absolute",
    right: "-28%",
    top: "7%",
    transform: [{ rotate: "-18deg" }],
    width: "80%"
  },
  feedVideoPitchMarkings: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.42
  },
  feedVideoPitchCenterLine: {
    backgroundColor: "rgba(255, 244, 204, 0.22)",
    height: 1,
    left: 0,
    position: "absolute",
    right: 0,
    top: "50%"
  },
  feedVideoPitchCenterCircle: {
    alignSelf: "center",
    borderColor: "rgba(255, 244, 204, 0.16)",
    borderRadius: 999,
    borderWidth: 1,
    height: 88,
    position: "absolute",
    top: "39%",
    width: 88
  },
  feedVideoPitchBoxTop: {
    alignSelf: "center",
    borderColor: "rgba(255, 244, 204, 0.14)",
    borderTopWidth: 0,
    borderWidth: 1,
    height: 72,
    position: "absolute",
    top: 0,
    width: "58%"
  },
  feedVideoPitchBoxBottom: {
    alignSelf: "center",
    borderBottomWidth: 0,
    borderColor: "rgba(255, 244, 204, 0.14)",
    borderWidth: 1,
    bottom: 0,
    height: 72,
    position: "absolute",
    width: "58%"
  },
  feedVideoNoiseWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.025)"
  },
  feedVideoSubject: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(5, 5, 3, 0.62)",
    borderRadius: 999,
    borderWidth: 2,
    height: 74,
    justifyContent: "center",
    position: "absolute",
    top: "29%",
    width: 74
  },
  feedVideoSubjectCompact: {
    top: "26%"
  },
  feedVideoSubjectText: {
    fontSize: 21,
    fontWeight: "900"
  },
  feedVideoPlayCircle: {
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 999,
    height: 54,
    justifyContent: "center",
    position: "absolute",
    top: "47%",
    width: 54
  },
  feedVideoPlayCircleCompact: {
    top: "48%"
  },
  feedVideoPlayTriangle: {
    borderBottomColor: "transparent",
    borderBottomWidth: 9,
    borderLeftWidth: 14,
    borderTopColor: "transparent",
    borderTopWidth: 9,
    height: 0,
    marginLeft: 4,
    width: 0
  },
  feedVideoActionRail: {
    gap: 9,
    position: "absolute",
    right: 10,
    top: "34%"
  },
  feedVideoActionButton: {
    alignItems: "center",
    backgroundColor: "rgba(5, 5, 3, 0.58)",
    borderRadius: 8,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    width: 46
  },
  feedVideoActionValue: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: "900"
  },
  feedVideoActionLabel: {
    color: "#DCE8E0",
    fontSize: 8,
    fontWeight: "900",
    marginTop: 1
  },
  feedVideoCaptionStrip: {
    alignItems: "flex-end",
    backgroundColor: "rgba(5, 5, 3, 0.68)",
    bottom: 18,
    flexDirection: "row",
    gap: 10,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
    position: "absolute",
    right: 12,
    zIndex: 2
  },
  feedVideoCaption: {
    flex: 1,
    fontSize: 12,
    fontWeight: "900"
  },
  feedVideoDuration: {
    fontSize: 11,
    fontWeight: "900"
  },
  feedVideoSeekControl: {
    bottom: 0,
    height: 20,
    justifyContent: "center",
    left: 12,
    position: "absolute",
    right: 12,
    zIndex: 4
  },
  feedVideoSeekControlCompact: {
    bottom: 0,
    left: 0,
    right: 0
  },
  feedVideoSeekPressable: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center"
  },
  feedVideoScrubberTrack: {
    borderRadius: 999,
    height: 4,
    overflow: "hidden",
    width: "100%"
  },
  feedVideoScrubberFill: {
    borderRadius: 999,
    height: "100%"
  },
  feedVideoScrubberThumb: {
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(5, 5, 3, 0.28)",
    borderRadius: 999,
    borderWidth: 1,
    height: 12,
    position: "absolute",
    top: 4,
    transform: [{ translateX: -6 }],
    width: 12
  },
  feedReelHeaderOverlay: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
    left: 18,
    position: "absolute",
    right: 18,
    top: 18,
    zIndex: 4
  },
  feedReelBrandMark: {
    height: 25,
    width: 25
  },
  feedReelCount: {
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4
  },
  feedScoreBadge: {
    backgroundColor: colors.surface
  },
  feedTextOverlay: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    bottom: TAB_BAR_CONTENT_PADDING + 8,
    left: 18,
    padding: 14,
    position: "absolute",
    right: 18,
    shadowColor: "#10261A",
    shadowOffset: { height: -4, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    zIndex: 4
  },
  feedTextOverlayWide: {
    bottom: 18,
    left: 30,
    padding: 18,
    right: 340
  },
  feedTextOverlayCompact: {
    backgroundColor: "transparent",
    borderRadius: 0,
    borderWidth: 0,
    bottom: 20,
    left: 0,
    overflow: "hidden",
    padding: 0,
    paddingBottom: 10,
    paddingHorizontal: 18,
    paddingTop: 14,
    right: 0,
    shadowOpacity: 0
  },
  feedTextOverlayCompactExpanded: {
    backgroundColor: "transparent",
    elevation: 0,
    minHeight: 270,
    paddingTop: 78,
    shadowOpacity: 0
  },
  feedCompactBlur: {
    ...StyleSheet.absoluteFillObject
  },
  feedCompactGradient: {
    ...StyleSheet.absoluteFillObject
  },
  feedOverlayEyebrow: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: 9,
    textTransform: "uppercase"
  },
  feedProfileRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    marginBottom: 10
  },
  feedProfileRowCompact: {
    alignItems: "flex-start",
    marginBottom: 7,
    zIndex: 2
  },
  feedProfileButton: {
    alignItems: "center",
    justifyContent: "center"
  },
  feedProfileButtonCompact: {
    backgroundColor: "rgba(5, 18, 12, 0.62)",
    borderColor: "rgba(255, 255, 255, 0.72)",
    borderRadius: 999,
    borderWidth: 1,
    height: 40,
    marginTop: 1,
    width: 40
  },
  feedAvatar: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    borderWidth: 2,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  feedAvatarText: {
    fontSize: 14,
    fontWeight: "900"
  },
  feedProfileTextBlock: {
    flex: 1,
    minWidth: 0
  },
  feedProfileName: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "900"
  },
  feedProfileNameCompact: {
    fontSize: 16,
    lineHeight: 20,
    textShadowColor: "rgba(0, 0, 0, 0.78)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 3
  },
  feedSponsorLabel: {
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2
  },
  feedSponsorLabelCompact: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 2,
    marginTop: 0,
    textShadowColor: "rgba(0, 0, 0, 0.78)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 3
  },
  feedStatusPill: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 31,
    paddingHorizontal: 10
  },
  feedStatusText: {
    fontSize: 11,
    fontWeight: "900"
  },
  feedReelVideoTitle: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 24
  },
  feedReelVideoTitleWide: {
    fontSize: 24,
    lineHeight: 29
  },
  feedCompactDescription: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
    textShadowColor: "rgba(0, 0, 0, 0.84)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 3,
    zIndex: 2
  },
  feedCompactDescriptionTitle: {
    fontWeight: "900"
  },
  feedCompactInlineAction: {
    color: colors.onPrimary,
    fontWeight: "900"
  },
  feedCompactExpandedMeta: {
    color: "rgba(255, 255, 255, 0.82)",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    marginTop: 8,
    zIndex: 2
  },
  feedCompactHashtagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 13,
    zIndex: 2
  },
  feedCompactHashtag: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 19,
    textShadowColor: "rgba(0, 0, 0, 0.72)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 2
  },
  feedCompactFundSection: {
    marginTop: 15,
    zIndex: 2
  },
  feedCompactFundTitle: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 19
  },
  feedCompactFundValues: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginTop: 7
  },
  feedCompactFundValue: {
    color: colors.onPrimary,
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "800"
  },
  feedCompactFundGoal: {
    color: "rgba(255, 255, 255, 0.78)",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "right"
  },
  feedCompactFundTrack: {
    backgroundColor: "rgba(255, 255, 255, 0.28)",
    borderRadius: 999,
    height: 6,
    marginTop: 7,
    overflow: "hidden"
  },
  feedCompactFundFill: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: "100%"
  },
  feedCompactFundEmpty: {
    color: "rgba(255, 255, 255, 0.82)",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    marginTop: 15,
    zIndex: 2
  },
  feedCompactExpandedActions: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    zIndex: 2
  },
  feedCompactTextButton: {
    minHeight: 34,
    justifyContent: "center",
    paddingHorizontal: 4
  },
  feedCompactTextButtonLabel: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: "900",
    textShadowColor: "rgba(0, 0, 0, 0.72)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 2
  },
  feedReelMeta: {
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4
  },
  feedTagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 9
  },
  feedTag: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    borderWidth: 1,
    fontSize: 10,
    fontWeight: "900",
    paddingHorizontal: 9,
    paddingVertical: 5,
    textTransform: "uppercase"
  },
  feedReelHighlight: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
    marginTop: 8
  },
  feedReadMoreButton: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingVertical: 4
  },
  feedReadMoreText: {
    fontSize: 13,
    fontWeight: "900"
  },
  feedInsightStrip: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 9,
    paddingVertical: 8
  },
  feedInsightStripCompact: {
    marginTop: 8,
    paddingVertical: 6
  },
  feedInsightItem: {
    flex: 1,
    minWidth: 0
  },
  feedInsightValue: {
    fontSize: 13,
    fontWeight: "900"
  },
  feedInsightLabel: {
    fontSize: 9,
    fontWeight: "900",
    marginTop: 2,
    textTransform: "uppercase"
  },
  feedReelMetricRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12
  },
  feedReelMetric: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 50,
    paddingHorizontal: 9,
    paddingVertical: 7
  },
  feedReelMetricValue: {
    fontSize: 14,
    fontWeight: "900"
  },
  feedReelMetricLabel: {
    fontSize: 10,
    fontWeight: "900",
    marginTop: 3,
    textTransform: "uppercase"
  },
  feedLearnMoreButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    minHeight: 48,
    paddingHorizontal: 15
  },
  feedProgressTrackCompact: {
    height: 5,
    marginTop: 10
  },
  feedProgressFillCompact: {
    height: 5
  },
  feedReelButtonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.98 }]
  },
  feedLearnMoreText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: "900"
  },
  feedDesktopPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    bottom: 18,
    padding: 16,
    position: "absolute",
    right: 30,
    width: 280,
    zIndex: 4
  },
  feedDesktopPanelTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 12
  },
  feedDesktopPanelRow: {
    borderColor: colors.border,
    borderTopWidth: 1,
    paddingVertical: 11
  },
  feedDesktopPanelLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  feedDesktopPanelValue: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 4
  },
  feedStatsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14
  },
  feedStatCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 13
  },
  feedStatValue: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0
  },
  feedStatLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 2,
    textTransform: "uppercase"
  },
  sectionHeaderRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 2
  },
  sectionEyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  sectionHeaderTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 3
  },
  sectionHeaderMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900",
    paddingBottom: 2
  },
  feedHero: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    padding: 18
  },
  submitHero: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    padding: 18
  },
  adminHero: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    padding: 18
  },
  heroKicker: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  heroTitle: {
    color: colors.text,
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 30,
    marginTop: 8
  },
  heroBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden"
  },
  videoPreview: {
    borderBottomWidth: 1,
    height: 168,
    justifyContent: "space-between",
    padding: 14
  },
  playButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    width: 70
  },
  playText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: "900"
  },
  paletteBadge: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(5, 5, 3, 0.72)",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  paletteBadgeText: {
    fontSize: 11,
    fontWeight: "900"
  },
  videoMeta: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  videoTitle: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 22,
    paddingRight: 12
  },
  videoLength: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800"
  },
  cardBody: {
    padding: 14
  },
  cardTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  playerTitleBlock: {
    flex: 1
  },
  playerName: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: 0
  },
  playerMeta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4
  },
  scoreBadge: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 2,
    minWidth: 56,
    paddingVertical: 5
  },
  scoreValue: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "900"
  },
  scoreLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800"
  },
  highlight: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12
  },
  cardMetricRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12
  },
  cardMetric: {
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 58,
    paddingHorizontal: 10,
    paddingVertical: 9
  },
  cardMetricValue: {
    fontSize: 16,
    fontWeight: "900"
  },
  cardMetricLabel: {
    fontSize: 10,
    fontWeight: "900",
    marginTop: 3,
    textTransform: "uppercase"
  },
  tag: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  tagText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800"
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14
  },
  progressText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  progressTrack: {
    backgroundColor: colors.border,
    borderRadius: 999,
    height: 8,
    marginTop: 7,
    overflow: "hidden"
  },
  progressFill: {
    borderRadius: 999,
    height: 8
  },
  detailContent: {
    alignSelf: "center",
    maxWidth: 1080,
    paddingHorizontal: 22,
    paddingBottom: DETAIL_CONTENT_PADDING,
    paddingTop: 76,
    width: "100%"
  },
  playerDetailShell: {
    flex: 1,
    position: "relative"
  },
  detailFixedHud: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    height: 62,
    left: 0,
    paddingHorizontal: 14,
    position: "absolute",
    right: 0,
    shadowColor: "#10261A",
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    top: 0,
    width: "100%",
    zIndex: 8
  },
  detailHudBackButton: {
    alignItems: "center",
    height: 44,
    justifyContent: "center",
    width: 44
  },
  detailHudBalance: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "900"
  },
  detailVideo: {
    borderRadius: 8,
    height: 230,
    justifyContent: "space-between",
    marginTop: 4,
    overflow: "hidden",
    padding: 16
  },
  detailVideoMedia: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
    height: "100%",
    width: "100%"
  },
  detailPlayButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 54,
    justifyContent: "center",
    width: 86
  },
  detailPlayText: {
    color: colors.onPrimary,
    fontSize: 13,
    fontWeight: "900"
  },
  detailVideoTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 29
  },
  detailTitleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginTop: 18
  },
  detailTitleBlock: {
    flex: 1
  },
  detailName: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 0
  },
  detailMeta: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 5
  },
  profileVideosSection: {
    marginTop: 22
  },
  profileVideosHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 11
  },
  profileVideosCount: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  profileVideosRail: {
    gap: 10,
    paddingRight: 22
  },
  profileVideoCard: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
    paddingBottom: 10,
    width: 138
  },
  profileVideoCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2
  },
  profileVideoThumbnail: {
    aspectRatio: 9 / 13,
    backgroundColor: colors.media,
    overflow: "hidden",
    position: "relative",
    width: "100%"
  },
  profileVideoThumbnailMedia: {
    ...StyleSheet.absoluteFillObject,
    height: "100%",
    width: "100%"
  },
  profileVideoPlayIcon: {
    alignItems: "center",
    backgroundColor: "rgba(5, 18, 12, 0.72)",
    borderRadius: 999,
    height: 36,
    justifyContent: "center",
    left: "50%",
    marginLeft: -18,
    marginTop: -18,
    position: "absolute",
    top: "50%",
    width: 36
  },
  profileVideoTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 17,
    marginTop: 9,
    paddingHorizontal: 9
  },
  profileVideoDuration: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
    paddingHorizontal: 9
  },
  demoNotice: {
    backgroundColor: colors.infoSoft,
    borderColor: "#BFD2FF",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 13,
    paddingVertical: 10
  },
  demoNoticeTitle: {
    color: colors.info,
    fontSize: 13,
    fontWeight: "900"
  },
  demoNoticeBody: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3
  },
  metricGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16
  },
  metricBox: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14
  },
  metricValue: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "900"
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 3
  },
  infoPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 16
  },
  submitInfoPanelCompact: {
    paddingHorizontal: 12
  },
  infoPanelCompact: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: 4
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: 8
  },
  bodyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21
  },
  labeledInputBlock: {
    marginTop: 10
  },
  inputLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 6,
    textTransform: "uppercase"
  },
  formInput: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    minHeight: 48,
    paddingHorizontal: 12
  },
  formInputMultiline: {
    lineHeight: 20,
    minHeight: 94,
    paddingTop: 12
  },
  videoPickerButton: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    marginTop: 12,
    minHeight: 48,
    paddingHorizontal: 14
  },
  videoPickerIcon: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "700"
  },
  videoPickerButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900"
  },
  videoPickerHint: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: 7
  },
  selectedVideoPanel: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    padding: 10
  },
  selectedVideoTextBlock: {
    flex: 1,
    minWidth: 0
  },
  selectedVideoName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900"
  },
  selectedVideoMeta: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3
  },
  removeVideoButton: {
    alignItems: "center",
    backgroundColor: colors.dangerSoft,
    borderColor: "#E9A8B0",
    borderRadius: 999,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34
  },
  removeVideoButtonText: {
    color: colors.danger,
    fontSize: 23,
    lineHeight: 25
  },
  videoSourceDivider: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    marginTop: 12
  },
  videoSourceDividerLine: {
    backgroundColor: colors.border,
    flex: 1,
    height: 1
  },
  videoSourceDividerText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  submissionVideoPreview: {
    alignSelf: "center",
    aspectRatio: 9 / 16,
    backgroundColor: "#000000",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    maxHeight: 640,
    maxWidth: 360,
    overflow: "hidden",
    width: "100%"
  },
  submissionVideoPreviewCompact: {
    maxHeight: 360,
    maxWidth: 210,
    width: "62%"
  },
  submissionVideoPreviewMedia: {
    height: "100%",
    width: "100%"
  },
  inputRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 14,
    paddingHorizontal: 12
  },
  currencyPrefix: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "900",
    marginRight: 8
  },
  amountInput: {
    color: colors.text,
    flex: 1,
    fontSize: 22,
    fontWeight: "900",
    minHeight: 54
  },
  availableBalanceText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 10
  },
  fundTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  fundStatus: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  fundStatusComplete: {
    color: colors.accent
  },
  fundProgressHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginTop: 16
  },
  fundProgressValue: {
    color: colors.primary,
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "900"
  },
  fundProgressGoal: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "right"
  },
  fundProgressTrack: {
    backgroundColor: colors.border,
    borderRadius: 999,
    height: 8,
    marginTop: 9,
    overflow: "hidden"
  },
  fundProgressFill: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: "100%"
  },
  fundStatsRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 13
  },
  fundStatItem: {
    flex: 1,
    minWidth: 0
  },
  fundStatValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  fundStatLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2,
    textTransform: "uppercase"
  },
  fundCompleteNotice: {
    borderLeftColor: colors.accent,
    borderLeftWidth: 3,
    marginTop: 18,
    paddingLeft: 12,
    paddingVertical: 3
  },
  fundCompleteNoticeTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "900"
  },
  fundCompleteNoticeBody: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3
  },
  fundCustodyNote: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 12
  },
  twoColumnRow: {
    flexDirection: "row",
    gap: 10
  },
  columnField: {
    flex: 1
  },
  simulationGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12
  },
  simulationBox: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    flex: 1,
    padding: 12
  },
  simulationValue: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "900"
  },
  simulationLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4
  },
  timelinePanel: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 14,
    padding: 12
  },
  timelineRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 8
  },
  timelineDot: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 24,
    justifyContent: "center",
    width: 24
  },
  timelineDotText: {
    color: colors.onPrimary,
    fontSize: 11,
    fontWeight: "900"
  },
  timelineText: {
    color: colors.text,
    flex: 1,
    fontSize: 13,
    fontWeight: "800"
  },
  validationText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 10
  },
  submissionValidationPanel: {
    backgroundColor: colors.dangerSoft,
    borderColor: "#E9A8B0",
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
    marginTop: 14,
    padding: 11
  },
  submissionValidationTitle: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 2
  },
  submissionValidationRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 7
  },
  submissionValidationMarker: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "900"
  },
  submissionValidationText: {
    color: colors.text,
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    minHeight: 48,
    justifyContent: "center",
    paddingVertical: 13
  },
  primaryButtonDisabled: {
    backgroundColor: colors.borderStrong
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: "900"
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 13
  },
  secondaryButtonDisabled: {
    backgroundColor: colors.surfaceMuted
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900"
  },
  checkRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 14
  },
  checkBox: {
    alignItems: "center",
    borderColor: colors.borderStrong,
    borderRadius: 6,
    borderWidth: 2,
    height: 28,
    justifyContent: "center",
    width: 28
  },
  checkBoxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  checkMark: {
    color: colors.onPrimary,
    fontSize: 10,
    fontWeight: "900"
  },
  checkText: {
    color: colors.text,
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18
  },
  submissionToastLayer: {
    alignItems: "center",
    bottom: TAB_BAR_CONTENT_PADDING + 8,
    left: 0,
    position: "absolute",
    right: 0,
    zIndex: 20
  },
  submissionToast: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 16,
    flexDirection: "row",
    gap: 10,
    minHeight: 64,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: "#000000",
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.38,
    shadowRadius: 10
  },
  submissionToastIcon: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 999,
    height: 32,
    justifyContent: "center",
    width: 32
  },
  submissionToastIconText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "900"
  },
  submissionToastTextBlock: {
    flex: 1,
    minWidth: 0
  },
  submissionToastTitle: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: "900"
  },
  submissionToastBody: {
    color: "#DCEFE4",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    marginTop: 2
  },
  submissionItem: {
    borderColor: colors.border,
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 12
  },
  adminItem: {
    borderColor: colors.border,
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12
  },
  submissionTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between"
  },
  submissionTextBlock: {
    flex: 1
  },
  submissionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  submissionMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3
  },
  submissionBody: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8
  },
  adminFinePrint: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 8
  },
  reviewNote: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 8,
    padding: 10
  },
  statusPill: {
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6
  },
  statusReview: {
    backgroundColor: colors.warningSoft
  },
  statusApproved: {
    backgroundColor: colors.primarySoft
  },
  statusAdjust: {
    backgroundColor: colors.infoSoft
  },
  statusRejected: {
    backgroundColor: colors.dangerSoft
  },
  statusPillText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "900"
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12
  },
  smallButton: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    flexDirection: "row",
    gap: 5,
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 8
  },
  approveButton: {
    backgroundColor: colors.primary
  },
  adjustButton: {
    backgroundColor: colors.warning
  },
  rejectButton: {
    backgroundColor: colors.danger
  },
  smallButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900"
  },
  smallButtonTextDark: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: "900"
  },
  summaryBand: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    padding: 18
  },
  summaryTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  depositButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 6,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 13
  },
  depositButtonText: {
    color: colors.onPrimary,
    fontSize: 13,
    fontWeight: "900"
  },
  buttonPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }]
  },
  summaryLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  summaryValue: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 6
  },
  summaryInsightStrip: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 10,
    paddingVertical: 10
  },
  summaryInsightItem: {
    flex: 1,
    minWidth: 0
  },
  summaryInsightValue: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900"
  },
  summaryInsightLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "900",
    marginTop: 3,
    textTransform: "uppercase"
  },
  summaryBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8
  },
  depositModalRoot: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 20
  },
  depositModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 18, 12, 0.52)"
  },
  depositDialog: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 18,
    maxWidth: 420,
    padding: 18,
    shadowColor: "#000000",
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    width: "100%"
  },
  depositDialogHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  depositDialogTitleBlock: {
    flex: 1,
    minWidth: 0
  },
  depositDialogTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900"
  },
  depositDialogSubtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4
  },
  depositCloseButton: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 36
  },
  depositBalanceLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 18,
    textTransform: "uppercase"
  },
  depositBalanceValue: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 18,
    marginTop: 2
  },
  depositInputRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 7,
    paddingHorizontal: 12
  },
  depositCurrencyPrefix: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "900",
    marginRight: 8
  },
  depositInput: {
    color: colors.text,
    flex: 1,
    fontSize: 24,
    fontWeight: "900",
    minHeight: 54
  },
  openFundSecondLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 15
  },
  openFundNotice: {
    borderLeftColor: colors.warning,
    borderLeftWidth: 3,
    marginTop: 16,
    paddingLeft: 11,
    paddingVertical: 2
  },
  openFundNoticeText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17
  },
  depositPresetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 10
  },
  depositPresetButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    flexGrow: 1,
    minHeight: 36,
    minWidth: 76,
    justifyContent: "center",
    paddingHorizontal: 8
  },
  depositPresetButtonActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary
  },
  depositPresetText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  depositPresetTextActive: {
    color: colors.primary
  },
  depositDialogActions: {
    flexDirection: "row",
    gap: 9,
    marginTop: 18
  },
  depositCancelButton: {
    alignItems: "center",
    borderColor: colors.borderStrong,
    borderRadius: 6,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 12
  },
  depositCancelText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900"
  },
  depositConfirmButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 6,
    flex: 1.6,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 12
  },
  depositConfirmText: {
    color: colors.onPrimary,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center"
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    padding: 18
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900"
  },
  emptyBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6
  },
  portfolioItemBlock: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 14
  },
  portfolioDesktopGrid: {
    flexDirection: "row",
    gap: 14,
    marginTop: 14
  },
  portfolioDesktopColumn: {
    flex: 1,
    minWidth: 0
  },
  portfolioItemHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  portfolioName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900"
  },
  portfolioMeta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4
  },
  portfolioNumbers: {
    alignItems: "flex-end",
    marginLeft: 12
  },
  portfolioAmount: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "900"
  },
  portfolioShare: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 4
  },
  stepRail: {
    flexDirection: "row",
    gap: 6,
    marginTop: 14
  },
  stepMarker: {
    backgroundColor: colors.border,
    borderRadius: 999,
    flex: 1,
    height: 8
  },
  stepMarkerActive: {
    backgroundColor: colors.primary
  },
  profileHero: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 14,
    padding: 18
  },
  profileFundAlert: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 13
  },
  profileFundAlertTitle: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: "900"
  },
  profileFundAlertBody: {
    color: "rgba(255, 255, 255, 0.86)",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3
  },
  profileHeroTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  profileAvatar: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderRadius: 999,
    borderWidth: 2,
    height: 50,
    justifyContent: "center",
    width: 50
  },
  profileAvatarText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "900"
  },
  profileTitleBlock: {
    flex: 1,
    minWidth: 0
  },
  profileStatusPill: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  profileStatusText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  profileName: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 0
  },
  profileMeta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 5
  },
  profileQuickStats: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    padding: 10
  },
  profileQuickItem: {
    flex: 1,
    minWidth: 0
  },
  profileQuickValue: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900"
  },
  profileQuickLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "900",
    marginTop: 3,
    textTransform: "uppercase"
  },
  profileDesktopGrid: {
    flexDirection: "row",
    gap: 14
  },
  profilePanelGridItem: {
    flex: 1,
    minWidth: 0
  },
  profilePanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16
  },
  profileRow: {
    alignItems: "center",
    borderColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 11
  },
  profileRowNoBorder: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 11
  },
  profileLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800"
  },
  profileValue: {
    color: colors.text,
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 12,
    textAlign: "right"
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    elevation: 10,
    gap: 2,
    paddingBottom: TAB_BAR_SAFE_PADDING,
    paddingHorizontal: 8,
    paddingTop: 8,
    shadowColor: "#10261A",
    shadowOffset: { height: -4, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    width: "100%"
  },
  tabButton: {
    alignItems: "center",
    borderRadius: 6,
    flex: 1,
    gap: 5,
    minHeight: 56,
    paddingVertical: 8
  },
  tabButtonActive: {
    backgroundColor: colors.primarySoft
  },
  tabMarker: {
    backgroundColor: "rgba(245, 222, 178, 0.26)",
    borderRadius: 999,
    height: 3,
    width: 22
  },
  tabMarkerActive: {
    backgroundColor: colors.primary,
    width: 34
  },
  tabText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "900"
  },
  tabTextActive: {
    color: colors.primary
  }
});
