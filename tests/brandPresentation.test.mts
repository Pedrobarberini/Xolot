import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { BRAND } from "../src/config/brand.ts";
import { lightColors, darkColors } from "../src/shared/theme/tokens.ts";

const json = (file: string) => JSON.parse(readFileSync(new URL(file, import.meta.url), "utf8"));
const luminance = (hex: string) => {
  const rgb = [1, 3, 5]
    .map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255)
    .map((value) => (value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722;
};
const contrast = (first: string, second: string) => {
  const a = luminance(first),
    b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
};

test("identidade pública Folko conserva IDs instalados e configura ícones reais", async () => {
  const app = json("../app.json").expo;
  const manifest = json("../public/manifest.json");
  assert.equal(app.name, BRAND.name);
  assert.equal(manifest.name, BRAND.name);
  assert.equal(app.web.name, manifest.name);
  assert.equal(app.slug, "xolot");
  assert.equal(app.scheme, "xolot");
  assert.equal(manifest.id, "./");
  assert.equal(manifest.start_url, "./");
  assert.ok(manifest.categories.includes("social"));
  for (const icon of manifest.icons) {
    const bytes = readFileSync(new URL(`../public/${icon.src}`, import.meta.url));
    assert.equal(`${bytes.readUInt32BE(16)}x${bytes.readUInt32BE(20)}`, icon.sizes);
  }
  const native = readFileSync(new URL(`../${app.icon.replace(/^\.\//, "")}`, import.meta.url));
  assert.equal(native.readUInt32BE(16), 1024);
  assert.equal(native.readUInt32BE(20), 1024);
  assert.equal(app.splash.image, "./assets/brand/folko-primary-transparent.png");
  for (const [file, hash] of [
    [
      "folko-primary-original.png",
      "d122631ee60eee9d14f62fc412be88c3d259eb6579756911da7e8b5df6f3eadd",
    ],
    [
      "folko-horizontal-original.png",
      "09f51a4ef08dbca65c207ba591d1ea29953fab7e1e492f8184423b9ff8823c97",
    ],
  ]) {
    assert.equal(
      createHash("sha256")
        .update(readFileSync(new URL(`../assets/brand/${file}`, import.meta.url)))
        .digest("hex"),
      hash,
    );
  }
  const display = json("../assets/brand/display-logos.json");
  const requireExpo = createRequire(new URL("../node_modules/expo/package.json", import.meta.url));
  const { getPngInfo } = requireExpo("@expo/image-utils");
  for (const asset of display.outputs) {
    const bytes = readFileSync(new URL(`../${asset.file}`, import.meta.url));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), asset.outputSha256);
    const png = await getPngInfo(fileURLToPath(new URL(`../${asset.file}`, import.meta.url)));
    assert.equal(png.data[3], 0);
    assert.equal(png.width, asset.width);
    assert.equal(png.height, asset.height);
    const counters =
      asset.usage === "header_feed"
        ? [
            [780, 630],
            [1300, 630],
          ]
        : [
            [495, 915],
            [915, 915],
          ];
    for (const [x, y] of counters) {
      const pixel = ((y - asset.sourceRect[1]) * png.width + x - asset.sourceRect[0]) * 4;
      assert.equal(png.data[pixel + 3], 0, "Fundo do interior das letras realmente transparente");
    }
    assert.equal(asset.rgbPixelsChanged, 0);
  }
  const splashPlugin = app.plugins.find(
    (plugin: unknown) => Array.isArray(plugin) && plugin[0] === "expo-splash-screen",
  );
  assert.equal(splashPlugin[1].image, app.splash.image);
  assert.equal(splashPlugin[1].backgroundColor, app.splash.backgroundColor);
});

test("três artes finais são preservadas, com recortes transparentes fiéis e derivados rastreáveis", async () => {
  const provenance = json("../assets/brand/provenance.json");
  const original = readFileSync(new URL(`../${provenance.source}`, import.meta.url));
  assert.equal(
    createHash("sha256").update(original).digest("hex"),
    "7465f9e6b156b75251f65448b5ce07d273342d7ae956e55b27ff0cb35fb1c580",
  );
  assert.equal(provenance.sha256, createHash("sha256").update(original).digest("hex"));
  const expected = [
    "7465f9e6b156b75251f65448b5ce07d273342d7ae956e55b27ff0cb35fb1c580",
    "8a41364005a0cbb24872f6fd700390eb1ffba4d87322febf535c830dbb9db957",
    "891a69a406b2dbdb4755126513172e245c4b7400266046eef40424938f00c988",
  ];
  assert.equal(provenance.originals.length, expected.length);
  provenance.originals.forEach((asset: { file: string; sha256: string }, index: number) => {
    const bytes = readFileSync(new URL(`../${asset.file}`, import.meta.url));
    assert.equal(createHash("sha256").update(bytes).digest("hex"), expected[index]);
    assert.equal(asset.sha256, expected[index]);
  });
  const requireExpo = createRequire(new URL("../node_modules/expo/package.json", import.meta.url));
  const { getPngInfo } = requireExpo("@expo/image-utils");
  const source = await getPngInfo(
    fileURLToPath(new URL(`../${provenance.presentation.source}`, import.meta.url)),
  );
  for (const asset of provenance.presentation.outputs) {
    const url = new URL(`../${asset.file}`, import.meta.url);
    const png = await getPngInfo(fileURLToPath(url));
    assert.equal(png.width, asset.width);
    assert.equal(png.height, asset.height);
    assert.equal(png.data[3], 0, "Canto realmente transparente");
    assert.equal(createHash("sha256").update(readFileSync(url)).digest("hex"), asset.sha256);
    let visible = 0;
    for (let y = 0; y < png.height; y++)
      for (let x = 0; x < png.width; x++) {
        const pixel = (y * png.width + x) * 4;
        if (!png.data[pixel + 3]) continue;
        const originalPixel =
          ((y + asset.sourceRect[1]) * source.width + x + asset.sourceRect[0]) * 4;
        assert.deepEqual(
          png.data.subarray(pixel, pixel + 3),
          source.data.subarray(originalPixel, originalPixel + 3),
        );
        visible++;
      }
    assert.equal(visible, asset.visiblePixels);
    for (const [sourceX, sourceY] of [
      [630, 313],
      [925, 395],
    ]) {
      const pixel =
        ((sourceY - asset.sourceRect[1]) * png.width + sourceX - asset.sourceRect[0]) * 4;
      assert.equal(png.data[pixel + 3], 255, "Olho e ponta escura do bico preservados");
    }
  }
  for (const [file, hash] of Object.entries(provenance.derivatives)) {
    assert.equal(
      createHash("sha256")
        .update(readFileSync(new URL(`../${file}`, import.meta.url)))
        .digest("hex"),
      hash,
    );
  }
});

test("paletas do logo mantêm contraste de texto/ação e tokens legados distinguíveis", () => {
  for (const palette of [lightColors, darkColors]) {
    for (const [foreground, background] of [
      [palette.text, palette.surface],
      [palette.muted, palette.surface],
      [palette.primaryText, palette.surface],
      [palette.primaryText, palette.primarySoft],
      [palette.onPrimary, palette.primary],
      [palette.onAccent, palette.accent],
    ])
      assert.ok(
        contrast(foreground, background) >= 4.5,
        `${foreground} / ${background} sem contraste mínimo`,
      );
  }
  // A fachada de estilos reconhece o token pela cor da paleta clara.
  assert.equal(new Set(Object.values(lightColors)).size, Object.keys(lightColors).length);
});
