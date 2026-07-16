export const AVATAR_FOCUS_MARKER_RADIUS = 16;

export type AvatarPreviewSize = {
  height: number;
  width: number;
};

function getMaximumRadius(size: AvatarPreviewSize) {
  return Math.max(
    Math.min(size.width, size.height) / 2 -
      AVATAR_FOCUS_MARKER_RADIUS -
      3,
    1
  );
}

export function constrainAvatarFocusPoint(
  x: number,
  y: number,
  size: AvatarPreviewSize
) {
  const centerX = size.width / 2;
  const centerY = size.height / 2;
  const maximumRadius = getMaximumRadius(size);
  const offsetX = x - centerX;
  const offsetY = y - centerY;
  const distance = Math.sqrt(offsetX ** 2 + offsetY ** 2);

  if (distance <= maximumRadius) {
    return { maximumRadius, x, y };
  }

  const scale = maximumRadius / Math.max(distance, 1);

  return {
    maximumRadius,
    x: centerX + offsetX * scale,
    y: centerY + offsetY * scale
  };
}

export function getAvatarFocusFromPoint(
  x: number,
  y: number,
  size: AvatarPreviewSize
) {
  const point = constrainAvatarFocusPoint(x, y, size);
  const centerX = size.width / 2;
  const centerY = size.height / 2;

  return {
    focusX: Math.min(
      Math.max(50 + ((point.x - centerX) / point.maximumRadius) * 50, 0),
      100
    ),
    focusY: Math.min(
      Math.max(50 + ((point.y - centerY) / point.maximumRadius) * 50, 0),
      100
    )
  };
}

export function getAvatarMarkerPoint(
  focusX: number,
  focusY: number,
  size: AvatarPreviewSize
) {
  const maximumRadius = getMaximumRadius(size);
  const x = size.width / 2 + ((focusX - 50) / 50) * maximumRadius;
  const y = size.height / 2 + ((focusY - 50) / 50) * maximumRadius;

  return constrainAvatarFocusPoint(x, y, size);
}
