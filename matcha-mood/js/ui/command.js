// Command menu (⌘K / Ctrl K, or the search button on a phone). Fuzzy-find any item,
// jump to a category, or run an action — with keyboard hints on devices that have a keyboard.
import { store } from "../store.js";
import { peso, defaultSel, pickImage } from "../model.js";
import { photo } from "../views.js";
import { register, popHistory } from "./sheet.js";
import { paintPlaceholders, watchImages } from "../lib/placeholder.js";
import { esc, reduced } from "../lib/dom.js";
import { I } from "../icons.js";

const score = (q, text) => {
  if (!q) return 1;
  const t = text.toLowerCase(), i = t.indexOf(q);
  if (i >= 0) return 100 - i;
  let k = 0; for (const c of t) if (c === q[k]) k++;       // subsequence match
  return k === q.length ? 10 : 0;
};

let open = null;
export function openCommand({ actions = [], onPick }) {
  if (open) { open.close(); return; }
  const wrap = document.createElement("div");
  wrap.className = "cmd-wrap";
  wrap.innerHTML = `<div class="scrim" style="--so:1"></div>
    <div class="cmd" role="dialog" aria-modal="true" aria-label="Search the menu">
      <label class="cmd-in">${I.search}<input type="text" placeholder="Search the menu or type a command…" autocomplete="off" spellcheck="false" aria-label="Search" data-autofocus></label>
      <div class="cmd-list" role="listbox" data-list></div>
      <div class="cmd-hints" aria-hidden="true"><span><kbd>↑</kbd><kbd>↓</kbd> navigate</span><span><kbd>↵</kbd> open</span><span><kbd>esc</kbd> close</span></div>
    </div>`;
  document.getElementById("layer").append(wrap);
  const panel = wrap.querySelector(".cmd"), input = wrap.querySelector("input"), list = wrap.querySelector("[data-list]");
  let rows = [], active = 0, closed = false;
  const entry = { close };
  const unregister = register(entry);
  input.focus();
  if (!reduced()) { panel.animate([{ opacity: 0, transform: "translateY(-14px) scale(.96)" }, { opacity: 1, transform: "none" }], { duration: 420, easing: "cubic-bezier(.34,1.56,.64,1)" }); wrap.firstElementChild.animate([{ opacity: 0 }, { opacity: 1 }], { duration: 250 }); }

  function build(q) {
    q = q.trim().toLowerCase();
    const items = store.menu.items.map((it) => ({ it, s: Math.max(score(q, it.name), score(q, it.cat) / 2, score(q, it.blurb) / 4) })).filter((x) => x.s > 0).sort((a, b) => (q ? b.s - a.s : 0));
    const acts = actions.map((a) => ({ a, s: score(q, a.label) })).filter((x) => x.s > 0 && (q || true));
    rows = [];
    let h = "";
    if (items.length) {
      h += `<div class="cmd-group">Menu</div>`;
      for (const { it } of items) { rows.push({ kind: "item", it }); h += `<button type="button" class="cmd-row" role="option" data-r="${rows.length - 1}">${photo(pickImage(it, defaultSel(it)), { sm: true, alt: "" })}<span><b>${esc(it.name)}</b><small>${esc(store.menu.categories.find((c) => c.id === it.cat)?.label ?? "")}</small></span><span class="r tnum">${peso(it.price)}</span></button>`; }
    }
    if (acts.length) {
      h += `<div class="cmd-group">Actions</div>`;
      for (const { a } of acts) { rows.push({ kind: "act", a }); h += `<button type="button" class="cmd-row" role="option" data-r="${rows.length - 1}"><span class="ico-box">${a.icon || I.arrow}</span><span><b>${esc(a.label)}</b></span><span class="r">${a.hint ? `<kbd>${a.hint}</kbd>` : ""}</span></button>`; }
    }
    list.innerHTML = rows.length ? h : `<div class="cmd-empty">No match for “${esc(q)}”. Try “matcha”, “cake” or “strawberry”.</div>`;
    paintPlaceholders(list); watchImages(list);
    active = 0; mark();
  }
  function mark() {
    list.querySelectorAll(".cmd-row").forEach((r) => { const on = Number(r.dataset.r) === active; r.classList.toggle("on", on); r.setAttribute("aria-selected", String(on)); if (on) r.scrollIntoView({ block: "nearest" }); });
  }
  function run(i) {
    const r = rows[i]; if (!r) return;
    close();
    setTimeout(() => (r.kind === "item" ? onPick(r.it.id) : r.a.run()), 60);
  }
  function close({ fromPop = false, instant = false } = {}) {
    if (closed) return; closed = true; open = null; unregister(); popHistory(entry, fromPop);
    if (instant || reduced()) { wrap.remove(); return; }
    panel.animate([{ opacity: 1 }, { opacity: 0, transform: "translateY(-10px) scale(.97)" }], { duration: 200, fill: "forwards" });
    wrap.firstElementChild.animate([{ opacity: 1 }, { opacity: 0 }], { duration: 200, fill: "forwards" }).onfinish = () => wrap.remove();
  }
  open = entry;
  input.addEventListener("input", () => build(input.value));
  input.addEventListener("keydown", (e) => {
    if (e.key === "ArrowDown") { e.preventDefault(); active = Math.min(rows.length - 1, active + 1); mark(); }
    else if (e.key === "ArrowUp") { e.preventDefault(); active = Math.max(0, active - 1); mark(); }
    else if (e.key === "Enter") { e.preventDefault(); run(active); }
  });
  list.addEventListener("click", (e) => { const r = e.target.closest("[data-r]"); if (r) run(Number(r.dataset.r)); });
  list.addEventListener("mousemove", (e) => { const r = e.target.closest("[data-r]"); if (r && Number(r.dataset.r) !== active) { active = Number(r.dataset.r); mark(); } });
  wrap.firstElementChild.addEventListener("click", () => close());
  build("");
  return entry;
}
