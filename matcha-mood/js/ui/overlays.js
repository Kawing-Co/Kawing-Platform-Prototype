// Wires every overlay to the page: delegated actions, keyboard shortcuts, quick-add.
import { store, addLine, itemById, cartCount } from "../store.js";
import { defaultSel, pickImage, imgPath } from "../model.js";
import { openCustomizer } from "./customizer.js";
import { initBag, openBag, bagPoint, squishBag } from "./bag.js";
import { openFlow } from "./flow.js";
import { openCommand } from "./command.js";
import { toast } from "./toast.js";
import { flyTo, burst } from "./fx.js";
import { overlayCount } from "./sheet.js";
import { vibrate } from "../lib/dom.js";
import { I } from "../icons.js";

export function initOverlays({ gallery }) {
  const customize = (id) => openCustomizer(id);
  const checkout = () => (cartCount() ? openFlow() : toast({ text: "Your bag is empty. Pick something you like first." }));
  initBag({ checkout });

  const actions = () => [
    { label: "Open bag", hint: "B", icon: I.bag, run: openBag },
    { label: "Checkout", hint: "C", icon: I.arrow, run: checkout },
    ...store.menu.categories.map((c) => ({ label: `Browse ${c.label.toLowerCase()}`, icon: I.cup, run: () => { const first = store.menu.items.find((i) => i.cat === c.id); gallery?.goId?.(first.id); } })),
    { label: "Back to top", icon: I.chevL, run: () => scrollTo({ top: 0, behavior: "smooth" }) },
  ];
  const command = () => openCommand({ actions: actions(), onPick: customize });

  function quickAdd(btn) {
    const it = itemById(btn.dataset.id), sel = defaultSel(it);
    const r = btn.getBoundingClientRect();
    const res = addLine(it.id, sel, 1);
    vibrate(10);
    burst(r.left + r.width / 2, r.top + r.height / 2, ["#cfe79a", "#eef3dc"], 10, { spread: 60, gravity: 20 });
    flyTo({ from: { x: r.left + r.width / 2, y: r.top + r.height / 2 }, src: imgPath(pickImage(it, sel), true), target: bagPoint(), size: 64, duration: 850 }).then(() => squishBag());
    toast({ text: `Added ${it.name}`, action: { label: "Undo", onClick: () => res.undo() } });
  }

  document.addEventListener("click", (e) => {
    const a = e.target.closest("[data-action]"); if (!a) return;
    const act = a.dataset.action;
    if (act === "customize") customize(a.dataset.id);
    else if (act === "quick-add") quickAdd(a);
    else if (act === "bag") openBag();
    else if (act === "command") command();
  });

  const typing = (t) => t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  addEventListener("keydown", (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") { e.preventDefault(); command(); return; }
    if (typing(e.target) || e.metaKey || e.ctrlKey || e.altKey) return;
    if (e.key === "/") { e.preventDefault(); command(); }
    else if (e.key.toLowerCase() === "b" && !overlayCount()) openBag();
    else if (e.key.toLowerCase() === "c" && !overlayCount()) checkout();
  });

  // optimistic-update failures surface here
  import("../store.js").then(({ subscribe }) => subscribe((t) => { if (t === "error" && store.lastError) toast({ text: store.lastError.message, duration: 6000 }); }));

  return { customize, checkout, command, toast, openBag };
}
