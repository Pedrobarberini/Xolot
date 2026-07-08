import React, { useMemo, useRef, useState } from "react";
import {
  FlatList,
  Image,
  KeyboardAvoidingView,
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
import { players } from "./src/data/players";
import {
  AppUser,
  Investment,
  Player,
  SimulatedInvestmentStatus,
  UserRole,
  VideoSubmission,
  VideoSubmissionStatus
} from "./src/types";
import {
  calculatePoolShare,
  calculateProjectedDistribution,
  formatBRL,
  formatPercent
} from "./src/utils/investment";

const NEXTSTAR_LOGO = require("./assets/nextstar-logo-cropped.png");

const SYSTEM_NAV_CLEARANCE =
  Platform.select({
    android: 58,
    ios: 34,
    default: 24
  }) ?? 24;
const TAB_BAR_CONTENT_PADDING = SYSTEM_NAV_CLEARANCE + 92;
const DETAIL_CONTENT_PADDING = SYSTEM_NAV_CLEARANCE + 36;

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

const investmentStages: SimulatedInvestmentStatus[] = [
  "Reserva simulada",
  "KYC simulado",
  "Contrato simulado",
  "Pagamento simulado",
  "Distribuicao simulada"
];

const CARD_PALETTES: CardPalette[] = [
  {
    name: "Ouro Prime",
    card: "#100B04",
    media: "#060504",
    border: "#8B641D",
    accent: "#F7C84B",
    accentSoft: "#33230A",
    text: "#FFF4CC",
    muted: "#C7A45A",
    tagBackground: "#1F1607",
    progressTrack: "#34260E",
    onAccent: "#080604"
  },
  {
    name: "Bronze Arena",
    card: "#160C05",
    media: "#080503",
    border: "#8E541E",
    accent: "#C9782B",
    accentSoft: "#351A08",
    text: "#FFE6BF",
    muted: "#C48A53",
    tagBackground: "#241106",
    progressTrack: "#3D210D",
    onAccent: "#080604"
  },
  {
    name: "Champagne Noir",
    card: "#11100B",
    media: "#070705",
    border: "#8E8059",
    accent: "#E9D8A6",
    accentSoft: "#302B1A",
    text: "#FFF8DC",
    muted: "#C9B987",
    tagBackground: "#211E12",
    progressTrack: "#3B3520",
    onAccent: "#080604"
  },
  {
    name: "Ambar Sprint",
    card: "#180F04",
    media: "#090602",
    border: "#9A6A10",
    accent: "#FFB703",
    accentSoft: "#3D2704",
    text: "#FFF1C2",
    muted: "#D39B2C",
    tagBackground: "#281A04",
    progressTrack: "#4A3106",
    onAccent: "#080604"
  },
  {
    name: "Grafite Crown",
    card: "#121211",
    media: "#050505",
    border: "#6F613D",
    accent: "#B8892D",
    accentSoft: "#292315",
    text: "#F6EBC8",
    muted: "#AE9764",
    tagBackground: "#1D1A12",
    progressTrack: "#332D1C",
    onAccent: "#080604"
  },
  {
    name: "Cobre Estelar",
    card: "#190B06",
    media: "#080302",
    border: "#9A4F23",
    accent: "#D9843A",
    accentSoft: "#341609",
    text: "#FFE8CF",
    muted: "#C9824F",
    tagBackground: "#261006",
    progressTrack: "#3E1D0B",
    onAccent: "#080604"
  }
];

const initialSubmissions: VideoSubmission[] = [
  {
    id: "seed-rafael-admin",
    userId: "seed-athlete",
    athleteName: "Rafael Nunes",
    age: 18,
    city: "Campinas, SP",
    position: "Volante",
    club: "Projeto social Zona Sul",
    videoTitle: "Desarmes e inversoes de jogo",
    videoLink: "https://video.exemplo/rafael",
    highlight:
      "Boa leitura defensiva, passe longo consistente e intensidade sem bola.",
    goals:
      "Simular captacao para avaliacao, fisioterapia preventiva e viagem para peneira.",
    hasGuardianConsent: false,
    status: "Em revisao",
    submittedAt: "2026-07-07T18:00:00.000Z"
  }
];

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [tab, setTab] = useState<Tab>("feed");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [submissions, setSubmissions] =
    useState<VideoSubmission[]>(initialSubmissions);

  const approvedSubmissionPlayers = useMemo(
    () =>
      submissions
        .filter((submission) => submission.status === "Aprovado")
        .map((submission, index) => buildPlayerFromSubmission(submission, index)),
    [submissions]
  );

  const availablePlayers = useMemo(
    () => [...players, ...approvedSubmissionPlayers],
    [approvedSubmissionPlayers]
  );

  const portfolioTotal = useMemo(
    () => investments.reduce((total, item) => total + item.amount, 0),
    [investments]
  );

  const pendingReviews = submissions.filter(
    (submission) => submission.status === "Em revisao"
  ).length;

  function handleAuth(nextUser: AppUser) {
    setUser(nextUser);
    if (nextUser.role === "Atleta") {
      setTab("submit");
      return;
    }
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
    const simulatedMonthlyReturn = calculateProjectedDistribution(
      amount,
      player.funded,
      player.athleteSharePercent,
      player.projectedMonthlyEarnings
    );

    setInvestments((current) => [
      {
        id: `simulation-${Date.now()}`,
        playerId: player.id,
        playerName: player.name,
        amount,
        simulatedMonthlyReturn,
        status: "Reserva simulada",
        createdAt: new Date().toISOString()
      },
      ...current
    ]);
    setSelectedPlayer(null);
    setTab("portfolio");
  }

  function handleAdvanceInvestment(investmentId: string) {
    setInvestments((current) =>
      current.map((investment) => {
        if (investment.id !== investmentId) {
          return investment;
        }

        const currentIndex = investmentStages.indexOf(investment.status);
        const nextStatus =
          investmentStages[Math.min(currentIndex + 1, investmentStages.length - 1)];

        return { ...investment, status: nextStatus };
      })
    );
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
      <SafeAreaView style={styles.safeArea}>
        <StatusBar barStyle="dark-content" />
        <AuthScreen onComplete={handleAuth} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" />
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.keyboardView}
      >
        {selectedPlayer ? (
          <PlayerDetail
            canInvest={user.role === "Investidor"}
            onBack={() => setSelectedPlayer(null)}
            onInvest={handleInvest}
            player={selectedPlayer}
          />
        ) : (
          <>
            {tab !== "feed" ? (
              <Header
                onSignOut={handleSignOut}
                pendingReviews={pendingReviews}
                portfolioTotal={portfolioTotal}
                user={user}
              />
            ) : null}
            {tab === "feed" ? (
              <FeedScreen
                approvedCount={approvedSubmissionPlayers.length}
                onOpenPlayer={setSelectedPlayer}
                players={availablePlayers}
              />
            ) : null}
            {tab === "portfolio" ? (
              <PortfolioScreen
                investments={investments}
                onAdvance={handleAdvanceInvestment}
              />
            ) : null}
            {tab === "submit" ? (
              <SubmitVideoScreen
                onSubmit={handleSubmitVideo}
                submissions={submissions.filter((item) => item.userId === user.id)}
                user={user}
              />
            ) : null}
            {tab === "admin" ? (
              <AdminScreen
                onReview={handleReviewSubmission}
                submissions={submissions}
              />
            ) : null}
            {tab === "profile" ? (
              <ProfileScreen
                investments={investments}
                onSignOut={handleSignOut}
                submissions={submissions}
                user={user}
              />
            ) : null}
            <BottomTabs activeTab={tab} onChange={setTab} role={user.role} />
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function buildPlayerFromSubmission(
  submission: VideoSubmission,
  index: number
): Player {
  const colors = getCardPalette(index + players.length);

  return {
    id: `approved-${submission.id}`,
    name: submission.athleteName,
    age: submission.age,
    city: submission.city,
    position: submission.position,
    club: submission.club,
    videoTitle: submission.videoTitle,
    videoLength: "1:30",
    highlight: submission.highlight,
    thesis:
      "Oportunidade aprovada na maquete. Antes de investimento real, o caso exige verificacao juridica, KYC, contrato e revisao documental.",
    fundingGoal: 60000,
    funded: 0,
    minimumTicket: 250,
    athleteSharePercent: 15,
    projectedMonthlyEarnings: 6000,
    score: 70 + (index % 9),
    riskLevel: "Alto",
    tags: ["Novo", "Aprovado", "Maquete"],
    metrics: [
      { label: "Status", value: "OK" },
      { label: "Idade", value: String(submission.age) },
      { label: "Meta", value: "R$60k" }
    ],
    thumbnailColor: colors.media,
    accentColor: colors.accent
  };
}

function getCardPalette(index: number) {
  return CARD_PALETTES[index % CARD_PALETTES.length];
}

function getCardPaletteFromId(id: string) {
  const total = id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);

  return getCardPalette(total);
}

function getScoreColor(score: number) {
  if (score >= 85) {
    return "#4ADE80";
  }

  if (score >= 78) {
    return "#F7C84B";
  }

  return "#F87171";
}

function AuthScreen({
  onComplete
}: {
  onComplete: (user: AppUser) => void;
}) {
  const { width } = useWindowDimensions();
  const [mode, setMode] = useState<"create" | "login">("create");
  const [role, setRole] = useState<UserRole>("Investidor");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const isCompact = width < 380;

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
      id: `${role.toLowerCase()}-${Date.now()}`,
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
      <ScrollView contentContainerStyle={styles.authContent}>
        <Image
          accessibilityLabel="Logo NextStar"
          resizeMode="contain"
          source={NEXTSTAR_LOGO}
          style={[styles.authLogo, isCompact ? styles.authLogoCompact : null]}
        />
        <Text style={styles.authBrand}>NextStar</Text>
        <Text style={styles.authEyebrow}>Maquete mobile de talentos</Text>
        <Text style={styles.authTitle}>
          {mode === "create" ? "Criar conta" : "Entrar"}
        </Text>

        <View style={styles.segmentedControl}>
          {(["Investidor", "Atleta", "Admin"] as UserRole[]).map((item) => {
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
              {acceptedTerms ? <Text style={styles.checkMark}>OK</Text> : null}
            </View>
            <Text style={styles.checkText}>
              Aceito que esta e uma maquete sem dinheiro real, contrato real ou
              promessa de retorno.
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
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Header({
  onSignOut,
  pendingReviews,
  portfolioTotal,
  user
}: {
  onSignOut: () => void;
  pendingReviews: number;
  portfolioTotal: number;
  user: AppUser;
}) {
  const { width } = useWindowDimensions();
  const isCompact = width < 390;
  const badgeLabel =
    user.role === "Investidor"
      ? "Carteira"
      : user.role === "Admin"
        ? "Revisao"
        : "Status";
  const badgeValue =
    user.role === "Investidor"
      ? formatBRL(portfolioTotal)
      : user.role === "Admin"
        ? `${pendingReviews} pend.`
        : user.kycStatus;

  return (
    <View style={styles.header}>
      <View style={styles.headerIdentity}>
        <Image
          accessibilityLabel="Logo NextStar"
          resizeMode="contain"
          source={NEXTSTAR_LOGO}
          style={[
            styles.headerLogo,
            isCompact ? styles.headerLogoCompact : null
          ]}
        />
        <View style={styles.headerTitleBlock}>
          <Text style={styles.brand}>NextStar</Text>
          <Text style={styles.headerSubtitle}>
            {user.role} | {user.name}
          </Text>
        </View>
      </View>
      <View style={styles.headerActions}>
        <View style={styles.walletBadge}>
          <Text style={styles.walletLabel}>{badgeLabel}</Text>
          <Text style={styles.walletValue}>{badgeValue}</Text>
        </View>
        <Pressable onPress={onSignOut} style={styles.signOutButton}>
          <Text style={styles.signOutText}>Sair</Text>
        </Pressable>
      </View>
    </View>
  );
}

function FeedScreen({
  approvedCount,
  onOpenPlayer,
  players: feedPlayers
}: {
  approvedCount: number;
  onOpenPlayer: (player: Player) => void;
  players: Player[];
}) {
  const { height } = useWindowDimensions();
  const [feedHeight, setFeedHeight] = useState(0);
  const feedListRef = useRef<FlatList<Player> | null>(null);
  const activeFeedIndexRef = useRef(0);
  const gestureStartIndexRef = useRef(0);
  const gestureStartOffsetRef = useRef(0);
  const gestureSettledRef = useRef(false);
  const pageHeight = feedHeight || height;
  const lastFeedIndex = Math.max(feedPlayers.length - 1, 0);

  function scrollToFeed(index: number) {
    feedListRef.current?.scrollToOffset({
      animated: true,
      offset: index * pageHeight
    });
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
      <FlatList
        bounces={false}
        data={feedPlayers}
        decelerationRate="normal"
        disableIntervalMomentum
        extraData={pageHeight}
        getItemLayout={(_, index) => ({
          length: pageHeight,
          offset: pageHeight * index,
          index
        })}
        keyExtractor={(player) => player.id}
        onMomentumScrollEnd={(event) => {
          settleFeedGesture(event.nativeEvent.contentOffset.y);
        }}
        onScrollBeginDrag={(event) => {
          const offsetY = event.nativeEvent.contentOffset.y;

          gestureStartIndexRef.current = Math.min(
            Math.max(Math.round(offsetY / pageHeight), 0),
            lastFeedIndex
          );
          activeFeedIndexRef.current = gestureStartIndexRef.current;
          gestureStartOffsetRef.current = offsetY;
          gestureSettledRef.current = false;
        }}
        onScrollEndDrag={(event) => {
          settleFeedGesture(event.nativeEvent.contentOffset.y);
        }}
        renderItem={({ item, index }) => (
          <FeedReel
            approvedCount={approvedCount}
            index={index}
            onOpen={() => onOpenPlayer(item)}
            palette={getCardPalette(index)}
            player={item}
            reelHeight={pageHeight}
            total={feedPlayers.length}
          />
        )}
        showsVerticalScrollIndicator={false}
        style={styles.feedPager}
      />
    </View>
  );
}

function FeedReel({
  approvedCount,
  index,
  onOpen,
  palette,
  player,
  reelHeight,
  total
}: {
  approvedCount: number;
  index: number;
  onOpen: () => void;
  palette: CardPalette;
  player: Player;
  reelHeight: number;
  total: number;
}) {
  const progress = Math.min(player.funded / player.fundingGoal, 1);
  const scoreColor = getScoreColor(player.score);

  return (
    <View style={[styles.feedReel, { height: reelHeight }]}>
      <View
        style={[
          styles.feedReelStage,
          { backgroundColor: palette.media, borderColor: palette.border }
        ]}
      >
        <View style={styles.feedReelTopRow}>
          <View>
            <Text style={[styles.feedReelKicker, { color: palette.accent }]}>
              Feed {index + 1}/{total}
            </Text>
            <Text style={[styles.feedReelCount, { color: palette.text }]}>
              {total} oportunidades | {approvedCount} aprovadas
            </Text>
          </View>
          <View style={[styles.scoreBadge, { borderColor: scoreColor }]}>
            <Text style={[styles.scoreValue, { color: scoreColor }]}>
              {player.score}
            </Text>
            <Text style={[styles.scoreLabel, { color: palette.muted }]}>
              score
            </Text>
          </View>
        </View>

        <View style={styles.feedReelCenter}>
          <View style={[styles.reelPlayButton, { backgroundColor: palette.accent }]}>
            <Text style={[styles.reelPlayText, { color: palette.onAccent }]}>
              PLAY
            </Text>
          </View>
          <View style={[styles.paletteBadge, { borderColor: palette.border }]}>
            <Text style={[styles.paletteBadgeText, { color: palette.accent }]}>
              NEXTSTAR
            </Text>
          </View>
        </View>

        <View style={styles.feedReelBottom}>
          <Text
            numberOfLines={2}
            style={[styles.feedReelVideoTitle, { color: palette.text }]}
          >
            {player.videoTitle}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.feedReelName, { color: palette.text }]}
          >
            {player.name}
          </Text>
          <Text
            numberOfLines={1}
            style={[styles.feedReelMeta, { color: palette.muted }]}
          >
            {player.age} anos | {player.position} | {player.club}
          </Text>
          <Text
            numberOfLines={3}
            style={[styles.feedReelHighlight, { color: palette.text }]}
          >
            {player.highlight}
          </Text>

          <View style={styles.feedReelMetricRow}>
            {player.metrics.slice(0, 3).map((metric) => (
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
                  style={[styles.feedReelMetricValue, { color: palette.accent }]}
                >
                  {metric.value}
                </Text>
                <Text
                  numberOfLines={1}
                  style={[styles.feedReelMetricLabel, { color: palette.muted }]}
                >
                  {metric.label}
                </Text>
              </View>
            ))}
          </View>

          <View style={styles.progressLabelRow}>
            <Text style={[styles.progressText, { color: palette.muted }]}>
              {formatBRL(player.funded)}
            </Text>
            <Text style={[styles.progressText, { color: palette.muted }]}>
              {formatBRL(player.fundingGoal)}
            </Text>
          </View>
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

          <Pressable
            onPress={onOpen}
            style={[styles.feedReelButton, { backgroundColor: palette.accent }]}
          >
            <Text style={[styles.feedReelButtonText, { color: palette.onAccent }]}>
              Abrir oportunidade
            </Text>
          </Pressable>
        </View>
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
  const progress = Math.min(player.funded / player.fundingGoal, 1);
  const scoreColor = getScoreColor(player.score);

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
              {player.score}
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
          {player.metrics.slice(0, 3).map((metric) => (
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
            {formatBRL(player.funded)}
          </Text>
          <Text style={[styles.progressText, { color: palette.muted }]}>
            {formatBRL(player.fundingGoal)}
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
  onBack,
  onInvest,
  player
}: {
  canInvest: boolean;
  onBack: () => void;
  onInvest: (player: Player, amount: number) => void;
  player: Player;
}) {
  const palette = getCardPaletteFromId(player.id);
  const scoreColor = getScoreColor(player.score);
  const [amountText, setAmountText] = useState(String(player.minimumTicket));
  const amount = Number(amountText.replace(/\D/g, "")) || 0;
  const share = calculatePoolShare(
    amount,
    player.funded,
    player.athleteSharePercent
  );
  const projectedDistribution = calculateProjectedDistribution(
    amount,
    player.funded,
    player.athleteSharePercent,
    player.projectedMonthlyEarnings
  );
  const hasMinimumTicket = amount >= player.minimumTicket;
  const canSubmitInvestment = canInvest && hasMinimumTicket;

  return (
    <ScrollView contentContainerStyle={styles.detailContent}>
      <View style={styles.detailTopBar}>
        <Pressable onPress={onBack} style={styles.backButton}>
          <Text style={styles.backButtonText}>Voltar</Text>
        </Pressable>
        <Text style={styles.detailRisk}>Risco {player.riskLevel}</Text>
      </View>

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
        <View
          style={[styles.detailPlayButton, { backgroundColor: palette.accent }]}
        >
          <Text style={[styles.detailPlayText, { color: palette.onAccent }]}>
            PLAY
          </Text>
        </View>
        <View style={[styles.paletteBadge, { borderColor: palette.border }]}>
          <Text style={[styles.paletteBadgeText, { color: palette.accent }]}>
            NEXTSTAR
          </Text>
        </View>
        <Text style={[styles.detailVideoTitle, { color: palette.text }]}>
          {player.videoTitle}
        </Text>
      </View>

      <View style={styles.detailTitleRow}>
        <View style={styles.detailTitleBlock}>
          <Text style={styles.detailName}>{player.name}</Text>
          <Text style={styles.detailMeta}>
            {player.age} anos | {player.position} | {player.club}
          </Text>
        </View>
        <View style={[styles.scoreBadge, { borderColor: scoreColor }]}>
          <Text style={[styles.scoreValue, { color: scoreColor }]}>
            {player.score}
          </Text>
          <Text style={[styles.scoreLabel, { color: palette.muted }]}>score</Text>
        </View>
      </View>

      <View style={styles.metricGrid}>
        {player.metrics.map((metric) => (
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

      <View style={styles.infoPanel}>
        <Text style={styles.sectionTitle}>Tese</Text>
        <Text style={styles.bodyText}>{player.thesis}</Text>
      </View>

      <View style={styles.infoPanel}>
        <Text style={styles.sectionTitle}>Simular reserva</Text>
        <Text style={styles.bodyText}>
          {formatPercent(player.athleteSharePercent)} dos ganhos do atleta seriam
          destinados ao pool de investidores. Esta tela apenas simula o modelo.
        </Text>

        <View style={styles.inputRow}>
          <Text style={styles.currencyPrefix}>R$</Text>
          <TextInput
            keyboardType="number-pad"
            onChangeText={setAmountText}
            placeholder="Valor"
            placeholderTextColor="#806B3D"
            style={styles.amountInput}
            value={amountText}
          />
        </View>

        <View style={styles.simulationGrid}>
          <View style={styles.simulationBox}>
            <Text style={styles.simulationValue}>{formatPercent(share)}</Text>
            <Text style={styles.simulationLabel}>da receita futura</Text>
          </View>
          <View style={styles.simulationBox}>
            <Text style={styles.simulationValue}>
              {formatBRL(projectedDistribution)}
            </Text>
            <Text style={styles.simulationLabel}>projecao mensal</Text>
          </View>
        </View>

        <View style={styles.timelinePanel}>
          {investmentStages.map((stage, index) => (
            <View key={stage} style={styles.timelineRow}>
              <View style={styles.timelineDot}>
                <Text style={styles.timelineDotText}>{index + 1}</Text>
              </View>
              <Text style={styles.timelineText}>{stage}</Text>
            </View>
          ))}
        </View>

        {!hasMinimumTicket ? (
          <Text style={styles.validationText}>
            Ticket minimo: {formatBRL(player.minimumTicket)}
          </Text>
        ) : null}
        {!canInvest ? (
          <Text style={styles.validationText}>
            Reservas estao disponiveis apenas para contas de investidor.
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
          <Text style={styles.primaryButtonText}>Criar reserva simulada</Text>
        </Pressable>
      </View>
    </ScrollView>
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
  const [draft, setDraft] = useState<SubmissionDraft>({
    ...emptySubmissionDraft,
    athleteName: user.name
  });
  const [lastSubmittedId, setLastSubmittedId] = useState<string | null>(null);
  const age = Number(draft.age.replace(/\D/g, ""));
  const needsGuardianConsent = age > 0 && age < 18;
  const canSubmit =
    draft.athleteName.trim().length >= 3 &&
    age >= 12 &&
    draft.city.trim().length >= 2 &&
    draft.position.trim().length >= 2 &&
    draft.videoTitle.trim().length >= 4 &&
    draft.videoLink.trim().length >= 6 &&
    draft.highlight.trim().length >= 12 &&
    (!needsGuardianConsent || draft.hasGuardianConsent);

  function updateDraft(field: keyof SubmissionDraft, value: string | boolean) {
    setDraft((current) => ({ ...current, [field]: value }));
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
      highlight: draft.highlight.trim(),
      goals: draft.goals.trim() || "Objetivos ainda nao informados",
      hasGuardianConsent: draft.hasGuardianConsent,
      status: "Em revisao",
      submittedAt: new Date().toISOString()
    });
    setLastSubmittedId(id);
    setDraft({
      ...emptySubmissionDraft,
      athleteName: user.name
    });
  }

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <View style={styles.submitHero}>
        <Text style={styles.heroKicker}>Area do atleta</Text>
        <Text style={styles.heroTitle}>Envie seu video para analise.</Text>
        <Text style={styles.heroBody}>
          O admin aprova, reprova ou pede ajustes. So oportunidades aprovadas
          entram no feed dos investidores.
        </Text>
      </View>

      {lastSubmittedId ? (
        <View style={styles.successPanel}>
          <Text style={styles.successTitle}>Video enviado</Text>
          <Text style={styles.successBody}>
            O material entrou na fila de moderacao com status Em revisao.
          </Text>
        </View>
      ) : null}

      <View style={styles.infoPanel}>
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

      <View style={styles.infoPanel}>
        <Text style={styles.sectionTitle}>Video</Text>
        <LabeledInput
          label="Titulo do video"
          onChangeText={(value) => updateDraft("videoTitle", value)}
          placeholder="Melhores lances"
          value={draft.videoTitle}
        />
        <LabeledInput
          autoCapitalize="none"
          label="Link do video"
          onChangeText={(value) => updateDraft("videoLink", value)}
          placeholder="https://..."
          value={draft.videoLink}
        />
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
                <Text style={styles.checkMark}>OK</Text>
              ) : null}
            </View>
            <Text style={styles.checkText}>
              Confirmo que o responsavel legal autorizou o envio.
            </Text>
          </Pressable>
        ) : null}

        {!canSubmit ? (
          <Text style={styles.validationText}>
            Preencha os campos principais para enviar para moderacao.
          </Text>
        ) : null}

        <Pressable
          disabled={!canSubmit}
          onPress={submitDraft}
          style={[
            styles.primaryButton,
            !canSubmit ? styles.primaryButtonDisabled : null
          ]}
        >
          <Text style={styles.primaryButtonText}>Enviar para moderacao</Text>
        </Pressable>
      </View>

      <SubmissionList submissions={submissions} />
    </ScrollView>
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
  const pending = submissions.filter((item) => item.status === "Em revisao").length;
  const approved = submissions.filter((item) => item.status === "Aprovado").length;
  const changes = submissions.filter(
    (item) => item.status === "Ajustes solicitados"
  ).length;

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <View style={styles.adminHero}>
        <Text style={styles.heroKicker}>Painel admin</Text>
        <Text style={styles.heroTitle}>Controle da maquete.</Text>
        <Text style={styles.heroBody}>
          Aprove oportunidades, peca ajustes e simule o funil antes de qualquer
          backend ou pagamento real.
        </Text>
      </View>

      <View style={styles.metricGrid}>
        <SummaryMetric label="Pendentes" value={String(pending)} />
        <SummaryMetric label="Aprovados" value={String(approved)} />
        <SummaryMetric label="Ajustes" value={String(changes)} />
      </View>

      <View style={styles.infoPanel}>
        <Text style={styles.sectionTitle}>Fila de videos</Text>
        {submissions.length === 0 ? (
          <Text style={styles.bodyText}>Nenhum video na fila.</Text>
        ) : (
          submissions.map((submission) => (
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
                      "Aprovado na maquete. Agora aparece no feed."
                    )
                  }
                  style={[styles.smallButton, styles.approveButton]}
                >
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
                  <Text style={styles.smallButtonTextDark}>Ajustes</Text>
                </Pressable>
                <Pressable
                  onPress={() =>
                    onReview(
                      submission.id,
                      "Reprovado",
                      "Reprovado na maquete por falta de informacoes suficientes."
                    )
                  }
                  style={[styles.smallButton, styles.rejectButton]}
                >
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
  investments,
  onAdvance
}: {
  investments: Investment[];
  onAdvance: (investmentId: string) => void;
}) {
  const total = investments.reduce((sum, item) => sum + item.amount, 0);
  const monthlyProjection = investments.reduce(
    (sum, item) => sum + item.simulatedMonthlyReturn,
    0
  );

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <View style={styles.summaryBand}>
        <Text style={styles.summaryLabel}>Carteira simulada</Text>
        <Text style={styles.summaryValue}>{formatBRL(total)}</Text>
        <Text style={styles.summaryBody}>
          Projecao mensal hipotetica: {formatBRL(monthlyProjection)}. Esta
          carteira nao faz cobranca, assinatura ou transferencia.
        </Text>
      </View>

      <View style={styles.infoPanel}>
        <Text style={styles.sectionTitle}>Fluxo futuro</Text>
        {investmentStages.map((stage, index) => (
          <View key={stage} style={styles.timelineRow}>
            <View style={styles.timelineDot}>
              <Text style={styles.timelineDotText}>{index + 1}</Text>
            </View>
            <Text style={styles.timelineText}>{stage}</Text>
          </View>
        ))}
      </View>

      {investments.length === 0 ? (
        <View style={styles.emptyState}>
          <Text style={styles.emptyTitle}>Nenhuma reserva ainda</Text>
          <Text style={styles.emptyBody}>
            Abra um perfil no feed e crie uma reserva simulada.
          </Text>
        </View>
      ) : (
        investments.map((investment) => {
          const currentIndex = investmentStages.indexOf(investment.status);
          const isComplete = currentIndex === investmentStages.length - 1;

          return (
            <View key={investment.id} style={styles.portfolioItemBlock}>
              <View style={styles.portfolioItemHeader}>
                <View style={styles.submissionTextBlock}>
                  <Text style={styles.portfolioName}>
                    {investment.playerName}
                  </Text>
                  <Text style={styles.portfolioMeta}>{investment.status}</Text>
                </View>
                <View style={styles.portfolioNumbers}>
                  <Text style={styles.portfolioAmount}>
                    {formatBRL(investment.amount)}
                  </Text>
                  <Text style={styles.portfolioShare}>
                    {formatBRL(investment.simulatedMonthlyReturn)} proj.
                  </Text>
                </View>
              </View>

              <View style={styles.stepRail}>
                {investmentStages.map((stage, index) => (
                  <View
                    key={stage}
                    style={[
                      styles.stepMarker,
                      index <= currentIndex ? styles.stepMarkerActive : null
                    ]}
                  />
                ))}
              </View>

              <Pressable
                disabled={isComplete}
                onPress={() => onAdvance(investment.id)}
                style={[
                  styles.secondaryButton,
                  isComplete ? styles.secondaryButtonDisabled : null
                ]}
              >
                <Text style={styles.secondaryButtonText}>
                  {isComplete ? "Simulacao concluida" : "Avancar simulacao"}
                </Text>
              </Pressable>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

function ProfileScreen({
  investments,
  onSignOut,
  submissions,
  user
}: {
  investments: Investment[];
  onSignOut: () => void;
  submissions: VideoSubmission[];
  user: AppUser;
}) {
  const totalInvested = investments.reduce((sum, item) => sum + item.amount, 0);
  const mySubmissions = submissions.filter((item) => item.userId === user.id);
  const approved = submissions.filter((item) => item.status === "Aprovado").length;
  const pending = submissions.filter((item) => item.status === "Em revisao").length;

  return (
    <ScrollView contentContainerStyle={styles.screenContent}>
      <View style={styles.profileHero}>
        <Text style={styles.profileName}>{user.name}</Text>
        <Text style={styles.profileMeta}>
          {user.role} | {user.email}
        </Text>
      </View>

      <View style={styles.profilePanel}>
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

      {user.role === "Investidor" ? (
        <View style={styles.profilePanel}>
          <Text style={styles.sectionTitle}>Investidor</Text>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Reservas simuladas</Text>
            <Text style={styles.profileValue}>{investments.length}</Text>
          </View>
          <View style={styles.profileRow}>
            <Text style={styles.profileLabel}>Total</Text>
            <Text style={styles.profileValue}>{formatBRL(totalInvested)}</Text>
          </View>
        </View>
      ) : null}

      {user.role === "Atleta" ? (
        <View style={styles.profilePanel}>
          <Text style={styles.sectionTitle}>Atleta</Text>
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
        <View style={styles.profilePanel}>
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

      <View style={styles.profilePanel}>
        <Text style={styles.sectionTitle}>Maquete ativa</Text>
        <Text style={styles.bodyText}>
          Esta etapa simula cadastro, moderacao, feed aprovado, reserva de
          aporte, KYC, contrato, pagamento e distribuicao. Nenhuma etapa tem
          validade financeira ou juridica.
        </Text>
      </View>

      <Pressable onPress={onSignOut} style={styles.secondaryButton}>
        <Text style={styles.secondaryButtonText}>Sair da conta</Text>
      </Pressable>
    </ScrollView>
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
        placeholderTextColor="#806B3D"
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
  const tabs: Array<{ id: Tab; label: string }> =
    role === "Atleta"
      ? [
          { id: "submit", label: "Envio" },
          { id: "feed", label: "Feed" },
          { id: "profile", label: "Perfil" }
        ]
      : role === "Admin"
        ? [
            { id: "admin", label: "Admin" },
            { id: "feed", label: "Feed" },
            { id: "profile", label: "Perfil" }
          ]
        : [
            { id: "feed", label: "Feed" },
            { id: "portfolio", label: "Carteira" },
            { id: "profile", label: "Perfil" }
          ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((item) => {
        const isActive = item.id === activeTab;

        return (
          <Pressable
            key={item.id}
            onPress={() => onChange(item.id)}
            style={[styles.tabButton, isActive ? styles.tabButtonActive : null]}
          >
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
  safeArea: {
    backgroundColor: "#050503",
    flex: 1
  },
  keyboardView: {
    flex: 1
  },
  authShell: {
    flex: 1
  },
  authContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 22,
    width: "100%",
    maxWidth: 520,
    alignSelf: "center"
  },
  authLogo: {
    alignSelf: "center",
    height: 210,
    marginBottom: 12,
    width: "100%"
  },
  authLogoCompact: {
    height: 168
  },
  authBrand: {
    color: "#F7C84B",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0,
    textAlign: "center"
  },
  authEyebrow: {
    color: "#B8892D",
    fontSize: 13,
    fontWeight: "900",
    marginTop: 4,
    textAlign: "center",
    textTransform: "uppercase"
  },
  authTitle: {
    color: "#FFF4CC",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 14,
    marginBottom: 18
  },
  segmentedControl: {
    backgroundColor: "#14110A",
    borderColor: "#4D3511",
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: "row",
    gap: 6,
    marginBottom: 14,
    padding: 6
  },
  segmentButton: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    paddingVertical: 12
  },
  segmentButtonActive: {
    backgroundColor: "#D6A326"
  },
  segmentText: {
    color: "#C6A96A",
    fontSize: 12,
    fontWeight: "900"
  },
  segmentTextActive: {
    color: "#090805"
  },
  header: {
    alignItems: "center",
    alignSelf: "center",
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    justifyContent: "space-between",
    maxWidth: 760,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 14,
    width: "100%"
  },
  headerIdentity: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    minWidth: 190,
    paddingRight: 12
  },
  headerLogo: {
    height: 54,
    marginRight: 10,
    width: 72
  },
  headerLogoCompact: {
    height: 46,
    width: 62
  },
  headerTitleBlock: {
    flex: 1
  },
  brand: {
    color: "#F7C84B",
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0
  },
  headerSubtitle: {
    color: "#C6A96A",
    fontSize: 13,
    fontWeight: "600",
    marginTop: 2
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  walletBadge: {
    alignItems: "flex-end",
    backgroundColor: "#14110A",
    borderColor: "#6F4C16",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  walletLabel: {
    color: "#B8892D",
    fontSize: 11,
    fontWeight: "700"
  },
  walletValue: {
    color: "#FFF4CC",
    fontSize: 14,
    fontWeight: "900",
    marginTop: 2
  },
  signOutButton: {
    alignItems: "center",
    backgroundColor: "#21190B",
    borderColor: "#6F4C16",
    borderWidth: 1,
    borderRadius: 8,
    justifyContent: "center",
    minHeight: 42,
    paddingHorizontal: 12
  },
  signOutText: {
    color: "#F7C84B",
    fontSize: 12,
    fontWeight: "900"
  },
  screenContent: {
    alignSelf: "center",
    maxWidth: 760,
    paddingHorizontal: 20,
    paddingBottom: TAB_BAR_CONTENT_PADDING,
    width: "100%"
  },
  feedPagerShell: {
    backgroundColor: "#050503",
    flex: 1
  },
  feedPager: {
    backgroundColor: "#050503",
    flex: 1
  },
  feedReel: {
    alignSelf: "stretch",
    width: "100%"
  },
  feedReelStage: {
    flex: 1,
    justifyContent: "space-between",
    overflow: "hidden",
    paddingHorizontal: 20,
    paddingTop: 18
  },
  feedReelTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  feedReelKicker: {
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  feedReelCount: {
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4
  },
  feedReelCenter: {
    alignItems: "center",
    flex: 1,
    gap: 14,
    justifyContent: "center",
    minHeight: 130
  },
  reelPlayButton: {
    alignItems: "center",
    borderRadius: 8,
    height: 72,
    justifyContent: "center",
    width: 112
  },
  reelPlayText: {
    fontSize: 15,
    fontWeight: "900"
  },
  feedReelBottom: {
    paddingBottom: TAB_BAR_CONTENT_PADDING + 8,
    paddingTop: 12
  },
  feedReelVideoTitle: {
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 29
  },
  feedReelName: {
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 10
  },
  feedReelMeta: {
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4
  },
  feedReelHighlight: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 20,
    marginTop: 10
  },
  feedReelMetricRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12
  },
  feedReelMetric: {
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 56,
    paddingHorizontal: 9,
    paddingVertical: 8
  },
  feedReelMetricValue: {
    fontSize: 15,
    fontWeight: "900"
  },
  feedReelMetricLabel: {
    fontSize: 10,
    fontWeight: "900",
    marginTop: 3,
    textTransform: "uppercase"
  },
  feedReelButton: {
    alignItems: "center",
    borderRadius: 8,
    marginTop: 14,
    minHeight: 48,
    justifyContent: "center",
    paddingHorizontal: 14
  },
  feedReelButtonText: {
    fontSize: 14,
    fontWeight: "900"
  },
  feedStatsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14
  },
  feedStatCard: {
    backgroundColor: "#12100A",
    borderColor: "#46300F",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 13
  },
  feedStatValue: {
    color: "#F7C84B",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0
  },
  feedStatLabel: {
    color: "#C6A96A",
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
    color: "#B8892D",
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  sectionHeaderTitle: {
    color: "#FFF4CC",
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 3
  },
  sectionHeaderMeta: {
    color: "#C6A96A",
    fontSize: 12,
    fontWeight: "900",
    paddingBottom: 2
  },
  feedHero: {
    backgroundColor: "#0D0B07",
    borderColor: "#6F4C16",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    padding: 18
  },
  submitHero: {
    backgroundColor: "#101010",
    borderColor: "#6F4C16",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    padding: 18
  },
  adminHero: {
    backgroundColor: "#120D05",
    borderColor: "#6F4C16",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    padding: 18
  },
  heroKicker: {
    color: "#F7C84B",
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  heroTitle: {
    color: "#FFF4CC",
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 30,
    marginTop: 8
  },
  heroBody: {
    color: "#D8C48A",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8
  },
  card: {
    backgroundColor: "#100B04",
    borderColor: "#8B641D",
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
    backgroundColor: "#F7C84B",
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    width: 70
  },
  playText: {
    color: "#090805",
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
    color: "#FFF4CC",
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: 0
  },
  playerMeta: {
    color: "#C6A96A",
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
    color: "#F7C84B",
    fontSize: 18,
    fontWeight: "900"
  },
  scoreLabel: {
    color: "#C6A96A",
    fontSize: 10,
    fontWeight: "800"
  },
  highlight: {
    color: "#FFF4CC",
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
    backgroundColor: "#1F1607",
    borderColor: "#8B641D",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  tagText: {
    color: "#F7C84B",
    fontSize: 12,
    fontWeight: "800"
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14
  },
  progressText: {
    color: "#C6A96A",
    fontSize: 12,
    fontWeight: "800"
  },
  progressTrack: {
    backgroundColor: "#34260E",
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
    maxWidth: 760,
    paddingHorizontal: 20,
    paddingBottom: DETAIL_CONTENT_PADDING,
    width: "100%"
  },
  detailTopBar: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12
  },
  backButton: {
    backgroundColor: "#14110A",
    borderColor: "#6F4C16",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 14,
    paddingVertical: 9
  },
  backButtonText: {
    color: "#F7C84B",
    fontSize: 13,
    fontWeight: "900"
  },
  detailRisk: {
    color: "#F7C84B",
    fontSize: 13,
    fontWeight: "900"
  },
  detailVideo: {
    borderRadius: 8,
    height: 230,
    justifyContent: "space-between",
    marginTop: 4,
    padding: 16
  },
  detailPlayButton: {
    alignItems: "center",
    backgroundColor: "#F7C84B",
    borderRadius: 8,
    height: 54,
    justifyContent: "center",
    width: 86
  },
  detailPlayText: {
    color: "#090805",
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
    color: "#FFF4CC",
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 0
  },
  detailMeta: {
    color: "#C6A96A",
    fontSize: 14,
    fontWeight: "700",
    marginTop: 5
  },
  metricGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16
  },
  metricBox: {
    backgroundColor: "#14110A",
    borderColor: "#46300F",
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14
  },
  metricValue: {
    color: "#F7C84B",
    fontSize: 20,
    fontWeight: "900"
  },
  metricLabel: {
    color: "#C6A96A",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 3
  },
  infoPanel: {
    backgroundColor: "#12100A",
    borderColor: "#46300F",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 16
  },
  infoPanelCompact: {
    backgroundColor: "#12100A",
    borderColor: "#46300F",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: 4
  },
  sectionTitle: {
    color: "#FFF4CC",
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: 8
  },
  bodyText: {
    color: "#D8C48A",
    fontSize: 14,
    lineHeight: 21
  },
  labeledInputBlock: {
    marginTop: 12
  },
  inputLabel: {
    color: "#F0D27A",
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 6,
    textTransform: "uppercase"
  },
  formInput: {
    backgroundColor: "#080704",
    borderColor: "#5E4215",
    borderRadius: 8,
    borderWidth: 1,
    color: "#FFF4CC",
    fontSize: 15,
    fontWeight: "700",
    minHeight: 52,
    paddingHorizontal: 12
  },
  formInputMultiline: {
    lineHeight: 20,
    minHeight: 94,
    paddingTop: 12
  },
  inputRow: {
    alignItems: "center",
    backgroundColor: "#080704",
    borderColor: "#5E4215",
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 14,
    paddingHorizontal: 12
  },
  currencyPrefix: {
    color: "#F7C84B",
    fontSize: 17,
    fontWeight: "900",
    marginRight: 8
  },
  amountInput: {
    color: "#FFF4CC",
    flex: 1,
    fontSize: 22,
    fontWeight: "900",
    minHeight: 54
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
    backgroundColor: "#21190B",
    borderColor: "#5E4215",
    borderWidth: 1,
    borderRadius: 8,
    flex: 1,
    padding: 12
  },
  simulationValue: {
    color: "#F7C84B",
    fontSize: 18,
    fontWeight: "900"
  },
  simulationLabel: {
    color: "#C6A96A",
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4
  },
  timelinePanel: {
    backgroundColor: "#080704",
    borderColor: "#4D3511",
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
    backgroundColor: "#D6A326",
    borderRadius: 999,
    height: 24,
    justifyContent: "center",
    width: 24
  },
  timelineDotText: {
    color: "#090805",
    fontSize: 11,
    fontWeight: "900"
  },
  timelineText: {
    color: "#D8C48A",
    flex: 1,
    fontSize: 13,
    fontWeight: "800"
  },
  validationText: {
    color: "#FF9B6A",
    fontSize: 13,
    fontWeight: "800",
    marginTop: 10
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: "#D6A326",
    borderRadius: 8,
    marginTop: 14,
    paddingVertical: 15
  },
  primaryButtonDisabled: {
    backgroundColor: "#5A4A25"
  },
  primaryButtonText: {
    color: "#090805",
    fontSize: 15,
    fontWeight: "900"
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: "#14110A",
    borderColor: "#6F4C16",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    paddingVertical: 14
  },
  secondaryButtonDisabled: {
    backgroundColor: "#17140D"
  },
  secondaryButtonText: {
    color: "#F7C84B",
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
    borderColor: "#B8892D",
    borderRadius: 6,
    borderWidth: 2,
    height: 28,
    justifyContent: "center",
    width: 28
  },
  checkBoxActive: {
    backgroundColor: "#D6A326",
    borderColor: "#D6A326"
  },
  checkMark: {
    color: "#090805",
    fontSize: 10,
    fontWeight: "900"
  },
  checkText: {
    color: "#D8C48A",
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18
  },
  successPanel: {
    backgroundColor: "#171F12",
    borderColor: "#6FA34A",
    borderRadius: 8,
    borderWidth: 1,
    padding: 14
  },
  successTitle: {
    color: "#B9F27A",
    fontSize: 16,
    fontWeight: "900"
  },
  successBody: {
    color: "#D8F3B2",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 19,
    marginTop: 4
  },
  submissionItem: {
    borderColor: "#46300F",
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 12
  },
  adminItem: {
    borderColor: "#46300F",
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
    color: "#FFF4CC",
    fontSize: 16,
    fontWeight: "900"
  },
  submissionMeta: {
    color: "#C6A96A",
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3
  },
  submissionBody: {
    color: "#D8C48A",
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8
  },
  adminFinePrint: {
    color: "#C6A96A",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 8
  },
  reviewNote: {
    backgroundColor: "#080704",
    borderRadius: 8,
    color: "#D8C48A",
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
    backgroundColor: "#3A2A10"
  },
  statusApproved: {
    backgroundColor: "#17301D"
  },
  statusAdjust: {
    backgroundColor: "#1E2B3F"
  },
  statusRejected: {
    backgroundColor: "#3D1710"
  },
  statusPillText: {
    color: "#FFF4CC",
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
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 8
  },
  approveButton: {
    backgroundColor: "#2F7D45"
  },
  adjustButton: {
    backgroundColor: "#D6A326"
  },
  rejectButton: {
    backgroundColor: "#A63E28"
  },
  smallButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900"
  },
  smallButtonTextDark: {
    color: "#090805",
    fontSize: 12,
    fontWeight: "900"
  },
  summaryBand: {
    backgroundColor: "#0D0B07",
    borderColor: "#6F4C16",
    borderWidth: 1,
    borderRadius: 8,
    padding: 18
  },
  summaryLabel: {
    color: "#F7C84B",
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  summaryValue: {
    color: "#FFF4CC",
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 6
  },
  summaryBody: {
    color: "#D8C48A",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8
  },
  emptyState: {
    backgroundColor: "#12100A",
    borderColor: "#46300F",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    padding: 18
  },
  emptyTitle: {
    color: "#FFF4CC",
    fontSize: 19,
    fontWeight: "900"
  },
  emptyBody: {
    color: "#D8C48A",
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6
  },
  portfolioItemBlock: {
    backgroundColor: "#12100A",
    borderColor: "#46300F",
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 14
  },
  portfolioItemHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  portfolioName: {
    color: "#FFF4CC",
    fontSize: 17,
    fontWeight: "900"
  },
  portfolioMeta: {
    color: "#C6A96A",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4
  },
  portfolioNumbers: {
    alignItems: "flex-end",
    marginLeft: 12
  },
  portfolioAmount: {
    color: "#F7C84B",
    fontSize: 16,
    fontWeight: "900"
  },
  portfolioShare: {
    color: "#D8C48A",
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
    backgroundColor: "#2B2110",
    borderRadius: 999,
    flex: 1,
    height: 8
  },
  stepMarkerActive: {
    backgroundColor: "#D6A326"
  },
  profileHero: {
    backgroundColor: "#0D0B07",
    borderColor: "#6F4C16",
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 14,
    padding: 18
  },
  profileName: {
    color: "#FFF4CC",
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 0
  },
  profileMeta: {
    color: "#C6A96A",
    fontSize: 13,
    fontWeight: "700",
    marginTop: 5
  },
  profilePanel: {
    backgroundColor: "#12100A",
    borderColor: "#46300F",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16
  },
  profileRow: {
    alignItems: "center",
    borderColor: "#2B2110",
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
    color: "#C6A96A",
    fontSize: 13,
    fontWeight: "800"
  },
  profileValue: {
    color: "#FFF4CC",
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 12,
    textAlign: "right"
  },
  tabBar: {
    backgroundColor: "#0D0B07",
    borderColor: "#6F4C16",
    borderRadius: 8,
    borderWidth: 1,
    bottom: SYSTEM_NAV_CLEARANCE,
    flexDirection: "row",
    gap: 8,
    left: 20,
    padding: 6,
    position: "absolute",
    right: 20
  },
  tabButton: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    paddingVertical: 12
  },
  tabButtonActive: {
    backgroundColor: "#D6A326"
  },
  tabText: {
    color: "#C6A96A",
    fontSize: 13,
    fontWeight: "900"
  },
  tabTextActive: {
    color: "#090805"
  }
});
