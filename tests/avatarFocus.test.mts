import assert from "node:assert/strict";
import test from "node:test";
import {
  AVATAR_FOCUS_MARKER_RADIUS,
  constrainAvatarFocusPoint,
  getAvatarFocusFromPoint,
  getAvatarMarkerPoint
} from "../src/utils/avatarFocus.ts";

const previewSize = { height: 210, width: 210 };

test("mapeia o centro da previa para foco central", () => {
  assert.deepEqual(getAvatarFocusFromPoint(105, 105, previewSize), {
    focusX: 50,
    focusY: 50
  });
});

test("mapeia a borda direita para o limite horizontal", () => {
  const maximumRadius =
    previewSize.width / 2 - AVATAR_FOCUS_MARKER_RADIUS - 3;

  assert.deepEqual(
    getAvatarFocusFromPoint(105 + maximumRadius, 105, previewSize),
    { focusX: 100, focusY: 50 }
  );
});

test("limita toque externo ao raio circular", () => {
  const point = constrainAvatarFocusPoint(300, 300, previewSize);
  const distance = Math.sqrt((point.x - 105) ** 2 + (point.y - 105) ** 2);

  assert.ok(Math.abs(distance - point.maximumRadius) < 0.0001);
});

test("converte foco continuo em posicao do marcador", () => {
  const marker = getAvatarMarkerPoint(75, 50, previewSize);

  assert.equal(marker.y, 105);
  assert.ok(marker.x > 105);
  assert.ok(marker.x < 210);
});
