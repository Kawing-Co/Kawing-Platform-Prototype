// Page-level behaviour: top bar, swipe gallery, scrollytelling, safe-triangle flyout.
import { $, $$, clamp, reduced, finePointer } from "../lib/dom.js";
import { spring } from "../lib/spring.js";

const pad = (n) => String(n).padStart(2, "0");

/* ───────── top bar: transparent over the hero, frosted after it ───────── */
export function initTopbar() {
  const bar = $("[data-topbar]");
  if (!bar) return;
  const darks = ["[data-hero]", "[data-story]", ".foot"].map((s) => $(s)).filter(Boolean);
  let t = false;
  const run = () => {
    t = false;
    const y = 36;
    const dark = darks.some((el) => { const r = el.getBoundingClientRect(); return r.top <= y && r.bottom >= y; });
    bar.classList.toggle("is-solid", !dark);
    bar.classList.toggle("on-dark", dark && scrollY > 40);
  };
  const on = () => { if (!t) { t = true; requestAnimationFrame(run); } };
  addEventListener("scroll", on, { passive: true }); addEventListener("resize", on, { passive: true });
  run();

}

/* ───────── swipe gallery ───────── */
export function initGallery(menu) {
  const sec = $("[data-menu]"), track = $(".g-track", sec);
  if (!track) return {};
  const slides = $$(".g-slide", track), rail = $("[data-rail]", sec), ind = $(".rail-ind", rail), tabs = $$("button", rail);
  const curEl = $("[data-g-cur]"), bar = $("[data-g-bar]");
  let active = -1, ticking = false;

  const moveInd = (tab) => { ind.style.width = `${tab.offsetWidth}px`; ind.style.transform = `translateX(${tab.offsetLeft - 4}px)`; };

  function update() {
    ticking = false;
    const tr = track.getBoundingClientRect(), mid = tr.left + tr.width / 2;
    let best = 0, bestD = 1e9;
    slides.forEach((s, i) => {
      const r = s.getBoundingClientRect(), d = (r.left + r.width / 2 - mid) / r.width; // −1…1 ≈ one card away
      s.style.setProperty("--p", d.toFixed(3));
      s.firstElementChild.style.setProperty("--k", Math.min(1, Math.abs(d)).toFixed(3));
      s.firstElementChild.style.setProperty("--a", (1 - Math.min(1, Math.abs(d)) * 0.85).toFixed(3));
      if (Math.abs(d) < bestD) { bestD = Math.abs(d); best = i; }
    });
    const max = track.scrollWidth - track.clientWidth;
    bar.style.setProperty("--prog", String(max > 0 ? Math.max(0.08, track.scrollLeft / max) : 1));
    if (best !== active) {
      active = best;
      curEl.textContent = pad(best + 1);
      const sl = slides[best], cat = sl.dataset.cat;
      sec.style.setProperty("--menu-glow", sl.style.getPropertyValue("--glow"));
      tabs.forEach((t) => t.setAttribute("aria-selected", String(t.dataset.cat === cat)));
      const t = tabs.find((t) => t.dataset.cat === cat); if (t) moveInd(t);
    }
  }
  const onScroll = () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } };
  track.addEventListener("scroll", onScroll, { passive: true });
  addEventListener("resize", () => { active = -1; update(); }, { passive: true });

  const goTo = (i, behavior = "smooth") => {
    const s = slides[clamp(i, 0, slides.length - 1)];
    track.scrollTo({ left: s.offsetLeft - (track.clientWidth - s.offsetWidth) / 2, behavior: reduced() ? "auto" : behavior });
  };
  const goId = (id) => { const i = slides.findIndex((s) => s.dataset.id === id); if (i >= 0) { $("#menu").scrollIntoView({ behavior: reduced() ? "auto" : "smooth", block: "start" }); setTimeout(() => goTo(i), 300); } };

  $("[data-g-prev]")?.addEventListener("click", () => goTo(active - 1));
  $("[data-g-next]")?.addEventListener("click", () => goTo(active + 1));
  track.addEventListener("keydown", (e) => {
    if (e.key === "ArrowRight") { e.preventDefault(); goTo(active + 1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); goTo(active - 1); }
  });
  tabs.forEach((t) => t.addEventListener("click", () => { const i = slides.findIndex((s) => s.dataset.cat === t.dataset.cat); goTo(i); }));

  // mouse drag (touch uses native scrolling + snap)
  let d = null, suppress = false;
  track.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0 || e.target.closest("button")) return;
    d = { x: e.clientX, l: track.scrollLeft, moved: false, id: e.pointerId, t: performance.now(), lx: e.clientX, v: 0 };
  });
  track.addEventListener("pointermove", (e) => {
    if (!d) return;
    const dx = e.clientX - d.x;
    if (!d.moved && Math.abs(dx) > 5) { d.moved = true; track.setPointerCapture(d.id); track.classList.add("is-dragging"); }
    if (d.moved) { track.scrollLeft = d.l - dx; d.v = e.clientX - d.lx; d.lx = e.clientX; }
  });
  const end = () => {
    if (!d) return;
    const was = d.moved, v = d.v; d = null; track.classList.remove("is-dragging");
    if (was) { suppress = true; setTimeout(() => (suppress = false), 60); const cur = active; goTo(v < -6 ? cur + 1 : v > 6 ? cur - 1 : cur); }
  };
  track.addEventListener("pointerup", end); track.addEventListener("pointercancel", end);
  track.addEventListener("click", (e) => { if (suppress) { e.stopPropagation(); e.preventDefault(); } }, true);

  requestAnimationFrame(() => { update(); });
  document.fonts?.ready.then(() => { active = -1; update(); });
  return { goTo, goId, active: () => active };
}

