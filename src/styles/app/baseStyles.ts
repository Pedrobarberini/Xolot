import { StyleSheet } from "react-native";
import { TAB_BAR_CONTENT_PADDING, USE_CENTERED_WEB_LAYOUT } from "../../constants/layout";
import { colors } from "../../theme";
import { FOLKO_PRIMARY_ASPECT_RATIO } from "../../constants/assets";

export const baseStyles = {
  appRoot: {
    alignItems: "center",
    backgroundColor: colors.background,
    flex: 1
  },
  safeArea: {
    backgroundColor: colors.background,
    flex: 1,
    width: "100%",
    ...(USE_CENTERED_WEB_LAYOUT
      ? {
          maxWidth: 480
        }
      : {})
  },
  brandLaunch: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    backgroundColor: "#090A0F",
    justifyContent: "center",
    paddingHorizontal: 36,
    zIndex: 100
  },
  brandLaunchLogo: {
    width: "100%",
    maxWidth: 300,
    aspectRatio: FOLKO_PRIMARY_ASPECT_RATIO
  },
  keyboardView: {
    flex: 1
  },
  tabScene: {
    backgroundColor: colors.background,
    flex: 1,
    overflow: "hidden"
  },
  tabSceneContent: {
    flex: 1
  },
  screenBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: colors.background,
    overflow: "hidden"
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
  }
} as const;
