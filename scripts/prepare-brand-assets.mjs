import { readFileSync, writeFileSync, mkdirSync, copyFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { createRequire } from "node:module";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repository = resolve(dirname(fileURLToPath(import.meta.url)), "..");
// Pipeline de assets já fornecido pelo Expo; preserva a arte original.
const requireExpo = createRequire(join(repository, "node_modules/expo/package.json"));
const { generateImageAsync, generateImageBackgroundAsync, compositeImagesAsync } =
  requireExpo("@expo/image-utils");
const source = "assets/brand/folko-logo.png";
const iconSource = "assets/brand/folko-symbol-transparent.png";
const originals = [
  [source, "codex-clipboard-3b264d66-150a-4f28-8c9e-c43480c50e2f.png", "ícone"],
  [
    "assets/brand/folko-horizontal.png",
    "codex-clipboard-29d0a65b-5f32-4b06-9455-1223db9fe2a5.png",
    "assinatura horizontal",
  ],
  [
    "assets/brand/folko-stacked.png",
    "codex-clipboard-ab3fa99a-a11d-42c7-a1d5-f545e6ce61d7.png",
    "assinatura vertical",
  ],
].map(([file, filename, role]) => {
  const bytes = readFileSync(join(repository, file));
  return {
    file,
    filename,
    role,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20),
  };
});
const variants = [
  ["assets/brand/folko-app-icon.png", 1024, 112],
  ["assets/brand/folko-adaptive-icon.png", 1024, 128, true],
  ["public/icons/folko-icon-192.png", 192, 20],
  ["public/icons/folko-icon-512.png", 512, 56],
  ["public/icons/folko-maskable-512.png", 512, 80],
  ["public/icons/folko-apple-touch-icon.png", 180, 18],
];
const hashes = {};
for (const [destination, size, padding, transparent = false] of variants) {
  const backgroundColor = transparent ? "transparent" : "#090A0F";
  const output = await generateImageAsync(
    { projectRoot: repository },
    {
      src: join(repository, iconSource),
      width: size - padding * 2,
      height: size - padding * 2,
      resizeMode: "contain",
      backgroundColor,
      removeTransparency: !transparent,
    },
  );
  const bytes = padding
    ? await compositeImagesAsync({
        foreground: output.source,
        background: await generateImageBackgroundAsync({
          width: size,
          height: size,
          backgroundColor,
          removeTransparency: !transparent,
        }),
        x: padding,
        y: padding,
      })
    : output.source;
  mkdirSync(dirname(join(repository, destination)), { recursive: true });
  writeFileSync(join(repository, destination), bytes);
  hashes[destination] = createHash("sha256").update(bytes).digest("hex");
}
const compatibilityIcons = {
  "public/icons/icon-192.png": "public/icons/folko-icon-192.png",
  "public/icons/icon-512.png": "public/icons/folko-icon-512.png",
  "public/icons/apple-touch-icon.png": "public/icons/folko-apple-touch-icon.png",
};
for (const [destination, current] of Object.entries(compatibilityIcons))
  copyFileSync(join(repository, current), join(repository, destination));
const sourceBytes = readFileSync(join(repository, source));
writeFileSync(
  join(repository, "assets/brand/provenance.json"),
  JSON.stringify(
    {
      brand: "Folko",
      receivedAt: "2026-11-05",
      source,
      iconSource,
      presentation: JSON.parse(
        readFileSync(join(repository, "assets/brand/presentation.json"), "utf8"),
      ),
      compatibilityIcons,
      sourceFilename: "codex-clipboard-3b264d66-150a-4f28-8c9e-c43480c50e2f.png",
      sha256: createHash("sha256").update(sourceBytes).digest("hex"),
      width: sourceBytes.readUInt32BE(16),
      height: sourceBytes.readUInt32BE(20),
      supersedes: ["Folko WPP.png", "Folko Logan.png"],
      originals,
      processing:
        "Originais preservados. Recorte por cor autorizado, preservando pixels RGB visíveis da arte horizontal. Ícones escuros e adaptive com alpha; fonte única para manter pena e bico consistentes.",
      derivatives: hashes,
    },
    null,
    2,
  ) + "\n",
);
console.log(`${variants.length} ícones gerados; ${originals.length} artes finais preservadas.`);
