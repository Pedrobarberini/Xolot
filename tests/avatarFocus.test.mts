import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_AVATAR_CROP_SCALE,
  MAX_AVATAR_CROP_SCALE,
  MIN_AVATAR_CROP_SCALE,
  getAvatarCropGeometry,
  getAvatarCropScaleFromPinch,
  getAvatarCropScaleFromTrackPosition,
  getAvatarCropTrackPosition,
  getAvatarFocusFromCropPoint
} from "../src/utils/avatarFocus.ts";

const previewSize = { height: 280, width: 324 };

test("exibe a foto inteira dentro da área de edição", () => {
  const geometry = getAvatarCropGeometry(
    50,
    50,
    DEFAULT_AVATAR_CROP_SCALE,
    previewSize,
    { height: 900, width: 1600 }
  );

  assert.equal(geometry.imageWidth, previewSize.width);
  assert.ok(geometry.imageHeight < previewSize.height);
  assert.ok(geometry.imageY > 0);
});

test("usa círculo equivalente ao recorte final do avatar", () => {
  const geometry = getAvatarCropGeometry(
    50,
    50,
    DEFAULT_AVATAR_CROP_SCALE,
    previewSize,
    { height: 900, width: 1600 }
  );

  assert.equal(
    geometry.circleRadius * 2,
    Math.min(geometry.imageWidth, geometry.imageHeight) *
      DEFAULT_AVATAR_CROP_SCALE
  );
});

test("aumenta o círculo até tocar o menor lado da imagem", () => {
  const geometry = getAvatarCropGeometry(
    50,
    50,
    MAX_AVATAR_CROP_SCALE,
    previewSize,
    { height: 900, width: 1600 }
  );

  assert.equal(
    geometry.circleRadius * 2,
    Math.min(geometry.imageWidth, geometry.imageHeight)
  );
});

test("limita o menor recorte a trinta por cento", () => {
  const geometry = getAvatarCropGeometry(
    50,
    50,
    0,
    previewSize,
    { height: 900, width: 1600 }
  );

  assert.equal(
    geometry.circleRadius * 2,
    Math.min(geometry.imageWidth, geometry.imageHeight) *
      MIN_AVATAR_CROP_SCALE
  );
});

test("mantém o círculo dentro dos limites da imagem", () => {
  const geometry = getAvatarCropGeometry(
    100,
    0,
    DEFAULT_AVATAR_CROP_SCALE,
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
    DEFAULT_AVATAR_CROP_SCALE,
    previewSize,
    { height: 900, width: 1600 }
  );
  const focus = getAvatarFocusFromCropPoint(
    geometry.circleX,
    geometry.circleY,
    DEFAULT_AVATAR_CROP_SCALE,
    previewSize,
    { height: 900, width: 1600 }
  );

  assert.ok(Math.abs(focus.focusX - 50) < 0.0001);
  assert.ok(Math.abs(focus.focusY - 50) < 0.0001);
});

test("limita toque externo ao recorte possível", () => {
  const focus = getAvatarFocusFromCropPoint(
    1000,
    -1000,
    DEFAULT_AVATAR_CROP_SCALE,
    previewSize,
    { height: 900, width: 1600 }
  );

  assert.deepEqual(focus, { focusX: 100, focusY: 0 });
});

test("mapeia slider entre trinta e cem por cento", () => {
  assert.equal(getAvatarCropScaleFromTrackPosition(0, 200), 0.3);
  assert.equal(getAvatarCropScaleFromTrackPosition(200, 200), 1);
  assert.ok(
    Math.abs(
      getAvatarCropTrackPosition(DEFAULT_AVATAR_CROP_SCALE, 200) -
        ((DEFAULT_AVATAR_CROP_SCALE - 0.3) / 0.7) * 200
    ) < 0.0001
  );
});

test("redimensiona o círculo com gesto de pinça dentro dos limites", () => {
  assert.equal(getAvatarCropScaleFromPinch(0.5, 100, 150), 0.75);
  assert.equal(getAvatarCropScaleFromPinch(0.5, 100, 20), 0.3);
  assert.equal(getAvatarCropScaleFromPinch(0.8, 100, 200), 1);
  assert.equal(getAvatarCropScaleFromPinch(0.7, 0, 150), 0.7);
});
