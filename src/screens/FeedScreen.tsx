import { BRAND } from "../config/brand.ts";
import { operationMetrics } from "../config/operationMetrics";
import type { MetricFinish } from "../shared/observability/operationMetrics";
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { resolveFeedAnchor, type FeedAnchor } from "../utils/feedSession";
import { useEvent } from "expo";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { VideoView, useVideoPlayer } from "expo-video";
import {
  Bell,
  Heart,
  MessageCircle,
  MoreVertical,
  Play,
  Share2,
  SlidersHorizontal,
  UserCheck,
  UserPlus,
  UsersRound,
  UserRound,
} from "lucide-react-native";
import {
  Animated,
  Easing,
  Image,
  PanResponder,
  Platform,
  Pressable,
  ScrollView,
  Text,
  useWindowDimensions,
  View,
} from "react-native";
import { formatPlaybackTime, getCardPalette, getPointerLocationX } from "../actions/appActions";
import { useResolvedVideoSource } from "../actions/useResolvedVideoSource";
import { BackButton } from "../components/Navigation";
import { CommentsModal } from "../components/CommentsModal";
import { FeedPostOptionsModal } from "../components/FeedPostOptionsModal";
import { NotificationsPopover } from "../components/NotificationsPopover";
import type { NotificationPostTarget } from "../app/useNotificationNavigation";
import { ProfileAvatarImage } from "../components/ProfileAvatarImage";
import { ProfileListModal, type ProfileListItemData } from "../components/ProfileListModal";
import { SharePostModal } from "../components/SharePostModal";
import { VideoVolumeControl } from "../components/VideoVolumeControl";
import { FOLKO_SYMBOL } from "../constants/assets";
import {
  FEED_TEXT_LIMIT_COMPACT,
  FEED_TEXT_LIMIT_WIDE,
  USE_CENTERED_WEB_LAYOUT,
} from "../constants/layout";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import type {
  AppNotification,
  AppUser,
  MessageContact,
  Player,
  PostComment,
  ProfileAvatar,
  ProfileAvatarsByProfile,
} from "../types";
import { formatProfileActivity } from "../utils/profileActivity";
import { CardPalette } from "../ui/types";
import { getPlayerContentKey, getPlayerContentLabel } from "../utils/feedEngagement";
import { selectFeedContentFit, selectFeedPlaybackIndex } from "../utils/feedPlayback";
import {
  createMediaTapGestureState,
  MEDIA_DOUBLE_TAP_DELAY_MS,
  resolveMediaTapGesture,
  suppressMediaTapGesture,
} from "../utils/mediaTapGesture";

