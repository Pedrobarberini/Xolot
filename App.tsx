import React, { useEffect, useMemo, useRef, useState } from "react";
import { KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, View } from "react-native";
import { createAppActions } from "./src/actions/createAppActions";
import { usePersistentAppState } from "./src/actions/usePersistentAppState";
import { useProfileActions } from "./src/actions/useProfileActions";
import { useSocialActions } from "./src/actions/useSocialActions";
import {
  AccountSetupGate,
  BrandLaunchOverlay,
  LoadingAppShell,
  LoggedOutAppShell
} from "./src/app/AppEntryShells";
import {
  selectApprovedSubmissionPlayers,
  selectApprovedPlayerForSubmission,
  selectAvailablePlayers,
  selectCurrentUserInvestments,
  selectFundByOwner,
  selectInvestmentFund,
  selectOrderedFeedPlayers,
  selectPendingReviews,
  selectPlayerByOwner,
  selectProfileAccount,
  selectProfileFund,
  selectProfileId,
  selectProfileVideos,
  selectUserSubmissions
} from "./src/app/appSelectors";
import { useAppNavigation } from "./src/app/useAppNavigation";
import { useExpoBoot } from "./src/app/useExpoBoot";
import { ScreenFrame } from "./src/components/AppShell";
import { BottomTabs, Header } from "./src/components/Navigation";
import { demoPlayer } from "./src/data/demoPlayer";
import { AdminScreen } from "./src/screens/AdminScreen";
import { FeedScreen } from "./src/screens/FeedScreen";
import { InvestmentScreen } from "./src/screens/InvestmentScreen";
import { MessagesScreen } from "./src/screens/MessagesScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
import { PublicProfileScreen } from "./src/screens/PublicProfileScreen";
import { SearchScreen } from "./src/screens/SearchScreen";
import { SubmitVideoScreen } from "./src/screens/SubmissionScreen";
import { styles } from "./src/styles/appStyles";
import { colors } from "./src/theme";
import {
  AthleteFund,
  MessageContact
} from "./src/types";

const INITIAL_ATHLETE_FUNDS: AthleteFund[] = [
  {
    id: "demo-athlete-fund",
    profileId: demoPlayer.profileId,
    ownerUserId: "demo-athlete",
    athleteName: demoPlayer.name,
    goalAmount: 5000,
    fundedAmount: 0,
    minimumContribution: 50,
    status: "Captando",
    createdAt: "2026-07-01T00:00:00.000Z"
  }
];

