import assert from "node:assert/strict";
import test from "node:test";
import {
  createFeedSession,
  parseFeedSession,
  refreshFeedSession,
  resolveFeedAnchor,
  FEED_HISTORY_LIMIT,
} from "../src/utils/feedSession.ts";

test("refresh adiciona lote acima do histórico sem reordenar nem perder a identidade anterior", () => {
  const original = createFeedSession(["a", "b", "c"]);
  original.anchor = { entryKey: "0:b", progress: 0.3 };
  const refreshed = refreshFeedSession(original, ["c", "a", "d", "b"]);
  assert.deepEqual(
    refreshed.entries.slice(0, 4).map((entry) => entry.playerId),
    ["d", "c", "a", "b"],
  );
  assert.deepEqual(refreshed.entries.slice(4), original.entries);
  assert.equal(new Set(refreshed.entries.map((entry) => entry.key)).size, 7);
  assert.deepEqual(refreshed.anchor, { entryKey: "1:d", progress: 0 });
  assert.deepEqual(
    original.entries.map((entry) => entry.playerId),
    ["a", "b", "c"],
  );
});

test("cache aceita só IDs e posição válidos, limita memória e ignora conteúdo extra", () => {
  let session = createFeedSession(Array.from({ length: 250 }, (_, index) => `post-${index}`));
  for (let i = 0; i < 50; i++) session = refreshFeedSession(session, ["a", "b", "c"]);
  assert.equal(session.entries.length, FEED_HISTORY_LIMIT);
  assert.deepEqual(
    parseFeedSession(JSON.stringify({ ...session, token: "must-not-persist" })),
    session,
  );
  assert.equal(parseFeedSession("{bad"), null);
  assert.equal(parseFeedSession(JSON.stringify({ ...session, generation: -1 })), null);
  assert.equal(
    parseFeedSession(
      JSON.stringify({ ...session, entries: [{ key: "1:bad/path", playerId: "bad/path" }] }),
    ),
    null,
  );
  assert.deepEqual(resolveFeedAnchor(["0:a", "0:b"], { entryKey: "0:b", progress: 0.3 }), {
    index: 1,
    progress: 0.3,
  });
  assert.deepEqual(resolveFeedAnchor(["0:a"], { entryKey: "removed", progress: 0.3 }), {
    index: 0,
    progress: 0,
  });
});
