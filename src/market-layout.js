export const MARKET_BLACKBALL = {id:"blackball",name:"Blackball Cafe",category:"Food & drinks",bio:"Coffee, matcha and all-day dining. Menu adapted from the published Blackball Cafe menu; local demo ordering only.",temporary:false};
export const MARKET_USUAL = {id:"usual",name:"the usual.",category:"Food & drinks",bio:"Your neighborhood coffee bar. Familiar favorites, made your way.",temporary:false};
// Serializable demo fixture and layout invariants, independent of the UI.
export const seedMarket = () => ({
  version: 1,
  catalogRevision: 3,
  name: "The Sunday Commons",
  venue: "Riverside Pavilion · Fictional event",
  status: "active",
  booths: Array.from({ length: 10 }, (_, i) => ({
    id: "B" + String(i + 1).padStart(2, "0"),
    x: 5 + (i % 5) * 19,
    y: i < 5 ? 8 : 47,
    w: 14,
    h: 15,
    category:
      (i === 1 || i === 3)
        ? "Food & drinks"
        : i === 6
          ? "Crafts"
          : i % 2
            ? "Crafts"
            : "Food & drinks",
    blocked: i === 8,
    merchant: i === 1 ? "salo" : i === 3 ? "usual" : i === 4 ? "blackball" : i === 6 ? "luna" : null,
  })),
  profiles: [
    MARKET_USUAL,
    MARKET_BLACKBALL,
    {
      id: "salo",
      name: "Matcha Mood",
      category: "Food & drinks",
      bio: "One sip, and the mood unwinds. An existing merchant joining the neighborhood market.",
      temporary: false,
    },
    {
      id: "luna",
      name: "Luna Made",
      category: "Crafts",
      bio: "Small-batch ceramics for everyday rituals. Fictional event-only seller.",
      temporary: true,
    },
  ],
  audit: [],
});
export function validateLayout(booths) {
  const ids = new Set();
  for (const b of booths) {
    if (ids.has(b.id)) return "Each booth needs a unique ID.";
    ids.add(b.id);
    if (
      ![b.x, b.y, b.w, b.h].every(Number.isFinite) ||
      b.w < 5 ||
      b.h < 5 ||
      b.x < 0 ||
      b.y < 0 ||
      b.x + b.w > 100 ||
      b.y + b.h > 70
    )
      return (
        b.id +
        ": keep the booth inside the venue with a minimum 5 × 5 footprint."
      );
    if (b.y < 41 && b.y + b.h > 29)
      return b.id + ": keep the central walkway clear.";
    if (b.x < 62 && b.x + b.w > 57)
      return b.id + ": keep the cross-access walkway clear.";
    for (const a of booths) {
      if (a.id === b.id) continue;
      if (
        b.x < a.x + a.w &&
        b.x + b.w > a.x &&
        b.y < a.y + a.h &&
        b.y + b.h > a.y
      )
        return b.id + " overlaps " + a.id + ".";
    }
  }
  return "";
}