export function FeedScreen({
  initialAnchor = null,
  entryKeys: suppliedEntryKeys,
  onAnchorChange,
  activeCampaignPlayerIds,
  autoplayEnabled,
  backLabel = "Voltar ao perfil",
  blockedProfileIds,
  commentsByPlayer,
  currentUserId,
  focusPlayerId,
  followingProfileIds,
  interestedContentKeys,
  likedPlayerIds,
  likeCountsByPlayer,
  shareCountsByPlayer,
  mutedContentKeys,
  notifications,
  notificationTarget,
  reportedPlayerIds,
  onAddComment,
  onBackToProfile,
  onDeleteComment,
  onImmersiveChange,
  onMarkNotificationsRead,
  onOpenNotification,
  onOpenPlayer,
  onOpenTaggedUser,
  onRecordView,
  onRefreshFeed,
  onReportPlayer,
  onShare,
  onToggleBlockProfile,
  onToggleFollow,
  onToggleInterest,
  onToggleLike,
  onToggleMutedContent,
  players: feedPlayers,
  profileAvatars,
  shareContacts,
  users,
}: {
  initialAnchor?: FeedAnchor | null;
  entryKeys?: string[];
  onAnchorChange?: (anchor: FeedAnchor) => void;
  activeCampaignPlayerIds: Set<string>;
  autoplayEnabled: boolean;
  backLabel?: string;
  blockedProfileIds: Set<string>;
  commentsByPlayer: Record<string, PostComment[]>;
  currentUserId: string;
  focusPlayerId?: string | null;
  followingProfileIds: string[];
  interestedContentKeys: Set<string>;
  likedPlayerIds: Set<string>;
  likeCountsByPlayer: Record<string, number>;
  shareCountsByPlayer: Record<string, number>;
  mutedContentKeys: Set<string>;
  notifications: AppNotification[];
  notificationTarget?: NotificationPostTarget | null;
  reportedPlayerIds: Set<string>;
  onAddComment: (playerId: string, body: string, replyToCommentId?: string) => boolean;
  onBackToProfile?: () => void;
  onDeleteComment: (commentId: string) => void;
  onImmersiveChange?: (active: boolean) => void;
  onMarkNotificationsRead: (notificationIds: string[]) => void;
  onOpenNotification: (notification: AppNotification) => void;
  onOpenPlayer: (player: Player) => void;
  onOpenTaggedUser: (user: AppUser) => void;
  onRecordView: (playerId: string) => void;
  onRefreshFeed: () => void;
  onReportPlayer: (player: Player) => void;
  onShare: (player: Player, contact: MessageContact, message: string) => void;
  onToggleBlockProfile: (player: Player) => void;
  onToggleFollow: (player: Player) => void;
  onToggleInterest: (player: Player) => void;
  onToggleLike: (player: Player) => void;
  onToggleMutedContent: (contentKey: string) => void;
  players: Player[];
  profileAvatars: ProfileAvatarsByProfile;
  shareContacts: MessageContact[];
  users: AppUser[];
}) {
  const { height } = useWindowDimensions();
  const entryKeys = suppliedEntryKeys ?? feedPlayers.map((player) => player.id);
  const entryScope = JSON.stringify(entryKeys);
  const initialIndex = focusPlayerId ? Math.max(0, feedPlayers.findIndex((player) => player.id === focusPlayerId)) : resolveFeedAnchor(entryKeys, initialAnchor).index;
  const firstItemMetric = useRef<MetricFinish | null>(null);
  useEffect(() => {
    firstItemMetric.current = operationMetrics.begin("feed.first_item");
    return () => { firstItemMetric.current?.("cancelled"); firstItemMetric.current = null; };
  }, []);
  const [feedHeight, setFeedHeight] = useState(0);
  const [activeFeedIndex, setActiveFeedIndex] = useState(initialIndex);
  const [resetEpoch, setResetEpoch] = useState(0);
  const [feedVolume, setFeedVolume] = useState(0);
  const [isFeedNavigating, setIsFeedNavigating] = useState(false);
  const [isCleanView, setIsCleanView] = useState(false);
  const [commentPlayer, setCommentPlayer] = useState<Player | null>(null);
  const [focusedCommentId, setFocusedCommentId] = useState<string | undefined>();
  const [preferencePlayer, setPreferencePlayer] = useState<Player | null>(null);
  const [sharePlayer, setSharePlayer] = useState<Player | null>(null);
  const [mentionedPlayer, setMentionedPlayer] = useState<Player | null>(null);
  const [notificationsVisible, setNotificationsVisible] = useState(false);
  const feedScrollRef = useRef<ScrollView | null>(null);
  const activeFeedIndexRef = useRef(initialIndex);
  const anchorRef = useRef(initialAnchor);
  const anchorChangeRef = useRef(onAnchorChange);
  anchorChangeRef.current = onAnchorChange;
  const feedSettleTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestFeedOffsetRef = useRef(0);
  const sectionOffsetsRef = useRef<Record<number, number>>({});
  const cleanViewActiveRef = useRef(false);
  const feedChromeOpacity = useRef(new Animated.Value(1)).current;
  const immersiveChangeRef = useRef(onImmersiveChange);
  immersiveChangeRef.current = onImmersiveChange;
  const pageHeight = feedHeight || height;
  const positionContextRef = useRef({ entryKeys, pageHeight });
  positionContextRef.current = { entryKeys, pageHeight };
  const lastFeedIndex = Math.max(feedPlayers.length - 1, 0);
  const activePlayerId = feedPlayers[activeFeedIndex]?.id;
  useEffect(() => {
    if (!feedHeight || !activePlayerId) return;
    const frame = requestAnimationFrame(() => { firstItemMetric.current?.(); firstItemMetric.current = null; });
    return () => cancelAnimationFrame(frame);
  }, [activePlayerId, feedHeight]);
  const recordViewRef = useRef(onRecordView);
  recordViewRef.current = onRecordView;
  const unreadNotificationCount = notifications.filter(
    (notification) => !notification.readAt,
  ).length;
  const hasFeedOverlay = Boolean(
    commentPlayer || mentionedPlayer || notificationsVisible || preferencePlayer || sharePlayer,
  );
  const playbackFeedIndex = selectFeedPlaybackIndex({
    activeIndex: activeFeedIndex,
    hasOverlay: hasFeedOverlay,
    isNavigating: isFeedNavigating,
    itemCount: feedPlayers.length,
  });
  const mentionedUsers = useMemo(
    () =>
      (mentionedPlayer?.mentions ?? [])
        .map((mention) =>
          users.find(
            (account) =>
              account.username.toLocaleLowerCase("pt-BR") === mention.toLocaleLowerCase("pt-BR"),
          ),
        )
        .filter((account): account is AppUser => Boolean(account)),
    [mentionedPlayer, users],
  );
  const mentionedProfiles = useMemo<ProfileListItemData[]>(
    () =>
      mentionedUsers.map((account) => ({
        avatar: profileAvatars["profile-" + account.id],
        id: account.id,
        name: account.name,
        subtitle: account.profileCompleted
          ? formatProfileActivity(account.sport, account.position, account.city)
          : `Perfil ${BRAND.name}`,
        username: account.username,
      })),
    [mentionedUsers, profileAvatars],
  );

  useEffect(
    () => () => {
      cleanViewActiveRef.current = false;
      feedChromeOpacity.stopAnimation();
      if (feedSettleTimerRef.current) {
        clearTimeout(feedSettleTimerRef.current);
      }
      immersiveChangeRef.current?.(false);
    },
    [feedChromeOpacity],
  );

  useEffect(() => {
    if (cleanViewActiveRef.current) {
      setCleanViewActive(false);
    }
  }, [activePlayerId]);

  useEffect(() => {
    if (!activePlayerId || playbackFeedIndex === null) {
      return undefined;
    }

    const viewTimer = setTimeout(() => {
      recordViewRef.current(activePlayerId);
    }, 800);

    return () => clearTimeout(viewTimer);
  }, [activePlayerId, playbackFeedIndex, currentUserId]);

  function setCleanViewActive(active: boolean) {
    if (cleanViewActiveRef.current === active) {
      return;
    }

    cleanViewActiveRef.current = active;
    setIsCleanView(active);
    feedChromeOpacity.stopAnimation();
    Animated.timing(feedChromeOpacity, {
      duration: active ? 150 : 220,
      easing: active ? Easing.out(Easing.quad) : Easing.out(Easing.cubic),
      toValue: active ? 0 : 1,
      useNativeDriver: true,
    }).start();
    immersiveChangeRef.current?.(active);
  }

  const activateFeedIndex = useCallback((index: number) => {
    const safeIndex = Math.min(Math.max(index, 0), lastFeedIndex);

    if (activeFeedIndexRef.current === safeIndex) {
      return;
    }

    activeFeedIndexRef.current = safeIndex;
    setActiveFeedIndex(safeIndex);
  }, [lastFeedIndex]);

  useLayoutEffect(() => {
    if (!feedHeight) return;
    const keys = JSON.parse(entryScope) as string[];
    const restored = resolveFeedAnchor(keys, anchorRef.current);
    sectionOffsetsRef.current = {};
    activeFeedIndexRef.current = restored.index;
    setActiveFeedIndex(restored.index);
    latestFeedOffsetRef.current = (restored.index + restored.progress) * feedHeight;
    feedScrollRef.current?.scrollTo({ animated: false, y: latestFeedOffsetRef.current });
  }, [entryScope, feedHeight]);

  useEffect(() => () => {
    if (anchorRef.current) anchorChangeRef.current?.(anchorRef.current);
  }, []);

  const focusIndex = focusPlayerId ? feedPlayers.findIndex((player) => player.id === focusPlayerId) : -1;
  useEffect(() => {
    if (activeFeedIndex > lastFeedIndex) {
      activateFeedIndex(lastFeedIndex);
    }
  }, [activeFeedIndex, activateFeedIndex, lastFeedIndex]);

  useEffect(() => {
    if (!focusPlayerId) {
      return;
    }

    const targetIndex = focusIndex;

    if (targetIndex < 0) {
      return;
    }

    activateFeedIndex(targetIndex);
    const frame = requestAnimationFrame(() => {
      const sectionOffset = sectionOffsetsRef.current[targetIndex];

      feedScrollRef.current?.scrollTo({
        animated: false,
        y: sectionOffset ?? targetIndex * pageHeight,
      });
      latestFeedOffsetRef.current = sectionOffset ?? targetIndex * pageHeight;
      anchorRef.current = { entryKey: positionContextRef.current.entryKeys[targetIndex], progress: 0 };
    });

    return () => cancelAnimationFrame(frame);
  }, [activateFeedIndex, focusIndex, focusPlayerId, pageHeight, notificationTarget?.requestId]);

  useEffect(() => {
    if (!notificationTarget) return;
    setCleanViewActive(false);
    setFocusedCommentId(notificationTarget.commentId);
    setCommentPlayer(notificationTarget.commentId ? notificationTarget.player : null);
  // A new request must reopen the same comment even when its post ID is unchanged.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notificationTarget?.requestId]);

  function openNotifications() {
    setNotificationsVisible(true);
    const unreadNotificationIds = notifications
      .filter((notification) => !notification.readAt)
      .map((notification) => notification.id);

    if (unreadNotificationIds.length > 0) {
      onMarkNotificationsRead(unreadNotificationIds);
    }
  }
  function refreshFeed() {
    anchorRef.current = null;
    onRefreshFeed();
    setCommentPlayer(null);
    setMentionedPlayer(null);
    setPreferencePlayer(null);
    setSharePlayer(null);
    setNotificationsVisible(false);
    setCleanViewActive(false);
    if (feedSettleTimerRef.current) {
      clearTimeout(feedSettleTimerRef.current);
      feedSettleTimerRef.current = null;
    }
    sectionOffsetsRef.current = {};
    activeFeedIndexRef.current = 0;
    latestFeedOffsetRef.current = 0;
    setActiveFeedIndex(0);
    setResetEpoch((current) => current + 1);
    setIsFeedNavigating(false);
    feedScrollRef.current?.scrollTo({ animated: false, y: 0 });
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

  function clearFeedSettleTimer() {
    if (!feedSettleTimerRef.current) {
      return;
    }

    clearTimeout(feedSettleTimerRef.current);
    feedSettleTimerRef.current = null;
  }

  function finishFeedNavigation(offsetY = latestFeedOffsetRef.current) {
    clearFeedSettleTimer();
    latestFeedOffsetRef.current = offsetY;

    if (!pageHeight || feedPlayers.length === 0) {
      setIsFeedNavigating(false);
      return;
    }

    activateFeedIndex(getNearestFeedIndex(offsetY));
    rememberPosition(offsetY);
    if (anchorRef.current) anchorChangeRef.current?.(anchorRef.current);
    setIsFeedNavigating(false);
  }

  function rememberPosition(offsetY: number) {
    const index = Math.min(Math.max(0, Math.floor(offsetY / pageHeight)), lastFeedIndex);
    if (entryKeys[index]) anchorRef.current = {
      entryKey: entryKeys[index],
      progress: Math.max(0, Math.min(1, offsetY / pageHeight - index)),
    };
  }

  function scheduleFeedNavigationFinish() {
    clearFeedSettleTimer();
    feedSettleTimerRef.current = setTimeout(() => {
      feedSettleTimerRef.current = null;
      finishFeedNavigation();
    }, 180);
  }

  return (
    <View
      testID="feed-pager-shell"
      onLayout={(event) => {
        const nextHeight = event.nativeEvent.layout.height;

        if (Math.abs(nextHeight - feedHeight) > 1) {
          setFeedHeight(nextHeight);
        }
      }}
      style={styles.feedPagerShell}
    >
      <ScrollView
        testID="feed-pager-scroll"
        bounces={false}
        decelerationRate="fast"
        nativeID="xolot-feed-scroll"
        ref={feedScrollRef}
        onMomentumScrollBegin={clearFeedSettleTimer}
        onMomentumScrollEnd={(event) => {
          finishFeedNavigation(event.nativeEvent.contentOffset.y);
        }}
        onScroll={(event) => {
          latestFeedOffsetRef.current = event.nativeEvent.contentOffset.y;
          rememberPosition(latestFeedOffsetRef.current);
          setIsFeedNavigating(true);
          scheduleFeedNavigationFinish();
        }}
        onScrollBeginDrag={(event) => {
          clearFeedSettleTimer();
          latestFeedOffsetRef.current = event.nativeEvent.contentOffset.y;
          setIsFeedNavigating(true);
        }}
        onScrollEndDrag={(event) => {
          latestFeedOffsetRef.current = event.nativeEvent.contentOffset.y;
          scheduleFeedNavigationFinish();
        }}
        scrollEnabled={!isCleanView}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        snapToAlignment="start"
        snapToInterval={pageHeight}
        style={styles.feedPager}
      >
        {feedPlayers.length === 0 ? (
          <View style={[styles.feedEmptyState, { height: pageHeight }]}>
            <View style={styles.feedEmptyStateIcon}>
              <SlidersHorizontal color={colors.primaryText} size={26} />
            </View>
            <Text style={styles.feedEmptyStateTitle}>Nenhuma publicação disponível</Text>
            <Text style={styles.feedEmptyStateBody}>
              Novas publicações aparecerão aqui assim que forem enviadas.
            </Text>
          </View>
        ) : (
          feedPlayers.map((player, index) => (
            <View
              collapsable={false}
              key={entryKeys[index] ?? player.id}
              nativeID={`xolot-feed-section-${index}`}
              onLayout={(event) => {
                sectionOffsetsRef.current[index] = event.nativeEvent.layout.y;
              }}
            >
              <FeedReel
                autoplayEnabled={autoplayEnabled}
                avatar={profileAvatars[player.profileId]}
                chromeOpacity={feedChromeOpacity}
                currentUserId={currentUserId}
                isFollowing={followingProfileIds.includes(player.profileId)}
                commentCount={commentsByPlayer[player.id]?.length ?? 0}
                isActive={index === playbackFeedIndex}
                isLiked={likedPlayerIds.has(player.id)}
                isSponsored={activeCampaignPlayerIds.has(player.id)}
                isCleanView={isCleanView}
                likeCount={likeCountsByPlayer[player.id] ?? 0}
                shareCount={shareCountsByPlayer[player.id] ?? 0}
                onCleanViewChange={setCleanViewActive}
                onComments={() => setCommentPlayer(player)}
                onMore={() => setPreferencePlayer(player)}
                onOpenMentions={() => setMentionedPlayer(player)}
                onOpen={() => onOpenPlayer(player)}
                onShare={() => setSharePlayer(player)}
                onToggleLike={() => onToggleLike(player)}
                onToggleFollow={() => onToggleFollow(player)}
                onVolumeChange={setFeedVolume}
                palette={getCardPalette(index)}
                player={player}
                reelHeight={pageHeight}
                resetEpoch={resetEpoch}
                volume={feedVolume}
              />
            </View>
          ))
        )}
      </ScrollView>
      <Animated.View
        pointerEvents={isCleanView ? "none" : "auto"}
        style={[styles.feedTopNavigation, { opacity: feedChromeOpacity }]}
      >
        {onBackToProfile ? (
          <BackButton accessibilityLabel={backLabel} inverse onPress={onBackToProfile} />
        ) : null}
        <Pressable
          accessibilityLabel="Atualizar feed"
          accessibilityRole="button"
          hitSlop={8}
          onPress={refreshFeed}
          style={({ pressed }) => [
            styles.feedBrandSlot,
            pressed ? styles.feedBrandSlotPressed : null,
          ]}
        >
          <Image
            accessibilityLabel={BRAND.name}
            resizeMode="contain"
            source={FOLKO_SYMBOL}
            style={styles.feedReelBrandMark}
          />
        </Pressable>
      </Animated.View>
      <Animated.View
        pointerEvents={isCleanView ? "none" : "auto"}
        style={[styles.feedNotificationControl, { opacity: feedChromeOpacity }]}
      >
        <Pressable
          accessibilityLabel={
            unreadNotificationCount > 0
              ? "Abrir notificações. " + unreadNotificationCount + " não lidas"
              : "Abrir notificações"
          }
          accessibilityRole="button"
          hitSlop={8}
          onPress={openNotifications}
          style={styles.feedNotificationButton}
        >
          <Bell color="#FFFFFF" size={21} strokeWidth={2.2} />
          {unreadNotificationCount > 0 ? (
            <View style={styles.feedNotificationBadge}>
              <Text style={styles.feedNotificationBadgeText}>
                {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
              </Text>
            </View>
          ) : null}
        </Pressable>
      </Animated.View>
      <FeedPostOptionsModal
        blocked={Boolean(preferencePlayer && blockedProfileIds.has(preferencePlayer.profileId))}
        canBlock={Boolean(
          preferencePlayer &&
          preferencePlayer.ownerUserId !== currentUserId &&
          preferencePlayer.profileId !== `profile-${currentUserId}`,
        )}
        canReport={Boolean(
          preferencePlayer &&
          preferencePlayer.ownerUserId !== currentUserId &&
          preferencePlayer.profileId !== `profile-${currentUserId}`,
        )}
        contentLabel={
          preferencePlayer ? getPlayerContentLabel(preferencePlayer) : "esta publicação"
        }
        interested={Boolean(
          preferencePlayer && interestedContentKeys.has(getPlayerContentKey(preferencePlayer)),
        )}
        muted={Boolean(
          preferencePlayer && mutedContentKeys.has(getPlayerContentKey(preferencePlayer)),
        )}
        onClose={() => setPreferencePlayer(null)}
        onReport={() => {
          if (preferencePlayer) {
            onReportPlayer(preferencePlayer);
          }
          setPreferencePlayer(null);
        }}
        onToggleBlock={() => {
          if (preferencePlayer) {
            onToggleBlockProfile(preferencePlayer);
          }
          setPreferencePlayer(null);
        }}
        onToggleInterest={() => {
          if (preferencePlayer) {
            onToggleInterest(preferencePlayer);
          }
          setPreferencePlayer(null);
        }}
        onToggleMuted={() => {
          if (preferencePlayer) {
            onToggleMutedContent(getPlayerContentKey(preferencePlayer));
          }
          setPreferencePlayer(null);
        }}
        reported={Boolean(preferencePlayer && reportedPlayerIds.has(preferencePlayer.id))}
        visible={Boolean(preferencePlayer)}
      />
      <CommentsModal
        focusCommentId={focusedCommentId}
        focusRequestId={notificationTarget?.requestId}
        comments={commentPlayer ? (commentsByPlayer[commentPlayer.id] ?? []) : []}
        currentUserId={currentUserId}
        onAddComment={(body, replyToCommentId) =>
          commentPlayer ? onAddComment(commentPlayer.id, body, replyToCommentId) : false
        }
        onClose={() => {
          setCommentPlayer(null);
          setFocusedCommentId(undefined);
        }}
        onDeleteComment={onDeleteComment}
        onOpenAuthor={(authorUserId) => {
          const account = users.find((item) => item.id === authorUserId);
          setCommentPlayer(null);
          if (account) {
            onOpenTaggedUser(account);
          }
        }}
        profileAvatars={profileAvatars}
        users={users}
        videoId={commentPlayer?.id ?? ""}
        videoTitle={commentPlayer?.videoTitle ?? ""}
        visible={Boolean(commentPlayer)}
      />
      <SharePostModal
        contacts={shareContacts}
        onClose={() => setSharePlayer(null)}
        onShare={(contact, message) => {
          if (sharePlayer) {
            onShare(sharePlayer, contact, message);
          }
        }}
        profileAvatars={profileAvatars}
        videoId={sharePlayer?.id ?? ""}
        videoTitle={sharePlayer?.videoTitle ?? ""}
        visible={Boolean(sharePlayer)}
      />
      <NotificationsPopover
        notifications={notifications}
        onClose={() => setNotificationsVisible(false)}
        onSelect={(notification) => {
          setNotificationsVisible(false);
          onOpenNotification(notification);
        }}
        visible={notificationsVisible}
      />
      <ProfileListModal
        emptyBody="Os perfis marcados não estão mais disponíveis."
        emptyTitle="Nenhum perfil disponível"
        items={mentionedProfiles}
        onClose={() => setMentionedPlayer(null)}
        onSelectItem={(profile) => {
          const account = users.find((item) => item.id === profile.id);

          setMentionedPlayer(null);
          if (account) {
            onOpenTaggedUser(account);
          }
        }}
        title="Pessoas marcadas"
        visible={Boolean(mentionedPlayer)}
      />
    </View>
  );
}

function FeedReel({
  autoplayEnabled,
  avatar,
  chromeOpacity,
  commentCount,
  currentUserId,
  isFollowing,
  isActive,
  isCleanView,
  isLiked,
  isSponsored,
  likeCount,
  shareCount,
  onCleanViewChange,
  onComments,
  onMore,
  onOpen,
  onOpenMentions,
  onShare,
  onToggleLike,
  onToggleFollow,
  onVolumeChange,
  palette,
  player,
  reelHeight,
  resetEpoch,
  volume,
}: {
  autoplayEnabled: boolean;
  avatar?: ProfileAvatar;
  chromeOpacity: Animated.Value;
  commentCount: number;
  currentUserId: string;
  isFollowing: boolean;
  isActive: boolean;
  isCleanView: boolean;
  isLiked: boolean;
  isSponsored: boolean;
  likeCount: number;
  shareCount: number;
  onCleanViewChange: (active: boolean) => void;
  onComments: () => void;
  onMore: () => void;
  onOpen: () => void;
  onOpenMentions: () => void;
  onShare: () => void;
  onToggleLike: () => void;
  onToggleFollow: () => void;
  onVolumeChange: (volume: number) => void;
  palette: CardPalette;
  player: Player;
  reelHeight: number;
  resetEpoch: number;
  volume: number;
}) {
  const { width } = useWindowDimensions();
  const [isExpanded, setIsExpanded] = useState(false);
  const expansionProgress = useRef(new Animated.Value(0)).current;
  const doubleTapHeartOpacity = useRef(new Animated.Value(0)).current;
  const doubleTapHeartScale = useRef(new Animated.Value(0.45)).current;
  const likeScale = useRef(new Animated.Value(1)).current;
  const revealProgress = useRef(new Animated.Value(0)).current;
  const isWide = !USE_CENTERED_WEB_LAYOUT && width >= 900;
  const canFollow =
    player.ownerUserId !== currentUserId && player.profileId !== `profile-${currentUserId}`;
  const presentationText = player.highlight.trim();
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
  const hasMentions = Boolean(player.mentions?.length);
  const initials = player.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
  const canvasHeight = isWide ? Math.max(540, Math.min(reelHeight - 44, 700)) : reelHeight;
  const canvasWidth = isWide ? Math.min(width - 80, 1080) : width;
  const mediaContentFit = selectFeedContentFit({
    containerHeight: canvasHeight,
    containerWidth: canvasWidth,
    mediaHeight: player.mediaHeight,
    mediaWidth: player.mediaWidth,
  });
  useEffect(() => {
    setIsExpanded(false);
    expansionProgress.setValue(0);
  }, [resetEpoch, expansionProgress]);

  function handleToggleLike() {
    if (!isLiked) {
      likeScale.stopAnimation();
      likeScale.setValue(1);
      Animated.sequence([
        Animated.timing(likeScale, {
          duration: 120,
          easing: Easing.out(Easing.cubic),
          toValue: 1.35,
          useNativeDriver: true,
        }),
        Animated.timing(likeScale, {
          duration: 90,
          easing: Easing.inOut(Easing.quad),
          toValue: 0.9,
          useNativeDriver: true,
        }),
        Animated.spring(likeScale, {
          damping: 8,
          mass: 0.7,
          stiffness: 240,
          toValue: 1,
          useNativeDriver: true,
        }),
      ]).start();
    }

    onToggleLike();
  }

  function handleDoublePressLike() {
    doubleTapHeartOpacity.stopAnimation();
    doubleTapHeartScale.stopAnimation();
    doubleTapHeartOpacity.setValue(0);
    doubleTapHeartScale.setValue(0.45);

    Animated.parallel([
      Animated.sequence([
        Animated.spring(doubleTapHeartScale, {
          damping: 7,
          mass: 0.7,
          stiffness: 230,
          toValue: 1.16,
          useNativeDriver: true,
        }),
        Animated.timing(doubleTapHeartScale, {
          duration: 100,
          toValue: 1,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(doubleTapHeartOpacity, {
          duration: 80,
          toValue: 1,
          useNativeDriver: true,
        }),
        Animated.delay(260),
        Animated.timing(doubleTapHeartOpacity, {
          duration: 180,
          toValue: 0,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    if (!isLiked) {
      handleToggleLike();
    }
  }

  function animateDescription(nextExpanded: boolean) {
    expansionProgress.stopAnimation();
    if (nextExpanded) setIsExpanded(true);

    Animated.timing(expansionProgress, {
      duration: nextExpanded ? 320 : 240,
      easing: nextExpanded ? Easing.out(Easing.cubic) : Easing.inOut(Easing.cubic),
      toValue: nextExpanded ? 1 : 0,
      useNativeDriver: false,
    }).start(({ finished }) => {
      if (finished && !nextExpanded) setIsExpanded(false);
    });
  }

  useEffect(() => {
    revealProgress.setValue(0);
    Animated.timing(revealProgress, {
      duration: 420,
      easing: Easing.out(Easing.cubic),
      toValue: 1,
      useNativeDriver: true,
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
          { opacity: revealProgress },
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
                    width: canvasWidth,
                  },
                ]
              : null,
          ]}
        >
          <View style={styles.feedVideoBackground} />
          <FeedVideoBox
            resetEpoch={resetEpoch}
            autoplayEnabled={autoplayEnabled}
            chromeOpacity={chromeOpacity}
            isActive={isActive}
            isCleanView={isCleanView}
            isWide={isWide}
            contentFit={mediaContentFit}
            onVolumeChange={onVolumeChange}
            palette={palette}
            player={player}
            onCleanViewChange={onCleanViewChange}
            onDoublePress={handleDoublePressLike}
            volume={volume}
          />

          <Animated.View
            pointerEvents="none"
            style={[
              styles.feedDoubleTapHeart,
              {
                opacity: Animated.multiply(doubleTapHeartOpacity, chromeOpacity),
                transform: [{ scale: doubleTapHeartScale }],
              },
            ]}
          >
            <Heart color={colors.onPrimary} fill={colors.like} size={92} strokeWidth={1.8} />
          </Animated.View>

          <Animated.View
            pointerEvents={isCleanView ? "none" : "auto"}
            style={[
              styles.feedSocialActionRail,
              isWide ? styles.feedSocialActionRailWide : null,
              { opacity: chromeOpacity },
            ]}
          >
            <Pressable
              accessibilityLabel={
                isLiked ? `Remover curtida de ${player.videoTitle}` : `Curtir ${player.videoTitle}`
              }
              accessibilityRole="button"
              accessibilityState={{ selected: isLiked }}
              hitSlop={5}
              onPress={handleToggleLike}
              style={styles.feedSocialAction}
            >
              <Animated.View style={{ transform: [{ scale: likeScale }] }}>
                <Heart
                  color={isLiked ? colors.like : "#FFFFFF"}
                  fill={isLiked ? colors.like : "transparent"}
                  size={25}
                  strokeWidth={2.2}
                />
              </Animated.View>
              <Text style={styles.feedSocialActionCount}>{likeCount}</Text>
            </Pressable>
            <Pressable
              accessibilityLabel={`Ver comentários de ${player.videoTitle}`}
              accessibilityRole="button"
              hitSlop={5}
              onPress={onComments}
              style={styles.feedSocialAction}
            >
              <MessageCircle color="#FFFFFF" size={24} strokeWidth={2.2} />
              <Text style={styles.feedSocialActionCount}>{commentCount}</Text>
            </Pressable>
            <Pressable
              accessibilityLabel={`Compartilhar ${player.videoTitle}`}
              accessibilityRole="button"
              hitSlop={5}
              onPress={onShare}
              style={styles.feedSocialAction}
            >
              <Share2 color="#FFFFFF" size={24} strokeWidth={2.2} />
              <Text style={styles.feedSocialActionCount}>{shareCount}</Text>
            </Pressable>
            <Pressable
              accessibilityLabel={`Mais opções de ${player.videoTitle}`}
              accessibilityRole="button"
              hitSlop={5}
              onPress={onMore}
              style={styles.feedSocialAction}
            >
              <MoreVertical color="#FFFFFF" size={25} strokeWidth={2.3} />
            </Pressable>
          </Animated.View>

          <Animated.View
            pointerEvents={isCleanView ? "none" : "auto"}
            style={[
              styles.feedTextOverlay,
              { opacity: chromeOpacity },
              isWide
                ? [styles.feedTextOverlayWide, { right: Math.max(300, canvasWidth - 360) }]
                : [
                    styles.feedTextOverlayCompact,
                    {
                      minHeight: expansionProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, 230],
                      }),
                      paddingTop: expansionProgress.interpolate({
                        inputRange: [0, 1],
                        outputRange: [14, 62],
                      }),
                    },
                  ],
            ]}
          >
            {!isWide && isExpanded ? (
              <Animated.View
                pointerEvents="none"
                style={[styles.feedCompactBackdropAnimation, { opacity: expansionProgress }]}
              >
                <BlurView
                  experimentalBlurMethod={Platform.OS === "android" ? "dimezisBlurView" : "none"}
                  intensity={24}
                  pointerEvents="none"
                  style={styles.feedCompactBlur}
                  tint="dark"
                />
                <LinearGradient
                  colors={["rgba(12, 13, 20, 0)", "rgba(12, 13, 20, 1)"]}
                  end={{ x: 0.5, y: 1 }}
                  locations={[0, 1]}
                  pointerEvents="none"
                  start={{ x: 0.5, y: 0 }}
                  style={styles.feedCompactGradient}
                />
              </Animated.View>
            ) : null}

            <View style={[styles.feedProfileRow, !isWide ? styles.feedProfileRowCompact : null]}>
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
                  pressed ? styles.buttonPressed : null,
                ]}
              >
                {avatar ? (
                  <ProfileAvatarImage avatar={avatar} />
                ) : isWide ? (
                  <Text style={[styles.feedAvatarText, { color: palette.accent }]}>{initials}</Text>
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
                      { color: "rgba(255, 255, 255, 0.82)" },
                    ]}
                  >
                    {player.username ? `${player.name} | ` : ""}
                    {formatProfileActivity(player.sport, player.position, player.city)}
                  </Text>
                ) : null}
                <Text
                  numberOfLines={1}
                  style={[
                    styles.feedProfileName,
                    !isWide ? styles.feedProfileNameCompact : null,
                    { color: isWide ? palette.text : colors.onPrimary },
                  ]}
                >
                  {player.username ? `@${player.username}` : player.name}
                </Text>
                {isWide ? (
                  <Text
                    numberOfLines={1}
                    style={[styles.feedSponsorLabel, { color: palette.muted }]}
                  >
                    {player.username ? `${player.name} | ` : ""}
                    {formatProfileActivity(player.sport, player.position, player.city)}
                  </Text>
                ) : null}
              </Pressable>
              {canFollow ? (
                <Pressable
                  accessibilityLabel={
                    isFollowing ? `Deixar de seguir ${player.name}` : `Seguir ${player.name}`
                  }
                  accessibilityRole="button"
                  onPress={onToggleFollow}
                  style={({ pressed }) => [
                    styles.feedFollowButton,
                    !isWide ? styles.feedFollowButtonCompact : null,
                    isFollowing ? styles.feedFollowButtonActive : null,
                    isFollowing && !isWide ? styles.feedFollowButtonActiveCompact : null,
                    pressed ? styles.buttonPressed : null,
                  ]}
                >
                  {isFollowing ? (
                    <UserCheck
                      color={isWide ? colors.primaryText : colors.onPrimary}
                      size={15}
                      strokeWidth={2.4}
                    />
                  ) : (
                    <UserPlus color={colors.onPrimary} size={15} strokeWidth={2.4} />
                  )}
                  <Text
                    numberOfLines={1}
                    style={[
                      styles.feedFollowButtonText,
                      isFollowing && isWide ? styles.feedFollowButtonTextActiveWide : null,
                    ]}
                  >
                    {isFollowing ? "Seguindo" : "Seguir"}
                  </Text>
                </Pressable>
              ) : null}
              {isWide ? (
                <View style={[styles.feedStatusPill, { borderColor: palette.border }]}>
                  <Text style={[styles.feedStatusText, { color: palette.accent }]}>
                    {isSponsored ? "Patrocinado" : "Publicado"}
                  </Text>
                </View>
              ) : null}
            </View>

            {isSponsored && !isWide ? (
              <Text
                style={{
                  color: "rgba(255,255,255,0.76)",
                  fontSize: 11,
                  fontWeight: "800",
                  marginBottom: 4,
                }}
              >
                Patrocinado
              </Text>
            ) : null}

            {isWide ? (
              <>
                <Text
                  numberOfLines={2}
                  style={[
                    styles.feedReelVideoTitle,
                    styles.feedReelVideoTitleWide,
                    { color: palette.text },
                  ]}
                >
                  {player.videoTitle}
                </Text>
                <Text style={[styles.feedReelHighlight, { color: palette.text }]}>
                  {visibleText}
                </Text>
                <Text numberOfLines={1} style={[styles.feedReelMeta, { color: palette.muted }]}>
                  {player.age} anos | {player.club}
                </Text>
                <View style={styles.feedTagRow}>
                  {player.tags.slice(0, 3).map((tag) => (
                    <Text
                      key={`tag-${tag}`}
                      numberOfLines={1}
                      style={[styles.feedTag, { borderColor: palette.border, color: palette.text }]}
                    >
                      #{tag}
                    </Text>
                  ))}
                </View>
                <View style={styles.feedReadMoreRow}>
                  {hasMoreText || hasMentions ? (
                    <Pressable
                      onPress={() => animateDescription(!isExpanded)}
                      style={styles.feedReadMoreButton}
                    >
                      <Text style={[styles.feedReadMoreText, { color: palette.accent }]}>
                        {isExpanded ? "Ver menos" : "Ver mais"}
                      </Text>
                    </Pressable>
                  ) : null}
                  {isExpanded && hasMentions ? (
                    <FeedMentionsButton
                      color={palette.accent}
                      count={player.mentions?.length ?? 0}
                      onPress={onOpenMentions}
                    />
                  ) : null}
                </View>
                <Pressable
                  onPress={onOpen}
                  style={({ pressed }) => [
                    styles.feedLearnMoreButton,
                    pressed ? styles.feedReelButtonPressed : null,
                  ]}
                >
                  <Text style={styles.feedLearnMoreText}>Abrir perfil</Text>
                </Pressable>
              </>
            ) : !isExpanded ? (
              <View>
                <Text style={[styles.feedCompactDescription, styles.feedCompactDescriptionTitle]}>
                  {player.videoTitle}
                </Text>
                <Text style={[styles.feedCompactDescription, styles.feedCompactDescriptionBody]}>
                  {compactPreview}
                  {hasMoreText || hasMentions ? (
                    <Text
                      accessibilityRole="button"
                      onPress={() => animateDescription(true)}
                      style={styles.feedCompactInlineAction}
                    >
                      {"  "}mais
                    </Text>
                  ) : null}
                </Text>
              </View>
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
                          outputRange: [10, 0],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <Text style={[styles.feedCompactDescription, styles.feedCompactDescriptionTitle]}>
                  {player.videoTitle}
                </Text>
                <Text style={[styles.feedCompactDescription, styles.feedCompactDescriptionBody]}>
                  {presentationText}
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
                <View style={styles.feedCompactExpandedActions}>
                  {hasMentions ? (
                    <FeedMentionsButton
                      compact
                      color={colors.onPrimary}
                      count={player.mentions?.length ?? 0}
                      onPress={onOpenMentions}
                    />
                  ) : (
                    <View />
                  )}
                  <Pressable
                    accessibilityLabel="Recolher descrição"
                    accessibilityRole="button"
                    hitSlop={8}
                    onPress={() => animateDescription(false)}
                    style={styles.feedCompactTextButton}
                  >
                    <Text style={styles.feedCompactTextButtonLabel}>menos</Text>
                  </Pressable>
                </View>
              </Animated.View>
            )}
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  );
}
function FeedMentionsButton({
  color,
  compact = false,
  count,
  onPress,
}: {
  color: string;
  compact?: boolean;
  count: number;
  onPress: () => void;
}) {
  return (
    <Pressable
      accessibilityLabel={"Ver " + count + (count === 1 ? " pessoa marcada" : " pessoas marcadas")}
      accessibilityRole="button"
      hitSlop={8}
      onPress={onPress}
      style={[styles.feedMentionsButton, compact ? styles.feedMentionsButtonCompact : null]}
    >
      <UsersRound color={color} size={18} strokeWidth={2.3} />
      <Text style={[styles.feedMentionsCount, { color }]}>{count}</Text>
    </Pressable>
  );
}

function FeedVideoBox({
  resetEpoch,
  autoplayEnabled,
  chromeOpacity,
  contentFit,
  isActive,
  isCleanView,
  isWide,
  onCleanViewChange,
  onDoublePress,
  onVolumeChange,
  palette,
  player,
  volume,
}: {
  resetEpoch: number;
  autoplayEnabled: boolean;
  chromeOpacity: Animated.Value;
  contentFit: "contain" | "cover";
  isActive: boolean;
  isCleanView: boolean;
  isWide: boolean;
  onCleanViewChange: (active: boolean) => void;
  onDoublePress: () => void;
  onVolumeChange: (volume: number) => void;
  palette: CardPalette;
  player: Player;
  volume: number;
}) {
  return (
    <View
      style={[
        styles.feedVideoBox,
        isWide ? styles.feedVideoBoxWide : styles.feedVideoBoxCompact,
        { backgroundColor: palette.media, borderColor: palette.border },
      ]}
    >
      {player.mediaType === "image" ? (
        <FeedImagePlayback
          contentFit={contentFit}
          onCleanViewChange={onCleanViewChange}
          onDoublePress={onDoublePress}
          uri={player.videoUri}
        />
      ) : (
        <FeedVideoPlayback
          resetEpoch={resetEpoch}
          accent={palette.accent}
          autoplayEnabled={autoplayEnabled}
          chromeOpacity={chromeOpacity}
          contentFit={contentFit}
          caption={player.videoTitle}
          durationLabel={player.videoLength}
          hasAudio={player.hasAudio !== false}
          isActive={isActive}
          isCleanView={isCleanView}
          isWide={isWide}
          onAccent={palette.onAccent}
          onCleanViewChange={onCleanViewChange}
          onDoublePress={onDoublePress}
          onVolumeChange={onVolumeChange}
          trackColor={palette.progressTrack}
          uri={player.videoUri}
          volume={volume}
        />
      )}
    </View>
  );
}

function FeedMediaTapTarget({
  accessibilityLabel,
  children,
  onDoublePress,
  onHoldChange,
  onSinglePress,
}: {
  accessibilityLabel?: string;
  children?: React.ReactNode;
  onDoublePress: () => void;
  onHoldChange?: (active: boolean) => void;
  onSinglePress?: () => void;
}) {
  const onDoublePressRef = useRef(onDoublePress);
  const onHoldChangeRef = useRef(onHoldChange);
  const onSinglePressRef = useRef(onSinglePress);
  const pendingSinglePressRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const gestureStateRef = useRef(createMediaTapGestureState());
  const isHoldingRef = useRef(false);

  onDoublePressRef.current = onDoublePress;
  onHoldChangeRef.current = onHoldChange;
  onSinglePressRef.current = onSinglePress;

  useEffect(
    () => () => {
      if (pendingSinglePressRef.current) {
        clearTimeout(pendingSinglePressRef.current);
      }
      if (isHoldingRef.current) {
        onHoldChangeRef.current?.(false);
      }
    },
    [],
  );

  function cancelPendingSinglePress() {
    if (pendingSinglePressRef.current) {
      clearTimeout(pendingSinglePressRef.current);
      pendingSinglePressRef.current = null;
    }
  }

  function handleLongPress() {
    if (!onHoldChangeRef.current) {
      return;
    }

    cancelPendingSinglePress();
    gestureStateRef.current = suppressMediaTapGesture(gestureStateRef.current, Date.now());
    isHoldingRef.current = true;
    onHoldChangeRef.current(true);
  }

  function handlePressOut() {
    if (!isHoldingRef.current) {
      return;
    }

    isHoldingRef.current = false;
    gestureStateRef.current = suppressMediaTapGesture(gestureStateRef.current, Date.now());
    onHoldChangeRef.current?.(false);
  }

  function handlePress() {
    const pressedAt = Date.now();
    const scheduledSinglePress = onSinglePressRef.current;
    const gesture = resolveMediaTapGesture(gestureStateRef.current, pressedAt);
    gestureStateRef.current = gesture.state;

    if (gesture.action === "ignore") {
      return;
    }

    if (gesture.action === "double") {
      cancelPendingSinglePress();
      onDoublePressRef.current();
      return;
    }

    if (!scheduledSinglePress) {
      return;
    }

    if (pendingSinglePressRef.current) {
      clearTimeout(pendingSinglePressRef.current);
    }

    pendingSinglePressRef.current = setTimeout(() => {
      pendingSinglePressRef.current = null;
      if (gestureStateRef.current.pendingTapAt !== pressedAt) {
        return;
      }
      gestureStateRef.current = {
        ...gestureStateRef.current,
        pendingTapAt: null,
      };
      scheduledSinglePress();
    }, MEDIA_DOUBLE_TAP_DELAY_MS);
  }

  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole={onSinglePress ? "button" : undefined}
      accessible={Boolean(onSinglePress)}
      delayLongPress={280}
      onLongPress={handleLongPress}
      onPress={handlePress}
      onPressOut={handlePressOut}
      style={styles.feedVideoTapTarget}
    >
      {children}
    </Pressable>
  );
}

function FeedImagePlayback({
  contentFit,
  onCleanViewChange,
  onDoublePress,
  uri,
}: {
  contentFit: "contain" | "cover";
  onCleanViewChange: (active: boolean) => void;
  onDoublePress: () => void;
  uri: string | number;
}) {
  const resolvedImage = useResolvedVideoSource(uri);

  if (!resolvedImage.source) {
    return (
      <View style={[styles.feedVideoPlayback, styles.videoUnavailableState]}>
        <Text style={styles.videoUnavailableTitle}>
          {resolvedImage.status === "loading" ? "Carregando foto..." : "Foto indisponível"}
        </Text>
        {resolvedImage.status === "unavailable" ? (
          <Text style={styles.videoUnavailableBody}>
            O arquivo temporário expirou. Publique esta foto novamente.
          </Text>
        ) : null}
      </View>
    );
  }

  return (
    <View style={styles.feedVideoPlayback}>
      <Image
        accessibilityLabel="Foto da publicação"
        resizeMode={contentFit}
        source={
          typeof resolvedImage.source === "number"
            ? resolvedImage.source
            : { uri: resolvedImage.source }
        }
        style={styles.feedVideoMedia}
      />
      <FeedMediaTapTarget onDoublePress={onDoublePress} onHoldChange={onCleanViewChange} />
    </View>
  );
}

type FeedVideoPlaybackProps = {
  resetEpoch: number;
  accent: string;
  autoplayEnabled: boolean;
  chromeOpacity: Animated.Value;
  contentFit: "contain" | "cover";
  caption: string;
  durationLabel: string;
  hasAudio: boolean;
  isActive: boolean;
  isCleanView: boolean;
  isWide: boolean;
  onAccent: string;
  onCleanViewChange: (active: boolean) => void;
  onDoublePress: () => void;
  onVolumeChange: (volume: number) => void;
  trackColor: string;
  uri: string | number;
  volume: number;
};

function FeedVideoPlayback(props: FeedVideoPlaybackProps) {
  if (!props.isActive) {
    return (
      <View style={styles.feedVideoPlayback}>
        <View pointerEvents="none" style={styles.feedVideoPlaybackPlaceholder}>
          <View
            style={[
              styles.feedVideoPlayCircle,
              styles.feedVideoPlaybackPlay,
              { backgroundColor: props.accent },
            ]}
          >
            <Play color={props.onAccent} fill={props.onAccent} size={24} />
          </View>
        </View>
      </View>
    );
  }

  return <ActiveFeedVideoPlayback {...props} />;
}

function ActiveFeedVideoPlayback(props: FeedVideoPlaybackProps) {
  const resolvedVideo = useResolvedVideoSource(props.uri);

  if (!resolvedVideo.source) {
    return (
      <View style={[styles.feedVideoPlayback, styles.videoUnavailableState]}>
        <Text style={styles.videoUnavailableTitle}>
          {resolvedVideo.status === "loading" ? "Carregando vídeo..." : "Vídeo indisponível"}
        </Text>
        {resolvedVideo.status === "unavailable" ? (
          <Text style={styles.videoUnavailableBody}>
            O arquivo temporário expirou. O atleta precisa reenviar este vídeo.
          </Text>
        ) : null}
      </View>
    );
  }

  return <ResolvedFeedVideoPlayback {...props} uri={resolvedVideo.source} />;
}

function ResolvedFeedVideoPlayback({
  resetEpoch,
  accent,
  autoplayEnabled,
  chromeOpacity,
  contentFit,
  caption,
  durationLabel,
  hasAudio,
  isActive,
  isCleanView,
  isWide,
  onAccent,
  onCleanViewChange,
  onDoublePress,
  onVolumeChange,
  trackColor,
  uri,
  volume,
}: FeedVideoPlaybackProps) {
  const [playbackTime, setPlaybackTime] = useState(0);
  const [seekTrackWidth, setSeekTrackWidth] = useState(0);
  const normalizedVolume = Math.min(Math.max(volume, 0), 1);
  const videoPlayer = useVideoPlayer(uri, (player) => {
    player.loop = true;
    player.volume = normalizedVolume;
    player.muted = normalizedVolume <= 0;
    player.playbackRate = 1;
    player.timeUpdateEventInterval = 0.1;
  });
  const lastResetEpochRef = useRef(resetEpoch);
  useEffect(() => {
    if (lastResetEpochRef.current === resetEpoch) return;
    lastResetEpochRef.current = resetEpoch;
    videoPlayer.currentTime = 0;
    setPlaybackTime(0);
    manuallyPausedRef.current = false;
    if (autoplayEnabled && isActive) videoPlayer.play();
  }, [resetEpoch, videoPlayer, autoplayEnabled, isActive]);
  const { isPlaying } = useEvent(videoPlayer, "playingChange", {
    isPlaying: videoPlayer.playing,
  });
  const isPlayingRef = useRef(isPlaying);
  const isActiveRef = useRef(isActive);
  const autoplayRequestedRef = useRef(false);
  const manuallyPausedRef = useRef(false);
  const lastPlaybackToggleAtRef = useRef(0);
  isPlayingRef.current = isPlaying;
  isActiveRef.current = isActive;
  const { muted } = useEvent(videoPlayer, "mutedChange", {
    muted: videoPlayer.muted,
  });
  const { status: playerStatus } = useEvent(videoPlayer, "statusChange", {
    status: videoPlayer.status,
  });

  useEffect(() => {
    videoPlayer.volume = normalizedVolume;
    videoPlayer.muted = normalizedVolume <= 0;
  }, [normalizedVolume, videoPlayer]);

  const { currentTime } = useEvent(videoPlayer, "timeUpdate", {
    bufferedPosition: videoPlayer.bufferedPosition,
    currentLiveTimestamp: null,
    currentOffsetFromLive: null,
    currentTime: videoPlayer.currentTime,
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
  const playbackProgress = playbackDuration > 0 ? safeCurrentTime / playbackDuration : 0;
  const totalTimeLabel = durationLabel || formatPlaybackTime(Math.ceil(playbackDuration));
  const thumbOffset =
    seekTrackWidth > 12
      ? Math.min(Math.max(playbackProgress * seekTrackWidth, 6), seekTrackWidth - 6)
      : 0;
  const videoPlayerRef = useRef(videoPlayer);
  const playbackDurationRef = useRef(playbackDuration);
  const seekTrackWidthRef = useRef(seekTrackWidth);
  const seekToTimeRef = useRef<(targetTime: number) => number>(() => 0);
  const seekToOffsetRef = useRef<(offsetX: number) => number>(() => 0);

  videoPlayerRef.current = videoPlayer;
  playbackDurationRef.current = playbackDuration;
  seekTrackWidthRef.current = seekTrackWidth;
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
      onStartShouldSetPanResponder: () => false,
    }),
  ).current;
  useEffect(() => {
    if (Number.isFinite(currentTime)) {
      setPlaybackTime(currentTime);
    }
  }, [currentTime]);

  useEffect(() => {
    autoplayRequestedRef.current = false;
    manuallyPausedRef.current = !autoplayEnabled;
    isActiveRef.current = isActive;

    if (!isActive || !autoplayEnabled) {
      videoPlayer.pause();
    }

    return () => {
      isActiveRef.current = false;
      videoPlayer.pause();
    };
  }, [autoplayEnabled, isActive, videoPlayer]);

  useEffect(() => {
    if (
      !autoplayEnabled ||
      playerStatus !== "readyToPlay" ||
      !isActiveRef.current ||
      manuallyPausedRef.current ||
      autoplayRequestedRef.current
    ) {
      return;
    }

    autoplayRequestedRef.current = true;
    videoPlayer.playbackRate = 1;
    videoPlayer.play();
  }, [autoplayEnabled, playerStatus, videoPlayer]);

  function togglePlayback() {
    if (!isActiveRef.current) {
      return;
    }

    const toggledAt = Date.now();
    if (toggledAt - lastPlaybackToggleAtRef.current < 360) {
      return;
    }
    lastPlaybackToggleAtRef.current = toggledAt;

    if (isPlayingRef.current || videoPlayer.playing) {
      manuallyPausedRef.current = true;
      videoPlayer.pause();
      return;
    }

    manuallyPausedRef.current = false;
    videoPlayer.playbackRate = 1;
    videoPlayer.play();
  }

  return (
    <View style={styles.feedVideoPlayback}>
      <VideoView
        contentFit={contentFit}
        nativeControls={false}
        player={videoPlayer}
        playsInline
        style={styles.feedVideoMedia}
        surfaceType="textureView"
      />
      <FeedMediaTapTarget
        accessibilityLabel={isPlaying ? "Pausar vídeo" : "Reproduzir vídeo"}
        onDoublePress={onDoublePress}
        onHoldChange={onCleanViewChange}
        onSinglePress={isActive ? togglePlayback : undefined}
      >
        {!isPlaying ? (
          <Animated.View
            style={[
              styles.feedVideoPlayCircle,
              styles.feedVideoPlaybackPlay,
              { backgroundColor: accent, opacity: chromeOpacity },
            ]}
          >
            <Play color={onAccent} fill={onAccent} size={24} />
          </Animated.View>
        ) : null}
      </FeedMediaTapTarget>
      <Animated.View
        pointerEvents={isCleanView ? "none" : "auto"}
        style={[styles.feedVideoFloatingControls, { opacity: chromeOpacity }]}
      >
        {hasAudio ? (
          <VideoVolumeControl
            active={isActive}
            muted={muted}
            onChange={(targetVolume) => {
              const nextVolume = Math.min(Math.max(targetVolume, 0), 1);

              onVolumeChange(nextVolume);
              videoPlayer.volume = nextVolume;
              videoPlayer.muted = nextVolume <= 0;
            }}
            volume={normalizedVolume}
          />
        ) : null}
      </Animated.View>
      {isWide ? (
        <Animated.View
          pointerEvents="none"
          style={[styles.feedVideoCaptionStrip, { opacity: chromeOpacity }]}
        >
          <Text numberOfLines={1} style={[styles.feedVideoCaption, { color: colors.onPrimary }]}>
            {caption}
          </Text>
          <Text style={[styles.feedVideoDuration, { color: colors.onPrimary }]}>
            {formatPlaybackTime(safeCurrentTime)} / {totalTimeLabel}
          </Text>
        </Animated.View>
      ) : null}
      <Animated.View
        pointerEvents={isCleanView ? "none" : "auto"}
        onLayout={(event) => {
          const nextWidth = event.nativeEvent.layout.width;
          seekTrackWidthRef.current = nextWidth;
          setSeekTrackWidth(nextWidth);
        }}
        style={[
          styles.feedVideoSeekControl,
          !isWide ? styles.feedVideoSeekControlCompact : null,
          { opacity: chromeOpacity },
        ]}
        {...seekPanResponder.panHandlers}
      >
        <Pressable
          accessibilityActions={[
            { label: "Avançar 5 segundos", name: "increment" },
            { label: "Voltar 5 segundos", name: "decrement" },
          ]}
          accessibilityLabel="Posição do vídeo"
          accessibilityRole="adjustable"
          accessibilityValue={{
            max: Math.max(0, Math.round(playbackDuration)),
            min: 0,
            now: Math.max(0, Math.round(safeCurrentTime)),
            text: `${formatPlaybackTime(safeCurrentTime)} de ${totalTimeLabel}`,
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
            style={[styles.feedVideoScrubberTrack, { backgroundColor: trackColor }]}
          >
            <View
              style={[
                styles.feedVideoScrubberFill,
                {
                  backgroundColor: accent,
                  width: `${playbackProgress * 100}%`,
                },
              ]}
            />
          </View>
          <View
            pointerEvents="none"
            style={[styles.feedVideoScrubberThumb, { left: thumbOffset }]}
          />
        </Pressable>
      </Animated.View>
    </View>
  );
}
