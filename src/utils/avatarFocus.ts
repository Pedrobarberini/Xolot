export const AVATAR_DISPLAY_SCALE = 1.22;

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
  previewSize: AvatarPreviewSize,
  sourceSize: AvatarSourceSize
): AvatarCropGeometry {
  const imageBounds = getContainedImageBounds(previewSize, sourceSize);
  const circleRadius =
    Math.min(imageBounds.imageWidth, imageBounds.imageHeight) /
    (2 * AVATAR_DISPLAY_SCALE);
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
  previewSize: AvatarPreviewSize,
  sourceSize: AvatarSourceSize
) {
  const geometry = getAvatarCropGeometry(50, 50, previewSize, sourceSize);
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
