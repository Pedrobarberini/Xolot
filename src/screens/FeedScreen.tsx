import React, { useEffect, useRef, useState } from "react";
import { useEvent } from "expo";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { VideoView, useVideoPlayer } from "expo-video";
import { ArrowLeft, Expand, Play, UserCheck, UserPlus, UserRound, Volume2, VolumeX } from "lucide-react-native";
import { Alert, Animated, Easing, Image, PanResponder, Platform, Pressable, ScrollView, Text, useWindowDimensions, View } from "react-native";
import {
  formatPlaybackTime,
  getCardPalette,
  getPointerLocationX,
  getPointerLocationY,
  getScoreColor
} from "../actions/appActions";
import { BalanceLine } from "../components/Navigation";
import { ProfileAvatarImage } from "../components/ProfileAvatarImage";
import { NEXTSTAR_SYMBOL } from "../constants/assets";
import { FEED_TEXT_LIMIT_COMPACT, FEED_TEXT_LIMIT_WIDE, USE_CENTERED_WEB_LAYOUT } from "../constants/layout";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import {
  AthleteFund,
  Player,
  ProfileAvatar,
  ProfileAvatarsByProfile
} from "../types";
import { CardPalette } from "../ui/types";
import { formatBRL, formatPercent } from "../utils/investment";

export function FeedScreen({
  balance,
  currentUserId,
  focusPlayerId,
  followingProfileIds,
  funds,
  onBackToProfile,
  onOpenInvestment,
  onOpenPlayer,
  onToggleFollow,
  players: feedPlayers,
  profileAvatars
}: {
  balance: number | null;
  currentUserId: string;
  focusPlayerId?: string | null;
  followingProfileIds: string[];
  funds: AthleteFund[];
  onBackToProfile?: () => void;
  onOpenInvestment: (player: Player) => void;
  onOpenPlayer: (player: Player) => void;
  onToggleFollow: (player: Player) => void;
  players: Player[];
  profileAvatars: ProfileAvatarsByProfile;
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

  useEffect(() => {
    if (!focusPlayerId) {
      return;
    }

    const targetIndex = feedPlayers.findIndex(
      (player) => player.id === focusPlayerId
    );

    if (targetIndex < 0) {
      return;
    }

    activeFeedIndexRef.current = targetIndex;
    setActiveFeedIndex(targetIndex);
    const frame = requestAnimationFrame(() => {
      const sectionOffset = sectionOffsetsRef.current[targetIndex];

      feedScrollRef.current?.scrollTo({
        animated: false,
        y: sectionOffset ?? targetIndex * pageHeight
      });
    });

    return () => cancelAnimationFrame(frame);
  }, [feedPlayers, focusPlayerId, pageHeight]);

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
              avatar={profileAvatars[player.profileId]}
              currentUserId={currentUserId}
              fund={funds.find((item) => item.profileId === player.profileId)}
              isFollowing={followingProfileIds.includes(player.profileId)}
              isActive={index === activeFeedIndex}
              onInvest={() => onOpenInvestment(player)}
              onOpen={() => onOpenPlayer(player)}
              onToggleFollow={() => onToggleFollow(player)}
              palette={getCardPalette(index)}
              player={player}
              reelHeight={pageHeight}
            />
          </View>
        ))}
      </ScrollView>
      <View style={styles.feedTopNavigation}>
        {onBackToProfile ? (
          <Pressable
            accessibilityLabel="Voltar ao perfil"
            accessibilityRole="button"
            hitSlop={6}
            onPress={onBackToProfile}
            style={styles.feedProfileBackButton}
          >
            <ArrowLeft color={colors.text} size={21} strokeWidth={2.2} />
          </Pressable>
        ) : null}
        <View pointerEvents="none" style={styles.feedBrandSlot}>
          <Image
            accessibilityLabel="NextStar"
            resizeMode="contain"
            source={NEXTSTAR_SYMBOL}
            style={styles.feedReelBrandMark}
          />
        </View>
      </View>
      {balance !== null ? <BalanceLine balance={balance} overlay /> : null}
    </View>
  );
}

