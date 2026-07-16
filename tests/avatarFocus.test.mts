import assert from "node:assert/strict";
import test from "node:test";
import {
  AVATAR_DISPLAY_SCALE,
  getAvatarCropGeometry,
  getAvatarFocusFromCropPoint
} from "../src/utils/avatarFocus.ts";

const previewSize = { height: 280, width: 324 };

test("exibe a foto inteira dentro da area de edicao", () => {
  const geometry = getAvatarCropGeometry(
    50,
    50,
    previewSize,
    { height: 900, width: 1600 }
  );

  assert.equal(geometry.imageWidth, previewSize.width);
  assert.ok(geometry.imageHeight < previewSize.height);
  assert.ok(geometry.imageY > 0);
});

test("usa circulo equivalente ao recorte final do avatar", () => {
  const geometry = getAvatarCropGeometry(
    50,
    50,
    previewSize,
    { height: 900, width: 1600 }
  );

  assert.equal(
    geometry.circleRadius * 2,
    Math.min(geometry.imageWidth, geometry.imageHeight) / AVATAR_DISPLAY_SCALE
  );
});

test("mantem o circulo dentro dos limites da imagem", () => {
  const geometry = getAvatarCropGeometry(
    100,
    0,
    previewSize,
    { height: 1600, width: 900 }
  );

  assert.ok(geometry.circleX + geometry.circleRadius <= geometry.imageX + geometry.imageWidth);
  assert.ok(geometry.circleY - geometry.circleRadius >= geometry.imageY);
});

test("mapeia toque no centro para foco central", () => {
  const geometry = getAvatarCropGeometry(
    50,
    50,
    previewSize,
    { height: 900, width: 1600 }
  );
  const focus = getAvatarFocusFromCropPoint(
    geometry.circleX,
    geometry.circleY,
    previewSize,
    { height: 900, width: 1600 }
  );

  assert.ok(Math.abs(focus.focusX - 50) < 0.0001);
  assert.ok(Math.abs(focus.focusY - 50) < 0.0001);
});

test("limita toque externo ao recorte possivel", () => {
  const focus = getAvatarFocusFromCropPoint(
    1000,
    -1000,
    previewSize,
    { height: 900, width: 1600 }
  );

  assert.deepEqual(focus, { focusX: 100, focusY: 0 });
});
