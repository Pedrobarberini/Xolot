import assert from "node:assert/strict";
import test from "node:test";
import {
  createLocalVideoReference,
  getLocalVideoStorageKey,
  isEphemeralBrowserVideoUri
} from "../src/utils/videoMediaReference.ts";

test("cria e recupera uma referência local de vídeo", () => {
  const reference = createLocalVideoReference("video-123/arquivo principal");

  assert.equal(
    getLocalVideoStorageKey(reference),
    "video-123/arquivo principal"
  );
});

test("ignora links remotos e referências locais inválidas", () => {
  assert.equal(getLocalVideoStorageKey("https://cdn.test/vídeo.mp4"), null);
  assert.equal(getLocalVideoStorageKey("nextstar-video:"), null);
  assert.equal(getLocalVideoStorageKey("nextstar-video:%E0%A4%A"), null);
});

test("identifica URL temporária criada pelo navegador", () => {
  assert.equal(isEphemeralBrowserVideoUri("blob:https://nextstar.test/123"), true);
  assert.equal(isEphemeralBrowserVideoUri("https://nextstar.test/video.mp4"), false);
});
