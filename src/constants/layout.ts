import { Platform } from "react-native";

export const SYSTEM_NAV_CLEARANCE =
  Platform.select({ android: 58, ios: 34, default: 24 }) ?? 24;
export const TAB_BAR_SAFE_PADDING =
  Platform.select({ android: 18, ios: 18, default: 10 }) ?? 10;
export const TAB_BAR_CONTENT_PADDING = 24;
export const DETAIL_CONTENT_PADDING = SYSTEM_NAV_CLEARANCE + 36;
export const FEED_TEXT_LIMIT_COMPACT = 76;
export const FEED_TEXT_LIMIT_WIDE = 230;
export const USE_CENTERED_WEB_LAYOUT = Platform.OS === "web";
