// Regenerates src/image-hashes.json (BlurHash placeholders). Needs ffmpeg.
//   node scripts/create-image-hashes.mjs
import { encode } from "blurhash";
import { execFileSync } from "node:child_process";
import { readdirSync, writeFileSync } from "node:fs";

const images = [
  // Kawing entry experience and the other fictional merchants
  "/images/bowl.jpg", "/images/salad.jpg", "/images/drink.jpg", "/images/plate.jpg", "/images/mango.jpg",
  "/images/market-hero.jpg", "/images/market-stall.jpg", "/images/salo-table.jpg",
  // Matcha Mood photography, every full-size and -sm variant
  ...readdirSync("public/images/matcha").filter((f) => f.endsWith(".jpg")).sort().map((f) => `/images/matcha/${f}`),
  // the usual.
  ...readdirSync("public/images/usual").filter((f) => f.endsWith(".jpg")).sort().map((f) => `/images/usual/${f}`),
];
const hashes = {};
for (const src of images) {
  const rgb = execFileSync("ffmpeg", ["-v", "error", "-i", `public${src}`, "-vf", "scale=32:24", "-frames:v", "1", "-f", "rawvideo", "-pix_fmt", "rgba", "pipe:1"]);
  hashes[src] = encode(new Uint8ClampedArray(rgb), 32, 24, 4, 3);
}
writeFileSync("src/image-hashes.json", JSON.stringify(hashes, null, 2) + "\n");
console.log(Object.keys(hashes).length, "hashes");
