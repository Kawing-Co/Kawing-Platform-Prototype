import React, { useMemo, useState } from "react";
import { decode } from "blurhash";
import hashes from "./image-hashes.json";
const cache = new Map();
function placeholder(src) {
  if (cache.has(src)) return cache.get(src);
  let url = "";
  try {
    if (hashes[src]) {
      const canvas = document.createElement("canvas");
      canvas.width = 32;
      canvas.height = 24;
      canvas
        .getContext("2d")
        .putImageData(new ImageData(decode(hashes[src], 32, 24), 32, 24), 0, 0);
      url = canvas.toDataURL();
    }
  } catch {}
  cache.set(src, url);
  return url;
}
export default function ProgressiveImage({ src, alt, ...props }) {
  const [state, setState] = useState({ src, loaded: false, error: false });
  const bg = useMemo(() => placeholder(src), [src]);
  const loaded = state.src === src && state.loaded,
    error = state.src === src && state.error;
  return (
    <span
      className={
        "progressive-image " +
        (loaded ? "image-ready" : "") +
        (error ? " image-error" : "")
      }
      style={bg ? { backgroundImage: `url(${bg})` } : undefined}
    >
      {!error && (
        <img
          {...props}
          src={src}
          alt={alt}
          onLoad={() => setState({ src, loaded: true, error: false })}
          onError={() => setState({ src, loaded: false, error: true })}
        />
      )}
      {error && (
        <span role="img" aria-label={alt}>
          Image unavailable
        </span>
      )}
    </span>
  );
}
