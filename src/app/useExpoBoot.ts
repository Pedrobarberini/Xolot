import { useEffect } from "react";
import * as SplashScreen from "expo-splash-screen";
import * as SystemUI from "expo-system-ui";
import { colors } from "../theme";

SplashScreen.preventAutoHideAsync().catch(() => undefined);

export function useExpoBoot() {
  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => undefined);
    SplashScreen.hideAsync().catch(() => undefined);
  }, []);
}
