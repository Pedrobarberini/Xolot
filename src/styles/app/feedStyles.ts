import { StyleSheet } from "react-native";
import { TAB_BAR_CONTENT_PADDING } from "../../constants/layout";
import { colors } from "../../theme";
import { FOLKO_HORIZONTAL_ASPECT_RATIO } from "../../constants/assets";

export const feedStyles = {
  feedPagerShell: {
    backgroundColor: colors.media,
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
  feedBrandSlot: {
    alignItems: "center",
    height: 76 / FOLKO_HORIZONTAL_ASPECT_RATIO,
    justifyContent: "center",
    width: 76
  },
  feedBrandSlotPressed: {
    opacity: 0.62,
    transform: [{ scale: 0.94 }]
  },
  feedPager: {
    backgroundColor: colors.media,
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
    backgroundColor: colors.media,
    width: "100%"
  },
  feedReelStage: {
    backgroundColor: colors.media,
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
  feedVideoPlaybackPlaceholder: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center"
  },
  feedVideoMedia: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#000000",
    height: "100%",
    width: "100%"
  },
  feedDoubleTapHeart: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2
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
    top: 50,
    zIndex: 3
  },
  feedVideoControlButton: {
    alignItems: "center",
    backgroundColor: "transparent",
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
    touchAction: "none",
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
  feedReelBrandMark: {
    height: 76 / FOLKO_HORIZONTAL_ASPECT_RATIO,
    width: 76
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
    shadowColor: "#1B160A",
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
    backgroundColor: "rgba(12, 13, 20, 0.62)",
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
    backgroundColor: "rgba(12, 13, 20, 0.58)",
    borderColor: "rgba(255, 255, 255, 0.68)"
  },
  feedFollowButtonText: {
    color: colors.onPrimary,
    fontSize: 11,
    fontWeight: "900"
  },
  feedFollowButtonTextActiveWide: {
    color: colors.primaryText
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
  feedCompactDescriptionBody: {
    marginTop: 3
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
  feedCompactTextButtonLabel: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: "900",
    textShadowColor: "rgba(0, 0, 0, 0.72)",
    textShadowOffset: { height: 1, width: 0 },
    textShadowRadius: 2
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
  feedReadMoreRow: {
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "space-between"
  },
  feedMentionsButton: {
    alignItems: "center",
    flexDirection: "row",
    gap: 4,
    justifyContent: "center",
    marginTop: 6,
    minHeight: 34,
    paddingHorizontal: 4
  },
  feedMentionsButtonCompact: {
    marginTop: 0
  },
  feedMentionsCount: {
    fontSize: 12,
    fontWeight: "900"
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
  feedReelButtonPressed: {
    opacity: 0.84,
    transform: [{ scale: 0.98 }]
  },
  feedLearnMoreText: {
    color: colors.onPrimary,
    fontSize: 14,
    fontWeight: "900"
  },
} as const;
