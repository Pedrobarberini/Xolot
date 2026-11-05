import { colors } from "../../theme";

export const securityStyles = {
  securitySegmentedControl: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 18,
    padding: 4
  },
  securitySegment: {
    alignItems: "center",
    borderRadius: 6,
    flex: 1,
    gap: 3,
    justifyContent: "center",
    minHeight: 68,
    paddingHorizontal: 4,
    paddingVertical: 8
  },
  securitySegmentActive: {
    backgroundColor: colors.surface
  },
  securitySegmentLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    textAlign: "center"
  },
  securitySegmentLabelActive: {
    color: colors.primaryText
  },
  securitySegmentCount: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "900"
  },
  securitySegmentCountActive: {
    color: colors.primaryText
  },
  securityListSection: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden"
  },
  securitySectionHeading: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 9,
    minHeight: 54,
    paddingHorizontal: 16
  },
  securitySectionTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 15,
    fontWeight: "900"
  },
  securityListRow: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 11,
    minHeight: 74,
    paddingHorizontal: 14,
    paddingVertical: 10
  },
  securityMediaIcon: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: 6,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  securityAvatar: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderRadius: 999,
    borderWidth: 1,
    height: 44,
    justifyContent: "center",
    overflow: "hidden",
    width: 44
  },
  securityAvatarText: {
    color: colors.primaryText,
    fontSize: 12,
    fontWeight: "900"
  },
  securityRowBody: {
    flex: 1,
    minWidth: 0
  },
  securityRowTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  securityRowMeta: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "600",
    lineHeight: 15,
    marginTop: 3
  },
  securityRestoreButton: {
    alignItems: "center",
    height: 42,
    justifyContent: "center",
    width: 42
  },
  securityRestoreButtonPressed: {
    opacity: 0.55
  },
  securityEmptyState: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 250,
    paddingHorizontal: 24,
    paddingVertical: 36
  },
  securityEmptyTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    marginTop: 12,
    textAlign: "center"
  },
  securityEmptyBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
    maxWidth: 340,
    textAlign: "center"
  }
} as const;
