import { useEffect } from "react";
import { AppState } from "react-native";
import { operationMetrics } from "../config/operationMetrics";
import { getCurrentFirebaseUser } from "../services/firebaseAccountService";

export function useOperationMetrics(userId: string | undefined) {
  useEffect(() => {
    let active = false;
    if (userId && process.env.EXPO_PUBLIC_OPERATION_METRICS_ENABLED === "true") {
      try {
        const identity = getCurrentFirebaseUser();
        active = Boolean(identity?.emailVerified && identity.uid === userId);
      } catch {
        // Diagnostics must not prevent boot when the identity SDK is unavailable.
      }
    }
    operationMetrics.configure(userId, active);
    if (!userId || !active) return;
    const timer = setInterval(() => {
      void operationMetrics.flush();
    }, 60000);
    const listener = AppState.addEventListener("change", (state) => {
      if (state !== "active") void operationMetrics.flush();
    });
    return () => {
      clearInterval(timer);
      listener.remove();
      operationMetrics.configure(undefined, false);
    };
  }, [userId]);
}
