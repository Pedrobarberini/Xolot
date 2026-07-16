import { StyleSheet } from "react-native";
import {
  DETAIL_CONTENT_PADDING,
  TAB_BAR_CONTENT_PADDING,
  TAB_BAR_SAFE_PADDING,
  USE_CENTERED_WEB_LAYOUT
} from "../constants/layout";
import { colors } from "../theme";

export const styles = StyleSheet.create({
  appRoot: {
    alignItems: "center",
    backgroundColor: USE_CENTERED_WEB_LAYOUT
      ? colors.surfaceMuted
      : colors.background,
    flex: 1
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
    width: "100%",
    ...(USE_CENTERED_WEB_LAYOUT
      ? {
          borderLeftColor: colors.border,
          borderLeftWidth: 1,
          borderRightColor: colors.border,
          borderRightWidth: 1,
          maxWidth: 480,
          shadowColor: "#10261A",
          shadowOffset: { height: 0, width: 0 },
          shadowOpacity: 0.12,
          shadowRadius: 22
        }
      : {})
  },
  brandLaunch: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: "#F7FAF7",
    justifyContent: "center",
    paddingHorizontal: 36,
    zIndex: 100
  },
  brandLaunchLogo: {
    height: 230,
    maxWidth: 420,
    width: "86%"
  },
  keyboardView: {
    flex: 1
  },
  tabScene: {
    backgroundColor: colors.background,
    flex: 1,
    overflow: "hidden"
  },
  submitScreen: {
    flex: 1
  },
  screenBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    overflow: "hidden"
  },
  screenBackdropAccent: {
    backgroundColor: "rgba(247, 200, 75, 0.1)",
    borderColor: "rgba(247, 200, 75, 0.16)",
    borderRadius: 8,
    borderWidth: 1,
    height: "46%",
    position: "absolute",
    right: "-18%",
    top: "7%",
    transform: [{ rotate: "-7deg" }],
    width: "68%"
  },
  screenBackdropFrame: {
    borderColor: "rgba(255, 255, 255, 0.07)",
    borderRadius: 8,
    borderWidth: 1,
    bottom: "18%",
    left: "8%",
    position: "absolute",
    right: "8%",
    top: "12%"
  },
  screenBackdropLaneLeft: {
    borderColor: "rgba(247, 200, 75, 0.08)",
    borderRadius: 8,
    borderWidth: 1,
    height: "44%",
    left: "-14%",
    position: "absolute",
    top: "22%",
    width: "32%"
  },
  screenBackdropLaneRight: {
    borderColor: "rgba(247, 200, 75, 0.08)",
    borderRadius: 8,
    borderWidth: 1,
    height: "44%",
    position: "absolute",
    right: "-14%",
    top: "22%",
    width: "32%"
  },
  screenBackdropShade: {
    backgroundColor: "rgba(5, 5, 3, 0.78)",
    bottom: 0,
    height: "62%",
    left: 0,
    position: "absolute",
    right: 0
  },
  authShell: {
    backgroundColor: colors.background,
    flex: 1,
    overflow: "hidden"
  },
  authContent: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 16,
    maxWidth: 520,
    alignSelf: "center",
    width: "100%"
  },
  authCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    elevation: 2,
    padding: 16,
    shadowColor: "#10261A",
    shadowOffset: { height: 4, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    width: "100%"
  },
  authTopRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8
  },
  authPanelKicker: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  authModePill: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
    borderRadius: 999,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5
  },
  authModeText: {
    color: colors.primary,
    fontSize: 10,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  authLogo: {
    alignSelf: "center",
    height: 138,
    marginBottom: 2,
    width: "100%"
  },
  authLogoCompact: {
    height: 122
  },
  authBrand: {
    color: colors.primary,
    fontSize: 28,
    fontWeight: "900",
    letterSpacing: 0,
    textAlign: "center"
  },
  authEyebrow: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900",
    marginTop: 2,
    textAlign: "center",
    textTransform: "uppercase"
  },
  authTitle: {
    color: colors.text,
    fontSize: 22,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 10,
    marginBottom: 10
  },
  authSignalStrip: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
    padding: 8
  },
  authSignalItem: {
    flex: 1,
    minWidth: 0
  },
  authSignalValue: {
    color: colors.text,
    fontSize: 11,
    fontWeight: "900"
  },
  authSignalLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "900",
    marginTop: 3,
    textTransform: "uppercase"
  },
  segmentedControl: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: "row",
    gap: 6,
    marginBottom: 10,
    padding: 5
  },
  segmentButton: {
    alignItems: "center",
    borderRadius: 8,
    flex: 1,
    paddingVertical: 10
  },
  segmentButtonActive: {
    backgroundColor: colors.surface
  },
  segmentText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900"
  },
  segmentTextActive: {
    color: colors.primary
  },
  header: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "space-between",
    maxWidth: 1180,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 16,
    position: "relative",
    width: "100%"
  },
  headerCompact: {
    alignItems: "center",
    flexDirection: "row",
    flexWrap: "nowrap",
    gap: 0,
    paddingBottom: 10,
    paddingHorizontal: 14,
    paddingTop: 10
  },
  headerIdentity: {
    alignItems: "center",
    flexDirection: "row",
    flex: 1,
    minWidth: 168,
    paddingRight: 8
  },
  headerIdentityCompact: {
    flex: 1,
    minHeight: 48,
    minWidth: 0,
    paddingRight: 156
  },
  headerIdentityCompactSolo: {
    paddingRight: 0
  },
  headerLogo: {
    height: 42,
    marginRight: 8,
    width: 54
  },
  headerLogoCompact: {
    height: 38,
    width: 48
  },
  headerTitleBlock: {
    flex: 1
  },
  brand: {
    color: colors.primary,
    fontSize: 23,
    fontWeight: "900",
    letterSpacing: 0
  },
  headerSubtitle: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2
  },
  headerActions: {
    alignItems: "center",
    flexDirection: "row",
    gap: 8
  },
  headerActionsCompact: {
    gap: 6,
    position: "absolute",
    right: 14,
    top: 11
  },
  balanceLine: {
    alignItems: "flex-end",
    justifyContent: "center",
    minHeight: 38,
    minWidth: 86
  },
  balanceLineOverlay: {
    minHeight: 30,
    minWidth: 0,
    position: "absolute",
    right: 72,
    top: 18,
    zIndex: 6
  },
  balanceLineValue: {
    color: colors.text,
    fontSize: 14,
    fontWeight: "900"
  },
  balanceLineValueOverlay: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: "900",
    textShadowColor: "rgba(0, 0, 0, 0.82)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 3
  },
  headerReviewLine: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  signOutButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    flexDirection: "row",
    gap: 6,
    justifyContent: "center",
    minHeight: 38,
    paddingHorizontal: 10
  },
  signOutButtonCompact: {
    minHeight: 46,
    paddingHorizontal: 18
  },
  signOutText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "900"
  },
  screenContent: {
    alignSelf: "center",
    maxWidth: 1080,
    paddingHorizontal: 22,
    paddingTop: 18,
    paddingBottom: TAB_BAR_CONTENT_PADDING,
    width: "100%"
  },
  screenContentCompact: {
    paddingHorizontal: 14
  },
  feedPagerShell: {
    backgroundColor: colors.background,
    flex: 1,
    position: "relative"
  },
  feedTopNavigation: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    left: 10,
    position: "absolute",
    top: 10,
    zIndex: 7
  },
  feedProfileBackButton: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.9)",
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    shadowColor: "#10261A",
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
    width: 40
  },
  feedBrandSlot: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 48
  },
  feedPager: {
    backgroundColor: colors.background,
    flex: 1
  },
  feedReel: {
    alignSelf: "stretch",
    width: "100%"
  },
  feedReelStage: {
    backgroundColor: colors.background,
    alignItems: "stretch",
    flex: 1,
    justifyContent: "center",
    overflow: "hidden"
  },
  feedReelStageWide: {
    alignItems: "center"
  },
  feedReelCanvas: {
    alignSelf: "stretch",
    flex: 1,
    overflow: "hidden"
  },
  feedReelCanvasWide: {
    alignSelf: "center",
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1
  },
  feedVideoBackground: {
    ...StyleSheet.absoluteFillObject,
    overflow: "hidden"
  },
  feedVideoAccent: {
    borderRadius: 8,
    borderWidth: 1,
    height: "58%",
    opacity: 0.62,
    position: "absolute",
    right: -48,
    top: 42,
    transform: [{ rotate: "-8deg" }],
    width: "68%"
  },
  feedVideoFrame: {
    borderRadius: 8,
    borderWidth: 1,
    bottom: "17%",
    left: "6%",
    opacity: 0.34,
    position: "absolute",
    right: "6%",
    top: "10%"
  },
  feedVideoTexture: {
    backgroundColor: "rgba(255, 255, 255, 0.025)",
    height: "100%",
    left: "50%",
    position: "absolute",
    top: 0,
    transform: [{ rotate: "12deg" }],
    width: 1
  },
  feedVideoLane: {
    borderColor: "rgba(247, 200, 75, 0.11)",
    borderWidth: 1,
    height: "62%",
    position: "absolute",
    top: "13%",
    width: "26%"
  },
  feedVideoLaneLeft: {
    borderBottomRightRadius: 8,
    borderTopRightRadius: 8,
    left: "-8%"
  },
  feedVideoLaneRight: {
    borderBottomLeftRadius: 8,
    borderTopLeftRadius: 8,
    right: "-8%"
  },
  feedVideoFocusBox: {
    borderColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 8,
    borderWidth: 1,
    height: "18%",
    left: "24%",
    position: "absolute",
    top: "26%",
    width: "52%"
  },
  feedVideoShadeTop: {
    backgroundColor: "rgba(5, 5, 3, 0.22)",
    height: "34%",
    left: 0,
    position: "absolute",
    right: 0,
    top: 0
  },
  feedVideoShadeBottom: {
    backgroundColor: "rgba(5, 5, 3, 0.9)",
    bottom: 0,
    height: "64%",
    left: 0,
    position: "absolute",
    right: 0
  },
  feedVideoBox: {
    overflow: "hidden",
    position: "absolute",
    zIndex: 2
  },
  feedVideoBoxCompact: {
    bottom: 0,
    left: 0,
    right: 0,
    top: 0
  },
  feedVideoBoxWide: {
    alignSelf: "center",
    aspectRatio: 9 / 16,
    borderRadius: 8,
    borderWidth: 1,
    maxWidth: 292,
    top: 30,
    width: 292
  },
  feedVideoPlayback: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000"
  },
  feedVideoMedia: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
    height: "100%",
    width: "100%"
  },
  feedVideoTapTarget: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1
  },
  feedVideoPlaybackPlay: {
    position: "relative",
    top: 0
  },
  feedVideoFloatingControls: {
    alignItems: "center",
    gap: 7,
    position: "absolute",
    right: 10,
    top: 10,
    zIndex: 3
  },
  feedVideoControlButton: {
    alignItems: "center",
    backgroundColor: "rgba(5, 5, 3, 0.72)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 999,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34
  },
  feedVideoVolumeControl: {
    alignItems: "center",
    gap: 7
  },
  feedVideoVolumeSlider: {
    alignItems: "center",
    backgroundColor: "rgba(5, 5, 3, 0.72)",
    borderColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 999,
    borderWidth: 1,
    height: 76,
    justifyContent: "center",
    width: 34
  },
  feedVideoVolumePressable: {
    alignItems: "center",
    height: 58,
    justifyContent: "center",
    position: "relative",
    width: 34
  },
  feedVideoVolumeTrack: {
    backgroundColor: "rgba(255, 255, 255, 0.32)",
    borderRadius: 999,
    height: "100%",
    justifyContent: "flex-end",
    overflow: "hidden",
    width: 4
  },
  feedVideoVolumeFill: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    width: "100%"
  },
  feedVideoVolumeThumb: {
    backgroundColor: colors.onPrimary,
    borderRadius: 999,
    height: 10,
    position: "absolute",
    width: 10
  },
  feedVideoControlIcon: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: "900"
  },
  feedVideoBoxGlow: {
    borderRadius: 8,
    height: "48%",
    opacity: 0.9,
    position: "absolute",
    right: "-28%",
    top: "7%",
    transform: [{ rotate: "-18deg" }],
    width: "80%"
  },
  feedVideoPitchMarkings: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.42
  },
  feedVideoPitchCenterLine: {
    backgroundColor: "rgba(255, 244, 204, 0.22)",
    height: 1,
    left: 0,
    position: "absolute",
    right: 0,
    top: "50%"
  },
  feedVideoPitchCenterCircle: {
    alignSelf: "center",
    borderColor: "rgba(255, 244, 204, 0.16)",
    borderRadius: 999,
    borderWidth: 1,
    height: 88,
    position: "absolute",
    top: "39%",
    width: 88
  },
  feedVideoPitchBoxTop: {
    alignSelf: "center",
    borderColor: "rgba(255, 244, 204, 0.14)",
    borderTopWidth: 0,
    borderWidth: 1,
    height: 72,
    position: "absolute",
    top: 0,
    width: "58%"
  },
  feedVideoPitchBoxBottom: {
    alignSelf: "center",
    borderBottomWidth: 0,
    borderColor: "rgba(255, 244, 204, 0.14)",
    borderWidth: 1,
    bottom: 0,
    height: 72,
    position: "absolute",
    width: "58%"
  },
  feedVideoNoiseWash: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(255, 255, 255, 0.025)"
  },
  feedVideoSubject: {
    alignItems: "center",
    alignSelf: "center",
    backgroundColor: "rgba(5, 5, 3, 0.62)",
    borderRadius: 999,
    borderWidth: 2,
    height: 74,
    justifyContent: "center",
    position: "absolute",
    top: "29%",
    width: 74
  },
  feedVideoSubjectCompact: {
    top: "26%"
  },
  feedVideoSubjectText: {
    fontSize: 21,
    fontWeight: "900"
  },
  feedVideoPlayCircle: {
    alignItems: "center",
    alignSelf: "center",
    borderRadius: 999,
    height: 54,
    justifyContent: "center",
    position: "absolute",
    top: "47%",
    width: 54
  },
  feedVideoPlayCircleCompact: {
    top: "48%"
  },
  feedVideoPlayTriangle: {
    borderBottomColor: "transparent",
    borderBottomWidth: 9,
    borderLeftWidth: 14,
    borderTopColor: "transparent",
    borderTopWidth: 9,
    height: 0,
    marginLeft: 4,
    width: 0
  },
  feedVideoActionRail: {
    gap: 9,
    position: "absolute",
    right: 10,
    top: "34%"
  },
  feedVideoActionButton: {
    alignItems: "center",
    backgroundColor: "rgba(5, 5, 3, 0.58)",
    borderRadius: 8,
    borderWidth: 1,
    height: 46,
    justifyContent: "center",
    width: 46
  },
  feedVideoActionValue: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: "900"
  },
  feedVideoActionLabel: {
    color: "#DCE8E0",
    fontSize: 8,
    fontWeight: "900",
    marginTop: 1
  },
  feedVideoCaptionStrip: {
    alignItems: "flex-end",
    backgroundColor: "rgba(5, 5, 3, 0.68)",
    bottom: 18,
    flexDirection: "row",
    gap: 10,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 9,
    position: "absolute",
    right: 12,
    zIndex: 2
  },
  feedVideoCaption: {
    flex: 1,
    fontSize: 12,
    fontWeight: "900"
  },
  feedVideoDuration: {
    fontSize: 11,
    fontWeight: "900"
  },
  feedVideoSeekControl: {
    bottom: 0,
    height: 20,
    justifyContent: "center",
    left: 12,
    position: "absolute",
    right: 12,
    zIndex: 4
  },
  feedVideoSeekControlCompact: {
    bottom: 0,
    left: 0,
    right: 0
  },
  feedVideoSeekPressable: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: "center"
  },
  feedVideoScrubberTrack: {
    borderRadius: 999,
    height: 4,
    overflow: "hidden",
    width: "100%"
  },
  feedVideoScrubberFill: {
    borderRadius: 999,
    height: "100%"
  },
  feedVideoScrubberThumb: {
    backgroundColor: "#FFFFFF",
    borderColor: "rgba(5, 5, 3, 0.28)",
    borderRadius: 999,
    borderWidth: 1,
    height: 12,
    position: "absolute",
    top: 4,
    transform: [{ translateX: -6 }],
    width: 12
  },
  feedReelHeaderOverlay: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "flex-end",
    left: 18,
    position: "absolute",
    right: 18,
    top: 18,
    zIndex: 4
  },
  feedReelBrandMark: {
    height: 38,
    width: 48
  },
  feedReelCount: {
    fontSize: 12,
    fontWeight: "800",
    marginTop: 4
  },
  feedScoreBadge: {
    backgroundColor: colors.surface
  },
  feedTextOverlay: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    bottom: TAB_BAR_CONTENT_PADDING + 8,
    left: 18,
    padding: 14,
    position: "absolute",
    right: 18,
    shadowColor: "#10261A",
    shadowOffset: { height: -4, width: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    zIndex: 4
  },
  feedTextOverlayWide: {
    bottom: 18,
    left: 30,
    padding: 18,
    right: 340
  },
  feedTextOverlayCompact: {
    backgroundColor: "transparent",
    borderRadius: 0,
    borderWidth: 0,
    bottom: 20,
    left: 0,
    overflow: "hidden",
    padding: 0,
    paddingBottom: 10,
    paddingHorizontal: 18,
    paddingTop: 14,
    right: 0,
    shadowOpacity: 0
  },
  feedCompactBackdropAnimation: {
    ...StyleSheet.absoluteFillObject
  },
  feedCompactBlur: {
    ...StyleSheet.absoluteFillObject
  },
  feedCompactGradient: {
    ...StyleSheet.absoluteFillObject
  },
  feedOverlayEyebrow: {
    fontSize: 10,
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: 9,
    textTransform: "uppercase"
  },
  feedProfileRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 9,
    marginBottom: 10
  },
  feedProfileRowCompact: {
    alignItems: "flex-start",
    marginBottom: 7,
    zIndex: 2
  },
  feedProfileButton: {
    alignItems: "center",
    justifyContent: "center"
  },
  feedProfileButtonCompact: {
    backgroundColor: "rgba(5, 18, 12, 0.62)",
    borderColor: "rgba(255, 255, 255, 0.72)",
    borderRadius: 999,
    borderWidth: 1,
    height: 40,
    marginTop: 1,
    overflow: "hidden",
    width: 40
  },
  feedAvatar: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    borderWidth: 2,
    height: 42,
    justifyContent: "center",
    overflow: "hidden",
    width: 42
  },
  feedAvatarText: {
    fontSize: 14,
    fontWeight: "900"
  },
  feedProfileTextBlock: {
    flex: 1,
    minWidth: 0
  },
  feedFollowButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderColor: colors.primary,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: "row",
    gap: 5,
    justifyContent: "center",
    minHeight: 32,
    paddingHorizontal: 10
  },
  feedFollowButtonCompact: {
    backgroundColor: "rgba(5, 122, 75, 0.92)",
    borderColor: "rgba(255, 255, 255, 0.78)",
    minHeight: 31,
    paddingHorizontal: 9
  },
  feedFollowButtonActive: {
    backgroundColor: colors.surface,
    borderColor: colors.primary
  },
  feedFollowButtonActiveCompact: {
    backgroundColor: "rgba(5, 18, 12, 0.58)",
    borderColor: "rgba(255, 255, 255, 0.68)"
  },
  feedFollowButtonText: {
    color: colors.onPrimary,
    fontSize: 11,
    fontWeight: "900"
  },
  feedFollowButtonTextActiveWide: {
    color: colors.primary
  },
  feedProfileName: {
    flexShrink: 1,
    fontSize: 15,
    fontWeight: "900"
  },
  feedProfileNameCompact: {
    fontSize: 16,
    lineHeight: 20,
    textShadowColor: "rgba(0, 0, 0, 0.78)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 3
  },
  feedSponsorLabel: {
    fontSize: 11,
    fontWeight: "800",
    marginTop: 2
  },
  feedSponsorLabelCompact: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 2,
    marginTop: 0,
    textShadowColor: "rgba(0, 0, 0, 0.78)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 3
  },
  feedStatusPill: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: 8,
    borderWidth: 1,
    justifyContent: "center",
    minHeight: 31,
    paddingHorizontal: 10
  },
  feedStatusText: {
    fontSize: 11,
    fontWeight: "900"
  },
  feedReelVideoTitle: {
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 24
  },
  feedReelVideoTitleWide: {
    fontSize: 24,
    lineHeight: 29
  },
  feedCompactDescription: {
    color: colors.onPrimary,
    fontSize: 15,
    fontWeight: "600",
    lineHeight: 20,
    textShadowColor: "rgba(0, 0, 0, 0.84)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 3,
    zIndex: 2
  },
  feedCompactDescriptionTitle: {
    fontWeight: "900"
  },
  feedCompactInlineAction: {
    color: colors.onPrimary,
    fontWeight: "900"
  },
  feedCompactExpandedContent: {
    zIndex: 2
  },
  feedCompactExpandedMeta: {
    color: "rgba(255, 255, 255, 0.82)",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    marginTop: 8,
    zIndex: 2
  },
  feedCompactHashtagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 7,
    marginTop: 13,
    zIndex: 2
  },
  feedCompactHashtag: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 19,
    textShadowColor: "rgba(0, 0, 0, 0.72)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 2
  },
  feedCompactFundSection: {
    marginTop: 15,
    zIndex: 2
  },
  feedCompactFundTitle: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: "900",
    lineHeight: 19
  },
  feedCompactFundValues: {
    alignItems: "center",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginTop: 7
  },
  feedCompactFundValue: {
    color: colors.onPrimary,
    flexShrink: 1,
    fontSize: 12,
    fontWeight: "800"
  },
  feedCompactFundGoal: {
    color: "rgba(255, 255, 255, 0.78)",
    fontSize: 11,
    fontWeight: "800",
    textAlign: "right"
  },
  feedCompactFundTrack: {
    backgroundColor: "rgba(255, 255, 255, 0.28)",
    borderRadius: 999,
    height: 6,
    marginTop: 7,
    overflow: "hidden"
  },
  feedCompactFundFill: {
    backgroundColor: colors.accent,
    borderRadius: 999,
    height: "100%"
  },
  feedCompactFundEmpty: {
    color: "rgba(255, 255, 255, 0.82)",
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 17,
    marginTop: 15,
    zIndex: 2
  },
  feedCompactExpandedActions: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    zIndex: 2
  },
  feedCompactTextButton: {
    minHeight: 34,
    justifyContent: "center",
    paddingHorizontal: 4
  },
  feedCompactTextButtonDisabled: {
    opacity: 0.52
  },
  feedCompactTextButtonLabel: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: "900",
    textShadowColor: "rgba(0, 0, 0, 0.72)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 2
  },
  feedCompactTextButtonLabelDisabled: {
    color: "rgba(255, 255, 255, 0.72)"
  },
  feedReelMeta: {
    fontSize: 13,
    fontWeight: "800",
    marginTop: 4
  },
  feedTagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
    marginTop: 9
  },
  feedTag: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 999,
    borderWidth: 1,
    fontSize: 10,
    fontWeight: "900",
    paddingHorizontal: 9,
    paddingVertical: 5,
    textTransform: "uppercase"
  },
  feedReelHighlight: {
    fontSize: 14,
    fontWeight: "700",
    lineHeight: 19,
    marginTop: 8
  },
  feedReadMoreButton: {
    alignSelf: "flex-start",
    marginTop: 6,
    paddingVertical: 4
  },
  feedReadMoreText: {
    fontSize: 13,
    fontWeight: "900"
  },
  feedInsightStrip: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 10,
    paddingHorizontal: 9,
    paddingVertical: 8
  },
  feedInsightStripCompact: {
    marginTop: 8,
    paddingVertical: 6
  },
  feedInsightItem: {
    flex: 1,
    minWidth: 0
  },
  feedInsightValue: {
    fontSize: 13,
    fontWeight: "900"
  },
  feedInsightLabel: {
    fontSize: 9,
    fontWeight: "900",
    marginTop: 2,
    textTransform: "uppercase"
  },
  feedReelMetricRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12
  },
  feedReelMetric: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 50,
    paddingHorizontal: 9,
    paddingVertical: 7
  },
  feedReelMetricValue: {
    fontSize: 14,
    fontWeight: "900"
  },
  feedReelMetricLabel: {
    fontSize: 10,
    fontWeight: "900",
    marginTop: 3,
    textTransform: "uppercase"
  },
  feedLearnMoreButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 12,
    minHeight: 48,
    paddingHorizontal: 15
  },
  feedProgressTrackCompact: {
    height: 5,
    marginTop: 10
  },
  feedProgressFillCompact: {
    height: 5
  },
  feedReelButtonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.98 }]
  },
  feedLearnMoreText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: "900"
  },
  feedDesktopPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    bottom: 18,
    padding: 16,
    position: "absolute",
    right: 30,
    width: 280,
    zIndex: 4
  },
  feedDesktopPanelTitle: {
    color: colors.text,
    fontSize: 16,
    fontWeight: "900",
    marginBottom: 12
  },
  feedDesktopPanelRow: {
    borderColor: colors.border,
    borderTopWidth: 1,
    paddingVertical: 11
  },
  feedDesktopPanelLabel: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  feedDesktopPanelValue: {
    color: colors.primary,
    fontSize: 15,
    fontWeight: "900",
    marginTop: 4
  },
  feedStatsGrid: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 14
  },
  feedStatCard: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 13
  },
  feedStatValue: {
    color: colors.primary,
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0
  },
  feedStatLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900",
    marginTop: 2,
    textTransform: "uppercase"
  },
  sectionHeaderRow: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
    marginTop: 2
  },
  sectionEyebrow: {
    color: colors.primary,
    fontSize: 11,
    fontWeight: "900",
    textTransform: "uppercase"
  },
  sectionHeaderTitle: {
    color: colors.text,
    fontSize: 20,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 3
  },
  sectionHeaderMeta: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "900",
    paddingBottom: 2
  },
  feedHero: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    padding: 18
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
  heroKicker: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800",
    textTransform: "uppercase"
  },
  heroTitle: {
    color: colors.text,
    fontSize: 25,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 30,
    marginTop: 8
  },
  heroBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
    overflow: "hidden"
  },
  videoPreview: {
    borderBottomWidth: 1,
    height: 168,
    justifyContent: "space-between",
    padding: 14
  },
  playButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 44,
    justifyContent: "center",
    width: 70
  },
  playText: {
    color: colors.onPrimary,
    fontSize: 12,
    fontWeight: "900"
  },
  paletteBadge: {
    alignSelf: "flex-end",
    backgroundColor: "rgba(5, 5, 3, 0.72)",
    borderRadius: 8,
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  paletteBadgeText: {
    fontSize: 11,
    fontWeight: "900"
  },
  videoMeta: {
    alignItems: "flex-end",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  videoTitle: {
    color: "#FFFFFF",
    flex: 1,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 22,
    paddingRight: 12
  },
  videoLength: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "800"
  },
  cardBody: {
    padding: 14
  },
  cardTopRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between"
  },
  playerTitleBlock: {
    flex: 1
  },
  playerName: {
    color: colors.text,
    fontSize: 21,
    fontWeight: "900",
    letterSpacing: 0
  },
  playerMeta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "600",
    marginTop: 4
  },
  scoreBadge: {
    alignItems: "center",
    borderRadius: 8,
    borderWidth: 2,
    minWidth: 56,
    paddingVertical: 5
  },
  scoreValue: {
    color: colors.primary,
    fontSize: 18,
    fontWeight: "900"
  },
  scoreLabel: {
    color: colors.muted,
    fontSize: 10,
    fontWeight: "800"
  },
  highlight: {
    color: colors.text,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 12
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginTop: 12
  },
  cardMetricRow: {
    flexDirection: "row",
    gap: 8,
    marginTop: 12
  },
  cardMetric: {
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    minHeight: 58,
    paddingHorizontal: 10,
    paddingVertical: 9
  },
  cardMetricValue: {
    fontSize: 16,
    fontWeight: "900"
  },
  cardMetricLabel: {
    fontSize: 10,
    fontWeight: "900",
    marginTop: 3,
    textTransform: "uppercase"
  },
  tag: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6
  },
  tagText: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: "800"
  },
  progressLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 14
  },
  progressText: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  progressTrack: {
    backgroundColor: colors.border,
    borderRadius: 999,
    height: 8,
    marginTop: 7,
    overflow: "hidden"
  },
  progressFill: {
    borderRadius: 999,
    height: 8
  },
  detailContent: {
    alignSelf: "center",
    maxWidth: 1080,
    paddingHorizontal: 22,
    paddingBottom: DETAIL_CONTENT_PADDING,
    paddingTop: 64,
    width: "100%"
  },
  playerDetailShell: {
    flex: 1,
    position: "relative"
  },
  detailFixedHud: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderBottomColor: colors.border,
    borderBottomWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    height: 52,
    left: 0,
    paddingHorizontal: 10,
    position: "absolute",
    right: 0,
    shadowColor: "#10261A",
    shadowOffset: { height: 3, width: 0 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    top: 0,
    width: "100%",
    zIndex: 8
  },
  detailHudLeading: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4
  },
  detailHudBackButton: {
    alignItems: "center",
    height: 40,
    justifyContent: "center",
    width: 40
  },
  detailHudLogo: {
    height: 38,
    width: 48
  },
  detailHudBalance: {
    color: colors.text,
    fontSize: 15,
    fontWeight: "900"
  },
  detailVideo: {
    borderRadius: 8,
    height: 230,
    justifyContent: "space-between",
    marginTop: 4,
    overflow: "hidden",
    padding: 16
  },
  detailVideoMedia: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
    height: "100%",
    width: "100%"
  },
  detailPlayButton: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderRadius: 8,
    height: 54,
    justifyContent: "center",
    width: 86
  },
  detailPlayText: {
    color: colors.onPrimary,
    fontSize: 13,
    fontWeight: "900"
  },
  detailVideoTitle: {
    color: "#FFFFFF",
    fontSize: 24,
    fontWeight: "900",
    letterSpacing: 0,
    lineHeight: 29
  },
  detailTitleRow: {
    alignItems: "flex-start",
    flexDirection: "row",
    gap: 12,
    justifyContent: "space-between",
    marginTop: 18
  },
  detailTitleBlock: {
    flex: 1
  },
  detailName: {
    color: colors.text,
    fontSize: 30,
    fontWeight: "900",
    letterSpacing: 0,
    marginTop: 0
  },
  detailMeta: {
    color: colors.muted,
    fontSize: 14,
    fontWeight: "700",
    marginTop: 5
  },
  profileVideosSection: {
    marginTop: 22
  },
  profileVideosHeader: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 11
  },
  profileVideosCount: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800"
  },
  profileVideosRail: {
    gap: 10,
    paddingRight: 22
  },
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
  demoNotice: {
    backgroundColor: colors.infoSoft,
    borderColor: "#BFD2FF",
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 12,
    paddingHorizontal: 13,
    paddingVertical: 10
  },
  demoNoticeTitle: {
    color: colors.info,
    fontSize: 13,
    fontWeight: "900"
  },
  demoNoticeBody: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 17,
    marginTop: 3
  },
  metricGrid: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16
  },
  metricBox: {
    backgroundColor: colors.primarySoft,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 14
  },
  metricValue: {
    color: colors.primary,
    fontSize: 20,
    fontWeight: "900"
  },
  metricLabel: {
    color: colors.muted,
    fontSize: 12,
    fontWeight: "800",
    marginTop: 3
  },
  infoPanel: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 14,
    padding: 16
  },
  submitInfoPanelCompact: {
    paddingHorizontal: 12
  },
  infoPanelCompact: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 14,
    paddingHorizontal: 16,
    paddingVertical: 4
  },
  sectionTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    letterSpacing: 0,
    marginBottom: 8
  },
  bodyText: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 21
  },
  labeledInputBlock: {
    marginTop: 10
  },
  inputLabel: {
    color: colors.text,
    fontSize: 12,
    fontWeight: "900",
    marginBottom: 6,
    textTransform: "uppercase"
  },
  formInput: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 8,
    borderWidth: 1,
    color: colors.text,
    fontSize: 15,
    fontWeight: "700",
    minHeight: 48,
    paddingHorizontal: 12
  },
  formInputMultiline: {
    lineHeight: 20,
    minHeight: 94,
    paddingTop: 12
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
  removeVideoButton: {
    alignItems: "center",
    backgroundColor: colors.dangerSoft,
    borderColor: "#E9A8B0",
    borderRadius: 999,
    borderWidth: 1,
    height: 34,
    justifyContent: "center",
    width: 34
  },
  removeVideoButtonText: {
    color: colors.danger,
    fontSize: 23,
    lineHeight: 25
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
  twoColumnRow: {
    flexDirection: "row",
    gap: 10
  },
  columnField: {
    flex: 1
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
  checkRow: {
    alignItems: "center",
    flexDirection: "row",
    gap: 10,
    marginTop: 14
  },
  checkBox: {
    alignItems: "center",
    borderColor: colors.borderStrong,
    borderRadius: 6,
    borderWidth: 2,
    height: 28,
    justifyContent: "center",
    width: 28
  },
  checkBoxActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary
  },
  checkMark: {
    color: colors.onPrimary,
    fontSize: 10,
    fontWeight: "900"
  },
  checkText: {
    color: colors.text,
    flex: 1,
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18
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
  reviewNote: {
    backgroundColor: colors.surfaceMuted,
    borderRadius: 8,
    color: colors.text,
    fontSize: 12,
    fontWeight: "700",
    lineHeight: 18,
    marginTop: 8,
    padding: 10
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
  summaryBand: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
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
  buttonPressed: {
    opacity: 0.76,
    transform: [{ scale: 0.98 }]
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
  summaryInsightStrip: {
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.border,
    borderRadius: 8,
    borderWidth: 1,
    flexDirection: "row",
    gap: 8,
    marginTop: 14,
    paddingHorizontal: 10,
    paddingVertical: 10
  },
  summaryInsightItem: {
    flex: 1,
    minWidth: 0
  },
  summaryInsightValue: {
    color: colors.primary,
    fontSize: 14,
    fontWeight: "900"
  },
  summaryInsightLabel: {
    color: colors.muted,
    fontSize: 9,
    fontWeight: "900",
    marginTop: 3,
    textTransform: "uppercase"
  },
  summaryBody: {
    color: colors.muted,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8
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
  portfolioDesktopGrid: {
    flexDirection: "row",
    gap: 14,
    marginTop: 14
  },
  portfolioDesktopColumn: {
    flex: 1,
    minWidth: 0
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
  profileMeta: {
    color: colors.muted,
    fontSize: 13,
    fontWeight: "700",
    marginTop: 5
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
  profileGalleryCardTitle: {
    bottom: 8,
    color: colors.onPrimary,
    fontSize: 11,
    fontWeight: "900",
    left: 8,
    lineHeight: 14,
    position: "absolute",
    right: 8
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
  profileSubviewBackButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderRadius: 6,
    borderWidth: 1,
    height: 40,
    justifyContent: "center",
    width: 40
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
  settingsAvatarRemoveButton: {
    alignItems: "center",
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
    borderRadius: 6,
    borderWidth: 1,
    flexDirection: "row",
    gap: 7,
    justifyContent: "center",
    minHeight: 40,
    paddingHorizontal: 13
  },
  settingsAvatarRemoveButtonText: {
    color: colors.danger,
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
  avatarPositionHeader: {
    alignItems: "flex-start",
    flexDirection: "row",
    justifyContent: "space-between"
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
    backgroundColor: colors.surfaceMuted,
    borderColor: colors.primary,
    borderRadius: 999,
    borderWidth: 3,
    height: 210,
    marginTop: 20,
    overflow: "hidden",
    position: "relative",
    width: 210
  },
  avatarPositionGrid: {
    ...StyleSheet.absoluteFillObject,
    flexDirection: "row",
    flexWrap: "wrap"
  },
  avatarPositionGridCell: {
    alignItems: "center",
    borderColor: "rgba(255, 255, 255, 0.42)",
    borderWidth: 0.5,
    height: "33.333%",
    justifyContent: "center",
    width: "33.333%"
  },
  avatarPositionMarker: {
    alignItems: "center",
    backgroundColor: colors.primary,
    borderColor: colors.surface,
    borderRadius: 999,
    borderWidth: 2,
    height: 32,
    justifyContent: "center",
    shadowColor: "#000000",
    shadowOffset: { height: 2, width: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    width: 32
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
  },
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
  },
  tabBar: {
    backgroundColor: colors.surface,
    borderTopColor: colors.border,
    borderTopWidth: 1,
    flexDirection: "row",
    elevation: 10,
    gap: 2,
    paddingBottom: TAB_BAR_SAFE_PADDING,
    paddingHorizontal: 8,
    paddingTop: 8,
    shadowColor: "#10261A",
    shadowOffset: { height: -4, width: 0 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    width: "100%"
  },
  tabButton: {
    alignItems: "center",
    borderRadius: 6,
    flex: 1,
    gap: 3,
    minHeight: 56,
    paddingVertical: 8
  },
  tabButtonActive: {
    backgroundColor: colors.primarySoft
  },
  tabMarker: {
    backgroundColor: "rgba(245, 222, 178, 0.26)",
    borderRadius: 999,
    height: 3,
    width: 22
  },
  tabMarkerActive: {
    backgroundColor: colors.primary,
    width: 34
  },
  tabText: {
    color: colors.muted,
    fontSize: 11,
    fontWeight: "900"
  },
  tabTextActive: {
    color: colors.primary
  }
});
