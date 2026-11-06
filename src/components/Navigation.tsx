import React, { useEffect, useRef } from "react";
import {
  Home,
  LogOut,
  MessageCircle,
  Search,
  ShieldCheck,
  Upload,
  UserRound
} from "lucide-react-native";
import {
  Animated,
  Pressable,
  Text,
  useWindowDimensions,
  View
} from "react-native";
import { BrandMark } from "../shared/ui/BrandMark";
import { USE_CENTERED_WEB_LAYOUT } from "../constants/layout";
import { styles } from "../styles/appStyles";
import { colors } from "../theme";
import { AppUser, UserRole } from "../types";
import { Tab } from "../ui/types";
import { BackButton } from "../shared/ui/BackButton";
export { BackButton } from "../shared/ui/BackButton";
export { LabeledInput } from "../shared/ui/LabeledInput";

export function Header({
  onSignOut,
  pendingReviews,
  showSignOut = true,
  user
}: {
  onSignOut: () => void;
  pendingReviews: number;
  showSignOut?: boolean;
  user: AppUser;
}) {
  const { width } = useWindowDimensions();
  const isCompact = USE_CENTERED_WEB_LAYOUT || width < 520;
  const hasHeaderActions = user.role === "Admin" || showSignOut;

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
          <BrandMark symbolOnly />
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
              <LogOut color={colors.primaryText} size={20} strokeWidth={2.2} />
            </Pressable>
          ) : null}
        </View>
      ) : null}
    </View>
  );
}

export function DetailHud({
  backLabel,
  onBack
}: {
  backLabel: string;
  onBack: () => void;
}) {
  return (
    <View style={styles.detailFixedHud}>
      <BackButton accessibilityLabel={backLabel} onPress={onBack} />
    </View>
  );
}

export function BottomTabs({
  activeTab,
  hidden = false,
  onChange,
  role
}: {
  activeTab: Tab;
  hidden?: boolean;
  onChange: (tab: Tab) => void;
  role: UserRole;
}) {
  const visibility = useRef(new Animated.Value(hidden ? 0 : 1)).current;

  useEffect(() => {
    visibility.stopAnimation();
    Animated.timing(visibility, {
      duration: hidden ? 150 : 220,
      toValue: hidden ? 0 : 1,
      useNativeDriver: true
    }).start();
  }, [hidden, visibility]);

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
    <Animated.View
      pointerEvents={hidden ? "none" : "auto"}
      style={[
        styles.tabBar,
        {
          opacity: visibility,
          transform: [
            {
              translateY: visibility.interpolate({
                inputRange: [0, 1],
                outputRange: [18, 0]
              })
            }
          ]
        }
      ]}
    >
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
              color={isActive ? colors.primaryText : colors.muted}
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
    </Animated.View>
  );
}
