import { StyleSheet } from "react-native";
import {
  DETAIL_CONTENT_PADDING,
  TAB_BAR_CONTENT_PADDING,
  TAB_BAR_SAFE_PADDING,
  USE_CENTERED_WEB_LAYOUT
} from "../../constants/layout";
import { colors } from "../../theme";

export const feedStyles = {
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
  feedEmptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 32
  },
  feedEmptyStateIcon: {
    alignItems: "center",
    backgroundColor: colors.primarySoft,
    borderRadius: 999,
    height: 54,
    justifyContent: "center",
    width: 54
  },
  feedEmptyStateTitle: {
    color: colors.text,
    fontSize: 18,
    fontWeight: "900",
    marginTop: 14,
    textAlign: "center"
  },
  feedEmptyStateBody: {
    color: colors.muted,
    fontSize: 13,
    lineHeight: 19,
    marginTop: 5,
    maxWidth: 300,
    textAlign: "center"
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
  feedSocialActionRail: {
    alignItems: "center",
    bottom: 132,
    gap: 13,
    position: "absolute",
    right: 10,
    zIndex: 6
  },
  feedSocialActionRailWide: {
    bottom: 96,
    right: 16
  },
  feedSocialAction: {
    alignItems: "center",
    justifyContent: "center",
    minHeight: 44,
    minWidth: 44
  },
  feedSocialActionIcon: {
    alignItems: "center",
    backgroundColor: "rgba(5, 10, 7, 0.66)",
    borderColor: "rgba(255, 255, 255, 0.28)",
    borderRadius: 999,
    borderWidth: 1,
    height: 42,
    justifyContent: "center",
    width: 42
  },
  feedSocialActionCount: {
    color: colors.onPrimary,
    fontSize: 11,
    fontWeight: "900",
    marginTop: 3,
    textShadowColor: "rgba(0, 0, 0, 0.88)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 3
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
    paddingRight: 72,
    paddingTop: 14,
    right: 0,
    shadowOpacity: 0
  },
  feedPreferenceTextBlock: {
    flex: 1,
    minWidth: 0
  },
  feedPreferenceHint: {
    color: colors.muted,
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2
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
  feedHero: {
    backgroundColor: colors.surface,
    borderColor: colors.border,
    borderWidth: 1,
    borderRadius: 8,
    marginBottom: 16,
    padding: 18
  }
} as const;
