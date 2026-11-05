// Sheet engine.
//  • spring-driven, so a sheet can be grabbed while it is opening or settling (interruptible)
//  • swipe down on the grab bar / header, or on the scroller when it is at the top, to dismiss
//  • pushes a history entry per overlay → the browser/Android back gesture closes the top one
//  • full-screen "pages" support an edge swipe whose peek follows the finger (predictive back)
import { spring } from "../lib/spring.js";
import { clamp, reduced } from "../lib/dom.js";

const stack = [];
let ignorePop = 0, seq = 0;
const layer = () => document.getElementById("layer");

function sync() {
  document.body.classList.toggle("has-overlay", stack.length > 0);
  document.body.classList.toggle("is-locked", stack.length > 0);
}

addEventListener("popstate", () => {
  if (ignorePop > 0) { ignorePop--; return; }
  stack[stack.length - 1]?.close({ fromPop: true });
});
addEventListener("keydown", (e) => {
  if (e.key === "Escape" && stack.length) { e.preventDefault(); stack[stack.length - 1].close(); }
});

export const topOverlay = () => stack[stack.length - 1];
export const closeAll = () => { for (let i = stack.length - 1; i >= 0; i--) stack[i].close({ instant: true }); };
export const overlayCount = () => stack.length;

/** Register any overlay (sheet, command palette…) with history + Esc handling. */
export function register(entry) {
  entry.id = ++seq;
  stack.push(entry);
  try { history.pushState({ mm: entry.id }, ""); entry.pushed = true; } catch {}
  sync();
  return () => {
    const i = stack.indexOf(entry);
    if (i >= 0) stack.splice(i, 1);
    sync();
  };
}
export function popHistory(entry, fromPop) {
  if (!fromPop && entry.pushed && history.state?.mm === entry.id) { ignorePop++; history.back(); }
}

/**
 * openSheet({ content, full, label, onClosed, scroller }) → { el, close, setContent }
 * `content` is an element placed inside the sheet. Elements with [data-grab] start a drag-dismiss.
 */
export function openSheet({ content, full = false, label = "Dialog", onClosed, scroller = "[data-scroll]", grabDark = false, grab = true }) {
  const wrap = document.createElement("div");
  wrap.className = "sheet-wrap";
  const scrim = document.createElement("div"); scrim.className = "scrim";
  const sheet = document.createElement("div"); sheet.className = "sheet" + (full ? " full" : "");
  sheet.setAttribute("role", "dialog"); sheet.setAttribute("aria-modal", "true"); sheet.setAttribute("aria-label", label);
  if (grab && !full) sheet.insertAdjacentHTML("afterbegin", `<div class="sheet-grab ${grabDark ? "dark" : ""}" data-grab aria-hidden="true"><i></i></div>`);
  sheet.append(content);
  wrap.append(scrim, sheet);
  layer().append(wrap);

  const axis = full ? "x" : "y";
  let size = full ? sheet.offsetWidth : sheet.offsetHeight;
  let closed = false, destroyed = false;
  const render = (p) => {
    sheet.style.transform = axis === "y" ? `translate3d(0,${p.toFixed(1)}px,0)` : `translate3d(${p.toFixed(1)}px,0,0)`;
    scrim.style.setProperty("--so", clamp(1 - p / size, 0, 1).toFixed(3));
    if (closed && p >= size - 1) destroy();           // gone from the screen → gone from the DOM
  };
  // stiff enough to feel immediate, slightly under-damped so it still has life
  const pos = spring(size, { stiffness: 520, damping: 40, precision: 0.4 }, render);
  render(size);
  const opener = document.activeElement;
  const entry = { close };
  const unregister = register(entry);

  requestAnimationFrame(() => { size = full ? sheet.offsetWidth : sheet.offsetHeight; if (reduced()) pos.set(0); else pos.to(0); focusFirst(); });
  function focusFirst() { (sheet.querySelector("[data-autofocus]") || sheet.querySelector("button, input, [tabindex]"))?.focus({ preventScroll: true }); }

  function destroy() { if (destroyed) return; destroyed = true; pos.stop(); wrap.remove(); onClosed?.(); try { opener?.focus?.({ preventScroll: true }); } catch {} }
  function close({ fromPop = false, instant = false } = {}) {
    if (closed) return; closed = true;
    unregister(); popHistory(entry, fromPop);
    size = full ? sheet.offsetWidth : sheet.offsetHeight;
    wrap.style.pointerEvents = "none";               // the exit animation must never swallow taps
    if (instant || reduced()) { pos.stop(); destroy(); return; }
    pos.stiffness = 640; pos.damping = 46;           // leave briskly
    pos.onRest = destroy; pos.to(size + 8);
  }

  /* ── drag to dismiss ── */
  let d = null;
  const scrollEl = () => sheet.querySelector(scroller);
  sheet.addEventListener("pointerdown", (e) => {
    if (closed || e.pointerType === "mouse" && e.button !== 0) return;
    const onGrab = !!e.target.closest("[data-grab]");
    const sc = scrollEl();
    const inScroll = sc && sc.contains(e.target);
    const edge = full && e.pointerType !== "mouse" && e.clientX - sheet.getBoundingClientRect().left < 24;
    if (!onGrab && !edge && !(inScroll && sc.scrollTop <= 0 && !full)) return;
    if (e.target.closest("input, textarea, [data-nodrag]") ) return;
    d = { x: e.clientX, y: e.clientY, p: pos.x, edge, onGrab, started: false, id: e.pointerId, lx: e.clientX, ly: e.clientY, lt: performance.now(), v: 0 };
    if (onGrab || edge) { pos.stop(); }
  });
  sheet.addEventListener("pointermove", (e) => {
    if (!d || e.pointerId !== d.id) return;
    const dx = e.clientX - d.x, dy = e.clientY - d.y;
    const delta = axis === "y" ? dy : dx, cross = axis === "y" ? dx : dy;
    if (!d.started) {
      if (Math.abs(delta) < 6 && !d.onGrab) return;
      if (delta <= 0 && !d.onGrab && !d.edge) { d = null; return; }     // scrolling up: not ours
      if (Math.abs(cross) > Math.abs(delta) && !d.onGrab) { d = null; return; }
      d.started = true; pos.stop(); d.p = pos.x; d.y = e.clientY; d.x = e.clientX;
      sheet.setPointerCapture(e.pointerId);
      if (d.edge) wrap.classList.add("back-peek");
    }
    const now = performance.now(), dt = Math.max(1, now - d.lt);
    const step = axis === "y" ? e.clientY - d.ly : e.clientX - d.lx;
    d.v = 0.75 * d.v + 0.25 * (step / dt); d.lx = e.clientX; d.ly = e.clientY; d.lt = now;
    const raw = (axis === "y" ? e.clientY - d.y : e.clientX - d.x);
    pos.set(raw >= 0 ? d.p + raw : d.p + -Math.sqrt(-raw) * 3);        // rubber-band when pulled the wrong way
  });
  const end = (e) => {
    if (!d || e.pointerId !== d.id) return;
    const was = d; d = null; wrap.classList.remove("back-peek");
    if (!was.started) return;
    if (pos.x > size * 0.32 || was.v > 0.55) close();
    else { pos.v = was.v * 1000; pos.to(0); }     // spring back, carrying the release velocity
  };
  sheet.addEventListener("pointerup", end); sheet.addEventListener("pointercancel", end);
  scrim.addEventListener("click", () => close());

  return { el: sheet, wrap, close, scrim, get closed() { return closed; } };
}
