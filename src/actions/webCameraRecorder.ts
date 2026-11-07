export type WebCameraRecordingResult = {
  durationMs: number;
  file: File;
  fileName: string;
  fileSize: number;
  height?: number;
  mediaType: "video";
  mimeType: string;
  uri: string;
  width?: number;
};

export type WebCameraRecordingSession = {
  result: Promise<WebCameraRecordingResult>;
  stop: () => void;
};

const WEB_VIDEO_MIME_TYPES = [
  "video/webm;codecs=vp9,opus",
  "video/webm;codecs=vp8,opus",
  "video/webm",
];

export function selectSupportedWebVideoMimeType(isTypeSupported: (mimeType: string) => boolean) {
  return WEB_VIDEO_MIME_TYPES.find(isTypeSupported) ?? "";
}

export function getWebVideoFileExtension(mimeType: string) {
  return mimeType.toLowerCase().includes("mp4") ? "mp4" : "webm";
}

export function getFirstLiveVideoTrack(source: unknown) {
  if (!source || typeof (source as { getVideoTracks?: unknown }).getVideoTracks !== "function") {
    return null;
  }

  const tracks = (source as MediaStream).getVideoTracks();
  return tracks.find((track) => track.readyState !== "ended") ?? null;
}

export async function startWebCameraRecording({
  cameraTestId,
  maxDurationMs,
  signal,
}: {
  cameraTestId: string;
  maxDurationMs: number;
  signal?: AbortSignal;
}): Promise<WebCameraRecordingSession> {
  if (
    typeof document === "undefined" ||
    typeof MediaRecorder === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    throw new Error("A gravação de vídeo não é suportada neste navegador.");
  }
  if (!Number.isFinite(maxDurationMs) || maxDurationMs <= 0 || maxDurationMs > 120_000)
    throw new Error("Duração de gravação inválida.");
  if (signal?.aborted) throw new Error("Gravação cancelada.");

  const cameraRoot =
    document.getElementById(cameraTestId) ??
    document.querySelector(`[data-testid="${cameraTestId}"]`);
  const scopedPreview =
    cameraRoot instanceof HTMLVideoElement
      ? cameraRoot
      : (cameraRoot?.querySelector("video") as HTMLVideoElement | null);
  // Nunca reutilizar a câmera de outro componente/vídeo da página.
  const preview = scopedPreview;
  const previewStream = preview?.srcObject as MediaStream | null;
  const previewVideoTrack = getFirstLiveVideoTrack(previewStream);

  if (!previewVideoTrack) {
    throw new Error("A câmera ainda não está pronta para gravar.");
  }

  let audioStream: MediaStream | null = null;

  try {
    audioStream = await navigator.mediaDevices.getUserMedia({ audio: true });
  } catch {
    audioStream = null;
  }
  if (signal?.aborted) {
    audioStream?.getTracks().forEach((track) => track.stop());
    throw new Error("Gravação cancelada.");
  }

  const recordingTracks = [...(audioStream?.getAudioTracks() ?? [])];
  try {
    recordingTracks.unshift(previewVideoTrack.clone());
  } catch (error) {
    recordingTracks.forEach((track) => track.stop());
    throw error;
  }
  let preferredMimeType = "";
  let recorder: MediaRecorder;
  try {
    preferredMimeType = selectSupportedWebVideoMimeType((mimeType) =>
      MediaRecorder.isTypeSupported(mimeType),
    );
    const recordingStream = new MediaStream(recordingTracks);
    recorder = preferredMimeType
      ? new MediaRecorder(recordingStream, { mimeType: preferredMimeType })
      : new MediaRecorder(recordingStream);
  } catch (error) {
    recordingTracks.forEach((track) => track.stop());
    throw error;
  }
  const chunks: Blob[] = [];
  const startedAt = Date.now();
  let stopTimer: ReturnType<typeof setTimeout> | null = null;
  let settled = false;
  let abortRecording: (() => void) | undefined;

  const cleanup = () => {
    if (stopTimer) {
      clearTimeout(stopTimer);
      stopTimer = null;
    }

    recordingTracks.forEach((track) => track.stop());
    if (abortRecording) signal?.removeEventListener("abort", abortRecording);
  };

  const result = new Promise<WebCameraRecordingResult>((resolve, reject) => {
    const fail = (message: string) => {
      if (settled) return;
      settled = true;
      cleanup();
      reject(new Error(message));
    };
    abortRecording = () => {
      fail("Gravação cancelada.");
      if (recorder.state !== "inactive") recorder.stop();
    };
    signal?.addEventListener("abort", abortRecording, { once: true });
    recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    });
    recorder.addEventListener(
      "error",
      () => {
        fail("O navegador não conseguiu gravar o vídeo.");
      },
      { once: true },
    );
    recorder.addEventListener(
      "stop",
      () => {
        if (settled) return;
        cleanup();

        const mimeType = recorder.mimeType || preferredMimeType || "video/webm";
        const blob = new Blob(chunks, { type: mimeType });

        if (blob.size <= 0) {
          fail("A gravação ficou vazia. Tente novamente.");
          return;
        }

        const extension = getWebVideoFileExtension(mimeType);
        const fileName = `folko-${Date.now()}.${extension}`;
        const file = new File([blob], fileName, { type: mimeType });

        settled = true;
        resolve({
          durationMs: Math.min(Date.now() - startedAt, maxDurationMs),
          file,
          fileName,
          fileSize: blob.size,
          height: preview?.videoHeight || undefined,
          mediaType: "video",
          mimeType,
          uri: URL.createObjectURL(blob),
          width: preview?.videoWidth || undefined,
        });
      },
      { once: true },
    );
    try {
      recorder.start(250);
      stopTimer = setTimeout(() => {
        if (recorder.state !== "inactive") recorder.stop();
      }, maxDurationMs);
    } catch {
      fail("O navegador não conseguiu iniciar a gravação.");
    }
  });

  return {
    result,
    stop: () => {
      if (recorder.state !== "inactive") {
        recorder.stop();
      }
    },
  };
}
