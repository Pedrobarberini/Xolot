import React from "react";
import { LogOut, ShieldCheck, Upload, UserRound, Video, WalletCards } from "lucide-react-native";
import { Image, Pressable, Text, TextInput, useWindowDimensions, View } from "react-native";
import { NEXTSTAR_SYMBOL } from "../constants/assets";
import { USE_CENTERED_WEB_LAYOUT } from "../constants/layout";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import { AppUser, UserRole } from "../types";
import { Tab } from "../ui/types";
import { formatBRL } from "../utils/investment";

export function Header({
  onSignOut,
  pendingReviews,
  showBalance,
  user,
  walletBalance
}: {
  onSignOut: () => void;
  pendingReviews: number;
  showBalance: boolean;
  user: AppUser;
  walletBalance: number;
}) {
  const { width } = useWindowDimensions();
  const isCompact = USE_CENTERED_WEB_LAYOUT || width < 520;

  return (
    <View style={[styles.header, isCompact ? styles.headerCompact : null]}>
      <View
        style={[
          styles.headerIdentity,
          isCompact ? styles.headerIdentityCompact : null
        ]}
      >
        <Image
          accessibilityLabel="Logo NextStar"
          resizeMode="contain"
          source={NEXTSTAR_SYMBOL}
          style={[
            styles.headerLogo,
            isCompact ? styles.headerLogoCompact : null
          ]}
        />
        <View style={styles.headerTitleBlock}>
          <Text style={styles.brand}>NextStar</Text>
          <Text numberOfLines={1} style={styles.headerSubtitle}>
            {user.role} | {user.name}
          </Text>
        </View>
      </View>
      <View
        style={[
          styles.headerActions,
          isCompact ? styles.headerActionsCompact : null
        ]}
      >
        {showBalance ? <BalanceLine balance={walletBalance} /> : null}
        {user.role === "Admin" ? (
          <Text style={styles.headerReviewLine}>{pendingReviews} pend.</Text>
        ) : null}
        <Pressable
          accessibilityLabel="Sair da conta"
          onPress={onSignOut}
          style={[
            styles.signOutButton,
            isCompact ? styles.signOutButtonCompact : null
          ]}
        >
          <LogOut color={colors.primary} size={20} strokeWidth={2.2} />
        </Pressable>
      </View>
    </View>
  );
}

export function BalanceLine({
  balance,
  overlay = false
}: {
  balance: number;
  overlay?: boolean;
}) {
  return (
    <View
      accessibilityLabel={`Saldo disponivel ${formatBRL(balance)}`}
      style={[styles.balanceLine, overlay ? styles.balanceLineOverlay : null]}
    >
      <Text
        numberOfLines={1}
        style={[
          styles.balanceLineValue,
          overlay ? styles.balanceLineValueOverlay : null
        ]}
      >
        {formatBRL(balance)}
      </Text>
    </View>
  );
}

export function LabeledInput({
  label,
  multiline,
  ...props
}: React.ComponentProps<typeof TextInput> & { label: string }) {
  return (
    <View style={styles.labeledInputBlock}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TextInput
        multiline={multiline}
        placeholderTextColor={colors.muted}
        style={[styles.formInput, multiline ? styles.formInputMultiline : null]}
        textAlignVertical={multiline ? "top" : "center"}
        {...props}
      />
    </View>
  );
}

export function BottomTabs({
  activeTab,
  onChange,
  role
}: {
  activeTab: Tab;
  onChange: (tab: Tab) => void;
  role: UserRole;
}) {
  const tabs: Array<{
    id: Tab;
    label: string;
  }> =
    role === "Admin"
        ? [
            { id: "admin", label: "Admin" },
            { id: "feed", label: "Feed" },
            { id: "profile", label: "Perfil" }
          ]
        : [
            { id: "feed", label: "Feed" },
            { id: "submit", label: "Envio" },
            { id: "portfolio", label: "Carteira" },
            { id: "profile", label: "Perfil" }
          ];

  return (
    <View style={styles.tabBar}>
      {tabs.map((item) => {
        const isActive = item.id === activeTab;
        const TabIcon =
          item.id === "submit"
            ? Upload
            : item.id === "admin"
              ? ShieldCheck
              : item.id === "portfolio"
                ? WalletCards
                : item.id === "profile"
                  ? UserRound
                  : Video;

        return (
          <Pressable
            accessibilityLabel={item.label}
            accessibilityRole="tab"
            accessibilityState={{ selected: isActive }}
            key={item.id}
            onPress={() => onChange(item.id)}
            style={[styles.tabButton, isActive ? styles.tabButtonActive : null]}
          >
            <TabIcon
              color={isActive ? colors.primary : colors.muted}
              size={22}
              strokeWidth={isActive ? 2.4 : 2}
            />
            <Text style={[styles.tabText, isActive ? styles.tabTextActive : null]}>
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
