import { act, renderHook } from "@testing-library/react-native";
import { AppState, type AppStateStatus } from "react-native";
import { httpsCallable } from "firebase/functions";
import { useOperationMetrics } from "../../src/actions/useOperationMetrics";
import { operationMetrics } from "../../src/config/operationMetrics";
import { getCurrentFirebaseUser } from "../../src/services/firebaseAccountService";
import { sendOperationMetrics } from "../../src/services/firebaseOperationMetricsService";
import type { MetricBatch } from "../../src/shared/observability/operationMetrics";

jest.mock("../../src/config/operationMetrics", () => ({
  operationMetrics: { configure: jest.fn(), flush: jest.fn().mockResolvedValue(undefined) },
}));
jest.mock("../../src/services/firebaseAccountService", () => ({
  getCurrentFirebaseUser: jest.fn(),
}));
jest.mock("../../src/config/firebase", () => ({ getFirebaseFunctions: () => ({}) }));
jest.mock("firebase/functions", () => ({ httpsCallable: jest.fn() }));

const initialFlag = process.env.EXPO_PUBLIC_OPERATION_METRICS_ENABLED;
const identity = jest.mocked(getCurrentFirebaseUser);
const account = (uid = "alice", emailVerified = true) =>
  ({ uid, emailVerified }) as NonNullable<ReturnType<typeof getCurrentFirebaseUser>>;
beforeEach(() => {
  jest.useFakeTimers();
  identity.mockReturnValue(account());
});
afterEach(() => {
  jest.useRealTimers();
  if (initialFlag === undefined) delete process.env.EXPO_PUBLIC_OPERATION_METRICS_ENABLED;
  else process.env.EXPO_PUBLIC_OPERATION_METRICS_ENABLED = initialFlag;
});

test("flag desligada não inicia timer/transporte nem consulta identidade", () => {
  delete process.env.EXPO_PUBLIC_OPERATION_METRICS_ENABLED;
  const hook = renderHook(() => useOperationMetrics("alice"));
  act(() => jest.advanceTimersByTime(120000));
  expect(operationMetrics.configure).toHaveBeenCalledWith("alice", false);
  expect(operationMetrics.flush).not.toHaveBeenCalled();
  expect(identity).not.toHaveBeenCalled();
  hook.unmount();
});

test("falha no SDK de identidade desativa diagnóstico sem impedir o app", () => {
  process.env.EXPO_PUBLIC_OPERATION_METRICS_ENABLED = "true";
  identity.mockImplementation(() => {
    throw new Error("identity unavailable");
  });
  const hook = renderHook(() => useOperationMetrics("alice"));
  expect(operationMetrics.configure).toHaveBeenCalledWith("alice", false);
  act(() => jest.advanceTimersByTime(120000));
  expect(operationMetrics.flush).not.toHaveBeenCalled();
  hook.unmount();
});

test("sessão verificada ativa lotes, background tenta envio e logout limpa recursos", () => {
  process.env.EXPO_PUBLIC_OPERATION_METRICS_ENABLED = "true";
  const remove = jest.fn();
  let changed!: (state: AppStateStatus) => void;
  jest.spyOn(AppState, "addEventListener").mockImplementation((_event, listener) => {
    changed = listener;
    return { remove };
  });
  const hook = renderHook(({ uid }) => useOperationMetrics(uid), {
    initialProps: { uid: "alice" as string | undefined },
  });
  expect(operationMetrics.configure).toHaveBeenCalledWith("alice", true);
  act(() => jest.advanceTimersByTime(60000));
  expect(operationMetrics.flush).toHaveBeenCalledTimes(1);
  act(() => changed("background"));
  expect(operationMetrics.flush).toHaveBeenCalledTimes(2);
  hook.rerender({ uid: undefined });
  expect(remove).toHaveBeenCalledTimes(1);
  expect(operationMetrics.configure).toHaveBeenCalledWith(undefined, false);
  const calls = jest.mocked(operationMetrics.flush).mock.calls.length;
  act(() => jest.advanceTimersByTime(120000));
  expect(operationMetrics.flush).toHaveBeenCalledTimes(calls);
});

test("transporte recusa identidade diferente/não verificada e nunca coloca UID no lote", async () => {
  const batch: MetricBatch = {
    schemaVersion: 1,
    source: "client",
    platform: "web",
    releaseId: "dcf3622",
    sampleRate: 0.2,
    dropped: 0,
    samples: [{ operation: "post.like.confirm", code: "ok", outcome: "success", value: 100 }],
  };
  const send = jest.fn().mockResolvedValue({ data: { accepted: 1 } });
  jest.mocked(httpsCallable).mockReturnValue(send);
  identity.mockReturnValue(account("other"));
  await sendOperationMetrics(batch, "alice");
  identity.mockReturnValue(account("alice", false));
  await sendOperationMetrics(batch, "alice");
  expect(send).not.toHaveBeenCalled();
  identity.mockReturnValue(account());
  await sendOperationMetrics(batch, "alice");
  expect(send).toHaveBeenCalledWith(batch);
  expect(JSON.stringify(send.mock.calls)).not.toContain("alice");
});
