import { StyleSheet } from "react-native";
import {
  DETAIL_CONTENT_PADDING,
  TAB_BAR_CONTENT_PADDING,
  TAB_BAR_SAFE_PADDING,
  USE_CENTERED_WEB_LAYOUT
} from "../../constants/layout";
import { colors } from "../../theme";

export const mediaDetailStyles = {
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
  }
} as const;
