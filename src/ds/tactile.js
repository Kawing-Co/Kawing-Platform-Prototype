// Tactile primary actions — for the buttons people press again and again.
//   light  – a soft spotlight and a lit border follow the cursor (the fingertip on touch)
//   magnet – the button leans a few pixels toward the cursor (fine pointers only)
//   give   – it compresses on press and springs back with a little overshoot
// Touch screens have no hover, so they get the press and a fingertip bloom, never the lean.
// Reduced motion keeps the light, drops all movement. Nothing here touches payment or order
// state: it only sets transform / CSS variables on the element.
import { spring } from "./spring.js";

export const TACTILE_SELECTOR =
  'button.primary, a.primary, .sf-primary, .space-primary, .cx-primary, .cx-mobile-bag, [data-tactile]';

const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;
const state = new WeakMap();
let started = false;

function make(el) {
  const s = { el, near: false, pressed: false };
  const apply = () => {
    const rm = reduced();
    const x = rm ? 0 : s.tx.x, y = rm ? 0 : s.ty.x, k = rm ? 1 : s.sc.x;
    el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) scale(${k.toFixed(4)})`;
    el.style.setProperty("--lg", s.glow.x.toFixed(3));
  };
  s.tx = spring(0, { stiffness: 230, damping: 17 }, apply);
  s.ty = spring(0, { stiffness: 230, damping: 17 }, apply);
  s.sc = spring(1, { stiffness: 520, damping: 13 }, apply);   // under-damped: a little bounce
  s.glow = spring(0, { stiffness: 160, damping: 20 }, apply);
  state.set(el, s);
  el.classList.add("k-tactile");
  return s;
}
const get = (el) => state.get(el) || make(el);

function light(el, e) {
  const r = el.getBoundingClientRect();
  el.style.setProperty("--lx", `${e.clientX - r.left}px`);
  el.style.setProperty("--ly", `${e.clientY - r.top}px`);
}
function lean(s, e, strength, max) {
  const r = s.el.getBoundingClientRect();
  const k = Math.min(1, Math.max(r.width, r.height) / 160);
  const c = (v) => Math.max(-max * k, Math.min(max * k, v * strength));
  s.tx.to(c(e.clientX - (r.left + r.width / 2)));
  s.ty.to(c(e.clientY - (r.top + r.height / 2)));
}
const targets = () => document.querySelectorAll(TACTILE_SELECTOR);

export function initTactile() {
  if (started) return;
  started = true;
  const fine = matchMedia("(hover: hover) and (pointer: fine)");
  let frameId = 0, lastEv = null;

  const pass = () => {
    frameId = 0;
    const e = lastEv;
    if (!e || e.pointerType === "touch" || !fine.matches) return;
    targets().forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.bottom < 0 || r.top > innerHeight || el.disabled) return;
      const s = get(el), pad = 52;
      const inside = e.clientX > r.left - pad && e.clientX < r.right + pad && e.clientY > r.top - pad && e.clientY < r.bottom + pad;
      if (inside) { if (!s.pressed) lean(s, e, 0.26, 7); light(el, e); s.glow.to(1); s.near = true; }
      else if (s.near) { s.near = false; if (!s.pressed) { s.tx.to(0); s.ty.to(0); } s.glow.to(0); }
    });
  };
  addEventListener("pointermove", (e) => { lastEv = e; if (!frameId) frameId = requestAnimationFrame(pass); }, { passive: true });

  addEventListener("pointerdown", (e) => {
    const el = e.target.closest?.(TACTILE_SELECTOR);
    if (!el || el.disabled) return;
    const s = get(el);
    s.pressed = true; light(el, e); el.classList.add("k-pressed");
    s.sc.to(0.95);                                       // give
    if (e.pointerType === "touch") { lean(s, e, 0.16, 5); s.glow.set(0.2); s.glow.to(1); }   // fingertip bloom
    const up = () => {
      s.pressed = false; el.classList.remove("k-pressed");
      s.sc.to(1);                                        // springs back with a little overshoot
      if (e.pointerType === "touch") { s.tx.to(0); s.ty.to(0); setTimeout(() => s.glow.to(0), 220); }
      else if (!s.near) { s.tx.to(0); s.ty.to(0); }
      removeEventListener("pointerup", up); removeEventListener("pointercancel", up);
    };
    addEventListener("pointerup", up); addEventListener("pointercancel", up);
  }, { passive: true });

  addEventListener("blur", () => targets().forEach((el) => { const s = state.get(el); if (s) { s.tx.to(0); s.ty.to(0); s.glow.to(0); s.sc.to(1); } }));
}
