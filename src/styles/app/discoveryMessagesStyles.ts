import { StyleSheet } from "react-native";
import {
  DETAIL_CONTENT_PADDING,
  TAB_BAR_CONTENT_PADDING,
  TAB_BAR_SAFE_PADDING,
  USE_CENTERED_WEB_LAYOUT
} from "../../constants/layout";
import { colors } from "../../theme";

export const discoveryMessagesStyles = {
  discoveryContent: {
    alignSelf: "center",
    maxWidth: 760,
    paddingBottom: TAB_BAR_CONTENT_PADDING,
    paddingHorizontal: 16,
    paddingTop: 20,
    width: "100%"
  },
  discoveryHeader: {
    marginBottom: 16
  },
  discoveryTitle: {
    color: colors.text,
    fontSize: 24,
    fontWeight: "900"
  },
  discoverySubtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 4
  },
  searchField: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    minHeight: 48,
    paddingHorizontal: 13
  },
  searchInput: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    minWidth: 0,
    paddingVertical: 10
  },
  searchClearButton: {
    alignItems: "center",
    height: 32,
    justifyContent: "center",
    width: 32
  },
  searchResultsHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 20
  },
  searchResultsTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  searchResultsCount: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  searchProfileRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginBottom: 8,
    minHeight: 86,
    padding: 12
  },
  searchProfileAvatar: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderRadius: 999,
    borderWidth: 1.5,
    height: 48,
    justifyContent: "center",
    overflow: "hidden",
    width: 48
  },
  searchProfileAvatarText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900"
  },
  searchProfileBody: {
    flex: 1,
    minWidth: 0
  },
  searchProfileName: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900"
  },
  searchProfileUsername: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 1
  },
  searchProfileMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 2
  },
  searchProfileFund: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 5
  },
  searchProfileFundActive: {
    color: colors.primary
  },
  discoveryEmptyState: {
    alignItems: "center",
    paddingHorizontal: 22,
    paddingTop: 54
  },
  discoveryEmptyTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 14,
    textAlign: "center"
  },
  discoveryEmptyBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 6,
    maxWidth: 390,
    textAlign: "center"
  },
  messagesContent: {
    alignSelf: "center",
    flexGrow: 1,
    maxWidth: 760,
    paddingBottom: TAB_BAR_CONTENT_PADDING,
    paddingHorizontal: 16,
    paddingTop: 20,
    width: "100%"
  },
  messagesScreen: {
    flex: 1,
    position: "relative"
  },
  messagesEmptyState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingBottom: 70,
    paddingHorizontal: 24
  },
  messagesIcon: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    height: 62,
    justifyContent: "center",
    width: 62
  },
  messagesSearchButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 6,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 20,
    minHeight: 44,
    paddingHorizontal: 16
  },
  messagesSearchButtonText: {
    color: colors.onPrimary,
    fontSize: 13,
    fontWeight: "900"
  },
  messagesConversationHeader: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 9,
    minHeight: 62,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  messagesBackButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 36
  },
  messagesContactAvatar: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderRadius: 999,
    borderWidth: 1.5,
    height: 42,
    justifyContent: "center",
    overflow: "hidden",
    width: 42
  },
  messagesContactAvatarText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900"
  },
  messagesContactIdentity: {
    flex: 1,
    minWidth: 0
  },
  messagesContactName: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  messagesContactSubtitle: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2
  },
  messagesFollowButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderRadius: 6,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    width: 38
  },
  messagesFollowButtonActive: {
    backgroundColor: colors.surface,
    borderColor: colors.primary
  },
  messagesThreadContent: {
    flexGrow: 1,
    paddingHorizontal: 14,
    paddingVertical: 16
  },
  messagesThreadEmpty: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 260,
    paddingHorizontal: 24
  },
  messagesThreadEmptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 12
  },
  messagesThreadEmptyBody: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
    textAlign: "center"
  },
  messagesRequestGate: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    margin: "auto",
    maxWidth: 420,
    minHeight: 260,
    paddingHorizontal: 24,
    paddingVertical: 28,
    width: "100%"
  },
  messagesRequestGateIcon: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    height: 52,
    justifyContent: "center",
    width: 52
  },
  messagesRequestFollowButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 6,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    marginTop: 18,
    minHeight: 42,
    paddingHorizontal: 15
  },
  messagesRequestFollowButtonText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: "900"
  },
  messagesRequestSentNotice: {
    alignSelf: "center",
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    maxWidth: 420,
    paddingHorizontal: 14,
    paddingVertical: 11,
    width: "100%"
  },
  messagesRequestSentTitle: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
    textAlign: "center"
  },
  messagesRequestSentBody: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 3,
    textAlign: "center"
  },
  messageBubbleRow: {
    alignItems: "flex-start",
    marginBottom: 8,
    width: "100%"
  },
  messageBubbleRowMine: {
    alignItems: "flex-end"
  },
  messageBubble: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: "82%",
    paddingHorizontal: 12,
    paddingVertical: 9
  },
  messageBubbleMine: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  messageBubbleText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18
  },
  messageBubbleTextMine: {
    color: colors.onPrimary
  },
  messageComposer: {
    alignItems: "flex-end",
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 8,
    padding: 10
  },
  messageComposerInput: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    maxHeight: 92,
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  messageComposerInputDisabled: {
    backgroundColor: colors.background,
    opacity: 0.74
  },
  messageSendButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 6,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  messageSendButtonDisabled: {
    opacity: 0.42
  },
  messagesContactList: {
    gap: 8,
    marginTop: 9
  },
  messagesSectionHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20
  },
  messagesRequestHeader: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    marginTop: 24,
    paddingTop: 20
  },
  messagesSectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  messagesSectionSubtitle: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 2
  },
  messagesSectionCount: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900"
  },
  messagesSectionEmpty: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 9
  },
  messagesContactCard: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 11,
    minHeight: 66,
    paddingHorizontal: 12,
    paddingVertical: 10
  },
  messagesContactPreview: {
    color: colors.muted,
    fontSize: 12,
    marginTop: 3
  },
  messagesRequestPill: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 5
  },
  messagesRequestPillText: {
    color: colors.primary,
    fontSize: 9,
    fontWeight: "900"
  }
} as const;
