import React, { useEffect, useMemo, useState } from "react";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { KeyboardAvoidingView, Platform, SafeAreaView, StatusBar, View } from "react-native";
import { buildPlayerFromSubmission } from "./src/actions/appActions";
import { createAppActions } from "./src/actions/createAppActions";
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
import { AppUser, AthleteFund, Investment, Player, VideoSubmission } from "./src/types";
import { Tab } from "./src/ui/types";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isBrandLaunchVisible, setIsBrandLaunchVisible] = useState(true);
  const [tab, setTab] = useState<Tab>("feed");
  const [selectedPlayer, setSelectedPlayer] = useState<Player | null>(null);
  const [selectedAccount, setSelectedAccount] = useState<AppUser | null>(null);
  const [investmentPlayer, setInvestmentPlayer] = useState<Player | null>(null);
  const [feedFocusPlayerId, setFeedFocusPlayerId] = useState<string | null>(null);
  const [registeredUsers, setRegisteredUsers] = useState<AppUser[]>([]);
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

  function openTab(nextTab: Tab) {
    setInvestmentPlayer(null);
    setSelectedAccount(null);
    setSelectedPlayer(null);
    setTab(nextTab);
  }

  function openReel(player: Player) {
    setInvestmentPlayer(null);
    setSelectedAccount(null);
    setSelectedPlayer(null);
    setFeedFocusPlayerId(player.id);
    setTab("feed");
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
              <ScreenFrame>
                <InvestmentScreen
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
              <ScreenFrame>
                <PublicProfileScreen
                  account={selectedProfileAccount}
                  canInvest={Boolean(
                    user.role === "Usuario" &&
                      selectedProfilePlayer &&
                      selectedProfilePlayer.ownerUserId !== user.id
                  )}
                  fund={selectedProfileFund}
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
                  onOpenVideo={openReel}
                  player={selectedProfilePlayer}
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
                  onSignOut={handleSignOut}
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
                  focusPlayerId={feedFocusPlayerId}
                  funds={athleteFunds}
                  onOpenPlayer={setSelectedPlayer}
                  players={availablePlayers}
                />
              ) : null}
              {tab === "search" ? (
                <ScreenFrame>
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
                    users={registeredUsers}
                  />
                </ScreenFrame>
              ) : null}
              {tab === "messages" ? (
                <ScreenFrame>
                  <MessagesScreen onFindProfiles={() => setTab("search")} />
                </ScreenFrame>
              ) : null}
              {tab === "submit" ? (
                <ScreenFrame>
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
                <ScreenFrame>
                  <AdminScreen
                    onReview={handleReviewSubmission}
                    submissions={submissions}
                  />
                </ScreenFrame>
              ) : null}
              {tab === "profile" ? (
                <ScreenFrame>
                  <ProfileScreen
                    balance={walletBalance}
                    fund={athleteFunds.find(
                      (item) => item.ownerUserId === user.id
                    )}
                    investments={currentUserInvestments}
                    onOpenFund={handleOpenFund}
                    onOpenVideo={(submission) => {
                      const reelPlayer = approvedSubmissionPlayers.find(
                        (player) => player.id === `approved-${submission.id}`
                      );

                      if (reelPlayer) {
                        openReel(reelPlayer);
                      }
                    }}
                    onDeposit={handleDeposit}
                    onSignOut={handleSignOut}
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
