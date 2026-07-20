import { StyleSheet } from "react-native";
import {
  DETAIL_CONTENT_PADDING,
  TAB_BAR_CONTENT_PADDING,
  TAB_BAR_SAFE_PADDING,
  USE_CENTERED_WEB_LAYOUT
} from "../../constants/layout";
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
  accountSetupModalBrandLogo: {
    height: 190,
    opacity: 0.18,
    width: "86%"
  },
  accountSetupModalRoot: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 16
  },
  accountSetupModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 18, 12, 0.58)"
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
  accountSetupContent: {
    flexGrow: 1,
    paddingBottom: 34,
    paddingHorizontal: 16,
    paddingTop: 16
  },
  accountSetupIntro: {
    marginBottom: 18,
    paddingHorizontal: 2
  },
  accountSetupEyebrow: {
    color: colors.primary,
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
  accountSetupSectionHeader: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 2,
    paddingBottom: 10
  },
  accountSetupRequired: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "900",
    textTransform: "uppercase"
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
  accountSetupSaveButton: {
    marginTop: 14
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
    color: colors.primary,
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
    backgroundColor: "rgba(5, 18, 12, 0.56)"
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
    backgroundColor: "#07110D",
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
    color: colors.primary,
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
  settingsFundComplete: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    marginBottom: 12,
    marginTop: 8,
    padding: 12
  },
  settingsFundCompleteTitle: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900"
  },
  settingsFundCompleteBody: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3
  }
} as const;
