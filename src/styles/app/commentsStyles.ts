import { StyleSheet } from "react-native";
import { colors } from "../../theme";

export const commentsStyles = {
  commentsModalRoot: {
    alignItems: "center",
    flex: 1,
    justifyContent: "flex-end"
  },
  commentsBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(12, 13, 20, 0.58)"
  },
  commentsKeyboardArea: {
    alignItems: "center",
    justifyContent: "flex-end",
    width: "100%"
  },
  commentsSheet: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    maxHeight: "78%",
    maxWidth: 560,
    minHeight: 410,
    overflow: "hidden",
    width: "100%"
  },
  commentsHeader: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 66,
    paddingHorizontal: 16
  },
  commentsHeaderIcon: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    height: 38,
    justifyContent: "center",
    width: 38
  },
  commentsHeaderText: {
    flex: 1,
    minWidth: 0
  },
  commentsTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900"
  },
  commentsSubtitle: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2
  },
  commentsCloseButton: {
    alignItems: "center",
    height: 38,
    justifyContent: "center",
    width: 38
  },
  commentsScroll: {
    flexShrink: 1
  },
  commentsList: {
    paddingHorizontal: 16,
    paddingVertical: 4
  },
  commentRow: {
    alignItems: "flex-start",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 10,
    paddingVertical: 13
  },
  commentReplyRow: {
    borderLeftColor: colors.primarySoft,
    borderLeftWidth: 2,
    marginLeft: 32,
    paddingLeft: 10
  },
  commentAvatar: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderRadius: 999,
    borderWidth: 1,
    height: 38,
    justifyContent: "center",
    overflow: "hidden",
    width: 38
  },
  commentReplyAvatar: {
    height: 30,
    width: 30
  },
  commentAvatarText: {
    color: colors.primaryText,
    fontSize: 11,
    fontWeight: "900"
  },
  commentBody: {
    flex: 1,
    minWidth: 0
  },
  commentIdentityRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  commentIdentityButton: {
    flex: 1,
    minWidth: 0
  },
  commentUsername: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900"
  },
  commentAuthorName: {
    color: colors.muted,
    fontSize: 10,
    marginTop: 1
  },
  commentTime: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "700"
  },
  commentText: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 6
  },
  commentReplyMention: {
    color: colors.primaryText,
    fontWeight: "900"
  },
  commentReplyButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 4,
    marginTop: 6,
    paddingVertical: 2
  },
  commentReplyButtonText: {
    color: colors.primaryText,
    fontSize: 10,
    fontWeight: "800"
  },
  commentThreadToggle: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 6,
    marginTop: 7,
    paddingVertical: 3
  },
  commentThreadToggleLine: {
    backgroundColor: colors.borderStrong,
    height: 1,
    width: 24
  },
  commentThreadToggleText: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800"
  },
  commentDeleteButton: {
    alignItems: "center",
    height: 34,
    justifyContent: "center",
    width: 30
  },
  commentsEmptyState: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    minHeight: 240,
    padding: 24
  },
  commentsEmptyIcon: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    height: 54,
    justifyContent: "center",
    width: 54
  },
  commentsEmptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 14
  },
  commentsEmptyBody: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 5,
    textAlign: "center"
  },
  commentReplyTarget: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  commentReplyTargetText: {
    color: colors.primaryText,
    flex: 1,
    fontSize: 11,
    fontWeight: "800"
  },
  commentReplyTargetClose: {
    alignItems: "center",
    height: 26,
    justifyContent: "center",
    width: 26
  },
  commentComposerArea: {
    position: "relative" as const,
    zIndex: 15
  },
  commentComposer: {
    alignItems: "flex-end",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 9,
    padding: 12
  },
  commentInput: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    color: colors.text,
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    maxHeight: 96,
    minHeight: 42,
    paddingHorizontal: 12,
    paddingVertical: 10,
    textAlignVertical: "top"
  },
  commentSendButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 6,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  commentSendButtonDisabled: {
    opacity: 0.38
  },
  commentDeleteConfirmationOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "flex-end",
    zIndex: 20
  },
  commentDeleteConfirmationBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(12, 13, 20, 0.48)"
  },
  commentDeleteConfirmationCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderTopWidth: 1,
    padding: 18
  },
  commentDeleteConfirmationTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900"
  },
  commentDeleteConfirmationBody: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 6
  },
  commentDeleteConfirmationActions: {
    flexDirection: "row",
    gap: 10,
    marginTop: 18
  },
  commentDeleteCancelButton: {
    alignItems: "center",
    borderColor: colors.borderStrong,
    borderRadius: 6,
    borderWidth: 1,
    flex: 1,
    height: 42,
    justifyContent: "center"
  },
  commentDeleteCancelText: {
    color: colors.text,
    fontWeight: "800"
  },
  commentDeleteConfirmButton: {
    alignItems: "center",
    backgroundColor: colors.danger,
    borderRadius: 6,
    flex: 1,
    flexDirection: "row",
    gap: 7,
    height: 42,
    justifyContent: "center"
  },
  commentDeleteConfirmText: {
    color: colors.onPrimary,
    fontWeight: "900"
  },
} as const;
