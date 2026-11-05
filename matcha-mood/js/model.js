// Pure model helpers — shared by the browser app and the Node prerenderer.
export const peso = (n) => "₱" + Math.round(n).toLocaleString("en-US");

export function defaultSel(item) {
  const sel = {};
  for (const o of item.options || []) sel[o.id] = o.type === "multi" ? [] : o.default ?? o.choices?.[0]?.id;
  return sel;
}

export function unitPrice(item, sel) {
  let p = item.price;
  for (const o of item.options || []) {
    if (o.type === "range") continue;
    const v = sel[o.id];
    for (const c of o.choices || []) if (o.type === "multi" ? v?.includes(c.id) : v === c.id) p += c.delta || 0;
  }
  return p;
}

const matches = (when, sel) =>
  Object.entries(when).every(([k, want]) => (Array.isArray(want) ? want.some((w) => (sel[k] || []).includes(w)) : sel[k] === want));

/** The photographed variant closest to this selection. */
export function pickImage(item, sel) {
  for (const r of item.images.rules || []) if (matches(r.when, sel)) return r.src;
  return item.images.base;
}

const choiceOf = (item, sel, optId) => item.options?.find((o) => o.id === optId)?.choices?.find((c) => c.id === sel[optId]);
export function scaleOf(item, sel) {
  return choiceOf(item, sel, "size")?.scale ?? 1.06;
}
export function toneOf(item, sel) {
  const parts = [];
  for (const o of item.options || []) { const c = o.choices?.find((c) => c.id === sel[o.id]); if (c?.tone) parts.push(c.tone); }
  return parts.join(" ");
}

export function summarize(item, sel, { all = false } = {}) {
  const out = [];
  for (const o of item.options || []) {
    const v = sel[o.id];
    if (o.type === "range") { if (all || v !== o.default) out.push(`${v}${o.suffix || ""} sweet`); }
    else if (o.type === "multi") for (const id of v || []) out.push(o.choices.find((c) => c.id === id)?.label);
    else { const c = o.choices.find((c) => c.id === v); if (c && (all || v !== o.default)) out.push(c.label); }
  }
  return out.filter(Boolean);
}

export const sigOf = (itemId, sel) =>
  itemId + "|" + Object.keys(sel).sort().map((k) => `${k}=${Array.isArray(sel[k]) ? [...sel[k]].sort().join("+") : sel[k]}`).join("&");

export const lineTotal = (item, line) => unitPrice(item, line.sel) * line.qty;
export const imgPath = (name, sm = false) => `media/photo/${name}${sm ? "-sm" : ""}.webp`;
