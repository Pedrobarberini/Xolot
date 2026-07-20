import { StyleSheet } from "react-native";
import { colors } from "../../theme";

export const walletInvestmentStyles = {
  fundTitleRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  fundStatus: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  fundStatusComplete: {
    color: colors.accent
  },
  fundProgressHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginTop: 16
  },
  fundProgressValue: {
    color: colors.primary,
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "900"
  },
  fundProgressGoal: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    textAlign: "right"
  },
  fundProgressTrack: {
    backgroundColor: colors.border,
    borderRadius: 999,
    height: 8,
    marginTop: 9,
    overflow: "hidden"
  },
  fundProgressFill: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: "100%"
  },
  fundStatsRow: {
    flexDirection: "row",
    gap: 16,
    marginTop: 13
  },
  fundStatItem: {
    flex: 1,
    minWidth: 0
  },
  fundStatValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  fundStatLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800",
    marginTop: 2,
    textTransform: "uppercase"
  },
  fundCompleteNotice: {
    borderLeftColor: colors.accent,
    borderLeftWidth: 3,
    marginTop: 18,
    paddingLeft: 12,
    paddingVertical: 3
  },
  fundCompleteNoticeTitle: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "900"
  },
  fundCompleteNoticeBody: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3
  },
  fundCustodyNote: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 12
  },
  simulationGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 12
  },
  simulationBox: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    flex: 1,
    padding: 12
  },
  simulationValue: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "900"
  },
  simulationLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4
  },
  timelinePanel: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    marginTop: 14,
    padding: 12
  },
  timelineRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginBottom: 8
  },
  timelineDot: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 24,
    justifyContent: "center",
    width: 24
  },
  timelineDotText: {
    color: colors.onPrimary,
    fontSize: 11,
    fontWeight: "900"
  },
  timelineText: {
    color: colors.text,
    flex: 1,
    fontSize: 13,
    fontWeight: "800"
  },
  summaryBand: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 12,
    padding: 18
  },
  summaryTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  depositButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 6,
    flex: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 13
  },
  depositButtonText: {
    color: colors.onPrimary,
    fontSize: 13,
    fontWeight: "900"
  },
  summaryLabel: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  summaryValue: {
    color: colors.text,
    fontSize: 34,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 6
  },
  walletActionRow: {
    flexDirection: "row",
    gap: 9,
    marginTop: 16
  },
  withdrawButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 6,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 13
  },
  withdrawButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900"
  },
  walletActionButtonDisabled: {
    opacity: 0.42
  },
  walletInfoButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  depositModalRoot: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 20
  },
  depositModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 18, 12, 0.52)"
  },
  depositDialog: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 18,
    maxWidth: 420,
    padding: 18,
    shadowColor: "#000000",
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    width: "100%"
  },
  financialInfoDialog: {
    maxWidth: 460
  },
  financialInfoList: {
    marginTop: 16
  },
  financialInfoItem: {
    alignItems: "flex-start",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 11,
    paddingVertical: 13
  },
  financialInfoItemIcon: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: 6,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  financialInfoItemBody: {
    flex: 1,
    minWidth: 0
  },
  financialInfoItemTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  financialInfoItemText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3
  },
  financialInfoNotice: {
    alignItems: "flex-start",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    padding: 11
  },
  financialInfoNoticeText: {
    color: colors.muted,
    flex: 1,
    fontSize: 11,
    lineHeight: 16
  },
  depositDialogHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  depositDialogTitleBlock: {
    flex: 1,
    minWidth: 0
  },
  depositDialogTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900"
  },
  depositDialogSubtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 18,
    marginTop: 4
  },
  depositCloseButton: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 36
  },
  depositBalanceLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "800",
    marginTop: 18,
    textTransform: "uppercase"
  },
  depositBalanceValue: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "900",
    marginBottom: 18,
    marginTop: 2
  },
  depositInputRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 7,
    paddingHorizontal: 12
  },
  depositCurrencyPrefix: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "900",
    marginRight: 8
  },
  depositInput: {
    color: colors.text,
    flex: 1,
    fontSize: 24,
    fontWeight: "900",
    minHeight: 54
  },
  openFundSecondLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 15
  },
  openFundNotice: {
    borderLeftColor: colors.warning,
    borderLeftWidth: 3,
    marginTop: 16,
    paddingLeft: 11,
    paddingVertical: 2
  },
  openFundNoticeText: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17
  },
  depositPresetRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 10
  },
  depositPresetButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    flexGrow: 1,
    minHeight: 36,
    minWidth: 76,
    justifyContent: "center",
    paddingHorizontal: 8
  },
  depositPresetButtonActive: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary
  },
  depositPresetText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  depositPresetTextActive: {
    color: colors.primary
  },
  depositDialogActions: {
    flexDirection: "row",
    gap: 9,
    marginTop: 18
  },
  depositCancelButton: {
    alignItems: "center",
    borderColor: colors.borderStrong,
    borderRadius: 6,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 12
  },
  depositCancelText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900"
  },
  depositConfirmButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 6,
    flex: 1.6,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 12
  },
  depositConfirmText: {
    color: colors.onPrimary,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center"
  },
  emptyState: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 16,
    padding: 18
  },
  emptyTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900"
  },
  emptyBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 6
  },
  portfolioItemBlock: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 12,
    padding: 14
  },
  portfolioItemHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  portfolioName: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900"
  },
  portfolioMeta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 4
  },
  portfolioNumbers: {
    alignItems: "flex-end",
    marginLeft: 12
  },
  portfolioAmount: {
    color: colors.primary,
    fontSize: 16,
    fontWeight: "900"
  },
  portfolioShare: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 4
  },
  stepRail: {
    flexDirection: "row",
    gap: 6,
    marginTop: 14
  },
  stepMarker: {
    backgroundColor: colors.border,
    borderRadius: 999,
    flex: 1,
    height: 8
  },
  stepMarkerActive: {
    backgroundColor: colors.primary
  },
  investmentContent: {
    paddingTop: 70
  },
  investmentPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    padding: 16
  },
  investmentCloseButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40
  }
} as const;
