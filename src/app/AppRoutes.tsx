import React from "react";
import type { Dispatch, SetStateAction } from "react";
import { KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, View } from "react-native";
import {
  isOwnAccountProfile,
  isOwnPlayerProfile,
  selectApprovedPlayerForSubmission,
  selectFundByOwner,
  selectPlayerByOwner,
  selectProfileFollowers,
  selectProfileFollowing,
  selectProfileFund,
  selectUserSubmissions
} from "./appSelectors";
import { BrandLaunchOverlay } from "./AppEntryShells";
import { ScreenFrame } from "../components/AppShell";
import { BottomTabs, Header } from "../components/Navigation";
import { AdminScreen } from "../screens/AdminScreen";
import { FeedScreen } from "../screens/FeedScreen";
import { InvestmentScreen } from "../screens/InvestmentScreen";
import { MessagesScreen } from "../screens/MessagesScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { PublicProfileScreen } from "../screens/PublicProfileScreen";
import { SearchScreen } from "../screens/SearchScreen";
import { SubmitVideoScreen } from "../screens/SubmissionScreen";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import type {
  AppUser,
  AthleteFund,
  DirectMessage,
  Investment,
  MessageContact,
  Player,
  ProfileAvatar,
  ProfileAvatarsByProfile,
  VideoSubmission,
  VideoSubmissionStatus
} from "../types";
import type { Tab } from "../ui/types";
import type { ReelReturnTarget } from "./useAppNavigation";
import { getPlayerContentKey } from "../utils/feedEngagement";

type AppRoutesProps = {
  activeMessageContactId: string | null;
  approvedSubmissionPlayers: Player[];
  athleteFunds: AthleteFund[];
  availablePlayers: Player[];
  blockedProfileIdSet: Set<string>;
  clearSelectedProfile: () => void;
  closeInvestment: () => void;
  currentMessageContacts: MessageContact[];
  deleteConversation: (contactId: string) => void;
  currentUserInvestments: Investment[];
  directMessages: DirectMessage[];
  feedFocusPlayerId: string | null;
  focusFeedPlayer: (playerId: string) => void;
  followersByProfile: Record<string, number>;
  followerUserIdsByProfile: Record<string, string[]>;
  followingProfileIds: string[];
  followingProfileSet: Set<string>;
  hiddenPlayerIdSet: Set<string>;
  interestedContentKeySet: Set<string>;
  handleDeleteVideo: (submission: VideoSubmission) => Promise<boolean>;
  handleDeposit: (amount: number) => void;
  handleInvest: (player: Player, amount: number) => void;
  handleOpenFund: (
    player: Player,
    goalAmount: number,
    minimumContribution: number
  ) => void;
  handleReviewSubmission: (
    submissionId: string,
    status: VideoSubmissionStatus,
    reviewNote: string
  ) => void;
  handleSubmitVideo: (submission: VideoSubmission) => void;
  handleUpdateProfile: (profile: {
    age: number | null;
    bio: string;
    city: string;
    club: string;
    name: string;
    position: string;
    username: string;
  }) => void;
  handleWithdraw: (amount: number) => void;
  investmentFund?: AthleteFund;
  investmentPlayer: Player | null;
  isBrandLaunchVisible: boolean;
  likedPlayerIdSet: Set<string>;
  likeCountsByPlayer: Record<string, number>;
  onBrandLaunchFinish: () => void;
  onOpenMessagesForSelectedProfile: () => void;
  openInvestment: (player: Player) => void;
  openPlayerProfile: (player: Player) => void;
  openReel: (player: Player, returnTarget?: ReelReturnTarget | null) => void;
  openTab: (tab: Tab) => void;
  openUserProfile: (account: AppUser) => void;
  orderedFeedPlayers: Player[];
  ownProfileId?: string | null;
  pendingReviews: number;
  mutedContactIds: string[];
  mutedContentKeySet: Set<string>;
  pinnedContactIds: string[];
  profileAvatars: ProfileAvatarsByProfile;
  recordPlayerView: (playerId: string) => void;
  registeredUsers: AppUser[];
  reelReturnTarget: ReelReturnTarget | null;
  returnToReelOrigin: () => void;
  selectedProfileAccount?: AppUser;
  selectedProfileFund?: AthleteFund;
  selectedProfileId?: string;
  selectedProfilePlayer?: Player;
  selectedProfileVideos: Player[];
  sendDirectMessage: (contactId: string, body: string) => void;
  sendSharedPost: (contact: MessageContact, player: Player) => void;
  setPlayerHidden: (playerId: string, hidden: boolean) => void;
  setActiveMessageContactId: Dispatch<SetStateAction<string | null>>;
  setProfileAvatar: (
    profileId: string,
    avatar: ProfileAvatar | null
  ) => void;
  shareContacts: MessageContact[];
  signOutSession: () => void;
  submissions: VideoSubmission[];
  tab: Tab;
  toggleFollowProfile: (profileId: string) => void;
  toggleBlockedProfile: (profileId: string) => void;
  toggleInterestedContent: (contentKey: string) => void;
  toggleLikePlayer: (playerId: string) => void;
  toggleMuteConversation: (contactId: string) => void;
  toggleMutedContent: (contentKey: string) => void;
  togglePinConversation: (contactId: string) => void;
  user: AppUser;
  viewCountsByPlayer: Record<string, number>;
  walletBalance: number;
};

