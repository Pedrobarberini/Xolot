import {
  subscribeFirebaseSocialState,
  updateFirebaseDirectMessageReceipts,
} from "../../src/services/firebaseSocialService";
import { onSnapshot, query } from "firebase/firestore";
import { httpsCallable } from "firebase/functions";
jest.mock("firebase/app", () => ({ FirebaseError: class extends Error {} }));
jest.mock("../../src/config/firebase", () => ({
  getFirebaseFirestore: () => ({}),
  getFirebaseFunctions: () => ({}),
}));
jest.mock("../../src/services/firebaseAccountService", () => ({
  getCurrentFirebaseUser: () => ({ uid: "alice", emailVerified: true }),
}));
jest.mock("firebase/firestore", () => ({
  collection: (_db: unknown, ...parts: string[]) => parts.join("/"),
  doc: (_db: unknown, ...parts: string[]) => parts.join("/"),
  where: (...args: unknown[]) => ["where", ...args],
  orderBy: (...args: unknown[]) => ["order", ...args],
  documentId: () => "__name__",
  limit: (value: number) => ["limit", value],
  query: jest.fn((...args) => args),
  onSnapshot: jest.fn(),
}));
jest.mock("firebase/functions", () => ({ httpsCallable: jest.fn() }));

test("mensagens e notificações recebem ordem temporal; sessão encerrada não envia recibos", () => {
  jest.mocked(onSnapshot).mockReturnValue(jest.fn());
  const onChange = jest.fn();
  const stop = subscribeFirebaseSocialState("alice", onChange);
  const queries = jest.mocked(query).mock.calls;
  const messages = queries.filter((args) => args[0] === "directMessages");
  expect(messages).toHaveLength(2);
  for (const args of messages) {
    expect(args).toContainEqual(["order", "createdAt", "desc"]);
    expect(args).toContainEqual(["order", "__name__", "desc"]);
  }
  stop();
  const incoming = jest
    .mocked(onSnapshot)
    .mock.calls.find(
      (args) => Array.isArray(args[0]) && JSON.stringify(args[0]).includes("recipientUserId"),
    )!;
  (incoming[1] as (value: unknown) => void)({
    docs: [
      { id: "m", data: () => ({ body: "texto", senderUserId: "bruno", recipientUserId: "alice" }) },
    ],
  });
  expect(onChange).not.toHaveBeenCalled();
  expect(httpsCallable).not.toHaveBeenCalled();
});

test("205 recibos são enviados sem perda em três lotes de até 100", async () => {
  const send = jest.fn(async ({ messageIds }: { messageIds: string[] }) => ({
    data: { updated: messageIds.length },
  }));
  jest.mocked(httpsCallable).mockReturnValue(send as never);
  expect(
    await updateFirebaseDirectMessageReceipts(
      Array.from({ length: 205 }, (_, index) => `message-${index}`),
      "read",
    ),
  ).toBe(205);
  expect(send.mock.calls.map((args) => args[0].messageIds.length)).toEqual([100, 100, 5]);
});
