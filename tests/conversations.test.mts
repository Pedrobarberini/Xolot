import assert from "node:assert/strict";
import test from "node:test";
import {
  filterMessagesAfterConversationDeletion,
  sortContactsByPinned,
  togglePinnedConversation
} from "../src/utils/conversations.ts";

test("limita conversas fixadas a tres", () => {
  assert.deepEqual(togglePinnedConversation(["a", "b", "c"], "d"), [
    "a",
    "b",
    "c"
  ]);
  assert.deepEqual(togglePinnedConversation(["a", "b", "c"], "b"), [
    "a",
    "c"
  ]);
});

test("ordena conversas fixadas antes das demais", () => {
  const contacts = [
    { id: "a", name: "A", profileId: "pa", subtitle: "" },
    { id: "b", name: "B", profileId: "pb", subtitle: "" },
    { id: "c", name: "C", profileId: "pc", subtitle: "" }
  ];

  assert.deepEqual(
    sortContactsByPinned(contacts, ["c", "b"]).map((contact) => contact.id),
    ["c", "b", "a"]
  );
});

test("oculta apenas mensagens anteriores a exclusao da conversa", () => {
  const messages = [
    {
      body: "antiga",
      createdAt: "2026-07-20T10:00:00.000Z",
      id: "1",
      recipientUserId: "b",
      senderUserId: "a"
    },
    {
      body: "nova",
      createdAt: "2026-07-20T12:00:00.000Z",
      id: "2",
      recipientUserId: "a",
      senderUserId: "b"
    }
  ];

  assert.deepEqual(
    filterMessagesAfterConversationDeletion(messages, "a", {
      b: "2026-07-20T11:00:00.000Z"
    }).map((message) => message.id),
    ["2"]
  );
});
