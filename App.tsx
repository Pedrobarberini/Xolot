import React, { useEffect, useMemo, useRef, useState } from "react";
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
import { AppRoutes } from "./src/app/AppRoutes";
import {
  selectApprovedSubmissionPlayers,
  selectAvailablePlayers,
  selectCurrentUserInvestments,
  selectInvestmentFund,
  selectOrderedFeedPlayers,
  selectPendingReviews,
  selectProfileAccount,
  selectProfileFund,
  selectProfileId,
  selectProfileVideos
} from "./src/app/appSelectors";
import { useAppNavigation } from "./src/app/useAppNavigation";
import { useExpoBoot } from "./src/app/useExpoBoot";
import { demoPlayer } from "./src/data/demoPlayer";
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
    followerUserIdsByProfile,
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
        : "Usuário NextStar",
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

  if (user.role === "Usuário" && !user.profileCompleted) {
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
    <AppRoutes
      activeMessageContactId={activeMessageContactId}
      approvedSubmissionPlayers={approvedSubmissionPlayers}
      athleteFunds={athleteFunds}
      availablePlayers={availablePlayers}
      clearSelectedProfile={clearSelectedProfile}
      closeInvestment={closeInvestment}
      currentMessageContacts={currentMessageContacts}
      currentUserInvestments={currentUserInvestments}
      directMessages={directMessages}
      feedFocusPlayerId={feedFocusPlayerId}
      focusFeedPlayer={focusFeedPlayer}
      followersByProfile={followersByProfile}
      followerUserIdsByProfile={followerUserIdsByProfile}
      followingProfileIds={followingProfileIds}
      followingProfileSet={followingProfileSet}
      handleDeleteVideo={handleDeleteVideo}
      handleDeposit={handleDeposit}
      handleInvest={handleInvest}
      handleOpenFund={handleOpenFund}
      handleReviewSubmission={handleReviewSubmission}
      handleSubmitVideo={handleSubmitVideo}
      handleUpdateProfile={handleUpdateProfile}
      investmentFund={investmentFund}
      investmentPlayer={investmentPlayer}
      isBrandLaunchVisible={isBrandLaunchVisible}
      onBrandLaunchFinish={() => setIsBrandLaunchVisible(false)}
      onOpenMessagesForSelectedProfile={openMessagesForSelectedProfile}
      openInvestment={openInvestment}
      openPlayerProfile={openPlayerProfile}
      openReel={openReel}
      openTab={openTab}
      openUserProfile={openUserProfile}
      orderedFeedPlayers={orderedFeedPlayers}
      ownProfileId={ownProfileId}
      pendingReviews={pendingReviews}
      profileAvatars={profileAvatars}
      registeredUsers={registeredUsers}
      reelReturnTarget={reelReturnTarget}
      returnToReelOrigin={returnToReelOrigin}
      selectedProfileAccount={selectedProfileAccount}
      selectedProfileFund={selectedProfileFund}
      selectedProfileId={selectedProfileId}
      selectedProfilePlayer={selectedProfilePlayer}
      selectedProfileVideos={selectedProfileVideos}
      sendDirectMessage={sendDirectMessage}
      setActiveMessageContactId={setActiveMessageContactId}
      setProfileAvatar={setProfileAvatar}
      signOutSession={signOutSession}
      submissions={submissions}
      tab={tab}
      toggleFollowProfile={toggleFollowProfile}
      user={user}
      walletBalance={walletBalance}
    />
  );
}
