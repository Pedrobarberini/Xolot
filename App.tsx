import { BRAND } from "./src/config/brand.ts";
import React, { useEffect, useMemo, useRef, useState } from "react";
import { createAppActions } from "./src/actions/createAppActions";
import { useFirebaseAccounts } from "./src/actions/useFirebaseAccounts";
import { useFirebasePosts } from "./src/actions/useFirebasePosts";
import { useFirebaseTagCatalog } from "./src/actions/useFirebaseTagCatalog";
import { usePersistentAppState } from "./src/actions/usePersistentAppState";
import { useProfileActions } from "./src/actions/useProfileActions";
import { useSocialActions } from "./src/actions/useSocialActions";
import {
  AccountSetupGate,
  LoadingAppShell,
  LoggedOutAppShell
} from "./src/app/AppEntryShells";
import { AppRoutes } from "./src/app/AppRoutes";
import {
  selectActiveCampaignPlayerIds,
  selectApprovedSubmissionPlayers,
  selectCurrentUserCampaigns,
  selectOrderedFeedPlayers,
  selectPendingReviews,
  selectPlayersByOwner,
  selectProfessionalSettings,
  selectProfileAccount,
  selectProfileId,
  selectProfileVideos,
  selectVisibleFeedPlayers
} from "./src/app/appSelectors";
import { useAppNavigation } from "./src/app/useAppNavigation";
import { useExpoBoot } from "./src/app/useExpoBoot";
import type { MessageContact } from "./src/types";
import {
  createDefaultProfessionalSettings
} from "./src/utils/professional";
import { selectShareContacts } from "./src/utils/socialSharing";

