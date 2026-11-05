// First view: a spring-driven carousel of large photographs. `pos` is a continuous
// position, so dragging, auto-advance and releasing with momentum all share one
// interruptible spring. Plus: drifting matcha dust, pointer parallax and scroll-linked depth.
import { $, $$, clamp, reduced, finePointer } from "../lib/dom.js";
import { spring } from "../lib/spring.js";

const pad = (n) => String(n).padStart(2, "0");

export function initHero(menu, { onOrder } = {}) {
  const hero = $("[data-hero]");
  if (!hero) return;
  const slides = $$(".hero-slide", hero), names = $$(".hero-name", hero), pans = $$(".hero-pan", hero);
  const stage = $(".hero-stage", hero), copy = $(".hero-copy", hero), foot = $(".hero-foot", hero);
  const curEl = $("[data-hero-cur]", hero), ctaEl = $("[data-hero-cta]", hero);
  const heroItems = menu.hero.map((id) => menu.items.find((i) => i.id === id));
  const n = slides.length;
  let shown = -1, W = hero.clientWidth;

  /* ── carousel ── */
  const pos = spring(0, { stiffness: 62, damping: 13, precision: 0.0008 }, render);
  function wrap(d) { return ((d + n / 2) % n + n) % n - n / 2; }
  function render(p) {
    for (let i = 0; i < n; i++) {
      const d = wrap(i - p), a = Math.abs(d), s = slides[i];
      if (a >= 1.05) { s.style.visibility = "hidden"; continue; }
      s.style.visibility = "visible";
      s.style.opacity = String(Math.max(0, 1 - a * 1.25).toFixed(3));
      s.style.zIndex = a < 0.5 ? 2 : 1;
      // large, physical movement: slide sideways, swing on Y, zoom through
      s.style.transform = `translate3d(${(d * W * 0.62).toFixed(1)}px,${(a * -2).toFixed(1)}vh,0) rotateY(${(-d * 18).toFixed(2)}deg) scale(${(1 + a * 0.24).toFixed(3)})`;
    }
    const idx = ((Math.round(p) % n) + n) % n;
    if (idx !== shown) setActive(idx);
  }
  function setActive(idx) {
    shown = idx;
    names.forEach((el, i) => el.classList.toggle("is-on", i === idx));
    slides.forEach((el, i) => i === idx ? el.removeAttribute("aria-hidden") : el.setAttribute("aria-hidden", "true"));
    curEl.textContent = pad(idx + 1);
    ctaEl.textContent = `Order the ${heroItems[idx].name}`;
    hero.style.setProperty("--glow", heroItems[idx].glow);
  }
  const go = (target) => { pos.to(target); restart(); };
  const current = () => ((Math.round(pos.target) % n) + n) % n;

  /* ── drag / swipe ── */
  let drag = null;
  hero.style.touchAction = "pan-y";
  hero.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button, a")) return;
    if (e.pointerType === "mouse" && e.button !== 0) return;
    pos.stop();                                   // grab it mid-flight
    drag = { x: e.clientX, p: pos.x, t: performance.now(), lx: e.clientX, lt: performance.now(), v: 0, id: e.pointerId, moved: false };
    stopAuto();
  });
  hero.addEventListener("pointermove", (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const dx = e.clientX - drag.x;
    if (!drag.moved && Math.abs(dx) > 6) { drag.moved = true; hero.setPointerCapture(e.pointerId); hero.classList.add("is-dragging"); }
    if (!drag.moved) return;
    const now = performance.now(), dt = Math.max(1, now - drag.lt);
    drag.v = 0.8 * drag.v + 0.2 * ((e.clientX - drag.lx) / dt); // px per ms, smoothed
    drag.lx = e.clientX; drag.lt = now;
    pos.set(drag.p - dx / (W * 0.62));
  });
  const release = (e) => {
    if (!drag || e.pointerId !== drag.id) return;
    const d = drag; drag = null; hero.classList.remove("is-dragging");
    if (!d.moved) { startAuto(); return; }
    const v = -d.v / (W * 0.62) * 1000;            // slides per second
    const base = Math.round(d.p), projected = pos.x + v * 0.18;
    const target = clamp(Math.round(projected), base - 1, base + 1);
    pos.v = v;                                      // carry the flick's momentum into the spring
    pos.to(target);
    startAuto();
  };
  hero.addEventListener("pointerup", release);
  hero.addEventListener("pointercancel", release);

  /* ── auto-advance (paused when hidden or being touched) ── */
  let timer = 0, visible = true;
  const startAuto = () => { stopAuto(); if (!reduced() && visible) timer = setTimeout(() => { go(Math.round(pos.target) + 1); }, 6200); };
  const stopAuto = () => clearTimeout(timer);
  const restart = () => startAuto();

  /* ── pointer parallax + scroll-linked depth + idle breathing ── */
  let px = 0, py = 0, cx = 0, cy = 0, raf = 0, running = false;
  if (finePointer()) hero.addEventListener("pointermove", (e) => { if (drag) return; const r = hero.getBoundingClientRect(); px = (e.clientX - r.left) / r.width * 2 - 1; py = (e.clientY - r.top) / r.height * 2 - 1; }, { passive: true });
  hero.addEventListener("pointerleave", () => { px = py = 0; });
  const tick = (t) => {
    raf = 0;
    if (!visible) { running = false; return; }
    cx += (px - cx) * 0.06; cy += (py - cy) * 0.06;
    const sp = clamp(scrollY / hero.offsetHeight, 0, 1);
    const rm = reduced();
    const base = 0.92 * clamp(hero.clientHeight / 800, 0.78, 1);   // short phones: a smaller photograph, so the type never sits on it
    pans.forEach((pan, i) => {
      const breathe = rm ? 0 : Math.sin(t / 4200 + i) * 0.012;
      pan.style.setProperty("--ox", `${(-cx * 22 + (rm ? 0 : Math.sin(t / 3100 + i) * 7)).toFixed(1)}px`);
      pan.style.setProperty("--oy", `${(-cy * 14 + sp * 46).toFixed(1)}px`);
      pan.style.setProperty("--zs", String((base + breathe + sp * 0.22).toFixed(4)));
    });
    stage.style.transform = `translate3d(0,${(sp * 12).toFixed(2)}vh,0)`;
    copy.style.transform = `translate3d(0,${(-sp * 60).toFixed(1)}px,0)`;
    copy.style.opacity = String(clamp(1 - sp * 1.7, 0, 1).toFixed(3));
    foot.style.opacity = String(clamp(1 - sp * 2.4, 0, 1).toFixed(3));
    dust.frame(t, cx, cy, sp);
    raf = requestAnimationFrame(tick);
  };
  const run = () => { if (!running) { running = true; raf = requestAnimationFrame(tick); } };

  /* ── matcha dust ── */
  const dust = makeDust($(".hero-dust", hero), reduced());

  new IntersectionObserver(([e]) => { visible = e.isIntersecting; if (visible) { run(); startAuto(); } else stopAuto(); }, { threshold: 0.05 }).observe(hero);
  addEventListener("resize", () => { W = hero.clientWidth; dust.resize(); render(pos.x); }, { passive: true });
  document.addEventListener("visibilitychange", () => (document.hidden ? stopAuto() : startAuto()));

  $("[data-action='hero-order']", hero)?.addEventListener("click", () => onOrder?.(heroItems[current()].id));

  setActive(0); render(0); run(); startAuto();
  return { go, current };
}

