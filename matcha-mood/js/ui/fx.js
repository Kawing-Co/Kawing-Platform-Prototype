// Visual surprises: particle bursts, rising steam, and the arc that carries a
// photograph from the customizer into the bag.
import { reduced } from "../lib/dom.js";

let layer;
const L = () => { if (!layer) { layer = document.createElement("div"); layer.className = "fx-layer"; layer.setAttribute("aria-hidden", "true"); document.body.append(layer); } return layer; };
const rnd = (a, b) => a + Math.random() * (b - a);

export function burst(x, y, colors = ["#cfe79a"], n = 16, { spread = 100, gravity = 46, size = [3, 8] } = {}) {
  if (reduced()) return;
  const host = L();
  for (let i = 0; i < n; i++) {
    const d = document.createElement("i");
    d.className = "fx-dot";
    const s = rnd(size[0], size[1]);
    Object.assign(d.style, { left: x + "px", top: y + "px", width: s + "px", height: s * rnd(0.8, 1.2) + "px", background: colors[i % colors.length], boxShadow: "0 0 8px " + colors[i % colors.length] + "88" });
    host.append(d);
    const a = rnd(0, Math.PI * 2), r = rnd(spread * 0.35, spread), dx = Math.cos(a) * r, dy = Math.sin(a) * r - rnd(10, 40);
    d.animate([
      { transform: "translate(-50%,-50%) scale(.2)", opacity: 1 },
      { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(1)`, opacity: 1, offset: 0.55 },
      { transform: `translate(calc(-50% + ${dx * 1.15}px), calc(-50% + ${dy + gravity}px)) scale(.5)`, opacity: 0 },
    ], { duration: rnd(650, 1100), easing: "cubic-bezier(.2,.8,.2,1)" }).onfinish = () => d.remove();
  }
}

export function steam(x, y, n = 9) {
  if (reduced()) return;
  const host = L();
  for (let i = 0; i < n; i++) {
    const d = document.createElement("i");
    d.className = "fx-dot";
    const s = rnd(18, 36);
    Object.assign(d.style, { left: x + rnd(-40, 40) + "px", top: y + "px", width: s + "px", height: s + "px", background: "radial-gradient(circle, rgba(255,255,255,.55), rgba(255,255,255,0) 70%)", filter: "blur(3px)" });
    host.append(d);
    d.animate([
      { transform: "translate(-50%,-50%) scale(.6)", opacity: 0 },
      { opacity: 0.9, offset: 0.25 },
      { transform: `translate(calc(-50% + ${rnd(-24, 24)}px), calc(-50% - ${rnd(80, 150)}px)) scale(1.8)`, opacity: 0 },
    ], { duration: rnd(1300, 2000), delay: i * 90, easing: "ease-out", fill: "backwards" }).onfinish = () => d.remove();
  }
}

export function sparkle(x, y, n = 12) { burst(x, y, ["#ffffff", "#dff3ff", "#bfe3ff"], n, { spread: 90, gravity: 20, size: [2, 5] }); }

/** Carry a thumbnail along a curved path to `target` (a DOMRect or {x,y}); resolves on landing. */
export function flyTo({ from, size = 88, src, target, duration = 900 }) {
  if (reduced()) return Promise.resolve();
  const host = L();
  const el = document.createElement("div");
  el.className = "fly"; el.style.width = el.style.height = size + "px";
  el.innerHTML = `<img src="${src}" alt="">`;
  Object.assign(el.style, { left: "0px", top: "0px" });
  host.append(el);
  const p0 = { x: from.x, y: from.y }, p2 = { x: target.x, y: target.y };
  const p1 = { x: (p0.x + p2.x) / 2 + (p2.x > p0.x ? -1 : 1) * 70, y: Math.min(p0.y, p2.y) - 170 };
  const at = (t) => ({ x: (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x, y: (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y });
  const frames = (lag = 0, sc0 = 1, sc1 = 0.24) => Array.from({ length: 21 }, (_, i) => {
    const t = Math.max(0, Math.min(1, i / 20 - lag)), p = at(t), k = sc0 + (sc1 - sc0) * (t * t);
    return { transform: `translate(${p.x - size / 2}px, ${p.y - size / 2}px) scale(${k}) rotate(${t * 220}deg)`, opacity: t > 0.94 ? 0.2 : 1, offset: i / 20 };
  });
  // a trail of matcha dust
  for (let i = 1; i <= 6; i++) {
    const d = document.createElement("i"); d.className = "fx-dot";
    const s = 14 - i * 1.6; Object.assign(d.style, { width: s + "px", height: s + "px", background: i % 2 ? "#cfe79a" : "#7da24a", left: "0", top: "0", opacity: ".0" });
    host.append(d);
    const kf = Array.from({ length: 21 }, (_, j) => { const t = Math.max(0, Math.min(1, j / 20 - i * 0.045)), p = at(t); return { transform: `translate(${p.x - s / 2}px, ${p.y - s / 2}px) scale(${1 - t * 0.6})`, opacity: t > 0 && t < 0.96 ? 0.7 - i * 0.08 : 0, offset: j / 20 }; });
    d.animate(kf, { duration, easing: "cubic-bezier(.45,0,.55,1)", fill: "both" }).onfinish = () => d.remove();
  }
  return new Promise((res) => {
    const a = el.animate(frames(), { duration, easing: "cubic-bezier(.45,0,.55,1)", fill: "both" });
    a.onfinish = () => { el.remove(); res(); };
  });
}
