import React, { useEffect, useMemo, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, View } from "react-native";
import { buildPlayerFromSubmission } from "./src/actions/appActions";
import { createAppActions } from "./src/actions/createAppActions";
import { useProfileActions } from "./src/actions/useProfileActions";
import { useSocialActions } from "./src/actions/useSocialActions";
import { BrandLaunchScreen, ScreenFrame } from "./src/components/AppShell";
import { BottomTabs, Header } from "./src/components/Navigation";
import { demoPlayer } from "./src/data/demoPlayer";
import { AdminScreen } from "./src/screens/AdminScreen";
import { AuthScreen } from "./src/screens/AuthScreen";
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
  AppUser,
  AthleteFund,
  Investment,
  MessageContact,
  Player,
  VideoSubmission
} from "./src/types";
import { Tab } from "./src/ui/types";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

type ReelReturnTarget =
  | { type: "own-profile" }
  | { account?: AppUser; player: Player; type: "public-profile" };

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isBrandLaunchVisible, setIsBrandLaunchVisible] = useState(true);
  const [tab, setTab] = useState<Tab>("feed");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<AppUser | null>(null);
  const [investmentPlayer, setInvestmentPlayer] = useState<Player | null>(null);
  const [feedFocusPlayerId, setFeedFocusPlayerId] = useState<string | null>(null);
  const [reelReturnTarget, setReelReturnTarget] =
    useState<ReelReturnTarget | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<AppUser[]>([]);
  const [activeMessageContactId, setActiveMessageContactId] = useState<
    string | null
  >(null);
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
    () =>
      availablePlayers
        .map((player, index) => ({ index, player }))
        .sort((left, right) => {
          const followDifference =
            Number(followingProfileSet.has(right.player.profileId)) -
            Number(followingProfileSet.has(left.player.profileId));

          return followDifference || left.index - right.index;
        })
        .map(({ player }) => player),
    [availablePlayers, followingProfileSet]
  );

  const pendingReviews = submissions.filter(
    (submission) => submission.status === "Em revisao"
  ).length;
  const currentUserInvestments = user
    ? investments.filter((investment) => investment.investorUserId === user.id)
    : [];
  const selectedProfilePlayer = selectedPlayer ?? undefined;
  const selectedProfileAccount = selectedAccount ?? (
    selectedProfilePlayer?.ownerUserId
      ? registeredUsers.find(
          (account) => account.id === selectedProfilePlayer.ownerUserId
        )
      : undefined
  );
  const selectedProfileVideos = selectedProfilePlayer
    ? availablePlayers.filter(
        (player) => player.profileId === selectedProfilePlayer.profileId
      )
    : [];
  const selectedProfileFund = selectedProfilePlayer
    ? athleteFunds.find(
        (fund) => fund.profileId === selectedProfilePlayer.profileId
      )
    : undefined;
  const investmentFund = investmentPlayer
    ? athleteFunds.find((fund) => fund.profileId === investmentPlayer.profileId)
    : undefined;
  const selectedProfileId =
    selectedProfilePlayer?.profileId ??
    (selectedProfileAccount ? `profile-${selectedProfileAccount.id}` : undefined);

  function openTab(nextTab: Tab) {
    setInvestmentPlayer(null);
    setReelReturnTarget(null);
    setSelectedAccount(null);
    setSelectedPlayer(null);
    setTab(nextTab);
  }

  function openReel(
    player: Player,
    returnTarget: ReelReturnTarget | null = null
  ) {
    setInvestmentPlayer(null);
    setReelReturnTarget(returnTarget);
    setSelectedAccount(null);
    setSelectedPlayer(null);
    setFeedFocusPlayerId(player.id);
    setTab("feed");
  }

  function returnToReelOrigin() {
    if (!reelReturnTarget) {
      return;
    }

    const returnTarget = reelReturnTarget;

    setReelReturnTarget(null);
    if (returnTarget.type === "own-profile") {
      setTab("profile");
      return;
    }

    setSelectedAccount(returnTarget.account ?? null);
    setSelectedPlayer(returnTarget.player);
  }

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
        : "Usuario NextStar"
    };

    addMessageContact(contact);
    setActiveMessageContactId(contact.id);
    setInvestmentPlayer(null);
    setSelectedAccount(null);
    setSelectedPlayer(null);
    setTab("messages");
  }

  const {
    handleAuth,
    handleDeposit,
    handleInvest,
    handleOpenFund,
    handleReviewSubmission,
    handleSignOut,
    handleSubmitVideo
  } = createAppActions({
    athleteFunds,
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
    setActiveMessageContactId(null);
    handleSignOut();
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
          {investmentPlayer && investmentFund ? (
            <>
              <ScreenFrame key={`investment-${investmentPlayer.id}`}>
                <InvestmentScreen
                  avatarUri={profileAvatars[investmentPlayer.profileId]}
                  fund={investmentFund}
                  onBack={() => setInvestmentPlayer(null)}
                  onInvest={(player, amount) => {
                    handleInvest(player, amount);
                    setInvestmentPlayer(null);
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
                  avatarUri={
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
                  onBack={() => {
                    setSelectedAccount(null);
                    setSelectedPlayer(null);
                  }}
                  onInvest={() => {
                    if (
                      selectedProfilePlayer &&
                      selectedProfileFund?.status === "Captando"
                    ) {
                      setInvestmentPlayer(selectedProfilePlayer);
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
                  onOpenPlayer={(player) => {
                    setReelReturnTarget(null);
                    setSelectedPlayer(player);
                  }}
                  onOpenInvestment={(player) => {
                    const fund = athleteFunds.find(
                      (item) => item.profileId === player.profileId
                    );

                    if (fund?.status === "Captando") {
                      setInvestmentPlayer(player);
                    }
                  }}
                  onToggleFollow={(player) => {
                    setFeedFocusPlayerId(player.id);
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
                    onOpenPlayer={(player) => {
                      setSelectedAccount(null);
                      setSelectedPlayer(player);
                    }}
                    onOpenUser={(account) => {
                      setSelectedPlayer(null);
                      setSelectedAccount(account);
                    }}
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
                    submissions={submissions.filter(
                      (item) => item.userId === user.id
                    )}
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
                    avatarUri={
                      ownProfileId ? profileAvatars[ownProfileId] : undefined
                    }
                    balance={walletBalance}
                    fund={athleteFunds.find(
                      (item) => item.ownerUserId === user.id
                    )}
                    investments={currentUserInvestments}
                    followersCount={
                      ownProfileId ? followersByProfile[ownProfileId] ?? 0 : 0
                    }
                    followingCount={followingProfileIds.length}
                    onOpenFund={handleOpenFund}
                    onOpenVideo={(submission) => {
                      const reelPlayer = approvedSubmissionPlayers.find(
                        (player) => player.id === `approved-${submission.id}`
                      );

                      if (reelPlayer) {
                        openReel(reelPlayer, { type: "own-profile" });
                      }
                    }}
                    onDeposit={handleDeposit}
                    onChangeAvatar={(uri) => {
                      if (ownProfileId) {
                        setProfileAvatar(ownProfileId, uri);
                      }
                    }}
                    onSignOut={signOutSession}
                    player={availablePlayers.find(
                      (item) => item.ownerUserId === user.id
                    )}
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
      {isBrandLaunchVisible ? (
        <BrandLaunchScreen onFinish={() => setIsBrandLaunchVisible(false)} />
      ) : null}
    </View>
  );
}
