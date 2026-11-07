import assert from "node:assert/strict";
import test from "node:test";
import { socialStateForUser, socialStorageKey } from "../src/utils/socialSession.ts";
import type { SocialState } from "../src/services/socialStorage.ts";
test("cache legado projeta apenas dados do dono, sem apagar a origem de outra conta", () => {
  const maps = { alice: ["a"], bruno: ["b"] };
  const state = {
    blockedProfileIdsByUser: maps,
    conversationPreferencesByUser: {},
    directMessages: [
      { id: "1", senderUserId: "alice", recipientUserId: "bruno" },
      { id: "2", senderUserId: "carla", recipientUserId: "bruno" },
    ],
    followingByUser: maps,
    hiddenPlayerIdsByUser: maps,
    interestedContentKeysByUser: maps,
    likedPlayerIdsByUser: maps,
    messageContactsByUser: {},
    mutedContentKeysByUser: maps,
    postComments: [{ id: "comment", authorUserId: "bruno" }],
    reportedPlayerIdsByUser: maps,
    viewedPlayerIdsByUser: maps,
  } as SocialState;
  const result = socialStateForUser(state, "alice");
  assert.deepEqual(
    result.directMessages.map((m) => m.id),
    ["1"],
  );
  assert.deepEqual(result.postComments, []);
  assert.deepEqual(result.likedPlayerIdsByUser, { alice: ["a"] });
  assert.deepEqual(state.likedPlayerIdsByUser, maps);
  assert.notEqual(socialStorageKey("alice"), socialStorageKey("bruno"));
  for (const uid of ["", "a/b", "a\n"]) assert.throws(() => socialStorageKey(uid));
});
