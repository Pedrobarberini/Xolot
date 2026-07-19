import { StyleSheet } from "react-native";
import {
  DETAIL_CONTENT_PADDING,
  TAB_BAR_CONTENT_PADDING,
  TAB_BAR_SAFE_PADDING,
  USE_CENTERED_WEB_LAYOUT
} from "../../constants/layout";
import { colors } from "../../theme";

export const submissionAdminStyles = {
  submitScreen: {
    flex: 1
  },
  submitHero: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    padding: 18
  },
  adminHero: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    padding: 18
  },
  submitInfoPanelCompact: {
    paddingHorizontal: 12
  },
  videoPickerButton: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 9,
    justifyContent: "center",
    marginTop: 12,
    minHeight: 48,
    paddingHorizontal: 14
  },
  videoPickerIcon: {
    color: colors.primary,
    fontSize: 22,
    fontWeight: "700"
  },
  videoPickerButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900"
  },
  videoPickerHint: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: 7
  },
  selectedVideoPanel: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginTop: 12,
    padding: 10
  },
  selectedVideoTextBlock: {
    flex: 1,
    minWidth: 0
  },
  selectedVideoName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900"
  },
  selectedVideoMeta: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3
  },
  videoSourceDivider: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    marginTop: 12
  },
  videoSourceDividerLine: {
    backgroundColor: colors.border,
    flex: 1,
    height: 1
  },
  videoSourceDividerText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  submissionVideoPreview: {
    alignSelf: "center",
    aspectRatio: 9 / 16,
    backgroundColor: "#000000",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    maxHeight: 640,
    maxWidth: 360,
    overflow: "hidden",
    width: "100%"
  },
  submissionVideoPreviewCompact: {
    maxHeight: 360,
    maxWidth: 210,
    width: "62%"
  },
  submissionVideoPreviewMedia: {
    height: "100%",
    width: "100%"
  },
  inputRow: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    marginTop: 14,
    paddingHorizontal: 12
  },
  currencyPrefix: {
    color: colors.primary,
    fontSize: 17,
    fontWeight: "900",
    marginRight: 8
  },
  amountInput: {
    color: colors.text,
    flex: 1,
    fontSize: 22,
    fontWeight: "900",
    minHeight: 54
  },
  availableBalanceText: {
    color: colors.primary,
    fontSize: 13,
    fontWeight: "900",
    marginTop: 10
  },
  twoColumnRow: {
    flexDirection: "row",
    gap: 10
  },
  columnField: {
    flex: 1
  },
  validationText: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "800",
    marginTop: 10
  },
  submissionValidationPanel: {
    backgroundColor: colors.dangerSoft,
    borderColor: "#E9A8B0",
    borderRadius: 8,
    borderWidth: 1,
    gap: 5,
    marginTop: 14,
    padding: 11
  },
  submissionValidationTitle: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "900",
    marginBottom: 2
  },
  submissionValidationRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 7
  },
  submissionValidationMarker: {
    color: colors.danger,
    fontSize: 13,
    fontWeight: "900"
  },
  submissionValidationText: {
    color: colors.text,
    flex: 1,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17
  },
  primaryButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    minHeight: 48,
    justifyContent: "center",
    paddingVertical: 13
  },
  primaryButtonDisabled: {
    backgroundColor: colors.borderStrong
  },
  primaryButtonText: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: "900"
  },
  secondaryButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 12,
    paddingVertical: 13
  },
  secondaryButtonDisabled: {
    backgroundColor: colors.surfaceMuted
  },
  secondaryButtonText: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900"
  },
  submissionToastLayer: {
    alignItems: "center",
    bottom: TAB_BAR_CONTENT_PADDING + 8,
    left: 0,
    position: "absolute",
    right: 0,
    zIndex: 20
  },
  submissionToast: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 16,
    flexDirection: "row",
    gap: 10,
    minHeight: 64,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: "#000000",
    shadowOffset: { height: 5, width: 0 },
    shadowOpacity: 0.38,
    shadowRadius: 10
  },
  submissionToastIcon: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderRadius: 999,
    height: 32,
    justifyContent: "center",
    width: 32
  },
  submissionToastIconText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "900"
  },
  submissionToastTextBlock: {
    flex: 1,
    minWidth: 0
  },
  submissionToastTitle: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: "900"
  },
  submissionToastBody: {
    color: "#DCEFE4",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    marginTop: 2
  },
  submissionItem: {
    borderColor: colors.border,
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 12
  },
  adminItem: {
    borderColor: colors.border,
    borderTopWidth: 1,
    marginTop: 12,
    paddingTop: 12
  },
  submissionTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between"
  },
  submissionTextBlock: {
    flex: 1
  },
  submissionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900"
  },
  submissionMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3
  },
  submissionBody: {
    color: colors.text,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 8
  },
  adminFinePrint: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 8
  },
  statusPill: {
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6
  },
  statusReview: {
    backgroundColor: colors.warningSoft
  },
  statusApproved: {
    backgroundColor: colors.primarySoft
  },
  statusAdjust: {
    backgroundColor: colors.infoSoft
  },
  statusRejected: {
    backgroundColor: colors.dangerSoft
  },
  statusPillText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "900"
  },
  actionRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12
  },
  smallButton: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    flexDirection: "row",
    gap: 5,
    minHeight: 40,
    justifyContent: "center",
    paddingHorizontal: 8
  },
  approveButton: {
    backgroundColor: colors.primary
  },
  adjustButton: {
    backgroundColor: colors.warning
  },
  rejectButton: {
    backgroundColor: colors.danger
  },
  smallButtonText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "900"
  },
  smallButtonTextDark: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: "900"
  },
  buttonPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }]
  }
} as const;
