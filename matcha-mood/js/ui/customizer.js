// The customizer: a bottom sheet where every choice updates the photograph, the price
// and the chips on the image — with a small surprise on each kind of choice.
import { store, itemById, addLine } from "../store.js";
import { defaultSel, unitPrice, pickImage, scaleOf, toneOf, summarize, peso, imgPath } from "../model.js";
import { photo, btn } from "../views.js";
import { openSheet } from "./sheet.js";
import { odo } from "../lib/odometer.js";
import { spring } from "../lib/spring.js";
import { burst, steam, sparkle, flyTo } from "./fx.js";
import { toast } from "./toast.js";
import { paintPlaceholders, watchImages } from "../lib/placeholder.js";
import { esc, vibrate, reduced } from "../lib/dom.js";
import { I } from "../icons.js";
import { bagPoint, squishBag } from "./bag.js";

const delta = (d) => (d ? `${d > 0 ? "+" : "−"}${peso(Math.abs(d))}` : "");

function groupHTML(o, sel) {
  if (o.type === "single") {
    return `<fieldset class="opt" data-opt="${o.id}"><legend>${esc(o.label)}</legend><div class="chips" role="radiogroup" aria-label="${esc(o.label)}">${o.choices.map((c) => {
      const sub = [c.note, delta(c.delta)].filter(Boolean).join(" · ");
      return `<button type="button" class="chip" role="radio" aria-checked="${sel[o.id] === c.id}" data-v="${c.id}"><span>${esc(c.label)}</span>${sub ? `<small class="tnum">${esc(sub)}</small>` : ""}</button>`;
    }).join("")}</div></fieldset>`;
  }
  if (o.type === "multi") {
    return `<fieldset class="opt" data-opt="${o.id}"><legend>${esc(o.label)}<em>optional</em></legend>${o.choices.map((c) => `
      <button type="button" class="tog" role="checkbox" aria-checked="${(sel[o.id] || []).includes(c.id)}" data-v="${c.id}">
        <span class="box">${I.check}</span><span class="t"><b>${esc(c.label)}</b>${c.note ? `<small>${esc(c.note)}</small>` : ""}</span><span class="delta tnum">${delta(c.delta) || "Free"}</span>
      </button>`).join("")}</fieldset>`;
  }
  const i = o.steps.indexOf(sel[o.id]);
  return `<fieldset class="opt" data-opt="${o.id}"><legend>${esc(o.label)}<em class="tnum" data-range-val>${sel[o.id]}${o.suffix || ""}</em></legend>
    <div class="range"><input type="range" min="0" max="${o.steps.length - 1}" step="1" value="${i}" aria-label="${esc(o.label)}" style="--fill:${(i / (o.steps.length - 1)) * 100}%">
    <div class="ticks tnum">${o.steps.map((s, k) => `<span class="${k === i ? "on" : ""}">${s}${o.suffix || ""}</span>`).join("")}</div></div></fieldset>`;
}