export default function App() {
  const [isBrandLaunchVisible, setIsBrandLaunchVisible] = useState(true);
  const hasRestoredInitialRoute = useRef(false);
  useExpoBoot();
  const {
    activeMessageContactId,
    campaignPlayer,
    clearSelectedProfile,
    closeCampaign,
    feedFocusPlayerId,
    focusFeedPlayer,
    openCampaign,
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
    campaigns,
    isAppStateLoaded,
    professionalSettingsByUser,
    setCampaigns,
    setProfessionalSettingsByUser,
    setSubmissions,
    submissions
  } = usePersistentAppState();
  const {
    isSessionLoaded,
    registeredUsers,
    setRegisteredUsers,
    setUser,
    user
  } = useFirebaseAccounts();
  const { isPostsLoaded } = useFirebasePosts(
    user,
    setSubmissions,
    isAppStateLoaded
  );
  const { ensureTag, tagCatalog } = useFirebaseTagCatalog(user, submissions);

  useEffect(() => {
    if (!isAppStateLoaded || !isSessionLoaded || hasRestoredInitialRoute.current) return;
    if (user?.role === "Admin") setTab("admin");
    hasRestoredInitialRoute.current = true;
  }, [isAppStateLoaded, isSessionLoaded, setTab, user?.role]);

  const approvedSubmissionPlayers = useMemo(
    () => selectApprovedSubmissionPlayers(submissions, registeredUsers),
    [registeredUsers, submissions]
  );
  const availablePlayers = approvedSubmissionPlayers;
  const { profileAvatars, setProfileAvatar } = useProfileActions(user);
  const {
    addMessageContact,
    addPostComment,
    autoplayEnabled,
    blockedProfileIdSet,
    commentsByPlayer,
    currentMessageContacts,
    deleteConversation,
    deletePostComment,
    directMessages,
    followersByProfile,
    followerUserIdsByProfile,
    followingCountsByUser,
    followingProfileIds,
    followingProfileSet,
    hiddenPlayerIdSet,
    interestedContentKeySet,
    likedPlayerIdSet,
    likeCountsByPlayer,
    markDirectMessagesRead,
    markNotificationsRead,
    mutedContentKeySet,
    notifications,
    notificationsEnabled,
    ownProfileId,
    mutedContactIds,
    pinnedContactIds,
    recordPlayerView,
    reportedPlayerIdSet,
    sendDirectMessage,
    sendSharedPost,
    shareCountsByPlayer,
    setAutoplayEnabled,
    setNotificationsEnabled,
    setPlayerHidden,
    setPlayerReported,
    toggleBlockedProfile,
    toggleFollowProfile,
    toggleInterestedContent,
    toggleLikePlayer,
    toggleMuteConversation,
    toggleMutedContent,
    togglePinConversation,
    viewCountsByPlayer
  } = useSocialActions({
    players: availablePlayers,
    user,
    users: registeredUsers
  });
  const visibleFeedPlayers = useMemo(
    () => selectVisibleFeedPlayers(
      availablePlayers,
      hiddenPlayerIdSet,
      feedFocusPlayerId,
      blockedProfileIdSet,
      mutedContentKeySet
    ),
    [availablePlayers, blockedProfileIdSet, feedFocusPlayerId, hiddenPlayerIdSet, mutedContentKeySet]
  );
  const activeCampaignPlayerIds = useMemo(
    () => selectActiveCampaignPlayerIds(campaigns),
    [campaigns]
  );
  const orderedFeedPlayers = useMemo(
    () =>
      selectOrderedFeedPlayers(
        visibleFeedPlayers,
        followingProfileSet,
        interestedContentKeySet,
        activeCampaignPlayerIds,
        user?.interestTags ?? [],
        likedPlayerIdSet
      ),
    [
      activeCampaignPlayerIds,
      followingProfileSet,
      interestedContentKeySet,
      likedPlayerIdSet,
      user?.interestTags,
      visibleFeedPlayers
    ]
  );
  const shareContacts = useMemo(
    () => selectShareContacts({
      contacts: currentMessageContacts,
      currentUserId: user?.id ?? "",
      followingProfileIds,
      players: availablePlayers,
      users: registeredUsers
    }),
    [availablePlayers, currentMessageContacts, followingProfileIds, registeredUsers, user?.id]
  );

  const pendingReviews = selectPendingReviews(submissions);
  const currentUserCampaigns = selectCurrentUserCampaigns(campaigns, user);
  const currentProfessionalSettings = useMemo(
    () => selectProfessionalSettings(professionalSettingsByUser, user?.id) ?? createDefaultProfessionalSettings(),
    [professionalSettingsByUser, user?.id]
  );
  const ownProfilePlayers = user
    ? selectPlayersByOwner(approvedSubmissionPlayers, user.id)
    : [];
  const selectedProfilePlayer = selectedPlayer ?? undefined;
  const selectedProfileAccount = selectProfileAccount(
    selectedAccount,
    selectedPlayer,
    registeredUsers
  );
  const selectedProfileVideos = selectProfileVideos(
    selectedPlayer,
    availablePlayers,
    selectedProfileAccount
  );
  const selectedProfileId = selectProfileId(selectedPlayer, selectedProfileAccount);
  const selectedProfileOwnerId =
    selectedProfileAccount?.id ?? selectedProfilePlayer?.ownerUserId;
  const selectedProfileProfessionalSettings = selectProfessionalSettings(
    professionalSettingsByUser,
    selectedProfileOwnerId
  );

  function openMessagesForSelectedProfile() {
    if (!user) return;

    const contactId =
      selectedProfileAccount?.id ??
      selectedProfilePlayer?.ownerUserId ??
      selectedProfilePlayer?.profileId;
    if (!contactId) return;

    const contact: MessageContact = {
      id: contactId,
      profileId:
        selectedProfilePlayer?.profileId ??
        `profile-${selectedProfileAccount?.id ?? contactId}`,
      name:
        selectedProfilePlayer?.name ??
        selectedProfileAccount?.name ??
        `Perfil ${BRAND.name}`,
      subtitle: selectedProfilePlayer
        ? `${selectedProfilePlayer.position} | ${selectedProfilePlayer.city}`
        : `Usuário ${BRAND.name}`,
      username:
        selectedProfileAccount?.username ?? selectedProfilePlayer?.username
    };

    addMessageContact(contact);
    openMessageContact(contact.id);
  }

  const {
    handleAuth,
    handleCreateCampaign,
    handleDeleteAccount,
    handleDeleteVideo,
    handleReviewSubmission,
    handleSignOut,
    handleSubmitVideo,
    handleToggleCampaign,
    handleUpdateProfessionalSettings,
    handleUpdateProfile
  } = createAppActions({
    registeredUsers,
    setCampaigns,
    setProfessionalSettingsByUser,
    setRegisteredUsers,
    setSelectedAccount,
    setSelectedPlayer,
    setSubmissions,
    setTab,
    setUser,
    user
  });

  async function deleteAccountSession() {
    const deleted = await handleDeleteAccount();
    if (deleted) resetSessionNavigation();
    return deleted;
  }

  function signOutSession() {
    resetSessionNavigation();
    handleSignOut();
  }

  if (!isAppStateLoaded || !isSessionLoaded || !isPostsLoaded) {
    return <LoadingAppShell isVisible={isBrandLaunchVisible} onFinish={() => setIsBrandLaunchVisible(false)} />;
  }

  if (!user) {
    return (
      <LoggedOutAppShell
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
        avatar={profileAvatars[`profile-${user.id}`]}
        isVisible={isBrandLaunchVisible}
        onFinish={() => setIsBrandLaunchVisible(false)}
        onChangeAvatar={(avatar) => setProfileAvatar(`profile-${user.id}`, avatar)}
        onCreateTag={ensureTag}
        onSave={handleUpdateProfile}
        onSignOut={signOutSession}
        tagCatalog={tagCatalog}
        user={user}
      />
    );
  }

  return (
    <AppRoutes
      activeCampaignPlayerIds={activeCampaignPlayerIds}
      activeMessageContactId={activeMessageContactId}
      autoplayEnabled={autoplayEnabled}
      approvedSubmissionPlayers={approvedSubmissionPlayers}
      availablePlayers={availablePlayers}
      blockedProfileIdSet={blockedProfileIdSet}
      commentsByPlayer={commentsByPlayer}
      campaignPlayer={campaignPlayer}
      clearSelectedProfile={clearSelectedProfile}
      closeCampaign={closeCampaign}
      currentMessageContacts={currentMessageContacts}
      currentProfessionalSettings={currentProfessionalSettings}
      currentUserCampaigns={currentUserCampaigns}
      addPostComment={addPostComment}
      deleteAccountSession={deleteAccountSession}
      deleteConversation={deleteConversation}
      directMessages={directMessages}
      deletePostComment={deletePostComment}
      feedFocusPlayerId={feedFocusPlayerId}
      focusFeedPlayer={focusFeedPlayer}
      followersByProfile={followersByProfile}
      followerUserIdsByProfile={followerUserIdsByProfile}
      followingCountsByUser={followingCountsByUser}
      followingProfileIds={followingProfileIds}
      followingProfileSet={followingProfileSet}
      hiddenPlayerIdSet={hiddenPlayerIdSet}
      interestedContentKeySet={interestedContentKeySet}
      handleCreateCampaign={handleCreateCampaign}
      handleDeleteVideo={handleDeleteVideo}
      handleReviewSubmission={handleReviewSubmission}
      handleSubmitVideo={handleSubmitVideo}
      handleToggleCampaign={handleToggleCampaign}
      handleUpdateProfessionalSettings={handleUpdateProfessionalSettings}
      handleUpdateProfile={handleUpdateProfile}
      ensureTag={ensureTag}
      isBrandLaunchVisible={isBrandLaunchVisible}
      likedPlayerIdSet={likedPlayerIdSet}
      likeCountsByPlayer={likeCountsByPlayer}
      markDirectMessagesRead={markDirectMessagesRead}
      markNotificationsRead={markNotificationsRead}
      mutedContactIds={mutedContactIds}
      mutedContentKeySet={mutedContentKeySet}
      notifications={notifications}
      notificationsEnabled={notificationsEnabled}
      onBrandLaunchFinish={() => setIsBrandLaunchVisible(false)}
      onOpenMessagesForSelectedProfile={openMessagesForSelectedProfile}
      openCampaign={openCampaign}
      openPlayerProfile={openPlayerProfile}
      openReel={openReel}
      openTab={openTab}
      openUserProfile={openUserProfile}
      orderedFeedPlayers={orderedFeedPlayers}
      ownProfileId={ownProfileId}
      ownProfilePlayers={ownProfilePlayers}
      pendingReviews={pendingReviews}
      pinnedContactIds={pinnedContactIds}
      professionalSettingsByUser={professionalSettingsByUser}
      profileAvatars={profileAvatars}
      recordPlayerView={recordPlayerView}
      reportedPlayerIdSet={reportedPlayerIdSet}
      registeredUsers={registeredUsers}
      reelReturnTarget={reelReturnTarget}
      returnToReelOrigin={returnToReelOrigin}
      selectedProfileAccount={selectedProfileAccount}
      selectedProfileId={selectedProfileId}
      selectedProfilePlayer={selectedProfilePlayer}
      selectedProfileProfessionalSettings={selectedProfileProfessionalSettings}
      selectedProfileVideos={selectedProfileVideos}
      sendDirectMessage={sendDirectMessage}
      sendSharedPost={sendSharedPost}
      shareCountsByPlayer={shareCountsByPlayer}
      setAutoplayEnabled={setAutoplayEnabled}
      setNotificationsEnabled={setNotificationsEnabled}
      setPlayerHidden={setPlayerHidden}
      setPlayerReported={setPlayerReported}
      setActiveMessageContactId={setActiveMessageContactId}
      setProfileAvatar={setProfileAvatar}
      shareContacts={shareContacts}
      signOutSession={signOutSession}
      submissions={submissions}
      tab={tab}
      tagCatalog={tagCatalog}
      toggleBlockedProfile={toggleBlockedProfile}
      toggleFollowProfile={toggleFollowProfile}
      toggleInterestedContent={toggleInterestedContent}
      toggleLikePlayer={toggleLikePlayer}
      toggleMuteConversation={toggleMuteConversation}
      toggleMutedContent={toggleMutedContent}
      togglePinConversation={togglePinConversation}
      user={user}
      viewCountsByPlayer={viewCountsByPlayer}
    />
  );
}
