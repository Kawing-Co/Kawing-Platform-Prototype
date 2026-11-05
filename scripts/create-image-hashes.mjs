import { encode } from "blurhash";
import { execFileSync } from "node:child_process";
import { writeFileSync } from "node:fs";
const hashes = {};
for (const name of ["bowl", "salad", "drink", "plate", "mango"]) {
  const rgb = execFileSync("ffmpeg", [
    "-v",
    "error",
    "-i",
    `public/images/${name}.jpg`,
    "-vf",
    "scale=32:24",
    "-frames:v",
    "1",
    "-f",
    "rawvideo",
    "-pix_fmt",
    "rgba",
    "pipe:1",
  ]);
  hashes[`/images/${name}.jpg`] = encode(
    new Uint8ClampedArray(rgb),
    32,
    24,
    4,
    3,
  );
}
writeFileSync("src/image-hashes.json", JSON.stringify(hashes, null, 2) + "\n");
