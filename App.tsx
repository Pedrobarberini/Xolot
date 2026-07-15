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
import { FeedScreen, PlayerDetail } from "./src/screens/FeedScreen";
import { PortfolioScreen } from "./src/screens/WalletScreen";
import { ProfileScreen } from "./src/screens/ProfileScreen";
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
          {selectedPlayer ? (
            <>
              <ScreenFrame>
                <PlayerDetail
                  canInvest={user.role === "Usuario"}
                  fund={athleteFunds.find(
                    (item) => item.profileId === selectedPlayer.profileId
                  )}
                  onBack={() => setSelectedPlayer(null)}
                  onInvest={handleInvest}
                  player={selectedPlayer}
                  profileVideos={availablePlayers.filter(
                    (item) => item.profileId === selectedPlayer.profileId
                  )}
                  walletBalance={walletBalance}
                />
              </ScreenFrame>
              <BottomTabs
                activeTab={tab}
                onChange={(nextTab) => {
                  setSelectedPlayer(null);
                  setTab(nextTab);
                }}
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
                    user.role === "Usuario" &&
                    (tab === "portfolio" || tab === "profile")
                  }
                  user={user}
                  walletBalance={walletBalance}
                />
              ) : null}
              {tab === "feed" ? (
                <FeedScreen
                  balance={user.role === "Usuario" ? walletBalance : null}
                  funds={athleteFunds}
                  onOpenPlayer={setSelectedPlayer}
                  players={availablePlayers}
                />
              ) : null}
              {tab === "portfolio" ? (
                <ScreenFrame>
                  <PortfolioScreen
                    balance={walletBalance}
                    investments={currentUserInvestments}
                    onDeposit={handleDeposit}
                  />
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
                    fund={athleteFunds.find(
                      (item) => item.ownerUserId === user.id
                    )}
                    investments={currentUserInvestments}
                    onOpenFund={handleOpenFund}
                    onSignOut={handleSignOut}
                    player={availablePlayers.find(
                      (item) => item.ownerUserId === user.id
                    )}
                    submissions={submissions}
                    user={user}
                  />
                </ScreenFrame>
              ) : null}
              <BottomTabs activeTab={tab} onChange={setTab} role={user.role} />
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
