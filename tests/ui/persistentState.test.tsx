import { act, renderHook } from "@testing-library/react-native";
import { usePersistentAppState } from "../../src/actions/usePersistentAppState";
import { loadLocalAppState, saveLocalAppState } from "../../src/repositories/localRepository";
import { createDefaultLocalAppState } from "../../src/repositories/appStateSchema";
import { reportOperationFailure } from "../../src/shared/observability/logger";

jest.mock("../../src/repositories/localRepository", () => ({
  loadLocalAppState: jest.fn(),
  saveLocalAppState: jest.fn(),
}));
jest.mock("../../src/shared/observability/logger", () => ({ reportOperationFailure: jest.fn() }));

afterEach(() => jest.useRealTimers());

test("cache com falha libera o app com fallback e relata operação; save não fica silencioso", async () => {
  jest.useFakeTimers();
  const readError = new Error("conteúdo privado não deve ser serializado pelo logger");
  const writeError = { code: "unavailable", token: "private" };
  jest.mocked(loadLocalAppState).mockRejectedValue(readError);
  jest.mocked(saveLocalAppState).mockRejectedValue(writeError);
  const hook = renderHook(() => usePersistentAppState());
  await act(async () => undefined);
  expect(hook.result.current.isAppStateLoaded).toBe(true);
  expect(hook.result.current.submissions).toEqual([]);
  expect(reportOperationFailure).toHaveBeenCalledWith("cache.load", readError);
  await act(async () => {
    jest.advanceTimersByTime(80);
  });
  expect(reportOperationFailure).toHaveBeenCalledWith("cache.save", writeError);
  hook.unmount();
});

test("falha de gravação não apaga conteúdo já carregado", async () => {
  jest.useFakeTimers();
  const cached = createDefaultLocalAppState();
  cached.professionalSettingsByUser.owner = {
    category: "talent",
    enabled: true,
    externalLink: "",
    plan: "free",
    updatedAt: "2026-01-01T00:00:00Z",
  };
  jest.mocked(loadLocalAppState).mockResolvedValue(cached);
  jest.mocked(saveLocalAppState).mockRejectedValue(new Error("sem espaço"));
  const hook = renderHook(() => usePersistentAppState());
  await act(async () => undefined);
  await act(async () => {
    jest.advanceTimersByTime(80);
  });
  expect(hook.result.current.professionalSettingsByUser.owner.enabled).toBe(true);
  expect(reportOperationFailure).toHaveBeenCalledWith("cache.save", expect.any(Error));
  hook.unmount();
});
