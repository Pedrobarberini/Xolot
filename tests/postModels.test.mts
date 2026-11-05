import assert from "node:assert/strict";
import test from "node:test";
import {
  firebasePostToSubmission,
  normalizeFirebasePostDocument,
} from "../src/utils/firebasePostDocument.ts";
import {
  publishedPostFromDocument,
  publishedPostToSubmission,
} from "../src/features/posts/data/postAdapters.ts";
import { selectApprovedSubmissionPlayers } from "../src/app/appSelectors.ts";

const id = "post-123";
const authorId = "owner";
const instant = new Date("2026-01-01T00:00:00Z");
function fixture(provider: "firebase" | "r2", kind: "image" | "video") {
  const mediaPath =
    provider === "r2"
      ? `users/${authorId}/posts/${id}/object.bin`
      : `posts/${authorId}/${id}/media`;
  return {
    authorId,
    createdAt: instant,
    updatedAt: instant,
    title: "Minha publicação",
    description: "Descrição sintética",
    mediaType: kind,
    storageProvider: provider,
    mediaPath,
    mediaKey: provider === "r2" ? mediaPath : "",
    mimeType: kind === "image" ? "image/png" : "video/mp4",
    fileName: "media.bin",
    fileSize: 100,
    durationMs: kind === "image" ? 0 : 1200,
    width: 100,
    height: 200,
    status: "published",
    tags: ["treino"],
    mentions: [],
  };
}

for (const provider of ["firebase", "r2"] as const)
  for (const kind of ["image", "video"] as const)
    test(`${provider}/${kind}: modelo separado mantém a publicação renderizável pelo legado`, () => {
      const document = normalizeFirebasePostDocument(id, fixture(provider, kind));
      assert.ok(document);
      const post = publishedPostFromDocument(id, document);
      assert.equal(post.id, id);
      assert.equal(post.authorUid, authorId);
      assert.equal(post.media.kind, kind);
      assert.equal(post.media.provider, provider);
      for (const personField of ["age", "name", "city", "position", "email"])
        assert.equal(personField in post, false);
      const mediaURL = "https://example.test/media";
      const legacy = publishedPostToSubmission(post, mediaURL);
      assert.deepEqual(legacy, firebasePostToSubmission(id, document, mediaURL));
      const players = selectApprovedSubmissionPlayers([legacy], []);
      assert.equal(players.length, 1);
      assert.equal(players[0].videoUri, mediaURL);
      assert.equal(players[0].mediaType, kind);
      document.tags.push("outro");
      assert.deepEqual(post.tags, ["treino"]);
    });

test("estado não publicável e versão futura não viram publicação aprovada por fallback", () => {
  const document = fixture("r2", "image");
  for (const status of ["draft", "processing", "hidden", "rejected", "deleting", "deleted"])
    assert.equal(normalizeFirebasePostDocument(id, { ...document, status }), null);
  assert.equal(normalizeFirebasePostDocument(id, { ...document, schemaVersion: 999 }), null);
  assert.ok(normalizeFirebasePostDocument(id, { ...document, schemaVersion: 1 }));
});
