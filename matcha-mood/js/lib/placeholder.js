// BlurHash placeholders. The hashes are computed from the real photographs
// (scripts/blurhash.mjs); a canvas paints the blurred preview, and the sharp
// image fades in over it when it has loaded.
import { decode } from "./blurhash.js";

export function paintPlaceholders(root = document) {
  root.querySelectorAll("canvas[data-blurhash]").forEach((c) => {
    if (c.dataset.done) return;
    try {
      const px = decode(c.dataset.blurhash, 32, 40);
      const img = new ImageData(px, 32, 40);
      c.getContext("2d").putImageData(img, 0, 0);
      c.dataset.done = "1";
    } catch {}
  });
}

export function watchImages(root = document) {
  root.querySelectorAll(".ph:not([data-w])").forEach((ph) => {
    ph.dataset.w = "1";
    const img = ph.querySelector("img");
    if (!img) return;
    const ok = () => ph.classList.add("is-loaded");
    if (img.complete && img.naturalWidth) ok();
    else { img.addEventListener("load", ok, { once: true }); img.addEventListener("error", ok, { once: true }); }
  });
}

// Average colour of a hash (Node-safe) so the very first paint is never blank.
export function avgColor(hash) {
  try {
    const [r, g, b] = decode(hash, 1, 1);
    return `rgb(${r},${g},${b})`;
  } catch { return "#14231a"; }
}
