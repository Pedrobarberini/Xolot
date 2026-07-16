export const MIN_AVATAR_CROP_SCALE = 0.3;
export const MAX_AVATAR_CROP_SCALE = 1;
export const DEFAULT_AVATAR_CROP_SCALE = 1 / 1.22;

export type AvatarPreviewSize = {
  height: number;
  width: number;
};

export type AvatarSourceSize = {
  height: number;
  width: number;
};

export type AvatarCropGeometry = {
  circleRadius: number;
  circleX: number;
  circleY: number;
  imageHeight: number;
  imageWidth: number;
  imageX: number;
  imageY: number;
};

function clamp(value: number, minimum: number, maximum: number) {
  return Math.min(Math.max(value, minimum), maximum);
}

export function normalizeAvatarCropScale(value: number) {
  return clamp(value, MIN_AVATAR_CROP_SCALE, MAX_AVATAR_CROP_SCALE);
}

export function getAvatarCropScaleFromTrackPosition(
  positionX: number,
  trackWidth: number
) {
  const progress = trackWidth > 0 ? clamp(positionX / trackWidth, 0, 1) : 0;

  return (
    MIN_AVATAR_CROP_SCALE +
    progress * (MAX_AVATAR_CROP_SCALE - MIN_AVATAR_CROP_SCALE)
  );
}

export function getAvatarCropTrackPosition(
  cropScale: number,
  trackWidth: number
) {
  const progress =
    (normalizeAvatarCropScale(cropScale) - MIN_AVATAR_CROP_SCALE) /
    (MAX_AVATAR_CROP_SCALE - MIN_AVATAR_CROP_SCALE);

  return progress * Math.max(trackWidth, 0);
}

function getContainedImageBounds(
  previewSize: AvatarPreviewSize,
  sourceSize: AvatarSourceSize
) {
  const safeSourceWidth = Math.max(sourceSize.width, 1);
  const safeSourceHeight = Math.max(sourceSize.height, 1);
  const scale = Math.min(
    previewSize.width / safeSourceWidth,
    previewSize.height / safeSourceHeight
  );
  const imageWidth = safeSourceWidth * scale;
  const imageHeight = safeSourceHeight * scale;

  return {
    imageHeight,
    imageWidth,
    imageX: (previewSize.width - imageWidth) / 2,
    imageY: (previewSize.height - imageHeight) / 2
  };
}

export function getAvatarCropGeometry(
  focusX: number,
  focusY: number,
  cropScale: number,
  previewSize: AvatarPreviewSize,
  sourceSize: AvatarSourceSize
): AvatarCropGeometry {
  const imageBounds = getContainedImageBounds(previewSize, sourceSize);
  const circleRadius =
    (Math.min(imageBounds.imageWidth, imageBounds.imageHeight) *
      normalizeAvatarCropScale(cropScale)) /
    2;
  const horizontalTravel = Math.max(
    imageBounds.imageWidth - circleRadius * 2,
    0
  );
  const verticalTravel = Math.max(
    imageBounds.imageHeight - circleRadius * 2,
    0
  );

  return {
    ...imageBounds,
    circleRadius,
    circleX:
      imageBounds.imageX +
      circleRadius +
      horizontalTravel * (clamp(focusX, 0, 100) / 100),
    circleY:
      imageBounds.imageY +
      circleRadius +
      verticalTravel * (clamp(focusY, 0, 100) / 100)
  };
}

export function getAvatarFocusFromCropPoint(
  x: number,
  y: number,
  cropScale: number,
  previewSize: AvatarPreviewSize,
  sourceSize: AvatarSourceSize
) {
  const geometry = getAvatarCropGeometry(
    50,
    50,
    cropScale,
    previewSize,
    sourceSize
  );
  const minimumX = geometry.imageX + geometry.circleRadius;
  const maximumX =
    geometry.imageX + geometry.imageWidth - geometry.circleRadius;
  const minimumY = geometry.imageY + geometry.circleRadius;
  const maximumY =
    geometry.imageY + geometry.imageHeight - geometry.circleRadius;
  const horizontalTravel = maximumX - minimumX;
  const verticalTravel = maximumY - minimumY;

  return {
    focusX:
      horizontalTravel > 0
        ? ((clamp(x, minimumX, maximumX) - minimumX) / horizontalTravel) * 100
        : 50,
    focusY:
      verticalTravel > 0
        ? ((clamp(y, minimumY, maximumY) - minimumY) / verticalTravel) * 100
        : 50
  };
}