export function openCustomizer(itemId, { sel: initial } = {}) {
  const item = itemById(itemId);
  if (!item) return;
  const sel = initial ? JSON.parse(JSON.stringify(initial)) : defaultSel(item);
  let qty = 1, curName = null;

  const root = document.createElement("div");
  root.className = "cz";
  root.style.setProperty("--glow", item.glow);
  root.innerHTML = `
    <div class="cz-stage" data-grab>
      <div class="cz-photo"><div class="cz-zoom"></div></div>
      <div class="cz-glow"></div><div class="cz-candle"></div>
      <button type="button" class="icon-btn cz-close hit" data-close aria-label="Close">${I.close}</button>
      <div class="cz-tag"><b>${esc(item.name)}</b><span class="cz-price tnum" data-price></span></div>
      <div class="cz-chips" aria-live="polite"></div>
    </div>
    <div class="cz-body" data-scroll>
      <div class="cz-head"><span class="cat">${esc(store.menu.categories.find((c) => c.id === item.cat)?.label ?? "")}</span><p>${esc(item.blurb)}</p></div>
      ${item.options.map((o) => groupHTML(o, sel)).join("")}
    </div>
    <div class="cz-foot">
      <div class="qty" role="group" aria-label="Quantity"><button type="button" data-q="-1" aria-label="Fewer">${I.minus}</button><output class="tnum" data-qty>1</output><button type="button" data-q="1" aria-label="More">${I.plus}</button></div>
      ${btn(`Add to bag <span class="tnum" data-total></span>`, { attrs: 'data-add data-autofocus' })}
    </div>`;

  const handle = openSheet({ content: root, label: `Customize ${item.name}` });
  const stage = root.querySelector(".cz-stage"), zoom = root.querySelector(".cz-zoom");
  const priceEl = root.querySelector("[data-price]"), totalEl = root.querySelector("[data-total]"), qtyEl = root.querySelector("[data-qty]");
  const chipsEl = root.querySelector(".cz-chips"), candle = root.querySelector(".cz-candle");

  /* photograph: scale is a spring (so sizes overshoot a little); swaps are an iris reveal */
  const sc = spring(scaleOf(item, sel) * 1.3, { stiffness: 90, damping: 11 }, (v) => zoom.style.setProperty("--sc", v.toFixed(4)));
  sc.to(scaleOf(item, sel));
  function showImage(name, instant) {
    if (name === curName) return;
    curName = name;
    const layer = document.createElement("div");
    layer.className = "cz-layer";
    layer.innerHTML = photo(name, { alt: item.name, eager: true });
    zoom.append(layer);
    paintPlaceholders(layer); watchImages(layer);
    const img = layer.querySelector("img");
    const go = () => {
      layer.querySelector(".ph").classList.add("is-loaded");
      if (instant || reduced()) { prune(layer); return; }
      const a = layer.animate([{ clipPath: "circle(0% at 50% 58%)" }, { clipPath: "circle(150% at 50% 58%)" }], { duration: 800, easing: "cubic-bezier(.2,.8,.2,1)" });
      a.onfinish = () => prune(layer);
    };
    (img.decode ? img.decode() : Promise.resolve()).then(go, go);
  }
  const prune = (keep) => { for (const l of [...zoom.children]) { if (l === keep) break; l.remove(); } };

  /* chips on the photograph show what you've chosen */
  const chipMap = new Map();
  function refreshChips() {
    const now = new Set(summarize(item, sel));
    for (const [k, el] of chipMap) if (!now.has(k)) { el.classList.add("out"); setTimeout(() => el.remove(), 240); chipMap.delete(k); }
    for (const k of now) if (!chipMap.has(k)) { const el = Object.assign(document.createElement("span"), { className: "cz-chip", textContent: k }); chipsEl.append(el); chipMap.set(k, el); }
  }

  function refresh({ instant = false } = {}) {
    odo(priceEl, unitPrice(item, sel));
    odo(totalEl, unitPrice(item, sel) * qty);
    qtyEl.textContent = qty;
    root.querySelector('[data-q="-1"]').disabled = qty <= 1;
    root.querySelector('[data-q="1"]').disabled = qty >= 20;
    showImage(pickImage(item, sel), instant);
    sc.to(scaleOf(item, sel));
    zoom.style.filter = toneOf(item, sel);
    candle.classList.toggle("on", !!sel.top?.includes("celebrate"));
    refreshChips();
  }

  const center = () => { const r = stage.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.top + r.height * 0.55, r }; };

  /* choices */
  root.addEventListener("click", (e) => {
    const close = e.target.closest("[data-close]");
    if (close) { handle.close(); return; }
    const q = e.target.closest("[data-q]");
    if (q) { qty = Math.max(1, Math.min(20, qty + Number(q.dataset.q))); refresh(); vibrate(6); return; }
    const chip = e.target.closest(".chip");
    if (chip) {
      const opt = chip.closest("[data-opt]").dataset.opt, v = chip.dataset.v, prev = sel[opt];
      if (prev === v) return;
      sel[opt] = v;
      chip.parentElement.querySelectorAll(".chip").forEach((c) => c.setAttribute("aria-checked", String(c === chip)));
      refresh(); vibrate(8);
      const { x, y } = center();
      if (opt === "temp") v === "hot" ? steam(x, y + 20) : sparkle(x, y - 20, 14);
      else if (opt === "size" || opt === "pack" || opt === "count" || opt === "portion") burst(x, y, [item.glow, "#eef3dc", "#cfe79a"], 12, { spread: 110 });
      else if (opt === "strength") burst(x, y, [item.glow, "#4d7027"], 10);
      else sparkle(x, y, 8);
      return;
    }
    const tog = e.target.closest(".tog");
    if (tog) {
      const opt = tog.closest("[data-opt]").dataset.opt, v = tog.dataset.v;
      const list = (sel[opt] ||= []), on = !list.includes(v);
      sel[opt] = on ? [...list, v] : list.filter((x) => x !== v);
      tog.setAttribute("aria-checked", String(on));
      refresh(); vibrate(on ? 12 : 5);
      if (on) { const c = item.options.find((o) => o.id === opt).choices.find((c) => c.id === v); const { x, y } = center(); burst(x, y, c.fx || ["#cfe79a"], 22, { spread: 130 }); }
      return;
    }
    if (e.target.closest("[data-add]")) add();
  });
  root.addEventListener("input", (e) => {
    const input = e.target.closest(".range input"); if (!input) return;
    const o = item.options.find((o) => o.id === input.closest("[data-opt]").dataset.opt);
    const i = Number(input.value); sel[o.id] = o.steps[i];
    input.style.setProperty("--fill", `${(i / (o.steps.length - 1)) * 100}%`);
    input.closest("[data-opt]").querySelector("[data-range-val]").textContent = `${o.steps[i]}${o.suffix || ""}`;
    input.parentElement.querySelectorAll(".ticks span").forEach((s, k) => s.classList.toggle("on", k === i));
    refresh(); vibrate(4);
  });

  function add() {
    const { x, y, r } = center();
    const res = addLine(itemId, sel, qty);
    const src = imgPath(curName, true);
    handle.close();
    flyTo({ from: { x, y }, src, target: bagPoint(), size: Math.min(110, r.width * 0.3) }).then(() => { squishBag(); burst(bagPoint().x, bagPoint().y, ["#cfe79a", "#7da24a", "#eef3dc"], 14, { spread: 70, gravity: 30 }); vibrate(14); });
    toast({ text: `Added ${qty > 1 ? qty + " × " : ""}${item.name}`, action: { label: "Undo", onClick: () => res.undo() } });
  }

  refresh({ instant: true });
  return handle;
}