export function AppRoutes({
  activeMessageContactId,
  approvedSubmissionPlayers,
  athleteFunds,
  availablePlayers,
  blockedProfileIdSet,
  clearSelectedProfile,
  closeInvestment,
  currentMessageContacts,
  deleteConversation,
  currentUserInvestments,
  directMessages,
  feedFocusPlayerId,
  focusFeedPlayer,
  followersByProfile,
  followerUserIdsByProfile,
  followingProfileIds,
  followingProfileSet,
  hiddenPlayerIdSet,
  interestedContentKeySet,
  handleDeleteVideo,
  handleDeposit,
  handleInvest,
  handleOpenFund,
  handleReviewSubmission,
  handleSubmitVideo,
  handleUpdateProfile,
  handleWithdraw,
  investmentFund,
  investmentPlayer,
  isBrandLaunchVisible,
  likedPlayerIdSet,
  likeCountsByPlayer,
  onBrandLaunchFinish,
  onOpenMessagesForSelectedProfile,
  openInvestment,
  openPlayerProfile,
  openReel,
  openTab,
  openUserProfile,
  orderedFeedPlayers,
  ownProfileId,
  pendingReviews,
  mutedContactIds,
  mutedContentKeySet,
  pinnedContactIds,
  profileAvatars,
  recordPlayerView,
  registeredUsers,
  reelReturnTarget,
  returnToReelOrigin,
  selectedProfileAccount,
  selectedProfileFund,
  selectedProfileId,
  selectedProfilePlayer,
  selectedProfileVideos,
  sendDirectMessage,
  sendSharedPost,
  setPlayerHidden,
  setActiveMessageContactId,
  setProfileAvatar,
  shareContacts,
  signOutSession,
  submissions,
  tab,
  toggleFollowProfile,
  toggleBlockedProfile,
  toggleInterestedContent,
  toggleLikePlayer,
  toggleMuteConversation,
  toggleMutedContent,
  togglePinConversation,
  user,
  viewCountsByPlayer,
  walletBalance
}: AppRoutesProps) {
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
          barStyle="dark-content"
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : undefined}
          style={styles.keyboardView}
        >
          {investmentPlayer && investmentFund ? (
            <>
              <ScreenFrame key={`investment-${investmentPlayer.id}`}>
                <InvestmentScreen
                  avatar={profileAvatars[investmentPlayer.profileId]}
                  fund={investmentFund}
                  onBack={closeInvestment}
                  onInvest={(player, amount) => {
                    handleInvest(player, amount);
                    closeInvestment();
                  }}
                  player={investmentPlayer}
                  walletBalance={walletBalance}
                />
              </ScreenFrame>
              <BottomTabs
                activeTab={tab}
                onChange={openTab}
                role={user.role}
              />
            </>
          ) : selectedProfilePlayer || selectedProfileAccount ? (
            <>
              <ScreenFrame
                key={`public-profile-${
                  selectedProfilePlayer?.profileId ?? selectedProfileAccount?.id
                }`}
              >
                <PublicProfileScreen
                  account={selectedProfileAccount}
                  avatar={
                    selectedProfileId
                      ? profileAvatars[selectedProfileId]
                      : undefined
                  }
                  canInvest={Boolean(
                    user.role === "Usuário" &&
                      selectedProfilePlayer &&
                      selectedProfilePlayer.ownerUserId !== user.id
                  )}
                  fund={selectedProfileFund}
                  followersCount={
                    selectedProfileId
                      ? followersByProfile[selectedProfileId] ?? 0
                      : 0
                  }
                  hiddenPlayerIds={hiddenPlayerIdSet}
                  isFollowing={Boolean(
                    selectedProfileId &&
                      followingProfileSet.has(selectedProfileId)
                  )}
                  onBack={clearSelectedProfile}
                  onInvest={() => {
                    if (
                      selectedProfilePlayer &&
                      selectedProfileFund?.status === "Captando"
                    ) {
                      openInvestment(selectedProfilePlayer);
                    }
                  }}
                  onMessage={onOpenMessagesForSelectedProfile}
                  onToggleFollow={() => {
                    if (selectedProfileId) {
                      toggleFollowProfile(selectedProfileId);
                    }
                  }}
                  onOpenVideo={(player) =>
                    openReel(player, {
                      account: selectedProfileAccount,
                      player: selectedProfilePlayer ?? player,
                      type: "public-profile"
                    })
                  }
                  onSetVideoHidden={setPlayerHidden}
                  onShareVideo={(player, contact) =>
                    sendSharedPost(contact, player)
                  }
                  player={selectedProfilePlayer}
                  profileAvatars={profileAvatars}
                  shareContacts={shareContacts}
                  showFollow={Boolean(
                    selectedProfileId && selectedProfileId !== ownProfileId
                  )}
                  videos={selectedProfileVideos}
                  viewCountsByPlayer={viewCountsByPlayer}
                  walletBalance={walletBalance}
                />
              </ScreenFrame>
              <BottomTabs
                activeTab={tab}
                onChange={openTab}
                role={user.role}
              />
            </>
          ) : (
            <>
              {tab !== "feed" && tab !== "submit" ? (
                <Header
                  onSignOut={signOutSession}
                  pendingReviews={pendingReviews}
                  showBalance={user.role === "Usuário" && tab === "profile"}
                  showSignOut={user.role === "Admin" && tab !== "profile"}
                  user={user}
                  walletBalance={walletBalance}
                />
              ) : null}
              {tab === "feed" ? (
                <FeedScreen
                  backLabel={
                    reelReturnTarget?.type === "messages"
                      ? "Voltar para mensagens"
                      : "Voltar ao perfil"
                  }
                  balance={user.role === "Usuário" ? walletBalance : null}
                  blockedProfileIds={blockedProfileIdSet}
                  currentUserId={user.id}
                  focusPlayerId={feedFocusPlayerId}
                  followingProfileIds={followingProfileIds}
                  funds={athleteFunds}
                  interestedContentKeys={interestedContentKeySet}
                  likedPlayerIds={likedPlayerIdSet}
                  likeCountsByPlayer={likeCountsByPlayer}
                  mutedContentKeys={mutedContentKeySet}
                  onBackToProfile={
                    reelReturnTarget ? returnToReelOrigin : undefined
                  }
                  onOpenPlayer={openAthleteProfile}
                  onRecordView={recordPlayerView}
                  onShare={(player, contact) =>
                    sendSharedPost(contact, player)
                  }
                  onOpenInvestment={(player) => {
                    const fund = selectProfileFund(player, athleteFunds);

                    if (fund?.status === "Captando") {
                      openInvestment(player);
                    }
                  }}
                  onToggleFollow={(player) => {
                    focusFeedPlayer(player.id);
                    toggleFollowProfile(player.profileId);
                  }}
                  onToggleBlockProfile={(player) =>
                    toggleBlockedProfile(player.profileId)
                  }
                  onToggleInterest={(player) => {
                    focusFeedPlayer(player.id);
                    toggleInterestedContent(getPlayerContentKey(player));
                  }}
                  onToggleLike={(player) => toggleLikePlayer(player.id)}
                  onToggleMutedContent={toggleMutedContent}
                  players={orderedFeedPlayers}
                  profileAvatars={profileAvatars}
                  shareContacts={shareContacts}
                />
              ) : null}
              {tab === "search" ? (
                <ScreenFrame key="search">
                  <SearchScreen
                    funds={athleteFunds}
                    onOpenPlayer={openAthleteProfile}
                    onOpenUser={openAccountProfile}
                    players={availablePlayers}
                    profileAvatars={profileAvatars}
                    users={registeredUsers}
                  />
                </ScreenFrame>
              ) : null}
              {tab === "messages" ? (
                <ScreenFrame
                  key={`messages-${activeMessageContactId ?? "list"}`}
                >
                  <MessagesScreen
                    activeContactId={activeMessageContactId}
                    contacts={currentMessageContacts}
                    currentUserId={user.id}
                    followingProfileIds={followingProfileIds}
                    messages={directMessages}
                    mutedContactIds={mutedContactIds}
                    onDeleteConversation={deleteConversation}
                    onFindProfiles={() => openTab("search")}
                    onOpenSharedPost={(playerId) => {
                      const sharedPlayer = availablePlayers.find(
                        (player) => player.id === playerId
                      );

                      if (sharedPlayer && activeMessageContactId) {
                        openReel(sharedPlayer, {
                          contactId: activeMessageContactId,
                          type: "messages"
                        });
                      }
                    }}
                    onSelectContact={setActiveMessageContactId}
                    onSendMessage={sendDirectMessage}
                    onToggleFollow={(profileId) =>
                      toggleFollowProfile(profileId)
                    }
                    onToggleMute={toggleMuteConversation}
                    onTogglePin={togglePinConversation}
                    pinnedContactIds={pinnedContactIds}
                    players={availablePlayers}
                    profileAvatars={profileAvatars}
                  />
                </ScreenFrame>
              ) : null}
              {tab === "submit" ? (
                <ScreenFrame key="submit">
                  <SubmitVideoScreen
                    onBack={() => openTab("feed")}
                    onSubmit={handleSubmitVideo}
                    user={user}
                  />
                </ScreenFrame>
              ) : null}
              {tab === "admin" ? (
                <ScreenFrame key="admin">
                  <AdminScreen
                    onReview={handleReviewSubmission}
                    submissions={submissions}
                  />
                </ScreenFrame>
              ) : null}
              {tab === "profile" ? (
                <ScreenFrame animated={false} key="profile">
                  <ProfileScreen
                    accounts={registeredUsers}
                    avatar={
                      ownProfileId ? profileAvatars[ownProfileId] : undefined
                    }
                    balance={walletBalance}
                    followers={selectProfileFollowers(
                      ownProfileId,
                      followerUserIdsByProfile,
                      registeredUsers
                    )}
                    following={selectProfileFollowing(
                      followingProfileIds,
                      registeredUsers
                    )}
                    fund={selectFundByOwner(athleteFunds, user.id)}
                    investments={currentUserInvestments}
                    followersCount={
                      ownProfileId ? followersByProfile[ownProfileId] ?? 0 : 0
                    }
                    followingCount={followingProfileIds.length}
                    hiddenPlayerIds={hiddenPlayerIdSet}
                    likeCountsByPlayer={likeCountsByPlayer}
                    onDeleteVideo={handleDeleteVideo}
                    onOpenFund={handleOpenFund}
                    onOpenProfile={openAccountProfile}
                    onOpenVideo={(submission) => {
                      const reelPlayer = selectApprovedPlayerForSubmission(
                        approvedSubmissionPlayers,
                        submission.id
                      );

                      if (reelPlayer) {
                        openReel(reelPlayer, { type: "own-profile" });
                      }
                    }}
                    onSetVideoHidden={setPlayerHidden}
                    onShareVideo={(submission, contact) => {
                      const sharedPlayer = selectApprovedPlayerForSubmission(
                        approvedSubmissionPlayers,
                        submission.id
                      );

                      if (sharedPlayer) {
                        sendSharedPost(contact, sharedPlayer);
                      }
                    }}
                    onDeposit={handleDeposit}
                    onChangeAvatar={(avatar) => {
                      if (ownProfileId) {
                        setProfileAvatar(ownProfileId, avatar);
                      }
                    }}
                    onSignOut={signOutSession}
                    onUpdateProfile={handleUpdateProfile}
                    onWithdraw={handleWithdraw}
                    player={selectPlayerByOwner(availablePlayers, user.id)}
                    profileAvatars={profileAvatars}
                    shareContacts={shareContacts}
                    submissions={submissions}
                    user={user}
                    viewCountsByPlayer={viewCountsByPlayer}
                  />
                </ScreenFrame>
              ) : null}
              {tab !== "submit" ? (
                <BottomTabs
                  activeTab={tab}
                  onChange={openTab}
                  role={user.role}
                />
              ) : null}
            </>
          )}
        </KeyboardAvoidingView>
      </SafeAreaView>
      <BrandLaunchOverlay
        isVisible={isBrandLaunchVisible}
        onFinish={onBrandLaunchFinish}
      />
    </View>
  );
}
