import React from "react";
import { Image, SafeAreaView, StatusBar, View } from "react-native";
import { BrandLaunchScreen, ScreenBackdrop } from "../components/AppShell";
import { XOLOT_WORDMARK } from "../constants/assets";
import { AccountSetupModal } from "../screens/AccountSetupScreen";
import { AuthScreen } from "../screens/AuthScreen";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import type { AccountProfile, AppUser } from "../types";

type BrandLaunchOverlayProps = {
  isVisible: boolean;
  onFinish: () => void;
};

type LoggedOutAppShellProps = BrandLaunchOverlayProps & {
  accounts: AppUser[];
  onComplete: (user: AppUser) => void;
};

type AccountSetupGateProps = BrandLaunchOverlayProps & {
  accounts: AppUser[];
  onSave: (profile: AccountProfile) => void;
  onSignOut: () => void;
  user: AppUser;
};

function AppStatusBar() {
  return (
    <StatusBar
      backgroundColor={colors.background}
      barStyle="dark-content"
    />
  );
}

export function BrandLaunchOverlay({
  isVisible,
  onFinish
}: BrandLaunchOverlayProps) {
  return isVisible ? <BrandLaunchScreen onFinish={onFinish} /> : null;
}

export function LoadingAppShell({
  isVisible,
  onFinish
}: BrandLaunchOverlayProps) {
  return (
    <View style={styles.appRoot}>
      <SafeAreaView style={styles.safeArea}>
        <AppStatusBar />
      </SafeAreaView>
      <BrandLaunchOverlay isVisible={isVisible} onFinish={onFinish} />
    </View>
  );
}

export function LoggedOutAppShell({
  accounts,
  isVisible,
  onComplete,
  onFinish
}: LoggedOutAppShellProps) {
  return (
    <View style={styles.appRoot}>
      <SafeAreaView style={styles.safeArea}>
        <AppStatusBar />
        <AuthScreen accounts={accounts} onComplete={onComplete} />
      </SafeAreaView>
      <BrandLaunchOverlay isVisible={isVisible} onFinish={onFinish} />
    </View>
  );
}

export function AccountSetupGate({
  accounts,
  isVisible,
  onFinish,
  onSave,
  onSignOut,
  user
}: AccountSetupGateProps) {
  return (
    <View style={styles.appRoot}>
      <SafeAreaView style={styles.safeArea}>
        <AppStatusBar />
        <ScreenBackdrop />
        <View style={styles.accountSetupModalBrand}>
          <Image
            accessibilityLabel="Logo Xolot"
            resizeMode="contain"
            source={XOLOT_WORDMARK}
            style={styles.accountSetupModalBrandLogo}
          />
        </View>
        <AccountSetupModal
          accounts={accounts}
          onSave={onSave}
          onSignOut={onSignOut}
          user={user}
          visible
        />
      </SafeAreaView>
      <BrandLaunchOverlay isVisible={isVisible} onFinish={onFinish} />
    </View>
  );
}
