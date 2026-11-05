// Pure HTML renderers. No DOM access — they run in the browser and in
// scripts/prerender.mjs (so the first paint is real HTML, before any JS).
import { peso, imgPath, defaultSel, pickImage } from "./model.js";
import { I } from "./icons.js";
import { avgColor } from "./lib/placeholder.js";
import HASHES from "../data/blurhashes.js";

const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const pad = (n) => String(n).padStart(2, "0");

/** A photograph with a BlurHash placeholder behind it. */
export function photo(name, { alt = "", cls = "", sm = false, eager = false, style = "" } = {}) {
  const h = HASHES[name] || "";
  return `<span class="ph ${cls}" style="--bh:${h ? avgColor(h) : "#14231a"};${style}"><canvas class="ph-canvas" width="32" height="40" data-blurhash="${h}" aria-hidden="true"></canvas><img class="ph-img" src="${imgPath(name, sm)}" alt="${esc(alt)}" width="${sm ? 480 : 1024}" height="${sm ? 600 : 1280}" ${eager ? 'fetchpriority="high"' : 'loading="lazy"'} decoding="async" draggable="false"></span>`;
}

export const btn = (label, { cls = "btn-primary", attrs = "", icon = "" } = {}) =>
  `<button class="btn ${cls}" ${cls.includes("btn-primary") ? "data-magnetic" : ""} ${attrs}><span class="btn-label">${label}${icon}</span></button>`;

const words = (t) => t.split(" ").map((w) => `<span class="sw">${esc(w)}</span>`).join(" ");
const baseImg = (item) => pickImage(item, defaultSel(item));
const catName = (menu, id) => menu.categories.find((c) => c.id === id)?.label ?? "";
export const ordered = (menu) => menu.categories.flatMap((c) => menu.items.filter((i) => i.cat === c.id));

export function headerHTML(menu) {
  const flyPanels = menu.categories.map((c) => `
    <div class="fly-panel" data-panel="${c.id}" hidden>
      ${menu.items.filter((i) => i.cat === c.id).map((i) => `<button class="fly-item" data-action="customize" data-id="${i.id}">${photo(baseImg(i), { alt: "", sm: true, cls: "fly-thumb" })}<span><b>${esc(i.name)}</b><small class="tnum">${peso(i.price)}</small></span></button>`).join("")}
    </div>`).join("");
  return `
  <header class="topbar" data-topbar>
    <a class="brand" href="#top" aria-label="Matcha Mood — top"><span class="hanko" aria-hidden="true">M</span><span class="brand-name">MATCHA MOOD</span></a>
    <nav class="topnav" aria-label="Sections">
      <div class="flyout-wrap" data-flyout>
        <button class="nav-link" aria-haspopup="true" aria-expanded="false">Menu</button>
        <div class="flyout" hidden>
          <ul class="fly-cats" role="list">${menu.categories.map((c) => `<li><button class="fly-cat" data-cat="${c.id}">${esc(c.label)}<small class="tnum">${menu.items.filter((i) => i.cat === c.id).length}</small>${I.chevR}</button></li>`).join("")}</ul>
          <div class="fly-panels">${flyPanels}</div>
        </div>
      </div>
      <a class="nav-link" href="#story">Ritual</a><a class="nav-link" href="#visit">Visit</a>
    </nav>
    <div class="top-actions">
      <button class="icon-btn hit" data-action="command" aria-label="Search the menu">${I.search}<kbd class="kbd-hint">⌘K</kbd></button>
      <button class="icon-btn hit" data-action="bag" aria-label="Open bag">${I.bag}<span class="bag-count tnum" data-bag-count hidden>0</span></button>
    </div>
  </header>`;
}

export function heroHTML(menu) {
  const items = menu.hero.map((id) => menu.items.find((i) => i.id === id));
  return `
  <section class="hero" id="top" data-hero aria-label="Matcha Mood">
    <div class="hero-stage">
      ${items.map((it, i) => `<figure class="hero-slide" data-i="${i}" data-id="${it.id}" ${i ? 'aria-hidden="true"' : ""}><div class="hero-pan">${photo(baseImg(it), { alt: `${it.name}`, eager: i === 0, cls: "hero-photo" })}</div></figure>`).join("")}
    </div>
    <canvas class="hero-dust" aria-hidden="true"></canvas>
    <div class="hero-shade" aria-hidden="true"></div>
    <div class="hero-copy">
      <p class="eyebrow light">MATCHA SPECIALTY CAFE</p>
      <h1 class="hero-title"><span class="ht-a">MATCHA</span><span class="ht-b">MOOD</span></h1>
      <p class="hero-tag">${esc(menu.merchant.tagline)}</p>
    </div>
    <div class="hero-foot">
      <div class="hero-meta">
        <div class="hero-names" aria-live="polite">${items.map((it, i) => `<div class="hero-name ${i ? "" : "is-on"}" data-i="${i}"><b>${esc(it.name)}</b><span class="tnum">${peso(it.price)}</span></div>`).join("")}</div>
        <span class="hero-count tnum" aria-hidden="true"><b data-hero-cur>01</b> / ${pad(items.length)}</span>
      </div>
      ${btn(`<span data-hero-cta>Order the ${esc(items[0].name)}</span>`, { attrs: 'data-action="hero-order" aria-label="Customize and order this item"', icon: I.arrow })}
      <a class="hero-link" href="#menu">Explore the menu</a>
      <div class="hero-hint" aria-hidden="true">${I.swipe}<span>Swipe</span></div>
    </div>
  </section>`;
}

