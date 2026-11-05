// Small DOM + math helpers (browser only unless noted).
export const $ = (sel, root = document) => root.querySelector(sel);
export const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
export const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
export const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
export const finePointer = () => matchMedia("(hover: hover) and (pointer: fine)").matches;
export const vibrate = (ms = 8) => { try { navigator.vibrate?.(ms); } catch {} };
export const uid = (p = "id") => p + "_" + (crypto.randomUUID?.().slice(0, 8) ?? Math.random().toString(36).slice(2, 10));
export const html = (strings, ...vals) => strings.reduce((a, s, i) => a + s + (vals[i] ?? ""), "");
// Run `fn` on the next frame, twice-deferred so layout has settled.
export const raf2 = (fn) => requestAnimationFrame(() => requestAnimationFrame(fn));
