// Boot: show the best menu we already have, hydrate the prerendered page, then
// revalidate the menu in the background (stale-while-revalidate).
import { MENU } from "../data/menu.js";
import { store, bootMenu, revalidateMenu } from "./store.js";
import { appHTML } from "./views.js";
import { paintPlaceholders, watchImages } from "./lib/placeholder.js";
import { initMagnets } from "./lib/magnet.js";
import { initHero } from "./ui/hero.js";
import { initGallery, initStory, initTopbar, initFlyout } from "./ui/page.js";

bootMenu();
const app = document.getElementById("app");
// Prerendered HTML is already on screen. Re-render only if a newer cached menu replaced the built-in one.
if (!app.dataset.prerendered || store.menu !== MENU) app.innerHTML = appHTML(store.menu);

let ui = null;
function hydrate() {
  paintPlaceholders(app);
  watchImages(app);
  initTopbar();
  const gallery = initGallery(store.menu);
  initStory();
  initFlyout();
  const hero = initHero(store.menu, { onOrder: (id) => ui?.customize(id) });
  return { gallery, hero };
}

const parts = hydrate();
initMagnets();
requestAnimationFrame(() => document.documentElement.classList.add("is-ready"));

import("./ui/overlays.js")
  .then((m) => { ui = m.initOverlays({ ...parts, rehydrate: () => { Object.assign(parts, hydrate()); } }); window.matchaMood = ui; })
  .catch((e) => console.warn("overlays not loaded", e));

revalidateMenu().then((changed) => {
  if (changed) { app.innerHTML = appHTML(store.menu); Object.assign(parts, hydrate()); ui?.toast?.({ text: "Menu updated" }); }
});
