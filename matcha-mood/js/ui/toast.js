// Toasts, with Undo. Swipe sideways to dismiss; hovering/pressing pauses the timer.
import { esc } from "../lib/dom.js";
import { I } from "../icons.js";

let host;
export function toast({ text, action, duration = 4600 }) {
  host ||= Object.assign(document.createElement("div"), { id: "toasts", ariaLive: "polite" });
  if (!host.isConnected) document.body.append(host);
  for (const old of [...host.children]) if (old.querySelector("span")?.textContent === text) old.remove(); // merge duplicates
  while (host.children.length >= 3) host.firstElementChild.remove();
  const el = document.createElement("div");
  el.className = "toast"; el.setAttribute("role", "status");
  el.style.setProperty("--d", duration + "ms");
  el.innerHTML = `<span>${esc(text)}</span>${action ? `<button type="button">${action.icon ?? I.undo}${esc(action.label)}</button>` : ""}<i></i>`;
  host.append(el);
  let t, left = duration, started = performance.now(), gone = false;
  const bar = el.querySelector("i");
  const kill = () => { if (gone) return; gone = true; clearTimeout(t); el.classList.add("out"); setTimeout(() => el.remove(), 280); };
  const arm = () => { started = performance.now(); t = setTimeout(kill, left); bar.style.animationPlayState = "running"; };
  const pause = () => { clearTimeout(t); left -= performance.now() - started; bar.style.animationPlayState = "paused"; };
  arm();
  el.addEventListener("pointerenter", pause); el.addEventListener("pointerleave", () => { if (!gone) arm(); });
  el.querySelector("button")?.addEventListener("click", () => { action.onClick?.(); kill(); });
  let sx = null;
  el.addEventListener("pointerdown", (e) => { if (e.target.closest("button")) return; sx = e.clientX; pause(); el.setPointerCapture(e.pointerId); });
  el.addEventListener("pointermove", (e) => { if (sx == null) return; el.style.transform = `translateX(${e.clientX - sx}px)`; el.style.opacity = String(1 - Math.min(1, Math.abs(e.clientX - sx) / 200)); });
  el.addEventListener("pointerup", (e) => { if (sx == null) return; const dx = e.clientX - sx; sx = null; if (Math.abs(dx) > 70) { el.style.transition = "transform .25s, opacity .25s"; el.style.transform = `translateX(${Math.sign(dx) * 380}px)`; el.style.opacity = "0"; kill(); } else { el.style.transform = ""; el.style.opacity = ""; arm(); } });
  return { dismiss: kill };
}
