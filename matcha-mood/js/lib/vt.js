import { reduced } from "./dom.js";
// View Transitions where supported; otherwise just run the update.
// Resolves once the DOM has been updated (not when the animation ends).
export function vt(update, { name } = {}) {
  if (!document.startViewTransition || reduced()) { update(); return Promise.resolve(); }
  if (name) document.documentElement.dataset.vt = name;
  const t = document.startViewTransition(() => { update(); });
  t.finished.catch(() => {}).finally(() => { delete document.documentElement.dataset.vt; });
  return t.updateCallbackDone.catch(() => {});
}