function FeedReel({
  avatar,
  currentUserId,
  fund,
  isFollowing,
  isActive,
  onInvest,
  onOpen,
  onToggleFollow,
  palette,
  player,
  reelHeight
}: {
  avatar?: ProfileAvatar;
  currentUserId: string;
  fund?: AthleteFund;
  isFollowing: boolean;
  isActive: boolean;
  onInvest: () => void;
  onOpen: () => void;
  onToggleFollow: () => void;
  palette: CardPalette;
  player: Player;
  reelHeight: number;
}) {
  const { width } = useWindowDimensions();
  const [isExpanded, setIsExpanded] = useState(false);
  const expansionProgress = useRef(new Animated.Value(0)).current;
  const revealProgress = useRef(new Animated.Value(0)).current;
  const isWide = !USE_CENTERED_WEB_LAYOUT && width >= 900;
  const evaluation = player.evaluation;
  const canFollow =
    player.ownerUserId !== currentUserId &&
    player.profileId !== `profile-${currentUserId}`;
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
  const canInvest = fund?.status === "Captando";
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

  function animateDescription(nextExpanded: boolean) {
    expansionProgress.stopAnimation();

    if (nextExpanded) {
      setIsExpanded(true);
    }

    Animated.timing(expansionProgress, {
      duration: nextExpanded ? 320 : 240,
      easing: nextExpanded
        ? Easing.out(Easing.cubic)
        : Easing.inOut(Easing.cubic),
      toValue: nextExpanded ? 1 : 0,
      useNativeDriver: false
    }).start(({ finished }) => {
      if (finished && !nextExpanded) {
        setIsExpanded(false);
      }
    });
  }

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
      expansionProgress.stopAnimation();
      expansionProgress.setValue(0);
      setIsExpanded(false);
    }
  }, [expansionProgress, isActive]);

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

          <Animated.View
            style={[
              styles.feedTextOverlay,
              isWide
                ? [
                    styles.feedTextOverlayWide,
                    { right: Math.max(300, canvasWidth - 360) }
                  ]
                : [
                    styles.feedTextOverlayCompact,
                    {
                      minHeight: expansionProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 270]
                      }),
                      paddingTop: expansionProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [14, 78]
                      })
                    }
                  ]
            ]}
          >
            {!isWide && isExpanded ? (
              <Animated.View
                pointerEvents="none"
                style={[
                  styles.feedCompactBackdropAnimation,
                  { opacity: expansionProgress }
                ]}
              >
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
              </Animated.View>
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
                {avatar ? (
                  <ProfileAvatarImage avatar={avatar} />
                ) : isWide ? (
                  <Text
                    style={[styles.feedAvatarText, { color: palette.accent }]}
                  >
                    {initials}
                  </Text>
                ) : (
                  <UserRound color={colors.onPrimary} size={20} strokeWidth={2.2} />
                )}
              </Pressable>
              <Pressable
                accessibilityLabel={`Abrir perfil de ${player.name}`}
                accessibilityRole="button"
                hitSlop={4}
                onPress={onOpen}
                style={styles.feedProfileTextBlock}
              >
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
              </Pressable>
              {canFollow ? (
                <Pressable
                  accessibilityLabel={
                    isFollowing
                      ? `Deixar de seguir ${player.name}`
                      : `Seguir ${player.name}`
                  }
                  accessibilityRole="button"
                  onPress={onToggleFollow}
                  style={({ pressed }) => [
                    styles.feedFollowButton,
                    !isWide ? styles.feedFollowButtonCompact : null,
                    isFollowing ? styles.feedFollowButtonActive : null,
                    isFollowing && !isWide
                      ? styles.feedFollowButtonActiveCompact
                      : null,
                    pressed ? styles.buttonPressed : null
                  ]}
                >
                  {isFollowing ? (
                    <UserCheck
                      color={isWide ? colors.primary : colors.onPrimary}
                      size={15}
                      strokeWidth={2.4}
                    />
                  ) : (
                    <UserPlus
                      color={colors.onPrimary}
                      size={15}
                      strokeWidth={2.4}
                    />
                  )}
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.feedFollowButtonText,
                      isFollowing && isWide
                        ? styles.feedFollowButtonTextActiveWide
                        : null
                    ]}
                  >
                    {isFollowing ? "Seguindo" : "Seguir"}
                  </Text>
                </Pressable>
              ) : null}
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
                    onPress={() => animateDescription(!isExpanded)}
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
                {!isExpanded ? (
                  <Text style={styles.feedCompactDescription}>
                    <Text style={styles.feedCompactDescriptionTitle}>
                      {player.videoTitle}
                    </Text>
                    {presentationText ? ` - ${compactPreview}` : ""}
                    <Text
                      accessibilityRole="button"
                      onPress={() => animateDescription(true)}
                      style={styles.feedCompactInlineAction}
                    >
                      {"  "}mais
                    </Text>
                  </Text>
                ) : (
                  <Animated.View
                    style={[
                      styles.feedCompactExpandedContent,
                      {
                        opacity: expansionProgress,
                        transform: [
                          {
                            translateY: expansionProgress.interpolate({
                              inputRange: [0, 1],
                              outputRange: [10, 0]
                            })
                          }
                        ]
                      }
                    ]}
                  >
                    <Text style={styles.feedCompactDescription}>
                      <Text style={styles.feedCompactDescriptionTitle}>
                        {player.videoTitle}
                      </Text>
                      {presentationText ? ` - ${presentationText}` : ""}
                    </Text>
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
                        accessibilityLabel={`Investir no perfil de ${player.name}`}
                        accessibilityRole="button"
                        disabled={!canInvest}
                        hitSlop={8}
                        onPress={onInvest}
                        style={[
                          styles.feedCompactTextButton,
                          !canInvest
                            ? styles.feedCompactTextButtonDisabled
                            : null
                        ]}
                      >
                        <Text
                          style={[
                            styles.feedCompactTextButtonLabel,
                            !canInvest
                              ? styles.feedCompactTextButtonLabelDisabled
                              : null
                          ]}
                        >
                          Investir
                        </Text>
                      </Pressable>
                      <Pressable
                        accessibilityLabel="Recolher descricao"
                        accessibilityRole="button"
                        hitSlop={8}
                        onPress={() => animateDescription(false)}
                        style={styles.feedCompactTextButton}
                      >
                        <Text style={styles.feedCompactTextButtonLabel}>
                          menos
                        </Text>
                      </Pressable>
                    </View>
                  </Animated.View>
                )}
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
          </Animated.View>

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
