import { colors } from "../../theme";

export const profileDiscoveryStyles = {
  searchModeControl: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 14,
    padding: 4
  },
  searchModeTab: {
    alignItems: "center",
    borderRadius: 6,
    flex: 1,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 10
  },
  searchModeTabActive: {
    backgroundColor: colors.surface
  },
  searchModeTabText: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800"
  },
  searchModeTabTextActive: {
    color: colors.primaryText
  },
  searchInterestSection: {
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    marginBottom: 16,
    paddingBottom: 14
  },
  searchInterestHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10
  },
  searchInterestTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  searchInterestCount: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800"
  },
  searchTagList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7
  },
  searchTag: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 34,
    paddingHorizontal: 12,
    paddingVertical: 7
  },
  searchTagSelected: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  searchTagText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800"
  },
  searchTagTextSelected: {
    color: colors.onPrimary
  },
  searchProfileBadgeRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 5,
    marginTop: 3,
    minWidth: 0
  }
} as const;
