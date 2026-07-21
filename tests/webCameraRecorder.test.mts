import assert from "node:assert/strict";
import test from "node:test";
import {
  getFirstLiveVideoTrack,
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

test("encontra a faixa ativa usada pela previa da camera", () => {
  const endedTrack = { readyState: "ended" } as MediaStreamTrack;
  const liveTrack = { readyState: "live" } as MediaStreamTrack;

  assert.equal(
    getFirstLiveVideoTrack({
      getVideoTracks: () => [endedTrack, liveTrack]
    }),
    liveTrack
  );
  assert.equal(getFirstLiveVideoTrack(null), null);
});
