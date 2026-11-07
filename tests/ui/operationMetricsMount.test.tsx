import React, { useEffect } from "react";
import { render } from "@testing-library/react-native";
import { useOperationMetrics } from "../../src/actions/useOperationMetrics";
import { operationMetrics } from "../../src/config/operationMetrics";

jest.mock("../../src/config/operationMetrics", () => {
  const { createOperationMetrics } = jest.requireActual(
    "../../src/shared/observability/operationMetrics",
  );
  return {
    operationMetrics: createOperationMetrics({
      platform: "web",
      random: () => 0,
      send: async () => undefined,
    }),
  };
});
jest.mock("../../src/services/firebaseAccountService", () => ({
  getCurrentFirebaseUser: () => ({ uid: "alice", emailVerified: true }),
}));

test("a primeira tela mede após a sessão ser configurada, mesmo no mesmo commit de login", () => {
  const previous = process.env.EXPO_PUBLIC_OPERATION_METRICS_ENABLED;
  process.env.EXPO_PUBLIC_OPERATION_METRICS_ENABLED = "true";
  function ChildScreen() {
    useEffect(() => {
      operationMetrics.begin("feed.first_item")();
    }, []);
    return null;
  }
  function AppSession() {
    useOperationMetrics("alice");
    return <ChildScreen />;
  }
  try {
    const screen = render(<AppSession />);
    expect(operationMetrics.pendingCount()).toBe(1);
    screen.unmount();
    expect(operationMetrics.pendingCount()).toBe(0);
  } finally {
    if (previous === undefined) delete process.env.EXPO_PUBLIC_OPERATION_METRICS_ENABLED;
    else process.env.EXPO_PUBLIC_OPERATION_METRICS_ENABLED = previous;
  }
});
