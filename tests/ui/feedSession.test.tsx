import AsyncStorage from "@react-native-async-storage/async-storage";
import { act, renderHook, waitFor } from "@testing-library/react-native";
import { useFeedSession, feedSessionStorageKey } from "../../src/actions/useFeedSession";
import { createFeedSession } from "../../src/utils/feedSession";
import type { Player } from "../../src/types";
jest.mock("@react-native-async-storage/async-storage", () =>
  jest.requireActual("@react-native-async-storage/async-storage/jest"),
);
beforeEach(async () => {
  await AsyncStorage.clear();
});
const post = (id: string) => ({ id, videoTitle: id }) as Player;

test("preferências e payloads ao vivo não reordenam, e novo conteúdo só entra pelo mascote", async () => {
  const hook = renderHook(({ players }) => useFeedSession("alice", players, true), {
    initialProps: { players: [post("a"), post("b")] },
  });
  await waitFor(() => expect(hook.result.current.loaded).toBe(true));
  hook.rerender({ players: [post("c"), post("b"), { ...post("a"), videoTitle: "Atualizado" }] });
  expect(hook.result.current.players.map((player) => player.id)).toEqual(["a", "b"]);
  expect(hook.result.current.players[0].videoTitle).toBe("Atualizado");
  act(() => hook.result.current.saveAnchor({ entryKey: "0:b", progress: 0.25 }));
  expect(hook.result.current.anchor).toEqual({ entryKey: "0:b", progress: 0.25 });
  act(() => hook.result.current.refresh());
  expect(hook.result.current.players.map((player) => player.id)).toEqual(["c", "b", "a", "a", "b"]);
  hook.rerender({ players: [post("c"), post("a")] }); // Ocultação/remoção prevalece em todos os lotes.
  expect(hook.result.current.players.every((player) => player.id !== "b")).toBe(true);
  hook.unmount();
});

test("restaura ordem e posição por UID, sem expor cache da conta anterior na troca", async () => {
  const session = createFeedSession(["b", "a"]);
  session.anchor = { entryKey: "0:a", progress: 0.5 };
  await AsyncStorage.setItem(feedSessionStorageKey("alice"), JSON.stringify(session));
  const hook = renderHook(({ uid }) => useFeedSession(uid, [post("a"), post("b")], true), {
    initialProps: { uid: "alice" },
  });
  await waitFor(() => expect(hook.result.current.loaded).toBe(true));
  expect(hook.result.current.players.map((player) => player.id)).toEqual(["b", "a"]);
  expect(hook.result.current.anchor).toEqual(session.anchor);
  hook.rerender({ uid: "bruno" });
  expect(hook.result.current.players).toEqual([]);
  await waitFor(() => expect(hook.result.current.loaded).toBe(true));
  expect(hook.result.current.players.map((player) => player.id)).toEqual(["a", "b"]);
  expect(hook.result.current.anchor).toBeNull();
  hook.unmount();
});
