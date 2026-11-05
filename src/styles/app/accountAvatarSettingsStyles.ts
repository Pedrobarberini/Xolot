import { StyleSheet } from "react-native";
import { colors } from "../../theme";

export const accountAvatarSettingsStyles = {
  accountSetupRoot: {
    backgroundColor: colors.surface,
    flex: 1
  },
  accountSetupModalBrand: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 36
  },
  accountSetupModalRoot: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 16
  },
  accountSetupModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(12, 13, 20, 0.58)"
  },
  accountSetupModalDialog: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 18,
    height: "90%",
    maxHeight: 760,
    maxWidth: 520,
    overflow: "hidden",
    shadowColor: "#000000",
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 18,
    width: "100%"
  },
  accountSetupHeader: {
    backgroundColor: colors.surface,
    paddingHorizontal: 16,
    paddingTop: 16
  },
  accountSetupStepViewport: {
    flex: 1,
    minHeight: 0,
    overflow: "hidden"
  },
  accountSetupStepContent: {
    flexGrow: 1,
    paddingBottom: 18,
    paddingHorizontal: 16
  },
  accountSetupFooter: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    paddingBottom: 12,
    paddingHorizontal: 16,
    paddingTop: 12
  },
  accountSetupIntro: {
    marginBottom: 18,
    minHeight: 92,
    paddingHorizontal: 2
  },
  accountSetupEyebrow: {
    color: colors.primaryText,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  accountSetupTitle: {
    color: colors.text,
    fontSize: 25,
    fontWeight: "900",
    marginTop: 6
  },
  accountSetupSubtitle: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 7,
    maxWidth: 420
  },
  accountSetupProgress: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 18
  },
  accountSetupProgressItem: {
    flex: 1,
    gap: 6
  },
  accountSetupProgressBar: {
    backgroundColor: colors.border,
    borderRadius: 999,
    height: 4
  },
  accountSetupProgressBarActive: {
    backgroundColor: colors.primary
  },
  accountSetupProgressLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "800",
    textAlign: "center"
  },
  accountSetupProgressLabelActive: {
    color: colors.primaryText
  },
  accountSetupAvatarRow: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 14,
    marginBottom: 4,
    paddingBottom: 14
  },
  accountSetupAvatarPreview: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderRadius: 999,
    borderWidth: 2,
    height: 78,
    justifyContent: "center",
    overflow: "hidden",
    position: "relative",
    width: 78
  },
  accountSetupAvatarCopy: {
    flex: 1,
    gap: 4,
    minWidth: 0
  },
  accountSetupAvatarButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    flexDirection: "row",
    gap: 6,
    minHeight: 34,
    paddingVertical: 6
  },
  accountSetupAvatarButtonText: {
    color: colors.primaryText,
    fontSize: 11,
    fontWeight: "900"
  },
  accountSetupInterestSectionCompact: {
    paddingVertical: 2
  },
  accountSetupActions: {
    flexDirection: "row"
  },
  accountSetupActionSlot: {
    flexBasis: 0,
    minWidth: 0
  },
  accountSetupBackButtonSlot: {
    overflow: "hidden"
  },
  accountSetupSecondaryButton: {
    alignItems: "center",
    borderColor: colors.borderStrong,
    borderRadius: 6,
    borderWidth: 1,
    flex: 1,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    minHeight: 48,
    paddingHorizontal: 14
  },
  accountSetupSecondaryButtonText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900"
  },
  accountSetupContinueButton: {
    flex: 1,
    marginTop: 0,
    minHeight: 48
  },
  accountSetupSection: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    padding: 15
  },
  accountSetupSectionInitial: {
    borderWidth: 0,
    padding: 0
  },
  accountSetupFieldRow: {
    flexDirection: "row",
    gap: 10
  },
  accountSetupFieldRowNarrow: {
    flexDirection: "column",
    gap: 0
  },
  accountSetupAgeField: {
    flex: 0.7,
    minWidth: 0
  },
  accountSetupPositionField: {
    flex: 1.3,
    minWidth: 0
  },
  accountSetupBioMeta: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6
  },
  accountSetupInterestTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900"
  },
  accountSetupSuggestionBlock: {
    gap: 6,
    marginBottom: 4,
    marginTop: 8
  },
  accountSetupSuggestionLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  accountSetupSuggestionList: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  accountSetupSuggestionChip: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    minHeight: 32,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  accountSetupSuggestionChipSelected: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary
  },
  accountSetupSuggestionChipText: {
    color: colors.text,
    fontSize: 10,
    fontWeight: "800"
  },
  accountSetupSuggestionChipTextSelected: {
    color: colors.primaryText
  },
  accountSetupHint: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "700"
  },
  accountSetupUsernameError: {
    color: colors.danger,
    fontSize: 10,
    fontWeight: "800",
    lineHeight: 15,
    marginTop: 6
  },
  accountSetupCounter: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "900"
  },
  accountSetupSignOutButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 44,
    marginTop: 8
  },
  accountSetupSignOutText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  settingsSection: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 14
  },
  settingsSectionTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 4
  },
  settingsDangerSection: {
    borderColor: colors.danger
  },
  settingsDangerDescription: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5
  },
  settingsDeleteAccountButton: {
    alignItems: "center",
    alignSelf: "flex-start",
    borderColor: colors.danger,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    marginTop: 14,
    minHeight: 42,
    paddingHorizontal: 14
  },
  settingsDeleteAccountButtonText: {
    color: colors.danger,
    fontSize: 12,
    fontWeight: "900"
  },
  settingsAvatarRow: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 12,
    marginTop: 8,
    paddingTop: 12
  },
  settingsAvatarPreview: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderRadius: 999,
    borderWidth: 2,
    height: 62,
    justifyContent: "center",
    overflow: "hidden",
    width: 62
  },
  settingsAvatarInitials: {
    color: colors.primaryText,
    fontSize: 17,
    fontWeight: "900"
  },
  settingsAvatarBody: {
    flex: 1,
    minWidth: 0
  },
  settingsAvatarActions: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 14
  },
  settingsAvatarButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 6,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 13
  },
  settingsAvatarButtonText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: "900"
  },
  avatarPositionModalRoot: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 20
  },
  avatarPositionBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(12, 13, 20, 0.56)"
  },
  avatarPositionDialog: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 20,
    maxWidth: 360,
    padding: 18,
    shadowColor: "#000000",
    shadowOffset: { height: 8, width: 0 },
    shadowOpacity: 0.22,
    shadowRadius: 18,
    width: "100%"
  },
  avatarPositionDialogCompact: {
    padding: 14
  },
  avatarPositionHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  avatarPositionHeaderText: {
    flex: 1,
    paddingRight: 8
  },
  avatarPositionTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900"
  },
  avatarPositionSubtitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700",
    marginTop: 3
  },
  avatarPositionCloseButton: {
    alignItems: "center",
    height: 36,
    justifyContent: "center",
    width: 36
  },
  avatarPositionPreview: {
    alignSelf: "center",
    backgroundColor: "#0C0D14",
    borderColor: colors.borderStrong,
    borderRadius: 8,
    borderWidth: 1,
    height: 280,
    marginTop: 20,
    overflow: "hidden",
    position: "relative",
    touchAction: "none",
    width: "100%"
  },
  avatarPositionFullImage: {
    ...StyleSheet.absoluteFillObject,
    height: "100%",
    width: "100%"
  },
  avatarPositionCropOverlay: {
    ...StyleSheet.absoluteFillObject
  },
  avatarCropSizeSection: {
    marginTop: 16
  },
  avatarCropSizeHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  avatarCropSizeLabel: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900"
  },
  avatarCropSizeValue: {
    color: colors.primaryText,
    fontSize: 14,
    fontWeight: "900"
  },
  avatarCropSizeControl: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 8
  },
  avatarCropSizeButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  avatarCropSizeTrack: {
    flex: 1,
    height: 32,
    position: "relative"
  },
  avatarCropSizeRail: {
    backgroundColor: colors.borderStrong,
    borderRadius: 999,
    height: 4,
    left: 0,
    position: "absolute",
    right: 0,
    top: 14
  },
  avatarCropSizeFill: {
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 4,
    left: 0,
    position: "absolute",
    top: 14
  },
  avatarCropSizeThumb: {
    backgroundColor: colors.surface,
    borderColor: colors.primary,
    borderRadius: 999,
    borderWidth: 3,
    height: 20,
    position: "absolute",
    shadowColor: "#000000",
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
    top: 6,
    width: 20
  },
  avatarCropSizeRange: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginHorizontal: 46,
    marginTop: 1
  },
  avatarCropSizeRangeText: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800"
  },
  avatarPositionActions: {
    flexDirection: "row",
    gap: 9,
    marginTop: 20
  },
  avatarPositionCancelButton: {
    alignItems: "center",
    borderColor: colors.borderStrong,
    borderRadius: 6,
    borderWidth: 1,
    flex: 1,
    justifyContent: "center",
    minHeight: 46
  },
  avatarPositionCancelText: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900"
  },
  avatarPositionSaveButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 6,
    flex: 1,
    justifyContent: "center",
    minHeight: 46
  },
  avatarPositionSaveText: {
    color: colors.onPrimary,
    fontSize: 13,
    fontWeight: "900"
  },
  settingsRow: {
    alignItems: "center",
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 68,
    paddingVertical: 10
  },
  settingsRowIcon: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: 6,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  settingsRowBody: {
    flex: 1,
    minWidth: 0
  },
  settingsRowTitle: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  settingsRowDescription: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 16,
    marginTop: 2
  },
} as const;
