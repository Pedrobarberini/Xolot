import { createRequire } from "node:module";
import { readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repository = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const requireExpo = createRequire(join(repository, "node_modules/expo/package.json"));
const { getJimpImageAsync } = requireExpo("@expo/image-utils/build/jimp");
const source = "assets/brand/folko-horizontal.png";
const sourceSha256 = createHash("sha256")
  .update(readFileSync(join(repository, source)))
  .digest("hex");
if (sourceSha256 !== "8a41364005a0cbb24872f6fd700390eb1ffba4d87322febf535c830dbb9db957") {
  throw new Error(
    "A arte de referência mudou. Revise a máscara e as regiões do olho antes de extrair.",
  );
}
const image = await getJimpImageAsync(join(repository, source));
const { width, height, data } = image.bitmap;
const count = width * height;
const labels = new Uint32Array(count);
const queue = new Uint32Array(count);
const background = [...data.subarray(0, 3)];
const foreground = (index) =>
  Math.max(...background.map((value, channel) => Math.abs(data[index * 4 + channel] - value))) > 12;
const components = [];
let nextLabel = 0;
for (let start = 0; start < count; start++) {
  if (labels[start] || !foreground(start)) continue;
  const id = ++nextLabel;
  let head = 0,
    tail = 1;
  queue[0] = start;
  labels[start] = id;
  while (head < tail) {
    const index = queue[head++],
      x = index % width,
      y = Math.floor(index / width);
    for (const adjacent of [
      x ? index - 1 : -1,
      x < width - 1 ? index + 1 : -1,
      y ? index - width : -1,
      y < height - 1 ? index + width : -1,
    ]) {
      if (adjacent < 0 || labels[adjacent] || !foreground(adjacent)) continue;
      labels[adjacent] = id;
      queue[tail++] = adjacent;
    }
  }
  components.push({ id, pixels: tail });
}
components.sort((first, second) => second.pixels - first.pixels);
const outputs = [];
// The supplied horizontal art is the single symbol reference: no regenerated feather/beak.
for (const [role, destination, selected] of [
  [
    "symbol",
    "assets/brand/folko-symbol-transparent.png",
    new Set(components.slice(0, 2).map((item) => item.id)),
  ],
  [
    "horizontal",
    "assets/brand/folko-horizontal-transparent.png",
    new Set(components.filter((item) => item.pixels >= 100).map((item) => item.id)),
  ],
]) {
  const copy = image.clone();
  let left = width,
    top = height,
    right = 0,
    bottom = 0,
    visible = 0;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const index = y * width + x;
      // Preserve the eye's original black pixels; the lettering counters remain transparent.
      const eye = ((x - 630) / 28) ** 2 + ((y - 313) / 28) ** 2 <= 1;
      const keep = selected.has(labels[index]) || eye;
      copy.bitmap.data[index * 4 + 3] = keep ? 255 : 0;
      if (!keep) {
        copy.bitmap.data.fill(0, index * 4, index * 4 + 4);
        continue;
      }
      visible++;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  const margin = 24;
  let cropWidth = right - left + 1 + margin * 2,
    cropHeight = bottom - top + 1 + margin * 2;
  if (role === "symbol") cropWidth = cropHeight = Math.max(cropWidth, cropHeight);
  const cropLeft = Math.floor((left + right + 1 - cropWidth) / 2);
  const cropTop = Math.floor((top + bottom + 1 - cropHeight) / 2);
  copy.crop(cropLeft, cropTop, cropWidth, cropHeight);
  copy.colorType(6);
  const bytes = await copy.getBufferAsync("image/png");
  const decoded = await getJimpImageAsync(bytes);
  let rgbPixelsChanged = 0;
  for (let y = 0; y < cropHeight; y++)
    for (let x = 0; x < cropWidth; x++) {
      const pixel = (y * cropWidth + x) * 4;
      if (!decoded.bitmap.data[pixel + 3]) continue;
      const originalPixel = ((y + cropTop) * width + x + cropLeft) * 4;
      if (
        [0, 1, 2].some(
          (channel) => decoded.bitmap.data[pixel + channel] !== data[originalPixel + channel],
        )
      )
        rgbPixelsChanged++;
    }
  if (rgbPixelsChanged) throw new Error("Logo extraction altered visible source pixels.");
  writeFileSync(join(repository, destination), bytes);
  outputs.push({
    role,
    file: destination,
    width: cropWidth,
    height: cropHeight,
    sourceRect: [cropLeft, cropTop, cropWidth, cropHeight],
    visiblePixels: visible,
    sha256: createHash("sha256").update(bytes).digest("hex"),
    rgbPixelsChanged,
  });
}
writeFileSync(
  join(repository, "assets/brand/presentation.json"),
  JSON.stringify(
    {
      source,
      sourceSha256: createHash("sha256")
        .update(readFileSync(join(repository, source)))
        .digest("hex"),
      method:
        "Owner-authorized color extraction. Only alpha and framing change; RGB comes directly from the original horizontal art. AI cutouts rejected; original eye, feather and beak preserved.",
      background,
      threshold: 12,
      outputs,
    },
    null,
    2,
  ) + "\n",
);
console.log(JSON.stringify(outputs, null, 2));
