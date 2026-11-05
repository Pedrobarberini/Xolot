import React from "react";
import { SafeAreaView, StatusBar, View } from "react-native";
import { BrandLaunchScreen, ScreenBackdrop } from "../components/AppShell";
import { BrandMark } from "../shared/ui/BrandMark";
import { AccountSetupModal } from "../screens/AccountSetupScreen";
import { AuthScreen } from "../screens/AuthScreen";
import { styles } from "../styles/appStyles";
import { useTheme } from "../ThemeProvider";
import { colors } from "../theme";
import type { AccountProfile, AppUser, ProfileAvatar, TagCatalogEntry } from "../types";

type BrandLaunchOverlayProps = {
  isVisible: boolean;
  onFinish: () => void;
};

type LoggedOutAppShellProps = BrandLaunchOverlayProps & {
  onComplete: (user: AppUser) => void;
};

type AccountSetupGateProps = BrandLaunchOverlayProps & {
  accounts: AppUser[];
  avatar?: ProfileAvatar;
  onSave: (profile: AccountProfile) => Promise<boolean> | boolean;
  onChangeAvatar: (avatar: ProfileAvatar) => void;
  onCreateTag: (label: string) => Promise<unknown> | unknown;
  onSignOut: () => void;
  tagCatalog: TagCatalogEntry[];
  user: AppUser;
};

function AppStatusBar() {
  const { themeMode } = useTheme();

  return (
    <StatusBar
      backgroundColor={colors.background}
      barStyle={themeMode === "dark" ? "light-content" : "dark-content"}
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
  isVisible,
  onComplete,
  onFinish
}: LoggedOutAppShellProps) {
  return (
    <View style={styles.appRoot}>
      <SafeAreaView style={styles.safeArea}>
        <AppStatusBar />
        <AuthScreen onComplete={onComplete} />
      </SafeAreaView>
      <BrandLaunchOverlay isVisible={isVisible} onFinish={onFinish} />
    </View>
  );
}

export function AccountSetupGate({
  accounts,
  avatar,
  isVisible,
  onFinish,
  onSave,
  onChangeAvatar,
  onCreateTag,
  onSignOut,
  tagCatalog,
  user
}: AccountSetupGateProps) {
  return (
    <View style={styles.appRoot}>
      <SafeAreaView style={styles.safeArea}>
        <AppStatusBar />
        <ScreenBackdrop />
        <View style={styles.accountSetupModalBrand}>
          <BrandMark hero />
        </View>
        <AccountSetupModal
          avatar={avatar}
          accounts={accounts}
          onSave={onSave}
          onChangeAvatar={onChangeAvatar}
          onCreateTag={onCreateTag}
          onSignOut={onSignOut}
          tagCatalog={tagCatalog}
          user={user}
          visible
        />
      </SafeAreaView>
      <BrandLaunchOverlay isVisible={isVisible} onFinish={onFinish} />
    </View>
  );
}
