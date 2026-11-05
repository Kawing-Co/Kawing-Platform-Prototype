import React, { useEffect, useRef, useState } from "react";
import { Check, Minus, Plus, X } from "lucide-react";
import { cleanSel, pickImage, photoPath, scaleOf, toneOf, summarize, unitPrice } from "./merchant";
import Odometer from "./ds/Odometer.jsx";
import { burst } from "./ds/fx.js";
import { spring } from "./ds/spring.js";

const peso = (n) => "₱" + Math.round(n).toLocaleString("en-US");
const delta = (d) => (d ? `${d > 0 ? "+" : "−"}${peso(Math.abs(d))}` : "");
const reduced = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Item customizer. Every choice updates the photograph (the closest photographed variant),
 * the price (rolling digits) and the chips on the image. Swipe the photo or handle down to
 * dismiss; Escape and the backdrop also close it. Pure presentation: the order still carries
 * only { id, sel, qty } and the unit price is recomputed from the menu at submission.
 */
export default function ItemSheet({ item, initial, onClose, onAdd }) {
  const dialog = useRef(null), stage = useRef(null);
  const [sel, setSel] = useState(() => cleanSel(item, initial));
  const [qty, setQty] = useState(1);
  const name = pickImage(item, sel);
  const [layers, setLayers] = useState([{ k: 0, name, first: true }]);
  const closing = useRef(false);

  // photograph swaps: the new variant irises in over the old one
  useEffect(() => {
    setLayers((ls) => {
      if (ls[ls.length - 1].name === name) return ls;
      return [...ls.slice(-1), { k: ls[ls.length - 1].k + 1, name, first: false }];
    });
  }, [name]);
  useEffect(() => {
    if (layers.length < 2) return;
    const t = setTimeout(() => setLayers((ls) => ls.slice(-1)), reduced() ? 20 : 900);
    return () => clearTimeout(t);
  }, [layers]);

  /* native dialog: focus trap + Escape + backdrop */
  useEffect(() => {
    const d = dialog.current;
    if (!d.open) d.showModal();
    return () => { if (d.open) d.close(); };
  }, []);

  /* swipe down to dismiss (grab bar or the photograph) */
  useEffect(() => {
    const d = dialog.current;
    const y = spring(0, { stiffness: 480, damping: 38, precision: 0.4 }, (v) => { d.style.transform = v ? `translateY(${v.toFixed(1)}px)` : ""; });
    let drag = null;
    const down = (e) => {
      if (!e.target.closest("[data-grab]") || (e.pointerType === "mouse" && e.button !== 0)) return;
      drag = { y0: e.clientY, last: e.clientY, t: performance.now(), v: 0, id: e.pointerId, moved: false };
    };
    const move = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const dy = e.clientY - drag.y0;
      if (!drag.moved && Math.abs(dy) < 6) return;
      if (!drag.moved) { drag.moved = true; d.setPointerCapture(e.pointerId); }
      const now = performance.now();
      drag.v = 0.75 * drag.v + 0.25 * ((e.clientY - drag.last) / Math.max(1, now - drag.t));
      drag.last = e.clientY; drag.t = now;
      y.set(dy > 0 ? dy : -Math.sqrt(-dy) * 3);          // rubber-band upward
    };
    const up = (e) => {
      if (!drag || e.pointerId !== drag.id) return;
      const was = drag; drag = null;
      if (!was.moved) return;
      if (y.x > 130 || was.v > 0.55) { y.to(d.offsetHeight); setTimeout(() => { closing.current = true; d.close(); }, 120); }
      else y.to(0);
    };
    d.addEventListener("pointerdown", down); d.addEventListener("pointermove", move);
    d.addEventListener("pointerup", up); d.addEventListener("pointercancel", up);
    return () => { d.removeEventListener("pointerdown", down); d.removeEventListener("pointermove", move); d.removeEventListener("pointerup", up); d.removeEventListener("pointercancel", up); };
  }, []);

  const spark = (colors) => {
    const r = stage.current?.getBoundingClientRect();
    if (r) burst(r.left + r.width / 2, r.top + r.height * 0.55, colors, 16, { spread: 110 });
  };
  const setOne = (o, v) => { if (sel[o.id] === v) return; setSel((s) => ({ ...s, [o.id]: v })); spark([item.glow || "#7da24a", "#eef3dc", "#cfe79a"]); navigator.vibrate?.(8); };
  const toggle = (o, c) => {
    const on = !(sel[o.id] || []).includes(c.id);
    setSel((s) => ({ ...s, [o.id]: on ? [...(s[o.id] || []), c.id] : (s[o.id] || []).filter((x) => x !== c.id) }));
    if (on) spark(c.fx || ["#cfe79a"]);
    navigator.vibrate?.(on ? 12 : 5);
  };
  const price = unitPrice(item, sel), chips = summarize(item, sel);
  const celebrate = (sel.top || []).includes("celebrate");

  return (
    <dialog
      ref={dialog}
      className="k-sheet cx-sheet"
      aria-label={"Customize " + item.name}
      style={{ "--glow": item.glow || "#7da24a" }}
      onClose={onClose}
      onClick={(e) => { if (e.target === dialog.current) dialog.current.close(); }}
    >
      <div className="k-sheet-grab" data-grab aria-hidden="true"><i /></div>
      <div className="k-sheet-stage" data-grab ref={stage}>
        <div className="k-sheet-photo" style={{ "--sc": scaleOf(item, sel), filter: toneOf(item, sel) || undefined }}>
          {layers.map((l) => (
            <img key={l.k} className={"k-layer" + (l.first ? "" : " k-iris")} src={photoPath(l.name)} alt={l.first ? item.name : ""} width="1024" height="1280" draggable="false" />
          ))}
        </div>
        <div className="k-sheet-glow" /><div className={"k-sheet-candle" + (celebrate ? " on" : "")} />
        <button type="button" className="k-sheet-close" aria-label="Close" onClick={() => dialog.current.close()}><X size={18} /></button>
        <div className="k-sheet-tag"><b>{item.name}</b><Odometer value={price} className="k-sheet-price" /></div>
        <div className="k-sheet-chips" aria-live="polite">{chips.map((c) => <span key={c}>{c}</span>)}</div>
      </div>
      <div className="k-sheet-body">
        <p className="k-sheet-desc">{item.description}</p>
        {item.options.map((o) => (
          <fieldset className="k-opt" key={o.id}>
            <legend>{o.label}{o.type === "multi" && <em>optional</em>}{o.type === "range" && <em className="tnum">{sel[o.id]}{o.suffix}</em>}</legend>
            {o.type === "single" && (
              <div className="k-chips" role="radiogroup" aria-label={o.label}>
                {o.choices.map((c) => {
                  const sub = [c.note, delta(c.delta)].filter(Boolean).join(" · ");
                  return (
                    <button type="button" role="radio" aria-checked={sel[o.id] === c.id} key={c.id} className="k-chip" onClick={() => setOne(o, c.id)}>
                      <span>{c.label}</span>{sub && <small>{sub}</small>}
                    </button>
                  );
                })}
              </div>
            )}
            {o.type === "multi" && o.choices.map((c) => {
              const on = (sel[o.id] || []).includes(c.id);
              return (
                <button type="button" role="checkbox" aria-checked={on} key={c.id} className="k-tog" onClick={() => toggle(o, c)}>
                  <span className="k-box"><Check size={15} /></span>
                  <span className="k-tog-t"><b>{c.label}</b>{c.note && <small>{c.note}</small>}</span>
                  <span className="k-tog-d tnum">{delta(c.delta) || "Free"}</span>
                </button>
              );
            })}
            {o.type === "range" && (
              <div className="k-range">
                <input type="range" min="0" max={o.steps.length - 1} step="1" value={o.steps.indexOf(sel[o.id])} aria-label={o.label}
                  style={{ "--fill": `${(o.steps.indexOf(sel[o.id]) / (o.steps.length - 1)) * 100}%` }}
                  onChange={(e) => setSel((s) => ({ ...s, [o.id]: o.steps[Number(e.target.value)] }))} />
                <div className="k-ticks tnum">{o.steps.map((s) => <span key={s} className={s === sel[o.id] ? "on" : ""}>{s}{o.suffix}</span>)}</div>
              </div>
            )}
          </fieldset>
        ))}
      </div>
      <div className="k-sheet-foot">
        <div className="k-qty" role="group" aria-label="Quantity">
          <button type="button" aria-label="Fewer" disabled={qty <= 1} onClick={() => setQty((q) => Math.max(1, q - 1))}><Minus size={16} /></button>
          <output className="tnum">{qty}</output>
          <button type="button" aria-label="More" disabled={qty >= 20} onClick={() => setQty((q) => Math.min(20, q + 1))}><Plus size={16} /></button>
        </div>
        <button type="button" className="primary k-sheet-add" data-tactile
          onClick={() => { const r = stage.current?.getBoundingClientRect(); onAdd({ id: item.id, sel, qty }, r, photoPath(name, true)); dialog.current.close(); }}>
          Add to order · <Odometer value={price * qty} />
        </button>
      </div>
    </dialog>
  );
}
