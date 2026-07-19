import { StyleSheet } from "react-native";
import {
  DETAIL_CONTENT_PADDING,
  TAB_BAR_CONTENT_PADDING,
  TAB_BAR_SAFE_PADDING,
  USE_CENTERED_WEB_LAYOUT
} from "../../constants/layout";
import { colors } from "../../theme";

export const navigationStyles = {
  header: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-between",
    maxWidth: 1180,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    position: "relative",
    width: "100%"
  },
  headerCompact: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: 0,
    paddingBottom: 10,
    paddingHorizontal: 14,
    paddingTop: 10
  },
  headerIdentity: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    minWidth: 168,
    paddingRight: 8
  },
  headerIdentityCompact: {
    flex: 1,
    minHeight: 48,
    minWidth: 0,
    paddingRight: 156
  },
  headerIdentityCompactSolo: {
    paddingRight: 0
  },
  headerLogo: {
    height: 42,
    marginRight: 8,
    width: 54
  },
  headerLogoCompact: {
    height: 38,
    width: 48
  },
  headerTitleBlock: {
    flex: 1
  },
  brand: {
    color: colors.primary,
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: 0
  },
  headerSubtitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  headerActionsCompact: {
    gap: 6,
    position: "absolute",
    right: 14,
    top: 11
  },
  balanceLine: {
    alignItems: "flex-end",
    justifyContent: "center",
    minHeight: 38,
    minWidth: 86
  },
  balanceLineOverlay: {
    minHeight: 30,
    minWidth: 0,
    position: "absolute",
    right: 72,
    top: 18,
    zIndex: 6
  },
  balanceLineValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  balanceLineValueOverlay: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: "900",
    textShadowColor: "rgba(0, 0, 0, 0.82)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 3
  },
  headerReviewLine: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  signOutButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: 38,
    paddingHorizontal: 10
  },
  signOutButtonCompact: {
    minHeight: 46,
    paddingHorizontal: 18
  },
  signOutText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900"
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    elevation: 10,
    gap: 2,
    paddingBottom: TAB_BAR_SAFE_PADDING,
    paddingHorizontal: 8,
    paddingTop: 8,
    shadowColor: "#10261A",
    shadowOffset: { height: -4, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    width: "100%"
  },
  tabButton: {
    alignItems: "center",
    borderRadius: 6,
    flex: 1,
    gap: 3,
    minHeight: 56,
    paddingVertical: 8
  },
  tabButtonActive: {
    backgroundColor: colors.primarySoft
  },
  tabMarker: {
    backgroundColor: "rgba(245, 222, 178, 0.26)",
    borderRadius: 999,
    height: 3,
    width: 22
  },
  tabMarkerActive: {
    backgroundColor: colors.primary,
    width: 34
  },
  tabText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900"
  },
  tabTextActive: {
    color: colors.primary
  }
} as const;