export default function App() {
  const [isBrandLaunchVisible, setIsBrandLaunchVisible] = useState(true);
  const hasRestoredInitialRoute = useRef(false);
  useExpoBoot();
  const {
    activeMessageContactId,
    clearSelectedProfile,
    closeInvestment,
    feedFocusPlayerId,
    focusFeedPlayer,
    investmentPlayer,
    openInvestment,
    openMessageContact,
    openPlayerProfile,
    openReel,
    openTab,
    openUserProfile,
    reelReturnTarget,
    resetSessionNavigation,
    returnToReelOrigin,
    selectedAccount,
    selectedPlayer,
    setActiveMessageContactId,
    setSelectedAccount,
    setSelectedPlayer,
    setTab,
    tab
  } = useAppNavigation();
  const {
    athleteFunds,
    investments,
    isAppStateLoaded,
    registeredUsers,
    setAthleteFunds,
    setInvestments,
    setRegisteredUsers,
    setSubmissions,
    setUser,
    setWalletBalances,
    submissions,
    user,
    walletBalances
  } = usePersistentAppState(INITIAL_ATHLETE_FUNDS);
  const walletBalance = user ? (walletBalances[user.id] ?? 0) : 0;

  useEffect(() => {
    if (!isAppStateLoaded || hasRestoredInitialRoute.current) {
      return;
    }

    if (user?.role === "Admin") {
      setTab("admin");
    }

    hasRestoredInitialRoute.current = true;
  }, [isAppStateLoaded, user?.role]);

  const approvedSubmissionPlayers = useMemo(
    () => selectApprovedSubmissionPlayers(submissions, registeredUsers),
    [registeredUsers, submissions]
  );

  const availablePlayers = useMemo(
    () => selectAvailablePlayers(approvedSubmissionPlayers, demoPlayer),
    [approvedSubmissionPlayers]
  );
  const { profileAvatars, setProfileAvatar } = useProfileActions();
  const {
    addMessageContact,
    currentMessageContacts,
    directMessages,
    followersByProfile,
    followingProfileIds,
    followingProfileSet,
    ownProfileId,
    sendDirectMessage,
    toggleFollowProfile
  } = useSocialActions({ players: availablePlayers, user });
  const orderedFeedPlayers = useMemo(
    () => selectOrderedFeedPlayers(availablePlayers, followingProfileSet),
    [availablePlayers, followingProfileSet]
  );

  const pendingReviews = selectPendingReviews(submissions);
  const currentUserInvestments = selectCurrentUserInvestments(investments, user);
  const selectedProfilePlayer = selectedPlayer ?? undefined;
  const selectedProfileAccount = selectProfileAccount(
    selectedAccount,
    selectedPlayer,
    registeredUsers
  );
  const selectedProfileVideos = selectProfileVideos(
    selectedPlayer,
    availablePlayers
  );
  const selectedProfileFund = selectProfileFund(selectedPlayer, athleteFunds);
  const investmentFund = selectInvestmentFund(investmentPlayer, athleteFunds);
  const selectedProfileId = selectProfileId(
    selectedPlayer,
    selectedProfileAccount
  );

  function openMessagesForSelectedProfile() {
    if (!user) {
      return;
    }

    const contactId =
      selectedProfileAccount?.id ??
      selectedProfilePlayer?.ownerUserId ??
      selectedProfilePlayer?.profileId;

    if (!contactId) {
      return;
    }

    const contact: MessageContact = {
      id: contactId,
      profileId:
        selectedProfilePlayer?.profileId ??
        `profile-${selectedProfileAccount?.id ?? contactId}`,
      name:
        selectedProfilePlayer?.name ??
        selectedProfileAccount?.name ??
        "Perfil NextStar",
      subtitle: selectedProfilePlayer
        ? `${selectedProfilePlayer.position} | ${selectedProfilePlayer.city}`
        : "Usuario NextStar",
      username:
        selectedProfileAccount?.username ?? selectedProfilePlayer?.username
    };

    addMessageContact(contact);
    openMessageContact(contact.id);
  }

  const {
    handleAuth,
    handleDeleteVideo,
    handleDeposit,
    handleInvest,
    handleOpenFund,
    handleReviewSubmission,
    handleSignOut,
    handleSubmitVideo,
    handleUpdateProfile
  } = createAppActions({
    athleteFunds,
    registeredUsers,
    setAthleteFunds,
    setInvestments,
    setRegisteredUsers,
    setSelectedAccount,
    setSelectedPlayer,
    setSubmissions,
    setTab,
    setUser,
    setWalletBalances,
    user,
    walletBalance
  });

  function signOutSession() {
    resetSessionNavigation();
    handleSignOut();
  }

  if (!isAppStateLoaded) {
    return (
      <LoadingAppShell
        isVisible={isBrandLaunchVisible}
        onFinish={() => setIsBrandLaunchVisible(false)}
      />
    );
  }

  if (!user) {
    return (
      <LoggedOutAppShell
        accounts={registeredUsers}
        isVisible={isBrandLaunchVisible}
        onComplete={handleAuth}
        onFinish={() => setIsBrandLaunchVisible(false)}
      />
    );
  }

  if (user.role === "Usuario" && !user.profileCompleted) {
    return (
      <AccountSetupGate
        accounts={registeredUsers}
        isVisible={isBrandLaunchVisible}
        onFinish={() => setIsBrandLaunchVisible(false)}
        onSave={handleUpdateProfile}
        onSignOut={signOutSession}
        user={user}
      />
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
                    user.role === "Usuario" &&
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
                  onMessage={openMessagesForSelectedProfile}
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
                  showBalance={
                    user.role === "Usuario" && tab === "profile"
                  }
                  showSignOut={user.role === "Admin" && tab !== "profile"}
                  user={user}
                  walletBalance={walletBalance}
                />
              ) : null}
              {tab === "feed" ? (
                <FeedScreen
                  balance={user.role === "Usuario" ? walletBalance : null}
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
                    onFindProfiles={() => openTab("search")}
                    onSelectContact={setActiveMessageContactId}
                    onSendMessage={sendDirectMessage}
                    onToggleFollow={(profileId) =>
                      toggleFollowProfile(profileId)
                    }
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
                    player={selectPlayerByOwner(availablePlayers, user.id)}
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
        onFinish={() => setIsBrandLaunchVisible(false)}
      />
    </View>
  );
}
