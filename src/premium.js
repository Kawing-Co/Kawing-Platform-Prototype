import { useEffect, useState } from "react";
import { flushSync } from "react-dom";
export const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;
let activeTransition;
export function transitionView(action) {
  activeTransition?.skipTransition?.();
  if (!document.startViewTransition || reducedMotion()) return action();
  const transition = document.startViewTransition(() => flushSync(action));
  activeTransition = transition;
  transition.finished
    .catch(() => {})
    .finally(() => {
      if (activeTransition === transition) activeTransition = null;
    });
}
export function offerUndo(message, undo) {
  window.dispatchEvent(
    new CustomEvent("kawing:undo", {
      detail: { message, undo, id: crypto.randomUUID() },
    }),
  );
}
// A browser-local stale-while-refresh pattern. No network/cache service is implied.
const snapshots = new Map();
export function useLocalSnapshot(key) {
  const read = () => {
    try {
      return localStorage.getItem(key);
    } catch {
      return null;
    }
  };
  const [record, setRecord] = useState(() => ({
    key,
    raw: snapshots.get(key) ?? read(),
  }));
  const raw = record.key === key ? record.raw : (snapshots.get(key) ?? read());
  useEffect(() => {
    const refresh = () => {
      const next = read();
      snapshots.set(key, next);
      setRecord((previous) =>
        previous.key === key && previous.raw === next
          ? previous
          : { key, raw: next },
      );
    };
    refresh();
    const storage = (e) => {
      if (e.key === key || e.key === null) refresh();
    };
    window.addEventListener("storage", storage);
    window.addEventListener("focus", refresh);
    window.addEventListener("kawing:local-change", refresh);
    return () => {
      window.removeEventListener("storage", storage);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("kawing:local-change", refresh);
    };
  }, [key]);
  let data = null;
  try {
    data = JSON.parse(raw);
  } catch {}
  return data;
}
export function inTriangle(p, a, b, c) {
  const sign = (p1, p2, p3) =>
    (p1.x - p3.x) * (p2.y - p3.y) - (p2.x - p3.x) * (p1.y - p3.y);
  const v = [sign(p, a, b), sign(p, b, c), sign(p, c, a)];
  return !(v.some((x) => x < 0) && v.some((x) => x > 0));
}
