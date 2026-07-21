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
  "video/webm"
];

export function selectSupportedWebVideoMimeType(
  isTypeSupported: (mimeType: string) => boolean
) {
  return WEB_VIDEO_MIME_TYPES.find(isTypeSupported) ?? "";
}

export function getWebVideoFileExtension(mimeType: string) {
  return mimeType.toLowerCase().includes("mp4") ? "mp4" : "webm";
}

export function getFirstLiveVideoTrack(source: unknown) {
  if (
    !source ||
    typeof (source as { getVideoTracks?: unknown }).getVideoTracks !==
      "function"
  ) {
    return null;
  }

  const tracks = (source as MediaStream).getVideoTracks();
  return tracks.find((track) => track.readyState !== "ended") ?? null;
}

export async function startWebCameraRecording({
  cameraTestId,
  maxDurationMs
}: {
  cameraTestId: string;
  maxDurationMs: number;
}): Promise<WebCameraRecordingSession> {
  if (
    typeof document === "undefined" ||
    typeof MediaRecorder === "undefined" ||
    !navigator.mediaDevices?.getUserMedia
  ) {
    throw new Error("A gravação de vídeo não é suportada neste navegador.");
  }

  const cameraRoot =
    document.getElementById(cameraTestId) ??
    document.querySelector(`[data-testid="${cameraTestId}"]`);
  const scopedPreview =
    cameraRoot instanceof HTMLVideoElement
      ? cameraRoot
      : (cameraRoot?.querySelector("video") as HTMLVideoElement | null);
  const previewCandidates = [
    scopedPreview,
    ...Array.from(document.querySelectorAll("video"))
  ].filter((candidate): candidate is HTMLVideoElement => Boolean(candidate));
  const preview = previewCandidates.find((candidate) =>
    getFirstLiveVideoTrack(candidate.srcObject)
  );
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

  const recordingTracks = [
    previewVideoTrack.clone(),
    ...(audioStream?.getAudioTracks() ?? [])
  ];
  const recordingStream = new MediaStream(recordingTracks);
  const preferredMimeType = selectSupportedWebVideoMimeType((mimeType) =>
    MediaRecorder.isTypeSupported(mimeType)
  );
  const recorder = preferredMimeType
    ? new MediaRecorder(recordingStream, { mimeType: preferredMimeType })
    : new MediaRecorder(recordingStream);
  const chunks: Blob[] = [];
  const startedAt = Date.now();
  let stopTimer: ReturnType<typeof setTimeout> | null = null;

  const cleanup = () => {
    if (stopTimer) {
      clearTimeout(stopTimer);
      stopTimer = null;
    }

    recordingTracks.forEach((track) => track.stop());
  };

  const result = new Promise<WebCameraRecordingResult>((resolve, reject) => {
    recorder.addEventListener("dataavailable", (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data);
      }
    });
    recorder.addEventListener(
      "error",
      () => {
        cleanup();
        reject(new Error("O navegador não conseguiu gravar o vídeo."));
      },
      { once: true }
    );
    recorder.addEventListener(
      "stop",
      () => {
        cleanup();

        const mimeType = recorder.mimeType || preferredMimeType || "video/webm";
        const blob = new Blob(chunks, { type: mimeType });

        if (blob.size <= 0) {
          reject(new Error("A gravação ficou vazia. Tente novamente."));
          return;
        }

        const extension = getWebVideoFileExtension(mimeType);
        const fileName = `xolot-${Date.now()}.${extension}`;
        const file = new File([blob], fileName, { type: mimeType });

        resolve({
          durationMs: Math.min(Date.now() - startedAt, maxDurationMs),
          file,
          fileName,
          fileSize: blob.size,
          height: preview?.videoHeight || undefined,
          mediaType: "video",
          mimeType,
          uri: URL.createObjectURL(blob),
          width: preview?.videoWidth || undefined
        });
      },
      { once: true }
    );
  });

  recorder.start(250);
  stopTimer = setTimeout(() => {
    if (recorder.state !== "inactive") {
      recorder.stop();
    }
  }, maxDurationMs);

  return {
    result,
    stop: () => {
      if (recorder.state !== "inactive") {
        recorder.stop();
      }
    }
  };
}
