import { StyleSheet } from "react-native";
import { colors } from "../../theme";

export const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: "center",
    padding: 20
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 18, 12, 0.5)"
  },
  dialog: {
    alignSelf: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    maxHeight: "78%",
    maxWidth: 520,
    overflow: "hidden",
    width: "100%"
  },
  header: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    minHeight: 60,
    paddingHorizontal: 16
  },
  heading: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  count: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2
  },
  closeButton: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    marginRight: -8,
    width: 36
  },
  content: {
    flexGrow: 1,
    minHeight: 276
  },
  list: {
    paddingHorizontal: 16,
    paddingVertical: 6
  },
  item: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 11,
    minHeight: 68,
    paddingVertical: 10
  },
  itemLast: {
    borderBottomWidth: 0
  },
  avatar: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderRadius: 999,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    overflow: "hidden",
    width: 42
  },
  avatarText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900"
  },
  itemText: {
    flex: 1,
    minWidth: 0
  },
  username: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  name: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2
  },
  subtitle: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 276,
    paddingHorizontal: 28
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    textAlign: "center"
  },
  emptyBody: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    marginTop: 7,
    textAlign: "center"
  },
  loadingList: {
    paddingHorizontal: 16,
    paddingVertical: 6
  },
  loadingRow: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 11,
    minHeight: 68,
    paddingVertical: 10
  },
  loadingAvatar: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    height: 42,
    width: 42
  },
  loadingText: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 4,
    height: 12,
    width: "48%"
  },
  loadingTextSmall: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 4,
    height: 10,
    marginTop: 7,
    width: "31%"
  },
  footer: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    minHeight: 58,
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  loadMoreButton: {
    alignItems: "center",
    borderColor: colors.primary,
    borderRadius: 6,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 36,
    paddingHorizontal: 16
  },
  loadMoreText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900"
  }
});
