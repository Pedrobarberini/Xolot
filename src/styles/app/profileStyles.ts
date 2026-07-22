import { StyleSheet } from "react-native";
import {
  DETAIL_CONTENT_PADDING,
  TAB_BAR_CONTENT_PADDING,
  TAB_BAR_SAFE_PADDING,
  USE_CENTERED_WEB_LAYOUT
} from "../../constants/layout";
import { colors } from "../../theme";

export const profileStyles = {
  profileVideoCard: {
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    overflow: "hidden",
    paddingBottom: 10,
    width: 138
  },
  profileVideoCardSelected: {
    borderColor: colors.primary,
    borderWidth: 2
  },
  profileVideoThumbnail: {
    aspectRatio: 9 / 13,
    backgroundColor: colors.media,
    overflow: "hidden",
    position: "relative",
    width: "100%"
  },
  profileVideoThumbnailMedia: {
    ...StyleSheet.absoluteFillObject,
    height: "100%",
    width: "100%"
  },
  profileVideoPlayIcon: {
    alignItems: "center",
    backgroundColor: "rgba(5, 18, 12, 0.72)",
    borderRadius: 999,
    height: 36,
    justifyContent: "center",
    left: "50%",
    marginLeft: -18,
    marginTop: -18,
    position: "absolute",
    top: "50%",
    width: 36
  },
  profileVideoTitle: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900",
    lineHeight: 17,
    marginTop: 9,
    paddingHorizontal: 9
  },
  profileVideoDuration: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    marginTop: 3,
    paddingHorizontal: 9
  },
  profileHero: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 14,
    padding: 18
  },
  profileFundAlert: {
    backgroundColor: colors.primary,
    borderRadius: 6,
    marginBottom: 12,
    paddingHorizontal: 16,
    paddingVertical: 13
  },
  profileFundAlertTitle: {
    color: colors.onPrimary,
    fontSize: 16,
    fontWeight: "900"
  },
  profileFundAlertBody: {
    color: "rgba(255, 255, 255, 0.86)",
    fontSize: 13,
    lineHeight: 18,
    marginTop: 3
  },
  profileHeroTopRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12
  },
  profileAvatar: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
    borderRadius: 999,
    borderWidth: 2,
    height: 50,
    justifyContent: "center",
    overflow: "hidden",
    width: 50
  },
  profileAvatarText: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "900"
  },
  profileTitleBlock: {
    flex: 1,
    minWidth: 0
  },
  profileStatusPill: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 8
  },
  profileStatusText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  profileName: {
    color: colors.text,
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 0
  },
  profileUsername: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2
  },
  profilePrimaryUsername: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0
  },
  profileSecondaryName: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 2
  },
  profileMeta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 5
  },
  profileBio: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "600",
    lineHeight: 19,
    marginTop: 14
  },
  profileClub: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
    marginTop: 6,
    textTransform: "uppercase"
  },
  profileQuickStats: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 16,
    padding: 10
  },
  profileQuickItem: {
    flex: 1,
    minWidth: 0
  },
  profileQuickValue: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900"
  },
  profileQuickLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "900",
    marginTop: 3,
    textTransform: "uppercase"
  },
  profileDesktopGrid: {
    flexDirection: "row",
    gap: 14
  },
  profilePanelGridItem: {
    flex: 1,
    minWidth: 0
  },
  profilePanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    padding: 16
  },
  profileRow: {
    alignItems: "center",
    borderColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 11
  },
  profileRowNoBorder: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 11
  },
  profileLabel: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800"
  },
  profileValue: {
    color: colors.text,
    flexShrink: 1,
    fontSize: 13,
    fontWeight: "900",
    marginLeft: 12,
    textAlign: "right"
  },
  profileGallerySection: {
    marginBottom: 12
  },
  profileGalleryHeader: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
    paddingBottom: 10
  },
  profileGalleryTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900"
  },
  profileGalleryCount: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900"
  },
  profileGalleryEmpty: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderStyle: "dashed",
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 220,
    paddingHorizontal: 24,
    paddingVertical: 30
  },
  profileGalleryEmptyTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900",
    marginTop: 12,
    textAlign: "center"
  },
  profileGalleryEmptyBody: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
    maxWidth: 320,
    textAlign: "center"
  },
  profileGalleryGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6
  },
  profileGalleryCard: {
    aspectRatio: 0.78,
    backgroundColor: colors.media,
    borderRadius: 6,
    overflow: "hidden",
    position: "relative",
    width: "31.9%"
  },
  profileGalleryOpenButton: {
    flex: 1
  },
  profileGalleryMedia: {
    height: "100%",
    width: "100%"
  },
  profileGalleryCardShade: {
    backgroundColor: "rgba(0, 0, 0, 0.44)",
    bottom: 0,
    height: "44%",
    left: 0,
    position: "absolute",
    right: 0
  },
  profileGalleryPlayBadge: {
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.52)",
    borderRadius: 999,
    height: 30,
    justifyContent: "center",
    position: "absolute",
    right: 8,
    top: 8,
    width: 30
  },
  profileGalleryPlayBadgeWithMenu: {
    right: 44
  },
  profileGalleryMenuButton: {
    alignItems: "center",
    backgroundColor: "rgba(5, 10, 7, 0.68)",
    borderColor: "rgba(255, 255, 255, 0.44)",
    borderRadius: 999,
    borderWidth: 1,
    height: 30,
    justifyContent: "center",
    position: "absolute",
    right: 8,
    top: 8,
    width: 30
  },
  profileGalleryCardTitle: {
    bottom: 8,
    color: colors.onPrimary,
    fontSize: 11,
    fontWeight: "900",
    left: 8,
    lineHeight: 14,
    position: "absolute",
    right: 48
  },
  profileGalleryViewCount: {
    alignItems: "center",
    bottom: 8,
    flexDirection: "row",
    gap: 3,
    position: "absolute",
    right: 8
  },
  profileGalleryViewCountText: {
    color: colors.onPrimary,
    fontSize: 10,
    fontWeight: "900",
    textShadowColor: "rgba(0, 0, 0, 0.82)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 2
  },
  videoActionsRoot: {
    flex: 1,
    justifyContent: "flex-end"
  },
  videoActionsBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 18, 12, 0.54)"
  },
  videoActionsSheet: {
    alignSelf: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    maxWidth: 520,
    paddingBottom: 18,
    paddingHorizontal: 16,
    width: "100%"
  },
  sharePostSheet: {
    alignSelf: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderTopLeftRadius: 8,
    borderTopRightRadius: 8,
    borderWidth: 1,
    maxHeight: "78%",
    maxWidth: 520,
    paddingBottom: 18,
    paddingHorizontal: 16,
    width: "100%"
  },
  videoActionsHeader: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 66
  },
  videoActionsHeaderIcon: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    height: 38,
    justifyContent: "center",
    width: 38
  },
  videoActionsTitleBlock: {
    flex: 1,
    minWidth: 0
  },
  videoActionsTitle: {
    color: colors.text,
    fontSize: 17,
    fontWeight: "900"
  },
  videoActionsSubtitle: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2
  },
  videoActionsClose: {
    alignItems: "center",
    height: 38,
    justifyContent: "center",
    width: 38
  },
  videoActionRow: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 12,
    minHeight: 54,
    paddingHorizontal: 4
  },
  videoActionText: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "800"
  },
  videoActionDanger: {
    borderBottomWidth: 0
  },
  videoActionDangerText: {
    color: colors.danger,
    fontSize: 14,
    fontWeight: "900"
  },
  sharePostContactScroll: {
    maxHeight: 360
  },
  sharePostContactList: {
    paddingVertical: 4
  },
  sharePostContactRow: {
    alignItems: "center",
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    gap: 10,
    minHeight: 62,
    paddingVertical: 8
  },
  sharePostAvatar: {
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
  sharePostAvatarText: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900"
  },
  sharePostContactIdentity: {
    flex: 1,
    minWidth: 0
  },
  sharePostContactName: {
    color: colors.text,
    fontSize: 13,
    fontWeight: "900"
  },
  sharePostContactMeta: {
    color: colors.muted,
    fontSize: 11,
    marginTop: 2
  },
  sharePostSendButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 999,
    height: 36,
    justifyContent: "center",
    width: 36
  },
  sharePostSendButtonDone: {
    backgroundColor: colors.primarySoft
  },
  sharePostEmpty: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 180,
    paddingHorizontal: 24
  },
  sharePostEmptyTitle: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 10
  },
  sharePostEmptyBody: {
    color: colors.muted,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 4,
    textAlign: "center"
  },
  sharePostDoneButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 6,
    justifyContent: "center",
    marginTop: 14,
    minHeight: 44
  },
  sharePostDoneButtonText: {
    color: colors.onPrimary,
    fontSize: 13,
    fontWeight: "900"
  },
  deleteVideoDialog: {
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
  deleteVideoTitleRow: {
    alignItems: "center",
    flex: 1,
    flexDirection: "row",
    gap: 11,
    minWidth: 0
  },
  deleteVideoIcon: {
    alignItems: "center",
    backgroundColor: colors.dangerSoft,
    borderRadius: 999,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  deleteVideoTitle: {
    color: colors.text,
    fontSize: 19,
    fontWeight: "900"
  },
  deleteVideoBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 18
  },
  deleteVideoConfirmButton: {
    alignItems: "center",
    backgroundColor: colors.danger,
    borderRadius: 6,
    flex: 1.6,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 46,
    paddingHorizontal: 12
  },
  deleteVideoConfirmText: {
    color: colors.onPrimary,
    fontSize: 13,
    fontWeight: "900",
    textAlign: "center"
  },
  profileVideoModalRoot: {
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    padding: 16
  },
  profileVideoModalBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(5, 18, 12, 0.72)"
  },
  profileVideoDialog: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: 430,
    padding: 14,
    width: "100%"
  },
  profileVideoDialogHeader: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  profileVideoDialogTitle: {
    color: colors.text,
    flex: 1,
    fontSize: 16,
    fontWeight: "900",
    minWidth: 0
  },
  profileMenuButton: {
    alignItems: "center",
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40
  },
  profileActionButtonDisabled: {
    opacity: 0.5
  },
  profileMenuModalRoot: {
    alignItems: "center",
    flex: 1
  },
  profileMenuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(20, 33, 24, 0.14)"
  },
  profileMenuLayer: {
    alignItems: "flex-end",
    maxWidth: 480,
    paddingHorizontal: 16,
    paddingTop: 88,
    width: "100%"
  },
  profileMenuPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 12,
    padding: 8,
    shadowColor: "#10261A",
    shadowOffset: { height: 6, width: 0 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    width: 238
  },
  profileMenuTitle: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "900",
    paddingHorizontal: 10,
    paddingVertical: 8,
    textTransform: "uppercase"
  },
  profileSocialMetrics: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    marginTop: 13
  },
  profileSocialMetricText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "700"
  },
  profileSocialMetricValue: {
    color: colors.text,
    fontWeight: "900"
  },
  profileSocialMetricDivider: {
    color: colors.border,
    fontSize: 12,
    fontWeight: "800"
  },
  profileMenuItem: {
    alignItems: "center",
    borderRadius: 6,
    flexDirection: "row",
    gap: 12,
    minHeight: 48,
    paddingHorizontal: 10
  },
  profileMenuItemText: {
    color: colors.text,
    flex: 1,
    fontSize: 14,
    fontWeight: "800"
  },
  profileMenuSignOut: {
    borderTopColor: colors.border,
    borderTopWidth: 1,
    marginTop: 4
  },
  profileMenuSignOutText: {
    color: colors.danger,
    flex: 1,
    fontSize: 14,
    fontWeight: "800"
  },
  profileSubviewHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 14,
    minHeight: 42
  },
  profileViewScene: {
    flex: 1
  },
  profileSubviewTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    textAlign: "center"
  },
  profileSubviewSpacer: {
    height: 40,
    width: 40
  },
  publicProfileShell: {
    flex: 1,
    position: "relative"
  },
  publicProfileContent: {
    paddingTop: 70
  },
  publicProfileSocialRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14
  },
  publicProfileFollowerCount: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "800"
  },
  publicProfileFollowButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 38,
    minWidth: 112,
    paddingHorizontal: 13
  },
  publicProfileFollowButtonActive: {
    backgroundColor: colors.surface,
    borderColor: colors.primary
  },
  publicProfileFollowButtonText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: "900"
  },
  publicProfileFollowButtonTextActive: {
    color: colors.primary
  },
  publicProfileName: {
    fontSize: 20,
    lineHeight: 23
  },
  publicProfileMeta: {
    lineHeight: 16
  },
  publicProfileInvestButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 6,
    flexDirection: "row",
    gap: 8,
    justifyContent: "center",
    marginTop: 12,
    minHeight: 44,
    paddingHorizontal: 14
  },
  publicProfileInvestButtonDisabled: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderWidth: 1
  },
  publicProfileInvestButtonText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: "900"
  },
  publicProfileInvestButtonTextDisabled: {
    color: colors.muted
  },
  publicProfileInvestmentHint: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "700",
    lineHeight: 16,
    marginTop: 7,
    textAlign: "center"
  }
} as const;
