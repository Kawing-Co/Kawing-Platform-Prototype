// Bag: the floating pill (also the fly-to target), the header badge, and the bag sheet.
import { store, subscribe, cartCount, cartTotal, itemById, lineUnit, setQty, removeLine, clearCart } from "../store.js";
import { peso, pickImage, summarize } from "../model.js";
import { photo, btn } from "../views.js";
import { openSheet } from "./sheet.js";
import { odo } from "../lib/odometer.js";
import { toast } from "./toast.js";
import { paintPlaceholders, watchImages } from "../lib/placeholder.js";
import { esc } from "../lib/dom.js";
import { I } from "../icons.js";

let pill, hooks = {}, bagHandle = null, renderBagFn = null;

export function initBag(h) {
  hooks = h;
  pill = document.createElement("button");
  pill.className = "bag-pill"; pill.type = "button";
  pill.setAttribute("aria-label", "Open bag");
  pill.innerHTML = `<span class="n tnum" data-n>0</span><span class="lbl">View bag</span><span class="sync" data-sync></span><span class="tot"><span data-tot class="tnum"></span>${I.arrow}</span>`;
  document.body.append(pill);
  pill.addEventListener("click", openBag);
  subscribe((type) => { paintPill(); if (type !== "sync") { renderBagFn?.(); } else renderBagFn?.(true); });
  paintPill();
}

let prevCount = 0;
function paintPill() {
  const n = cartCount();
  pill.classList.toggle("on", n > 0);
  pill.querySelector("[data-n]").textContent = n;
  odo(pill.querySelector("[data-tot]"), cartTotal());
  pill.querySelector("[data-sync]").classList.toggle("on", store.syncing > 0);
  document.querySelectorAll("[data-bag-count]").forEach((b) => {
    b.hidden = n === 0; b.textContent = n;
    if (n > prevCount) { b.classList.remove("bump"); void b.offsetWidth; b.classList.add("bump"); }
  });
  prevCount = n;
}

/** Centre of the pill (its resting place), even while it is still sliding in. */
export function bagPoint() {
  const bottom = parseFloat(getComputedStyle(pill).bottom) || 14;   // layout position, ignores the slide-in transform
  return { x: innerWidth / 2, y: innerHeight - bottom - pill.offsetHeight / 2 };
}
export function squishBag() { pill.classList.remove("squish"); void pill.offsetWidth; pill.classList.add("squish"); }

/* ───────── bag sheet ───────── */
export function openBag() {
  if (bagHandle && !bagHandle.closed) return;
  const root = document.createElement("div");
  root.className = "bag";
  root.innerHTML = `<div class="bag-head" data-grab><h2>Your bag</h2><span class="sub tnum" data-sub></span><span class="sync-note" data-note>Saving…</span></div><div class="bag-list" data-scroll data-list></div><div class="bag-foot" data-foot></div>`;
  const list = root.querySelector("[data-list]"), foot = root.querySelector("[data-foot]");
  const note = root.querySelector("[data-note]"), sub = root.querySelector("[data-sub]");

  function render(syncOnly) {
    note.classList.toggle("on", store.syncing > 0);
    if (syncOnly) return;
    const n = cartCount();
    sub.textContent = n ? `${n} item${n > 1 ? "s" : ""}` : "";
    if (!store.cart.length) {
      list.innerHTML = `<div class="bag-empty">${photo("ritual", { alt: "", sm: true })}<h3>Nothing here yet.</h3><p>Pick something from the menu and it will wait here.</p>${btn("Browse the menu", { cls: "btn-ghost", attrs: "data-browse" })}</div>`;
      foot.innerHTML = ""; foot.hidden = true;
      paintPlaceholders(list); watchImages(list);
      return;
    }
    foot.hidden = false;
    list.innerHTML = store.cart.map((l) => {
      const it = itemById(l.itemId), sum = summarize(it, l.sel, { all: false });
      return `<div class="row" data-id="${l.id}">
        ${photo(pickImage(it, l.sel), { alt: "", sm: true, cls: "thumb sq" })}
        <div class="info"><b>${esc(it.name)}</b><small>${esc(sum.length ? sum.join(" · ") : "As on the menu")}</small>
          <div class="qty" role="group" aria-label="Quantity of ${esc(it.name)}"><button type="button" data-qd="-1" aria-label="Fewer">${I.minus}</button><output class="tnum">${l.qty}</output><button type="button" data-qd="1" aria-label="More">${I.plus}</button></div></div>
        <div class="side"><span class="lp tnum">${peso(lineUnit(l) * l.qty)}</span><button type="button" class="icon-btn rm hit" data-rm aria-label="Remove ${esc(it.name)}">${I.trash}</button></div>
      </div>`;
    }).join("");
    paintPlaceholders(list); watchImages(list);
    foot.innerHTML = `<div class="sum"><span>Subtotal · VAT included</span><span class="tnum">${peso(cartTotal())}</span></div>${btn(`Checkout · <span class="tnum" data-ct></span>`, { cls: "btn-primary btn-block", attrs: "data-checkout data-autofocus", icon: I.arrow })}`;
    odo(foot.querySelector("[data-ct]"), cartTotal());
  }

  root.addEventListener("click", (e) => {
    const row = e.target.closest(".row");
    const qd = e.target.closest("[data-qd]");
    if (qd && row) { const l = store.cart.find((x) => x.id === row.dataset.id); if (l) { if (l.qty + Number(qd.dataset.qd) < 1) return; setQty(l.id, l.qty + Number(qd.dataset.qd)); } return; }
    if (e.target.closest("[data-rm]") && row) {
      const l = store.cart.find((x) => x.id === row.dataset.id), name = itemById(l.itemId).name;
      const undo = removeLine(row.dataset.id);
      toast({ text: `Removed ${name}`, action: { label: "Undo", onClick: () => undo?.undo() } });
      return;
    }
    if (e.target.closest("[data-browse]")) { handle.close(); location.hash = "#menu"; return; }
    if (e.target.closest("[data-checkout]")) { handle.close({ instant: false }); setTimeout(() => hooks.checkout?.(), 120); }
  });

  renderBagFn = render;
  const handle = openSheet({ content: root, label: "Your bag", grabDark: true, onClosed: () => { renderBagFn = null; } });
  bagHandle = handle;
  render();
}
