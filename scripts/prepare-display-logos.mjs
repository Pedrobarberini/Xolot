import { createRequire } from "node:module";
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repository = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const requireExpo = createRequire(join(repository, "node_modules/expo/package.json"));
const { getJimpImageAsync } = requireExpo("@expo/image-utils/build/jimp");
const inputs = [
  {
    source: "assets/brand/folko-primary-original.png",
    file: "assets/brand/folko-primary-transparent.png",
    receivedFilename: "Folko logo 1.png",
    sha256: "d122631ee60eee9d14f62fc412be88c3d259eb6579756911da7e8b5df6f3eadd",
    eye: [659, 389, 26],
    usage: "entrada_cadastro_abertura",
  },
  {
    source: "assets/brand/folko-horizontal-original.png",
    file: "assets/brand/folko-horizontal-display-transparent.png",
    receivedFilename: "Folko Logo 2.png",
    sha256: "09f51a4ef08dbca65c207ba591d1ea29953fab7e1e492f8184423b9ff8823c97",
    eye: [630, 313, 28],
    usage: "header_feed",
  },
];
const outputs = [];
for (const input of inputs) {
  const originalBytes = readFileSync(join(repository, input.source));
  if (createHash("sha256").update(originalBytes).digest("hex") !== input.sha256)
    throw new Error("A arte original mudou; revise a extração.");
  const original = await getJimpImageAsync(originalBytes);
  const { width, height, data } = original.bitmap;
  const background = [...data.subarray(0, 3)];
  const labels = new Uint32Array(width * height),
    queue = new Uint32Array(width * height);
  const foreground = (pixel) =>
    Math.max(...background.map((value, channel) => Math.abs(data[pixel * 4 + channel] - value))) >
    12;
  const keepLabels = new Set();
  let nextLabel = 0;
  for (let start = 0; start < labels.length; start++) {
    if (labels[start] || !foreground(start)) continue;
    const id = ++nextLabel;
    let head = 0,
      tail = 1;
    labels[start] = id;
    queue[0] = start;
    while (head < tail) {
      const pixel = queue[head++],
        x = pixel % width,
        y = Math.floor(pixel / width);
      for (const adjacent of [
        x ? pixel - 1 : -1,
        x < width - 1 ? pixel + 1 : -1,
        y ? pixel - width : -1,
        y < height - 1 ? pixel + width : -1,
      ]) {
        if (adjacent < 0 || labels[adjacent] || !foreground(adjacent)) continue;
        labels[adjacent] = id;
        queue[tail++] = adjacent;
      }
    }
    if (tail >= 80) keepLabels.add(id);
  }
  const extracted = original.clone();
  let left = width,
    top = height,
    right = 0,
    bottom = 0,
    visiblePixels = 0;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++) {
      const pixel = y * width + x;
      const eye =
        ((x - input.eye[0]) / input.eye[2]) ** 2 + ((y - input.eye[1]) / input.eye[2]) ** 2 <= 1;
      if (!keepLabels.has(labels[pixel]) && !eye) {
        extracted.bitmap.data.fill(0, pixel * 4, pixel * 4 + 4);
        continue;
      }
      extracted.bitmap.data[pixel * 4 + 3] = 255;
      visiblePixels++;
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  const margin = 24,
    x = left - margin,
    y = top - margin;
  const cropWidth = right - left + 1 + 2 * margin,
    cropHeight = bottom - top + 1 + 2 * margin;
  extracted.crop(x, y, cropWidth, cropHeight).colorType(6);
  const bytes = await extracted.getBufferAsync("image/png"),
    decoded = await getJimpImageAsync(bytes);
  let rgbPixelsChanged = 0;
  for (let row = 0; row < cropHeight; row++)
    for (let column = 0; column < cropWidth; column++) {
      const pixel = (row * cropWidth + column) * 4;
      if (!decoded.bitmap.data[pixel + 3]) continue;
      const sourcePixel = ((row + y) * width + column + x) * 4;
      if (
        [0, 1, 2].some(
          (channel) => decoded.bitmap.data[pixel + channel] !== data[sourcePixel + channel],
        )
      )
        rgbPixelsChanged++;
    }
  if (rgbPixelsChanged) throw new Error("A extração alterou pixels visíveis do original.");
  writeFileSync(join(repository, input.file), bytes);
  outputs.push({
    ...input,
    width: cropWidth,
    height: cropHeight,
    sourceRect: [x, y, cropWidth, cropHeight],
    visiblePixels,
    rgbPixelsChanged,
    outputSha256: createHash("sha256").update(bytes).digest("hex"),
  });
}
writeFileSync(
  join(repository, "assets/brand/display-logos.json"),
  JSON.stringify(
    {
      receivedAt: "2026-11-05",
      instruction:
        "Remover somente o fundo preto; preservar RGB do logo 1 na entrada/abertura e do logo 2 no header/feed, sem filtros ou texto recriado.",
      outputs,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  JSON.stringify(
    outputs.map(({ file, width, height, rgbPixelsChanged }) => ({
      file,
      width,
      height,
      rgbPixelsChanged,
    })),
    null,
    2,
  ),
);
