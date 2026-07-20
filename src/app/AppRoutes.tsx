import React from "react";
import type { Dispatch, SetStateAction } from "react";
import { KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, View } from "react-native";
import {
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

type AppRoutesProps = {
  activeMessageContactId: string | null;
  approvedSubmissionPlayers: Player[];
  athleteFunds: AthleteFund[];
  availablePlayers: Player[];
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
  onBrandLaunchFinish: () => void;
  onOpenMessagesForSelectedProfile: () => void;
  openInvestment: (player: Player) => void;
  openPlayerProfile: (player: Player) => void;
  openReel: (player: Player, returnTarget?: { type: "own-profile" } | {
    account?: AppUser;
    player: Player;
    type: "public-profile";
  } | null) => void;
  openTab: (tab: Tab) => void;
  openUserProfile: (account: AppUser) => void;
  orderedFeedPlayers: Player[];
  ownProfileId?: string | null;
  pendingReviews: number;
  mutedContactIds: string[];
  pinnedContactIds: string[];
  profileAvatars: ProfileAvatarsByProfile;
  registeredUsers: AppUser[];
  reelReturnTarget: unknown;
  returnToReelOrigin: () => void;
  selectedProfileAccount?: AppUser;
  selectedProfileFund?: AthleteFund;
  selectedProfileId?: string;
  selectedProfilePlayer?: Player;
  selectedProfileVideos: Player[];
  sendDirectMessage: (contactId: string, body: string) => void;
  setActiveMessageContactId: Dispatch<SetStateAction<string | null>>;
  setProfileAvatar: (
    profileId: string,
    avatar: ProfileAvatar | null
  ) => void;
  signOutSession: () => void;
  submissions: VideoSubmission[];
  tab: Tab;
  toggleFollowProfile: (profileId: string) => void;
  toggleMuteConversation: (contactId: string) => void;
  togglePinConversation: (contactId: string) => void;
  user: AppUser;
  walletBalance: number;
};

export function AppRoutes({
  activeMessageContactId,
  approvedSubmissionPlayers,
  athleteFunds,
  availablePlayers,
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
  pinnedContactIds,
  profileAvatars,
  registeredUsers,
  reelReturnTarget,
  returnToReelOrigin,
  selectedProfileAccount,
  selectedProfileFund,
  selectedProfileId,
  selectedProfilePlayer,
  selectedProfileVideos,
  sendDirectMessage,
  setActiveMessageContactId,
  setProfileAvatar,
  signOutSession,
  submissions,
  tab,
  toggleFollowProfile,
  toggleMuteConversation,
  togglePinConversation,
  user,
  walletBalance
}: AppRoutesProps) {
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
                  player={selectedProfilePlayer}
                  showFollow={Boolean(
                    selectedProfileId && selectedProfileId !== ownProfileId
                  )}
                  videos={selectedProfileVideos}
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
              {tab !== "feed" ? (
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
                  balance={user.role === "Usuário" ? walletBalance : null}
                  currentUserId={user.id}
                  focusPlayerId={feedFocusPlayerId}
                  followingProfileIds={followingProfileIds}
                  funds={athleteFunds}
                  onBackToProfile={
                    reelReturnTarget ? returnToReelOrigin : undefined
                  }
                  onOpenPlayer={openPlayerProfile}
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
                  players={orderedFeedPlayers}
                  profileAvatars={profileAvatars}
                />
              ) : null}
              {tab === "search" ? (
                <ScreenFrame key="search">
                  <SearchScreen
                    funds={athleteFunds}
                    onOpenPlayer={openPlayerProfile}
                    onOpenUser={openUserProfile}
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
                    onSelectContact={setActiveMessageContactId}
                    onSendMessage={sendDirectMessage}
                    onToggleFollow={(profileId) =>
                      toggleFollowProfile(profileId)
                    }
                    onToggleMute={toggleMuteConversation}
                    onTogglePin={togglePinConversation}
                    pinnedContactIds={pinnedContactIds}
                    profileAvatars={profileAvatars}
                  />
                </ScreenFrame>
              ) : null}
              {tab === "submit" ? (
                <ScreenFrame key="submit">
                  <SubmitVideoScreen
                    onSubmit={handleSubmitVideo}
                    submissions={selectUserSubmissions(submissions, user.id)}
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
                    onDeleteVideo={handleDeleteVideo}
                    onOpenFund={handleOpenFund}
                    onOpenVideo={(submission) => {
                      const reelPlayer = selectApprovedPlayerForSubmission(
                        approvedSubmissionPlayers,
                        submission.id
                      );

                      if (reelPlayer) {
                        openReel(reelPlayer, { type: "own-profile" });
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
                    submissions={submissions}
                    user={user}
                  />
                </ScreenFrame>
              ) : null}
              <BottomTabs activeTab={tab} onChange={openTab} role={user.role} />
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
