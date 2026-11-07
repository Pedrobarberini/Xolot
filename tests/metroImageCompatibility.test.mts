import assert from "node:assert/strict";
import { createRequire } from "node:module";
import { resolve } from "node:path";
import test from "node:test";
const require = createRequire(import.meta.url);
const { getAssetData } = require("metro/private/Assets");
const expoRequire = createRequire(require.resolve("@expo/metro/package.json"));
const expoAssets = expoRequire("metro/private/Assets");

test("Metro lê dimensões de PNGs reais com image-size atualizado, incluindo transparência", async () => {
  for (const reader of [getAssetData, expoAssets.getAssetData]) {
    for (const file of ["folko-primary-transparent.png", "folko-symbol-transparent.png"]) {
      const asset = await reader(
        resolve("assets/brand", file),
        "assets/brand/" + file,
        [],
        null,
        "/assets",
      );
      assert.equal(asset.type, "png");
      assert.ok(asset.width > 0 && asset.height > 0);
      assert.equal(asset.scales.length, asset.files.length);
    }
  }
});
