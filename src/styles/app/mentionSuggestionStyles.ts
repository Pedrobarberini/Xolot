import { colors } from "../../theme";

export const mentionSuggestionStyles = {
  mentionSuggestionsPopover: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 14,
    left: 0,
    maxHeight: 280,
    overflow: "hidden" as const,
    position: "absolute" as const,
    right: 0,
    shadowColor: "#000000",
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.16,
    shadowRadius: 14,
    zIndex: 60
  },
  mentionSuggestionsScroll: {
    maxHeight: 280
  },
  mentionSuggestionsAbove: {
    bottom: 68
  },
  mentionSuggestionsBelow: {
    top: 80
  },
  mentionSuggestionRow: {
    alignItems: "center" as const,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row" as const,
    gap: 10,
    minHeight: 54,
    paddingHorizontal: 12,
    paddingVertical: 8
  },
  mentionSuggestionRowLast: {
    borderBottomWidth: 0
  },
  mentionSuggestionIcon: {
    alignItems: "center" as const,
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    height: 34,
    justifyContent: "center" as const,
    overflow: "hidden" as const,
    width: 34
  },
  mentionSuggestionInitial: {
    color: colors.primaryText,
    fontSize: 13,
    fontWeight: "900" as const
  },
  mentionSuggestionIdentity: {
    flex: 1,
    minWidth: 0
  },
  mentionSuggestionUsername: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900" as const
  },
  mentionSuggestionName: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700" as const,
    marginTop: 2
  },
  mentionSuggestionEmpty: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700" as const,
    paddingHorizontal: 14,
    paddingVertical: 16,
    textAlign: "center" as const
  }
};