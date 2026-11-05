// Pre-renders the page shell into index.html so the first paint is real HTML —
// hero, menu and photographs appear before any JavaScript runs — and emits
// ../public/matcha-mood/data/menu.json (used by the stale-while-revalidate demo).
import { readFileSync, writeFileSync } from "node:fs";
import { MENU } from "../data/menu.js";
import { appHTML } from "../js/views.js";

const root = new URL("../", import.meta.url);
const tpl = readFileSync(new URL("index.src.html", root), "utf8");
writeFileSync(new URL("index.html", root), tpl.replace("<!--PRERENDER-->", appHTML(MENU)));
writeFileSync(new URL("../public/matcha-mood/data/menu.json", root), JSON.stringify(MENU, null, 2));
console.log("prerendered index.html + data/menu.json");