export function storyHTML() {
  return `
  <section class="story" id="story" data-story aria-labelledby="story-h">
    <div class="story-inner">
      <p class="eyebrow light">THE RITUAL</p>
      <h2 id="story-h" class="story-line balance">${words("Stone-ground. Whisked to order. Poured slowly, so the first sip is the calmest.")}</h2>
      <figure class="story-media">${photo("ritual", { alt: "A bowl of whisked matcha with a bamboo whisk", cls: "story-photo" })}<video class="story-video" muted loop playsinline preload="none" aria-hidden="true" tabindex="-1" data-mp4="media/teaser.mp4" data-webm="media/teaser.webm"></video></figure>
      <ol class="steps">
        <li><span class="tnum">01</span><b>Grind</b><small>Shade-grown tencha, milled slowly on granite.</small></li>
        <li><span class="tnum">02</span><b>Whisk</b><small>Each bowl whisked to order until it turns to silk.</small></li>
        <li><span class="tnum">03</span><b>Pour</b><small>Over milk or ice, never rushed.</small></li>
      </ol>
    </div>
  </section>`;
}

export function galleryHTML(menu) {
  const slides = ordered(menu).map((it, i) => `
    <li class="g-slide" data-id="${it.id}" data-cat="${it.cat}" data-i="${i}" style="--glow:${it.glow}">
      <article class="g-card">
        <div class="g-media">${photo(baseImg(it), { alt: it.name, cls: "g-photo" })}</div>
        <div class="g-body">
          <p class="g-cat">${esc(catName(menu, it.cat))}</p>
          <h3 class="g-name">${esc(it.name)}</h3>
          <p class="g-blurb">${esc(it.blurb)}</p>
          <div class="g-row">
            <span class="price tnum">${peso(it.price)}</span>
            ${btn("Customize", { attrs: `data-action="customize" data-id="${it.id}"`, icon: I.arrow })}
            <button class="icon-btn quick-add hit" data-action="quick-add" data-id="${it.id}" aria-label="Quick add ${esc(it.name)} to bag">${I.plus}</button>
          </div>
        </div>
      </article>
    </li>`).join("");
  return `
  <section class="menu" id="menu" data-menu aria-labelledby="menu-h">
    <header class="sec-head">
      <p class="eyebrow">THE MENU</p>
      <h2 id="menu-h" class="balance">Choose your mood.</h2>
      <p class="lede">Swipe through, then make it yours — size, milk, toppings. The photograph follows your choices.</p>
    </header>
    <div class="rail" role="tablist" aria-label="Categories" data-rail>
      ${menu.categories.map((c, i) => `<button role="tab" aria-selected="${i === 0}" data-cat="${c.id}">${esc(c.label)}</button>`).join("")}
      <i class="rail-ind" aria-hidden="true"></i>
    </div>
    <div class="gallery" data-gallery>
      <ul class="g-track" role="list" tabindex="0" aria-label="Menu items. Swipe or use the arrow keys.">${slides}</ul>
    </div>
    <div class="g-foot">
      <span class="g-count tnum" aria-live="polite"><b data-g-cur>01</b> / <span data-g-total>${pad(menu.items.length)}</span></span>
      <div class="g-progress" aria-hidden="true"><i data-g-bar></i></div>
      <div class="g-arrows"><button class="icon-btn hit" data-g-prev aria-label="Previous">${I.chevL}</button><button class="icon-btn hit" data-g-next aria-label="Next">${I.chevR}</button></div>
    </div>
  </section>`;
}

export function bentoHTML(menu) {
  const wide = new Set([0, 5, 8]);
  return `
  <section class="bento-sec" id="all" aria-labelledby="all-h">
    <header class="sec-head"><p class="eyebrow">ALL AT A GLANCE</p><h2 id="all-h" class="balance">Nine small pleasures.</h2></header>
    <div class="bento">
      ${ordered(menu).map((it, i) => `
      <button class="tile ${wide.has(i) ? "wide" : ""}" data-action="customize" data-id="${it.id}" style="--glow:${it.glow}" aria-label="${esc(it.name)}, ${peso(it.price)}. Customize.">
        ${photo(baseImg(it), { alt: "", sm: !wide.has(i) ? true : false, cls: "tile-photo" })}
        <span class="tile-meta"><small>${esc(catName(menu, it.cat))}</small><b>${esc(it.name)}</b><span class="tnum">${peso(it.price)}</span></span>
        <span class="tile-add" aria-hidden="true">${I.plus}</span>
      </button>`).join("")}
    </div>
  </section>`;
}

export function visitHTML(menu) {
  const m = menu.merchant;
  return `
  <section class="visit" id="visit" aria-labelledby="visit-h">
    <p class="eyebrow">ORDER AHEAD</p>
    <h2 id="visit-h" class="balance">Ready in about <span class="tnum">${m.prepMinutes}</span> minutes.</h2>
    <p class="lede">Order from your phone and collect it at the counter. Takeout or dine-in.</p>
    <ul class="visit-list">
      <li>${I.pin}<span>${esc(m.address)}</span></li>
      <li>${I.clock}<span>${esc(m.hours)}</span></li>
    </ul>
    <p class="fine">Café details are temporary placeholders. This is a demo: orders and payment are simulated.</p>
  </section>`;
}

export function footerHTML() {
  return `<footer class="foot"><span class="hanko sm" aria-hidden="true">M</span><span>Matcha Mood</span><span class="dot"></span><span>Demo ordering experience</span></footer>`;
}

export function appHTML(menu) {
  return headerHTML(menu) + `<main id="main">` + heroHTML(menu) + storyHTML() + galleryHTML(menu) + bentoHTML(menu) + visitHTML(menu) + `</main>` + footerHTML();
}
