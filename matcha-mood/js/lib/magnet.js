// Primary-button physics, applied only to `[data-magnetic]` (the buttons people press
// again and again: Order, Add to bag, Checkout, Place order…).
//
//  • light  – a soft spotlight + a lit border follow the cursor across the button
//  • magnet – the button leans a few pixels toward the cursor when it gets close
//  • give   – on press it compresses, and on release springs back with a little overshoot
//
// Touch screens have no hover, so a tap blooms the light at the touch point and the
// button leans toward it for an instant. Reduced motion keeps the light, drops the movement.
import { spring } from "./spring.js";
import { reduced } from "./dom.js";

const state = new WeakMap();
let inited = false;

function make(el) {
  const label = el.querySelector(".btn-label");
  const s = { el, label, near: false, pressed: false };
  const apply = () => {
    const rm = reduced();
    const x = rm ? 0 : s.tx.x, y = rm ? 0 : s.ty.x, k = rm ? 1 : s.sc.x;
    el.style.transform = `translate3d(${x.toFixed(2)}px,${y.toFixed(2)}px,0) scale(${k.toFixed(4)})`;
    if (label) label.style.transform = `translate3d(${(x * 0.45).toFixed(2)}px,${(y * 0.45).toFixed(2)}px,0)`;
    el.style.setProperty("--g", s.glow.x.toFixed(3));
  };
  s.tx = spring(0, { stiffness: 230, damping: 17 }, apply);
  s.ty = spring(0, { stiffness: 230, damping: 17 }, apply);
  s.sc = spring(1, { stiffness: 520, damping: 13 }, apply); // underdamped → a little bounce
  s.glow = spring(0, { stiffness: 160, damping: 20 }, apply);
  state.set(el, s);
  return s;
}
const get = (el) => state.get(el) || make(el);

function setLight(el, e) {
  const r = el.getBoundingClientRect();
  el.style.setProperty("--mx", `${e.clientX - r.left}px`);
  el.style.setProperty("--my", `${e.clientY - r.top}px`);
}

function lean(s, e, strength, max) {
  const r = s.el.getBoundingClientRect();
  const dx = e.clientX - (r.left + r.width / 2), dy = e.clientY - (r.top + r.height / 2);
  const k = Math.min(1, Math.max(r.width, r.height) / 160);
  const cl = (v) => Math.max(-max * k, Math.min(max * k, v * strength));
  s.tx.to(cl(dx)); s.ty.to(cl(dy));
}

export function initMagnets() {
  if (inited) return;
  inited = true;
  let frame = 0, lastEv = null;

  // Mouse / pen proximity: runs on pointermove, coalesced to one pass per frame.
  const pass = () => {
    frame = 0;
    const e = lastEv;
    if (!e || e.pointerType === "touch") return;
    document.querySelectorAll("[data-magnetic]").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.width === 0 || r.bottom < 0 || r.top > innerHeight) return;
      const s = get(el);
      const pad = 54;
      const inside = e.clientX > r.left - pad && e.clientX < r.right + pad && e.clientY > r.top - pad && e.clientY < r.bottom + pad;
      if (inside) {
        if (!s.pressed) lean(s, e, 0.28, 9);
        setLight(el, e);
        s.glow.to(1);
        s.near = true;
      } else if (s.near) {
        s.near = false;
        if (!s.pressed) { s.tx.to(0); s.ty.to(0); }
        s.glow.to(0);
      }
    });
  };
  addEventListener("pointermove", (e) => {
    lastEv = e;
    if (!frame) frame = requestAnimationFrame(pass);
  }, { passive: true });

  addEventListener("pointerdown", (e) => {
    const el = e.target.closest?.("[data-magnetic]");
    if (!el || el.disabled) return;
    const s = get(el);
    s.pressed = true;
    setLight(el, e);
    el.classList.add("is-pressed");
    s.sc.to(0.94);                                  // give
    if (e.pointerType === "touch") { lean(s, e, 0.18, 6); s.glow.set(0.2); s.glow.to(1); } // bloom at the fingertip
    const up = (ev) => {
      s.pressed = false;
      el.classList.remove("is-pressed");
      s.sc.to(1);                                   // spring back, overshoots slightly
      if (e.pointerType === "touch") { s.tx.to(0); s.ty.to(0); setTimeout(() => s.glow.to(0), 220); }
      else if (!s.near) { s.tx.to(0); s.ty.to(0); }
      removeEventListener("pointerup", up);
      removeEventListener("pointercancel", up);
    };
    addEventListener("pointerup", up);
    addEventListener("pointercancel", up);
  }, { passive: true });

  // Buttons that disappear/reappear (sheets) should never be left leaning.
  addEventListener("blur", () => document.querySelectorAll("[data-magnetic]").forEach((el) => { const s = get(el); s.tx.to(0); s.ty.to(0); s.glow.to(0); s.sc.to(1); }));
}
