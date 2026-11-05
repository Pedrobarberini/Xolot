import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const gallerySource = readFileSync(
  new URL("../src/components/ProfileVideoGallery.tsx", import.meta.url),
  "utf8"
);
const profileStylesSource = readFileSync(
  new URL("../src/styles/app/profileStyles.ts", import.meta.url),
  "utf8"
);

test("galeria não reintroduz a camada de sombra legada", () => {
  assert.doesNotMatch(gallerySource, /profileGalleryCardShade/);
  assert.doesNotMatch(profileStylesSource, /profileGalleryCardShade/);
});

test("botao de opcoes preserva contraste em tamanho compacto", () => {
  assert.match(gallerySource, /MoreVertical color=\{colors\.onPrimary\} size=\{16\}/);
  assert.match(
    profileStylesSource,
    /profileGalleryMenuButton:[\s\S]*backgroundColor: "rgba\(5, 10, 7, 0\.68\)"[\s\S]*height: 26[\s\S]*width: 26/
  );
});