function makeDust(canvas, still) {
  const ctx = canvas.getContext("2d");
  let w = 0, h = 0, dpr = 1;
  const sprite = (() => {
    const c = document.createElement("canvas"); c.width = c.height = 64;
    const g = c.getContext("2d"), r = g.createRadialGradient(32, 32, 0, 32, 32, 32);
    r.addColorStop(0, "rgba(222,244,170,1)"); r.addColorStop(0.35, "rgba(190,226,120,.5)"); r.addColorStop(1, "rgba(160,205,90,0)");
    g.fillStyle = r; g.fillRect(0, 0, 64, 64); return c;
  })();
  const N = still ? 0 : 38;
  const ps = Array.from({ length: N }, (_, i) => ({ x: Math.random(), y: Math.random(), z: 0.25 + Math.random() * 0.75, s: 0.6 + Math.random() * 1.9, ph: Math.random() * 6.28, sp: 0.00003 + Math.random() * 0.00006 }));
  function resize() { dpr = Math.min(1.5, devicePixelRatio || 1); w = canvas.clientWidth; h = canvas.clientHeight; canvas.width = w * dpr; canvas.height = h * dpr; }
  resize();
  return {
    resize,
    frame(t, cx, cy, sp) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0); ctx.clearRect(0, 0, w, h);
      for (const p of ps) {
        p.y -= p.sp * p.z; if (p.y < -0.05) { p.y = 1.05; p.x = Math.random(); }
        const x = (p.x + Math.sin(t / 2600 + p.ph) * 0.012) * w - cx * 40 * p.z, y = p.y * h + sp * 90 * p.z;
        const r = p.s * 4.6 * p.z * 2.2;
        ctx.globalAlpha = (0.25 + 0.45 * p.z) * (0.6 + 0.4 * Math.sin(t / 1400 + p.ph));
        ctx.drawImage(sprite, x - r, y - r, r * 2, r * 2);
      }
    },
  };
}