/* ───────── scrollytelling: words light up, the photograph opens ───────── */
export function initStory() {
  const sec = $("[data-story]");
  if (!sec) return;
  const ws = $$(".sw", sec), media = $(".story-media", sec), photo = $(".story-photo", sec), line = $(".story-line", sec);
  let t = false;
  const run = () => {
    t = false;
    const vh = innerHeight, r = line.getBoundingClientRect();
    const p = clamp((vh * 0.88 - r.top) / (vh * 0.62 + r.height * 0.4), 0, 1);
    ws.forEach((w, i) => w.style.setProperty("--on", clamp(p * (ws.length + 2) - i, 0, 1).toFixed(2)));
    const m = media.getBoundingClientRect(), q = clamp((vh * 0.95 - m.top) / (vh * 0.75), 0, 1);
    media.style.setProperty("--cp", `${((1 - q) * 14).toFixed(2)}%`);
    photo.style.setProperty("--zs", (1.12 - q * 0.12).toFixed(3));
  };
  const on = () => { if (!t) { t = true; requestAnimationFrame(run); } };
  addEventListener("scroll", on, { passive: true }); addEventListener("resize", on, { passive: true });
  run();

  // The Hyperframes teaser plays only while it is on screen — and never for people who
  // asked for reduced motion or Save-Data. The still photograph underneath is the fallback.
  const vid = $(".story-video", sec);
  if (vid && !reduced() && !navigator.connection?.saveData) {
    const load = () => {
      if (vid.dataset.ready) return;
      vid.dataset.ready = "1";
      for (const [type, src] of [["video/webm", vid.dataset.webm], ["video/mp4", vid.dataset.mp4]]) {
        const s = document.createElement("source"); s.type = type; s.src = src; vid.append(s);
      }
      vid.load();
    };
    new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { load(); vid.play().then(() => vid.classList.add("is-playing")).catch(() => {}); }
      else vid.pause();
    }, { threshold: 0.45 }).observe(media);
  }
}

/* ───────── desktop flyout with an "Amazon safe triangle" ─────────
   While the pointer travels diagonally from a category toward its item panel it
   crosses other categories. We keep the current panel open as long as the pointer
   stays inside the triangle between its last position and the panel's near corners. */
export function initFlyout() {
  const wrap = $("[data-flyout]");
  if (!wrap || !finePointer()) return;
  const btn = $(".nav-link", wrap), fly = $(".flyout", wrap), panelsBox = $(".fly-panels", wrap);
  const cats = $$(".fly-cat", wrap), panels = $$(".fly-panel", wrap);
  let open = false, closeT = 0, activeCat = null, last = null;

  const show = (cat) => {
    activeCat = cat;
    cats.forEach((c) => c.classList.toggle("is-on", c.dataset.cat === cat));
    panels.forEach((p) => (p.hidden = p.dataset.panel !== cat));
  };
  const openIt = () => { clearTimeout(closeT); if (open) return; open = true; fly.hidden = false; btn.setAttribute("aria-expanded", "true"); show(cats[0].dataset.cat); };
  const closeIt = () => { open = false; fly.hidden = true; btn.setAttribute("aria-expanded", "false"); last = null; };
  const later = () => { clearTimeout(closeT); closeT = setTimeout(closeIt, 220); };

  const inTri = (p, a, b, c) => {
    const s = (p1, p2, p3) => (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
    const d1 = s(p, a, b), d2 = s(p, b, c), d3 = s(p, c, a);
    return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
  };

  btn.addEventListener("pointerenter", openIt);
  btn.addEventListener("click", () => (open ? closeIt() : openIt()));
  wrap.addEventListener("pointerleave", later);
  wrap.addEventListener("pointerenter", () => clearTimeout(closeT));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && open) closeIt(); });
  document.addEventListener("pointerdown", (e) => { if (open && !wrap.contains(e.target)) closeIt(); });

  fly.addEventListener("pointermove", (e) => { last = { x: e.clientX, y: e.clientY }; });
  cats.forEach((c) => {
    c.addEventListener("focus", () => show(c.dataset.cat));
    c.addEventListener("pointerenter", (e) => {
      const target = c.dataset.cat;
      if (!activeCat || activeCat === target || !last) { show(target); return; }
      // Is the pointer heading toward the open panel? Then ignore this category for a beat.
      const pr = panelsBox.getBoundingClientRect();
      const heading = inTri({ x: e.clientX, y: e.clientY }, last, { x: pr.left, y: pr.top }, { x: pr.left, y: pr.bottom }) ||
        inTri({ x: e.clientX, y: e.clientY }, { x: last.x, y: last.y }, { x: pr.left, y: pr.top }, { x: pr.right, y: pr.top });
      if (heading) { clearTimeout(c._t); c._t = setTimeout(() => { if (c.matches(":hover")) show(target); }, 140); }
      else show(target);
    });
  });
}
