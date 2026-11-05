import { TAB_BAR_SAFE_PADDING } from "../../constants/layout";
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
    paddingBottom: 8,
    paddingHorizontal: 14,
    paddingTop: 8
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
  headerTitleBlock: {
    flex: 1
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
    shadowColor: "#1B160A",
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
  tabText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900"
  },
  tabTextActive: {
    color: colors.primaryText
  }
} as const;
