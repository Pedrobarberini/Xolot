import { Platform } from "react-native";
import { createOperationMetrics } from "../shared/observability/operationMetrics";

export const operationMetrics = createOperationMetrics({
  platform: Platform.OS === "android" || Platform.OS === "ios" ? Platform.OS : "web",
  releaseId: process.env.EXPO_PUBLIC_RELEASE_ID,
  send: async (batch, expectedUserId) => {
    const { sendOperationMetrics } = await import("../services/firebaseOperationMetricsService");
    return sendOperationMetrics(batch, expectedUserId);
  },
});
