import assert from "node:assert/strict";
import test from "node:test";
import {
  DEFAULT_AVATAR_CROP_SCALE,
  DEFAULT_AVATAR_FOCUS,
  normalizeProfileAvatar,
  parseProfileAvatars,
  serializeProfileAvatars
} from "../src/repositories/profileAvatarSchema.ts";

test("migra avatar antigo salvo apenas como URI", () => {
  const avatars = parseProfileAvatars(
    JSON.stringify({ "profile-1": "data:image/jpeg;base64,foto" })
  );

  assert.deepEqual(avatars["profile-1"], {
    cropScale: DEFAULT_AVATAR_CROP_SCALE,
    focusX: DEFAULT_AVATAR_FOCUS,
    focusY: DEFAULT_AVATAR_FOCUS,
    uri: "data:image/jpeg;base64,foto"
  });
});

test("normaliza foco e dimensões inválidas", () => {
  assert.deepEqual(
    normalizeProfileAvatar({
      cropScale: 2,
      focusX: -20,
      focusY: 140,
      sourceHeight: 0,
      sourceWidth: 1200,
      uri: "foto.jpg"
    }),
    {
      cropScale: 1,
      focusX: 0,
      focusY: 100,
      sourceHeight: undefined,
      sourceWidth: 1200,
      uri: "foto.jpg"
    }
  );
});

test("preserva enquadramento na serialização", () => {
  const avatars = {
    "profile-1": {
      cropScale: 0.65,
      focusX: 100,
      focusY: 0,
      sourceHeight: 900,
      sourceWidth: 1600,
      uri: "foto.jpg"
    }
  };

  assert.deepEqual(
    parseProfileAvatars(serializeProfileAvatars(avatars)),
    avatars
  );
});
