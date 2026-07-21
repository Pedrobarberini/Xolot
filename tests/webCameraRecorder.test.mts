import assert from "node:assert/strict";
import test from "node:test";
import {
  getWebVideoFileExtension,
  selectSupportedWebVideoMimeType
} from "../src/actions/webCameraRecorder.ts";

test("seleciona o primeiro formato de video aceito pelo navegador", () => {
  assert.equal(
    selectSupportedWebVideoMimeType((mimeType) =>
      mimeType.includes("vp8")
    ),
    "video/webm;codecs=vp8,opus"
  );
});

test("permite que o MediaRecorder escolha o formato quando nenhum e aceito", () => {
  assert.equal(selectSupportedWebVideoMimeType(() => false), "");
});

test("usa uma extensao compativel com o formato escolhido pelo navegador", () => {
  assert.equal(getWebVideoFileExtension("video/mp4"), "mp4");
  assert.equal(getWebVideoFileExtension("video/webm;codecs=vp8,opus"), "webm");
});
