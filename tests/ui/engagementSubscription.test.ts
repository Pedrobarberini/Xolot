import {
  engagementChunks,
  subscribeFirebaseEngagement,
} from "../../src/services/firebaseEngagementSubscription";
import { onSnapshot, onSnapshotsInSync, query, where } from "firebase/firestore";
jest.mock("../../src/config/firebase", () => ({ getFirebaseFirestore: () => ({}) }));
jest.mock("firebase/firestore", () => ({
  collection: (_db: unknown, ...segments: string[]) => segments.join("/"),
  documentId: () => "__name__",
  where: jest.fn((...args) => args),
  query: jest.fn((...args) => args),
  onSnapshot: jest.fn(),
  onSnapshotsInSync: jest.fn(),
}));
const subscribe = jest.mocked(onSnapshot);
const sync = jest.mocked(onSnapshotsInSync);

test("somente IDs do contexto são consultados, em lotes até 30; nenhuma coleção global", () => {
  subscribe.mockReturnValue(jest.fn());
  sync.mockReturnValue(jest.fn());
  const ids = Array.from({ length: 65 }, (_, index) => `post-${index}`);
  expect(engagementChunks([...ids, ids[0], "path/invalid"])).toHaveLength(3);
  const stop = subscribeFirebaseEngagement("alice", ids, jest.fn(), jest.fn());
  expect(subscribe).toHaveBeenCalledTimes(9);
  for (const args of jest.mocked(query).mock.calls) {
    expect(args).toHaveLength(2);
    expect(args[1]).toEqual(["__name__", "in", expect.any(Array)]);
  }
  expect(jest.mocked(where).mock.calls.every((args) => args[1] === "in")).toBe(true);
  stop();
});

test("contador e marcador são emitidos juntos; callback após saída da sessão é descartado", async () => {
  const unsubscribed = jest.fn();
  subscribe.mockReturnValue(unsubscribed);
  sync.mockReturnValue(unsubscribed);
  const onChange = jest.fn();
  const error = jest.fn();
  const stop = subscribeFirebaseEngagement("alice", ["post"], onChange, error);
  const callbacks = subscribe.mock.calls.map((args) => args[1] as (snapshot: unknown) => void);
  callbacks[0]({ docs: [{ id: "post", data: () => ({ likes: 10, shares: 0, views: 20 }) }] });
  callbacks[1]({ docs: [{ id: "post" }] });
  callbacks[2]({ docs: [] });
  const inSync = sync.mock.calls[0][1] as () => void;
  inSync();
  await Promise.resolve();
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(onChange.mock.calls[0][0]).toMatchObject({
    likedPlayerIds: ["post"],
    engagementByPlayer: { post: { likes: 10 } },
  });
  stop();
  callbacks[0]({ docs: [] });
  inSync();
  await Promise.resolve();
  expect(onChange).toHaveBeenCalledTimes(1);
  expect(unsubscribed).toHaveBeenCalledTimes(4);
});
