import { BRAND } from "../config/brand.ts";
import React, { useEffect, useMemo, useRef, useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import { Alert, KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, View } from "react-native";
import {
  isOwnAccountProfile,
  isOwnPlayerProfile,
  selectApprovedPlayerForSubmission,
  selectProfileFollowers,
  selectProfileFollowing
} from "./appSelectors";
import { BrandLaunchOverlay } from "./AppEntryShells";
import { ScreenFrame } from "../components/AppShell";
import { BottomTabs, Header } from "../components/Navigation";
import { AdminScreen } from "../screens/AdminScreen";
import { FeedScreen } from "../screens/FeedScreen";
import { MessagesScreen } from "../screens/MessagesScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { PromotePostScreen } from "../screens/PromotePostScreen";
import { PublicProfileScreen } from "../screens/PublicProfileScreen";
import { SearchScreen } from "../screens/ProfileDiscoveryScreen";
import { SubmitVideoScreen } from "../screens/SubmissionScreen";
import { syncProfessionalSubscriptionWithRetry } from "../services/firebaseProfessionalService";
import { styles } from "../styles/appStyles";
import { useTheme } from "../ThemeProvider";
import { colors } from "../theme";
import type {
  AppNotification,
  AppUser,
  CampaignObjective,
  DirectMessage,
  MessageContact,
  Player,
  PostComment,
  PublicationMediaInput,
  ProfessionalSettings,
  ProfessionalSettingsByUser,
  ProfileAvatar,
  ProfileAvatarsByProfile,
  PromotionCampaign,
  TagCatalogEntry,
  VideoSubmission,
  VideoSubmissionStatus
} from "../types";
import type { Tab } from "../ui/types";
import type { ReelReturnTarget } from "./useAppNavigation";
import { getPlayerContentKey } from "../utils/feedEngagement";
import { useNotificationNavigation } from "./useNotificationNavigation";
import type { NotificationContent } from "../utils/notificationDestination";
import type { FeedAnchor } from "../utils/feedSession";

type AppRoutesProps = {
  feedSyncError?: string;
  onRetryFeedSync?: () => void;
  feedAnchor?: FeedAnchor | null;
  feedEntryKeys?: string[];
  onFeedAnchorChange?: (anchor: FeedAnchor) => void;
  onRefreshFeed?: () => void;
  activeCampaignPlayerIds: Set<string>;
  activeMessageContactId: string | null;
  autoplayEnabled: boolean;
  approvedSubmissionPlayers: Player[];
  availablePlayers: Player[];
  blockedProfileIdSet: Set<string>;
  commentsByPlayer: Record<string, PostComment[]>;
  campaignPlayer: Player | null;
  clearSelectedProfile: () => void;
  closeCampaign: () => void;
  currentMessageContacts: MessageContact[];
  currentProfessionalSettings: ProfessionalSettings;
  currentUserCampaigns: PromotionCampaign[];
  addPostComment: (
    playerId: string,
    body: string,
    replyToCommentId?: string
  ) => boolean;
  deleteAccountSession: () => Promise<boolean>;
  deleteConversation: (contactId: string) => void;
  directMessages: DirectMessage[];
  markDirectMessagesRead: (messageIds: string[]) => void;
  markNotificationsRead: (notificationIds: string[]) => void;
  deletePostComment: (commentId: string) => void;
  feedFocusPlayerId: string | null;
  focusFeedPlayer: (playerId: string) => void;
  followersByProfile: Record<string, number>;
  followerUserIdsByProfile: Record<string, string[]>;
  followingCountsByUser: Record<string, number>;
  followingProfileIds: string[];
  followingProfileSet: Set<string>;
  hiddenPlayerIdSet: Set<string>;
  interestedContentKeySet: Set<string>;
  handleCreateCampaign: (
    player: Player,
    input: {
      budget: number;
      durationDays: number;
      objective: CampaignObjective;
    }
  ) => boolean;
  handleDeleteVideo: (submission: VideoSubmission) => Promise<boolean>;
  handleReviewSubmission: (
    submissionId: string,
    status: VideoSubmissionStatus,
    reviewNote: string
  ) => void;
  handleSubmitVideo: (
    submission: VideoSubmission,
    media: PublicationMediaInput,
    onProgress: (progress: number) => void
  ) => Promise<VideoSubmission>;
  handleToggleCampaign: (campaignId: string) => void;
  handleUpdateProfessionalSettings: (settings: ProfessionalSettings) => void;
  ensureTag: (label: string) => Promise<unknown> | unknown;
  handleUpdateProfile: (profile: {
    age: number | null;
    bio: string;
    city: string;
    club: string;
    interestTags: string[];
    name: string;
    position: string;
    sport: string;
    username: string;
  }) => Promise<boolean>;
  isBrandLaunchVisible: boolean;
  likedPlayerIdSet: Set<string>;
  likeCountsByPlayer: Record<string, number>;
  shareCountsByPlayer: Record<string, number>;
  mutedContactIds: string[];
  mutedContentKeySet: Set<string>;
  notifications: AppNotification[];
  notificationsEnabled: boolean;
  onBrandLaunchFinish: () => void;
  onOpenMessagesForSelectedProfile: () => void;
  onResolveNotificationContent: (content: NotificationContent) => void;
  openCampaign: (player: Player) => void;
  openPlayerProfile: (player: Player) => void;
  openReel: (player: Player, returnTarget?: ReelReturnTarget | null) => void;
  openTab: (tab: Tab) => void;
  openUserProfile: (account: AppUser) => void;
  orderedFeedPlayers: Player[];
  ownProfileId?: string | null;
  ownProfilePlayers: Player[];
  pendingReviews: number;
  pinnedContactIds: string[];
  professionalSettingsByUser: ProfessionalSettingsByUser;
  profileAvatars: ProfileAvatarsByProfile;
  recordPlayerView: (playerId: string) => void;
  reportedPlayerIdSet: Set<string>;
  registeredUsers: AppUser[];
  reelReturnTarget: ReelReturnTarget | null;
  returnToReelOrigin: () => void;
  selectedProfileAccount?: AppUser;
  selectedProfileId?: string;
  selectedProfilePlayer?: Player;
  selectedProfileProfessionalSettings?: ProfessionalSettings;
  selectedProfileVideos: Player[];
  sendDirectMessage: (contactId: string, body: string) => void;
  sendSharedPost: (contact: MessageContact, player: Player, message?: string) => void;
  setAutoplayEnabled: (enabled: boolean) => void;
  setNotificationsEnabled: (enabled: boolean) => void;
  setPlayerHidden: (playerId: string, hidden: boolean) => void;
  setPlayerReported: (playerId: string, reported: boolean) => void;
  setActiveMessageContactId: Dispatch<SetStateAction<string | null>>;
  setProfileAvatar: (profileId: string, avatar: ProfileAvatar | null) => void;
  shareContacts: MessageContact[];
  signOutSession: () => void;
  submissions: VideoSubmission[];
  tab: Tab;
  tagCatalog: TagCatalogEntry[];
  toggleFollowProfile: (profileId: string) => void;
  toggleBlockedProfile: (profileId: string) => void;
  toggleInterestedContent: (contentKey: string) => void;
  toggleLikePlayer: (playerId: string) => void;
  toggleMuteConversation: (contactId: string) => void;
  toggleMutedContent: (contentKey: string) => void;
  togglePinConversation: (contactId: string) => void;
  user: AppUser;
  viewCountsByPlayer: Record<string, number>;
};

export function AppRoutes(props: AppRoutesProps) {
  const { themeMode } = useTheme();
  const [isFeedImmersive, setIsFeedImmersive] = useState(false);
  const [professionalOpenRequestId, setProfessionalOpenRequestId] = useState(0);
  const subscriptionReturnHandledRef = useRef(false);
  const {
    activeCampaignPlayerIds,
    activeMessageContactId,
    autoplayEnabled,
    approvedSubmissionPlayers,
    availablePlayers,
    blockedProfileIdSet,
    commentsByPlayer,
    campaignPlayer,
    clearSelectedProfile,
    closeCampaign,
    currentMessageContacts,
    currentProfessionalSettings,
    currentUserCampaigns,
    addPostComment,
    deleteAccountSession,
    deleteConversation,
    deletePostComment,
    directMessages,
    feedFocusPlayerId,
    followersByProfile,
    followerUserIdsByProfile,
    followingCountsByUser,
    followingProfileIds,
    followingProfileSet,
    hiddenPlayerIdSet,
    interestedContentKeySet,
    handleCreateCampaign,
    handleDeleteVideo,
    handleReviewSubmission,
    handleSubmitVideo,
    handleToggleCampaign,
    handleUpdateProfessionalSettings,
    handleUpdateProfile,
    ensureTag,
    isBrandLaunchVisible,
    likedPlayerIdSet,
    likeCountsByPlayer,
    markDirectMessagesRead,
    markNotificationsRead,
    shareCountsByPlayer,
    mutedContactIds,
    mutedContentKeySet,
    notifications,
    notificationsEnabled,
    onBrandLaunchFinish,
    onOpenMessagesForSelectedProfile,
    onResolveNotificationContent,
    openCampaign,
    openPlayerProfile,
    openReel,
    openTab,
    openUserProfile,
    orderedFeedPlayers,
    ownProfileId,
    ownProfilePlayers,
    pendingReviews,
    pinnedContactIds,
    professionalSettingsByUser,
    profileAvatars,
    recordPlayerView,
    reportedPlayerIdSet,
    registeredUsers,
    reelReturnTarget,
    returnToReelOrigin,
    selectedProfileAccount,
    selectedProfileId,
    selectedProfilePlayer,
    selectedProfileProfessionalSettings,
    selectedProfileVideos,
    sendDirectMessage,
    sendSharedPost,
    setAutoplayEnabled,
    setNotificationsEnabled,
    setPlayerHidden,
    setPlayerReported,
    setActiveMessageContactId,
    setProfileAvatar,
    shareContacts,
    signOutSession,
    submissions,
    tab,
    tagCatalog,
    toggleFollowProfile,
    toggleBlockedProfile,
    toggleInterestedContent,
    toggleLikePlayer,
    toggleMuteConversation,
    toggleMutedContent,
    togglePinConversation,
    user,
    viewCountsByPlayer
  } = props;

  const notificationNavigation = useNotificationNavigation({
    blockedProfileIds: blockedProfileIdSet,
    commentsByPlayer,
    currentUserId: user.id,
    messages: directMessages,
    onNotice: (title, body) => {
      if (Platform.OS === "web" && typeof window !== "undefined") {
        window.alert(`${title}\n\n${body}`);
      } else {
        Alert.alert(title, body);
      }
    },
    onOpenConversation: (contactId) => {
      openTab("messages");
      setActiveMessageContactId(contactId);
    },
    onOpenPost: openReel,
    onResolveContent: onResolveNotificationContent,
    players: availablePlayers,
    tab,
    users: registeredUsers,
  });
  const notificationPost = notificationNavigation.postTarget;
  const notificationMessage = notificationNavigation.messageTarget;
  const feedPlayers = useMemo(() => {
    if (!notificationPost || orderedFeedPlayers.some((player) => player.id === notificationPost.player.id)) return orderedFeedPlayers;
    return [notificationPost.player, ...orderedFeedPlayers];
  }, [notificationPost, orderedFeedPlayers]);
  const feedEntryKeys = feedPlayers === orderedFeedPlayers
    ? props.feedEntryKeys
    : [`notification:${notificationPost!.player.id}`, ...(props.feedEntryKeys ?? orderedFeedPlayers.map((player) => player.id))];
  const messageContacts = useMemo(() => {
    if (!notificationMessage || currentMessageContacts.some((contact) => contact.id === notificationMessage.contact.id)) return currentMessageContacts;
    return [...currentMessageContacts, notificationMessage.contact];
  }, [currentMessageContacts, notificationMessage]);
  const conversationMessages = useMemo(() => {
    const message = notificationMessage?.message;
    if (!message || directMessages.some((item) => item.id === message.id)) return directMessages;
    return [...directMessages, message].sort((left, right) => left.createdAt.localeCompare(right.createdAt));
  }, [directMessages, notificationMessage]);

  useEffect(() => {
    if (tab !== "feed" && isFeedImmersive) {
      setIsFeedImmersive(false);
    }
  }, [isFeedImmersive, tab]);

  useEffect(() => {
    if (
      Platform.OS !== "web" ||
      typeof window === "undefined" ||
      subscriptionReturnHandledRef.current ||
      user.role !== "Usuário"
    ) {
      return;
    }

    const params = new URLSearchParams(window.location.search);
    if (params.get("subscription") !== "return") {
      return;
    }

    subscriptionReturnHandledRef.current = true;
    params.delete("subscription");
    const nextSearch = params.toString();
    window.history.replaceState(
      window.history.state,
      "",
      `${window.location.pathname}${nextSearch ? `?${nextSearch}` : ""}${window.location.hash}`
    );
    setProfessionalOpenRequestId(Date.now());
    openTab("profile");
    void syncProfessionalSubscriptionWithRetry()
      .then((result) => {
        if (result.status === "authorized") {
          Alert.alert(
            `${BRAND.subscriptionName} ativado`,
            "O pagamento foi confirmado e o selo de identidade verificada está ativo."
          );
          return;
        }

        if (result.status === "canceled") {
          Alert.alert(
            "Assinatura cancelada",
            "O Mercado Pago informou que esta assinatura foi cancelada."
          );
          return;
        }

        Alert.alert(
          "Pagamento em processamento",
          "Ainda estamos aguardando a confirmação do Mercado Pago. Você pode atualizar o status no painel profissional."
        );
      })
      .catch((error) => {
        Alert.alert(
          "Não foi possível confirmar agora",
          error instanceof Error
            ? error.message
            : "Abra o painel profissional e tente atualizar o pagamento."
        );
      });
  }, [openTab, user.role]);

  const openAccountProfile = (account: AppUser) => {
    if (isOwnAccountProfile(account, user.id)) {
      openTab("profile");
      return;
    }
    openUserProfile(account);
  };

  const openAthleteProfile = (player: Player) => {
    if (isOwnPlayerProfile(player, user.id, ownProfileId)) {
      openTab("profile");
      return;
    }
    openPlayerProfile(player);
  };

  return (
    <View style={styles.appRoot}>
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          backgroundColor={colors.background}
          barStyle={themeMode === "dark" ? "light-content" : "dark-content"}
        />
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.keyboardView}>
          {campaignPlayer ? (
            <>
              <ScreenFrame key={`campaign-${campaignPlayer.id}`}>
                <PromotePostScreen
                  onBack={closeCampaign}
                  onCreate={(input) => handleCreateCampaign(campaignPlayer, input)}
                  player={campaignPlayer}
                />
              </ScreenFrame>
              <BottomTabs activeTab={tab} onChange={openTab} role={user.role} />
            </>
          ) : selectedProfilePlayer || selectedProfileAccount ? (
            <>
              <ScreenFrame key={`public-profile-${selectedProfilePlayer?.profileId ?? selectedProfileAccount?.id}`}>
                <PublicProfileScreen
                  account={selectedProfileAccount}
                  avatar={selectedProfileId ? profileAvatars[selectedProfileId] : undefined}
                  followersCount={selectedProfileId ? followersByProfile[selectedProfileId] ?? 0 : 0}
                  followingCount={followingCountsByUser[selectedProfileAccount?.id ?? selectedProfilePlayer?.ownerUserId ?? ""] ?? 0}
                  hiddenPlayerIds={hiddenPlayerIdSet}
                  isFollowing={Boolean(selectedProfileId && followingProfileSet.has(selectedProfileId))}
                  likeCountsByPlayer={likeCountsByPlayer}
                  onBack={clearSelectedProfile}
                  onMessage={onOpenMessagesForSelectedProfile}
                  onToggleFollow={() => {
                    if (selectedProfileId) toggleFollowProfile(selectedProfileId);
                  }}
                  onOpenVideo={(player) => openReel(player, {
                    account: selectedProfileAccount,
                    player: selectedProfilePlayer ?? player,
                    type: "public-profile"
                  })}
                  onSetVideoHidden={setPlayerHidden}
                  onShareVideo={(player, contact, message) => sendSharedPost(contact, player, message)}
                  player={selectedProfilePlayer}
                  professionalSettings={selectedProfileProfessionalSettings}
                  profileAvatars={profileAvatars}
                  shareContacts={shareContacts}
                  showFollow={Boolean(selectedProfileId && selectedProfileId !== ownProfileId)}
                  videos={selectedProfileVideos}
                  viewCountsByPlayer={viewCountsByPlayer}
                />
              </ScreenFrame>
              <BottomTabs activeTab={tab} onChange={openTab} role={user.role} />
            </>
          ) : (
            <>
              {tab !== "feed" && tab !== "submit" ? (
                <Header
                  onSignOut={signOutSession}
                  pendingReviews={pendingReviews}
                  showSignOut={user.role === "Admin" && tab !== "profile"}
                  user={user}
                />
              ) : null}

              {tab === "feed" ? (
                <FeedScreen
                  syncError={props.feedSyncError}
                  onRetrySync={props.onRetryFeedSync}
                  initialAnchor={props.feedAnchor}
                  entryKeys={feedEntryKeys}
                  onAnchorChange={props.onFeedAnchorChange}
                  activeCampaignPlayerIds={activeCampaignPlayerIds}
                  autoplayEnabled={autoplayEnabled}
                  backLabel={reelReturnTarget?.type === "messages" ? "Voltar para mensagens" : "Voltar ao perfil"}
                  blockedProfileIds={blockedProfileIdSet}
                  commentsByPlayer={notificationNavigation.commentsByPlayer}
                  currentUserId={user.id}
                  focusPlayerId={feedFocusPlayerId}
                  followingProfileIds={followingProfileIds}
                  interestedContentKeys={interestedContentKeySet}
                  likedPlayerIds={likedPlayerIdSet}
                  likeCountsByPlayer={likeCountsByPlayer}
                  shareCountsByPlayer={shareCountsByPlayer}
                  mutedContentKeys={mutedContentKeySet}
                  notifications={notifications}
                  notificationTarget={notificationPost}
                  onMarkNotificationsRead={markNotificationsRead}
                  onOpenNotification={(notification) => { void notificationNavigation.openNotification(notification); }}
                  onAddComment={addPostComment}
                  onBackToProfile={reelReturnTarget ? returnToReelOrigin : undefined}
                  onDeleteComment={(commentId) => {
                    notificationNavigation.removeComment(commentId);
                    deletePostComment(commentId);
                  }}
                  onImmersiveChange={setIsFeedImmersive}
                  onOpenPlayer={openAthleteProfile}
                  onOpenTaggedUser={openAccountProfile}
                  onRecordView={recordPlayerView}
                  onRefreshFeed={() => { openTab("feed"); props.onRefreshFeed?.(); }}
                  onReportPlayer={(player) => setPlayerReported(player.id, true)}
                  reportedPlayerIds={reportedPlayerIdSet}
                  onShare={(player, contact, message) => sendSharedPost(contact, player, message)}
                  onToggleFollow={(player) => {
                    toggleFollowProfile(player.profileId);
                  }}
                  onToggleBlockProfile={(player) => toggleBlockedProfile(player.profileId)}
                  onToggleInterest={(player) => {
                    toggleInterestedContent(getPlayerContentKey(player));
                  }}
                  onToggleLike={(player) => toggleLikePlayer(player.id)}
                  onToggleMutedContent={toggleMutedContent}
                  players={feedPlayers}
                  profileAvatars={profileAvatars}
                  shareContacts={shareContacts}
                  users={registeredUsers}
                />
              ) : null}

              {tab === "search" ? (
                <ScreenFrame key="search">
                  <SearchScreen
                    followingProfileIds={followingProfileIds}
                    interestedContentKeys={interestedContentKeySet}
                    onOpenUser={openAccountProfile}
                    ownProfileId={ownProfileId}
                    players={availablePlayers}
                    professionalSettingsByUser={professionalSettingsByUser}
                    profileAvatars={profileAvatars}
                    users={registeredUsers}
                    viewerCity={user.city}
                    viewerInterestTags={user.interestTags}
                  />
                </ScreenFrame>
              ) : null}

              {tab === "messages" ? (
                <ScreenFrame key={`messages-${activeMessageContactId ?? "list"}`}>
                  <MessagesScreen
                    activeContactId={activeMessageContactId}
                    contacts={messageContacts}
                    currentUserId={user.id}
                    followingProfileIds={followingProfileIds}
                    messages={conversationMessages}
                    focusMessageId={notificationMessage?.contact.id === activeMessageContactId ? notificationMessage.messageId : undefined}
                    focusRequestId={notificationMessage?.requestId}
                    onMarkMessagesRead={markDirectMessagesRead}
                    mutedContactIds={mutedContactIds}
                    onDeleteConversation={deleteConversation}
                    onFindProfiles={() => openTab("search")}
                    onOpenProfile={(contactId) => {
                      const account = registeredUsers.find(
                        (candidate) => candidate.id === contactId
                      );
                      if (account) openAccountProfile(account);
                    }}
                    onOpenSharedPost={(playerId) => {
                      const sharedPlayer = availablePlayers.find((player) => player.id === playerId);
                      if (sharedPlayer && activeMessageContactId) {
                        openReel(sharedPlayer, { contactId: activeMessageContactId, type: "messages" });
                      }
                    }}
                    onSelectContact={setActiveMessageContactId}
                    onSendMessage={sendDirectMessage}
                    onToggleFollow={toggleFollowProfile}
                    onToggleMute={toggleMuteConversation}
                    onTogglePin={togglePinConversation}
                    pinnedContactIds={pinnedContactIds}
                    players={availablePlayers}
                    profileAvatars={profileAvatars}
                  />
                </ScreenFrame>
              ) : null}

              {tab === "submit" ? (
                <ScreenFrame backgroundColor={colors.media} key="submit">
                  <SubmitVideoScreen
                    accounts={registeredUsers}
                    onBack={() => openTab("feed")}
                    onPublished={() => openTab("feed")}
                    onCreateTag={ensureTag}
                    onSubmit={handleSubmitVideo}
                    profileAvatars={profileAvatars}
                    tagCatalog={tagCatalog}
                    user={user}
                  />
                </ScreenFrame>
              ) : null}

              {tab === "admin" ? (
                <ScreenFrame key="admin">
                  <AdminScreen onReview={handleReviewSubmission} submissions={submissions} />
                </ScreenFrame>
              ) : null}

              {tab === "profile" ? (
                <ScreenFrame animated={false} key="profile">
                  <ProfileScreen
                    accounts={registeredUsers}
                    autoplayEnabled={autoplayEnabled}
                    avatar={ownProfileId ? profileAvatars[ownProfileId] : undefined}
                    blockedProfileIds={blockedProfileIdSet}
                    campaigns={currentUserCampaigns}
                    followers={selectProfileFollowers(ownProfileId, followerUserIdsByProfile, registeredUsers)}
                    following={selectProfileFollowing(followingProfileIds, registeredUsers)}
                    followersCount={ownProfileId ? followersByProfile[ownProfileId] ?? 0 : 0}
                    followingCount={followingProfileIds.length}
                    hiddenPlayerIds={hiddenPlayerIdSet}
                    likeCountsByPlayer={likeCountsByPlayer}
                    mutedContentKeys={mutedContentKeySet}
                    messagesCount={directMessages.filter((message) => message.recipientUserId === user.id).length}
                    notificationsEnabled={notificationsEnabled}
                    onChangeAutoplay={setAutoplayEnabled}
                    onChangeNotifications={setNotificationsEnabled}
                    onDeleteAccount={deleteAccountSession}
                    onCreateTag={ensureTag}
                    onDeleteVideo={handleDeleteVideo}
                    onOpenProfile={openAccountProfile}
                    onProfessionalOpenRequestHandled={() => setProfessionalOpenRequestId(0)}
                    onOpenVideo={(submission) => {
                      const reelPlayer = selectApprovedPlayerForSubmission(approvedSubmissionPlayers, submission.id);
                      if (reelPlayer) openReel(reelPlayer, { type: "own-profile" });
                    }}
                    onPromotePost={openCampaign}
                    onRestoreMutedContent={toggleMutedContent}
                    onSetPlayerReported={setPlayerReported}
                    onSetVideoHidden={setPlayerHidden}
                    onShareVideo={(submission, contact, message) => {
                      const sharedPlayer = selectApprovedPlayerForSubmission(approvedSubmissionPlayers, submission.id);
                      if (sharedPlayer) sendSharedPost(contact, sharedPlayer, message);
                    }}
                    onChangeAvatar={(avatar) => {
                      if (ownProfileId) setProfileAvatar(ownProfileId, avatar);
                    }}
                    onSignOut={signOutSession}
                    onToggleBlockedProfile={toggleBlockedProfile}
                    onToggleCampaign={handleToggleCampaign}
                    onUpdateProfessionalSettings={handleUpdateProfessionalSettings}
                    onUpdateProfile={handleUpdateProfile}
                    professionalOpenRequestId={professionalOpenRequestId}
                    professionalPosts={ownProfilePlayers}
                    professionalSettings={currentProfessionalSettings}
                    profileAvatars={profileAvatars}
                    reportedPlayerIds={reportedPlayerIdSet}
                    securityPlayers={availablePlayers}
                    shareContacts={shareContacts}
                    submissions={submissions}
                    tagCatalog={tagCatalog}
                    user={user}
                    viewCountsByPlayer={viewCountsByPlayer}
                  />
                </ScreenFrame>
              ) : null}

              {tab !== "submit" ? (
                <BottomTabs
                  activeTab={tab}
                  hidden={tab === "feed" && isFeedImmersive}
                  onChange={openTab}
                  role={user.role}
                />
              ) : null}
            </>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
      <BrandLaunchOverlay isVisible={isBrandLaunchVisible} onFinish={onBrandLaunchFinish} />
    </View>
  );
}
