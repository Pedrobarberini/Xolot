import assert from "node:assert/strict";
import test, { afterEach } from "node:test";
import {
  getFirstLiveVideoTrack,
  getWebVideoFileExtension,
  selectSupportedWebVideoMimeType,
  startWebCameraRecording,
} from "../src/actions/webCameraRecorder.ts";

test("seleciona o primeiro formato de video aceito pelo navegador", () => {
  assert.equal(
    selectSupportedWebVideoMimeType((mimeType) => mimeType.includes("vp8")),
    "video/webm;codecs=vp8,opus",
  );
});

const globals = [
  "document",
  "navigator",
  "HTMLVideoElement",
  "MediaStream",
  "MediaRecorder",
] as const;
const original = new Map(
  globals.map((name) => [name, Object.getOwnPropertyDescriptor(globalThis, name)]),
);
afterEach(() => {
  for (const name of globals) {
    const descriptor = original.get(name);
    if (descriptor) Object.defineProperty(globalThis, name, descriptor);
    else Reflect.deleteProperty(globalThis, name);
  }
});
function browser(
  options: {
    constructorFails?: boolean;
    startFails?: boolean;
    missingCamera?: boolean;
    audio?: () => Promise<unknown>;
  } = {},
) {
  const clone = {
    stopped: 0,
    stop() {
      this.stopped++;
    },
  };
  const microphone = {
    stopped: 0,
    stop() {
      this.stopped++;
    },
  };
  const source = {
    readyState: "live",
    stopped: 0,
    clone: () => clone,
    stop() {
      this.stopped++;
    },
  };
  class Video {
    srcObject = { getVideoTracks: () => [source] };
    videoHeight = 720;
    videoWidth = 1280;
  }
  class Stream {
    tracks: unknown[];
    constructor(tracks: unknown[]) {
      this.tracks = tracks;
    }
  }
  class Recorder extends EventTarget {
    static isTypeSupported = () => true;
    state = "inactive";
    mimeType = "video/webm";
    constructor(_stream: unknown) {
      super();
      if (options.constructorFails) throw new Error("constructor");
    }
    start() {
      if (options.startFails) throw new Error("start");
      this.state = "recording";
    }
    stop() {
      this.state = "inactive";
      queueMicrotask(() => {
        const event = new Event("dataavailable");
        Object.defineProperty(event, "data", { value: new Blob(["video"]) });
        this.dispatchEvent(event);
        this.dispatchEvent(new Event("stop"));
      });
    }
  }
  const video = new Video();
  const values = {
    document: {
      getElementById: () => (options.missingCamera ? null : video),
      querySelector: () => null,
      querySelectorAll: () => {
        throw new Error("não capturar vídeo alheio");
      },
    },
    navigator: {
      mediaDevices: {
        getUserMedia:
          options.audio ??
          (async () => ({ getAudioTracks: () => [microphone], getTracks: () => [microphone] })),
      },
    },
    HTMLVideoElement: Video,
    MediaStream: Stream,
    MediaRecorder: Recorder,
  };
  for (const name of globals)
    Object.defineProperty(globalThis, name, { configurable: true, value: values[name] });
  return { clone, microphone, source };
}

test("falha ao construir ou iniciar o gravador libera microfone e clone; preserva a prévia", async () => {
  const failed = browser({ constructorFails: true });
  await assert.rejects(
    startWebCameraRecording({ cameraTestId: "camera", maxDurationMs: 1000 }),
    /constructor/,
  );
  assert.equal(failed.clone.stopped, 1);
  assert.equal(failed.microphone.stopped, 1);
  assert.equal(failed.source.stopped, 0);
  const started = browser({ startFails: true });
  const session = await startWebCameraRecording({ cameraTestId: "camera", maxDurationMs: 1000 });
  await assert.rejects(session.result, /iniciar/);
  assert.equal(started.clone.stopped, 1);
  assert.equal(started.microphone.stopped, 1);
});

test("saída da tela cancela gravação e também libera microfone cuja permissão chegou tarde", async () => {
  const tracks = browser();
  const abort = new AbortController();
  const session = await startWebCameraRecording({
    cameraTestId: "camera",
    maxDurationMs: 1000,
    signal: abort.signal,
  });
  const result = assert.rejects(session.result, /cancelada/);
  abort.abort();
  await result;
  assert.equal(tracks.clone.stopped, 1);
  assert.equal(tracks.microphone.stopped, 1);
  let deliver!: (value: unknown) => void;
  const lateMic = {
    stopped: false,
    stop() {
      this.stopped = true;
    },
  };
  browser({
    audio: () =>
      new Promise((resolve) => {
        deliver = resolve;
      }),
  });
  const lateAbort = new AbortController();
  const pending = startWebCameraRecording({
    cameraTestId: "camera",
    maxDurationMs: 1000,
    signal: lateAbort.signal,
  });
  lateAbort.abort();
  deliver({ getTracks: () => [lateMic] });
  await assert.rejects(pending, /cancelada/);
  assert.equal(lateMic.stopped, true);
});

test("permissão de áudio negada permite vídeo mudo; stop duplicado não cria dois arquivos", async () => {
  const tracks = browser({
    audio: async () => {
      throw new Error("permission denied");
    },
  });
  const session = await startWebCameraRecording({ cameraTestId: "camera", maxDurationMs: 1000 });
  session.stop();
  session.stop();
  const media = await session.result;
  assert.equal(media.fileSize, 5);
  assert.equal(media.width, 1280);
  URL.revokeObjectURL(media.uri);
  assert.equal(tracks.clone.stopped, 1);
  assert.equal(tracks.source.stopped, 0);
});

test("câmera ainda indisponível nunca usa outro vídeo da página", async () => {
  browser({ missingCamera: true });
  await assert.rejects(
    startWebCameraRecording({ cameraTestId: "camera", maxDurationMs: 1000 }),
    /não está pronta/,
  );
});

test("permite que o MediaRecorder escolha o formato quando nenhum e aceito", () => {
  assert.equal(
    selectSupportedWebVideoMimeType(() => false),
    "",
  );
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
      getVideoTracks: () => [endedTrack, liveTrack],
    }),
    liveTrack,
  );
  assert.equal(getFirstLiveVideoTrack(null), null);
});
