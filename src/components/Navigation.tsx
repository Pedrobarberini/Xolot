import React from "react";
import {
  ArrowLeft,
  Home,
  LogOut,
  MessageCircle,
  Search,
  ShieldCheck,
  Upload,
  UserRound
} from "lucide-react-native";
import {
  Image,
  Pressable,
  type StyleProp,
  Text,
  TextInput,
  useWindowDimensions,
  View,
  type ViewStyle
} from "react-native";
import {
  XOLOT_HORIZONTAL_WORDMARK,
  XOLOT_SYMBOL
} from "../constants/assets";
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
  showSignOut = true,
  user,
  walletBalance
}: {
  onSignOut: () => void;
  pendingReviews: number;
  showBalance: boolean;
  showSignOut?: boolean;
  user: AppUser;
  walletBalance: number;
}) {
  const { width } = useWindowDimensions();
  const isCompact = USE_CENTERED_WEB_LAYOUT || width < 520;
  const hasHeaderActions =
    showBalance || user.role === "Admin" || showSignOut;

  return (
    <View style={[styles.header, isCompact ? styles.headerCompact : null]}>
      <View
        style={[
          styles.headerIdentity,
          isCompact ? styles.headerIdentityCompact : null,
          isCompact && !hasHeaderActions
            ? styles.headerIdentityCompactSolo
            : null
        ]}
      >
        <View style={styles.headerTitleBlock}>
          <Image
            accessibilityLabel="Xolot"
            resizeMode="contain"
            source={XOLOT_HORIZONTAL_WORDMARK}
            style={[
              styles.headerWordmark,
              isCompact ? styles.headerWordmarkCompact : null
            ]}
          />
          <Text numberOfLines={1} style={styles.headerSubtitle}>
            {user.role} | @{user.username}
          </Text>
        </View>
      </View>
      {hasHeaderActions ? (
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
          {showSignOut ? (
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
          ) : null}
        </View>
      ) : null}
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
      accessibilityLabel={`Saldo disponível ${formatBRL(balance)}`}
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

export function BackButton({
  accessibilityLabel,
  disabled = false,
  inverse = false,
  onPress,
  style
}: {
  accessibilityLabel: string;
  disabled?: boolean;
  inverse?: boolean;
  onPress: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="button"
      disabled={disabled}
      hitSlop={8}
      onPress={onPress}
      style={({ pressed }) => [
        styles.backIconButton,
        style,
        pressed ? styles.backIconButtonPressed : null,
        disabled ? styles.backIconButtonDisabled : null
      ]}
    >
      <ArrowLeft
        color={inverse ? colors.onPrimary : colors.text}
        size={22}
        strokeWidth={2.2}
      />
    </Pressable>
  );
}

export function DetailHud({
  backLabel,
  onBack,
  walletBalance
}: {
  backLabel: string;
  onBack: () => void;
  walletBalance: number;
}) {
  return (
    <View style={styles.detailFixedHud}>
      <View style={styles.detailHudLeading}>
        <BackButton
          accessibilityLabel={backLabel}
          onPress={onBack}
        />
        <Image
          accessibilityLabel="Logo Xolot"
          resizeMode="contain"
          source={XOLOT_SYMBOL}
          style={styles.detailHudLogo}
        />
      </View>
      <Text
        accessibilityLabel={`Saldo disponível ${formatBRL(walletBalance)}`}
        numberOfLines={1}
        style={styles.detailHudBalance}
      >
        {formatBRL(walletBalance)}
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
            { id: "feed", label: "Início" },
            { id: "search", label: "Pesquisar" },
            { id: "messages", label: "Mensagens" },
            { id: "profile", label: "Perfil" }
          ]
        : [
            { id: "feed", label: "Início" },
            { id: "submit", label: "Envio" },
            { id: "search", label: "Pesquisar" },
            { id: "messages", label: "Mensagens" },
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
              : item.id === "search"
                ? Search
                : item.id === "messages"
                  ? MessageCircle
                : item.id === "profile"
                  ? UserRound
                  : Home;

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
              size={21}
              strokeWidth={isActive ? 2.4 : 2}
            />
            <Text
              numberOfLines={1}
              style={[styles.tabText, isActive ? styles.tabTextActive : null]}
            >
              {item.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
