// Client state: menu (stale-while-revalidate), cart (optimistic updates with rollback),
// and demo order submission (idempotency keys). Everything is browser-local — the
// "server" below is a simulation so the UX of latency, failure and retry is real.
import { MENU } from "../data/menu.js";
import { sigOf, unitPrice, summarize } from "./model.js";
import { sleep, uid } from "./lib/dom.js";

const CART_KEY = "mm-cart-v1", MENU_KEY = "mm-menu-v1", ORDERS_KEY = "mm-orders-v1", DRAFT_KEY = "mm-draft-v1";
const params = new URLSearchParams(location.search);
// Demo switches: ?fail=cart makes the first "sync" fail (shows optimistic rollback),
// ?fail=order makes the first order submit fail (shows retry with the same idempotency key).
const FAIL = params.get("fail");

const read = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const write = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} };

const subs = new Set();
export const subscribe = (fn) => (subs.add(fn), () => subs.delete(fn));
const emit = (type = "cart") => subs.forEach((fn) => fn(type));

export const store = {
  menu: MENU,
  cart: [],
  syncing: 0,
  lastError: null,
};

export const itemById = (id) => store.menu.items.find((i) => i.id === id);

/* ───────────── menu: stale-while-revalidate ───────────── */
export function bootMenu() {
  const cached = read(MENU_KEY, null);
  // Show the best copy we already have, instantly…
  if (cached && cached.version > MENU.version) store.menu = cached;
  store.cart = read(CART_KEY, []).filter((l) => store.menu.items.some((i) => i.id === l.itemId));
}
// …then revalidate in the background; callers re-render only if something changed.
export async function revalidateMenu() {
  try {
    const res = await fetch("data/menu.json", { cache: "no-cache" });
    if (!res.ok) return false;
    const fresh = await res.json();
    if (fresh.version !== store.menu.version) {
      store.menu = fresh;
      write(MENU_KEY, fresh);
      emit("menu");
      return true;
    }
    write(MENU_KEY, fresh);
  } catch {}
  return false;
}

/* ───────────── cart (optimistic) ───────────── */
const persist = () => write(CART_KEY, store.cart);
export const cartCount = () => store.cart.reduce((n, l) => n + l.qty, 0);
export const lineUnit = (l) => unitPrice(itemById(l.itemId), l.sel);
export const cartTotal = () => store.cart.reduce((n, l) => n + lineUnit(l) * l.qty, 0);

// The "server": resolves after a believable delay; may fail on demand.
let failedCart = false;
async function syncCart() {
  store.syncing++; emit("sync");
  try {
    await sleep(480 + Math.random() * 260);
    if (FAIL === "cart" && !failedCart) { failedCart = true; throw new Error("Couldn't reach the café"); }
  } finally { store.syncing--; emit("sync"); }
}
// Apply a change immediately; if the background sync fails, roll it back.
function optimistic(apply, rollback, label) {
  apply(); persist(); emit();
  syncCart().catch((e) => { rollback(); persist(); store.lastError = { message: `${label} — ${e.message}. Reverted.` }; emit("error"); emit(); });
}

export function addLine(itemId, sel, qty = 1) {
  const sig = sigOf(itemId, sel);
  const existing = store.cart.find((l) => sigOf(l.itemId, l.sel) === sig);
  let line = existing, created = false, prevQty = existing?.qty ?? 0;
  optimistic(
    () => {
      if (existing) existing.qty = Math.min(20, existing.qty + qty);
      else { line = { id: uid("ln"), itemId, sel: JSON.parse(JSON.stringify(sel)), qty }; store.cart.push(line); created = true; }
    },
    () => { if (created) store.cart = store.cart.filter((l) => l !== line); else if (existing) existing.qty = prevQty; },
    "Couldn't add to bag"
  );
  return {
    line,
    undo() { // reverses only THIS add (later adds that merged into the same line stay)
      const l = store.cart.find((x) => x.id === line.id);
      if (l) l.qty = Math.max(0, l.qty - qty);
      store.cart = store.cart.filter((x) => x.qty > 0); persist(); emit();
    },
  };
}
export function setQty(id, qty) {
  const l = store.cart.find((x) => x.id === id); if (!l) return;
  const prev = l.qty;
  optimistic(() => { l.qty = Math.max(1, Math.min(20, qty)); }, () => { l.qty = prev; }, "Couldn't update quantity");
}
export function removeLine(id) {
  const i = store.cart.findIndex((l) => l.id === id); if (i < 0) return null;
  const [gone] = store.cart.splice(i, 1);
  persist(); emit(); syncCart().catch(() => {});
  return { undo() { store.cart.splice(Math.min(i, store.cart.length), 0, gone); persist(); emit(); } };
}
export function clearCart() {
  const prev = store.cart; store.cart = []; persist(); emit();
  return { undo() { store.cart = prev; persist(); emit(); } };
}

/* ───────────── checkout draft ───────────── */
export const draft = Object.assign({ pickup: "takeout", slot: 0, name: "", phone: "", pay: "card" }, read(DRAFT_KEY, {}));
export const saveDraft = () => write(DRAFT_KEY, { name: draft.name, phone: draft.phone, pickup: draft.pickup, pay: draft.pay });

/* ───────────── orders: idempotent submit ───────────── */
export const VAT = 0.12; // Philippine VAT; menu prices are VAT-inclusive (same rate for takeout and dine-in)
export const taxIncluded = (total) => Math.round(total - total / (1 + VAT));
export const readOrders = () => read(ORDERS_KEY, []);

export function buildOrder(slotLabel, slotAt) {
  const lines = store.cart.map((l) => {
    const it = itemById(l.itemId);
    return { itemId: l.itemId, name: it.name, qty: l.qty, unit: unitPrice(it, l.sel), sel: l.sel, summary: summarize(it, l.sel, { all: false }) };
  });
  const total = lines.reduce((n, l) => n + l.unit * l.qty, 0);
  return { lines, total, tax: taxIncluded(total), pickup: draft.pickup, slotLabel, slotAt, name: draft.name.trim(), phone: draft.phone.trim(), pay: draft.pay };
}

let failedOrder = sessionStorage.getItem("mm-failed-order") === "1";
// The "server". The same idempotency key always yields the same single order, so
// double-taps, retries after a dropped connection, or a replayed request never duplicate it.
export async function submitOrder(orderDraft, key) {
  await sleep(1100);
  const orders = readOrders();
  const dup = orders.find((o) => o.key === key);
  if (dup) return { order: dup, replay: true };
  if (FAIL === "order" && !failedOrder) { failedOrder = true; sessionStorage.setItem("mm-failed-order", "1"); throw new Error("The connection dropped"); }
  const n = (orders[0]?.n ?? 427) + 1;
  const order = { id: "MM-" + String(n).padStart(4, "0"), n, key, createdAt: Date.now(), ...orderDraft };
  write(ORDERS_KEY, [order, ...orders].slice(0, 12));
  try { window.dispatchEvent(new CustomEvent("matchamood:order", { detail: order })); } catch {} // host pages (e.g. Kawing) can listen
  return { order, replay: false };
}
