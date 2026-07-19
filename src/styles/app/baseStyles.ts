import { StyleSheet } from "react-native";
import {
  DETAIL_CONTENT_PADDING,
  TAB_BAR_CONTENT_PADDING,
  TAB_BAR_SAFE_PADDING,
  USE_CENTERED_WEB_LAYOUT
} from "../../constants/layout";
import { colors } from "../../theme";

export const baseStyles = {
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
