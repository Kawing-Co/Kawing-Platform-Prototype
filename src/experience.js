import { config, extend } from "./commerce";
export const devices = [
  { id: "phone", name: "Phone", detail: "390 × 844", w: 390, h: 844 },
  { id: "compact", name: "Compact phone", detail: "360 × 800", w: 360, h: 800 },
  { id: "large", name: "Large phone", detail: "430 × 932", w: 430, h: 932 },
  { id: "tablet", name: "Tablet", detail: "768 × 1024", w: 768, h: 1024 },
  { id: "desktop", name: "Desktop", detail: "1280 × 800", w: 1280, h: 800 },
];
export const tiers = ["basic", "growth", "bespoke"];
export const businessKey = (id) =>
  id === "salo" ? "kawing-demo-v1" : "kawing-merchant-v2:" + id;
export const receiptKey = (id) =>
  !id || id === "salo" ? "kawing-last-order" : "kawing-last-order:" + id;
export function projectTier(c, tier) {
  if (!tiers.includes(tier)) return c;
  const d = structuredClone(c);
  if (tier === "basic") {
    d.layout = "quick";
    d.galleryAssets = (d.galleryAssets || []).slice(0, 2);
    d.modules = d.modules.map((m) =>
      ["promotions", "game"].includes(m.type) ? { ...m, enabled: false } : m,
    );
    if (["promotions", "game"].includes(d.featured)) d.featured = "order";
  } else if (tier === "growth") {
    d.galleryAssets = (d.galleryAssets || []).slice(0, 6);
  }
  return d;
}
export function newBusiness(profile) {
  const food = profile.category !== "Crafts";
  return extend(
    {
      brand: {
        name: profile.name,
        tagline: profile.bio || "Local favorites, thoughtfully made.",
        bio: profile.bio,
        contact: profile.ops?.contact || "Local vendor · demo@example.test",
        category: profile.category,
        accent: "#245642",
      },
      menu: food
        ? [
            {
              id: 1,
              name: "Market lunch bowl",
              description: "A fresh local lunch, made for your market visit.",
              price: 285,
              category: "Bowls",
              image: "/images/bowl.jpg",
              available: true,
            },
            {
              id: 2,
              name: "Fresh cooler",
              description: "Something bright and refreshing.",
              price: 95,
              category: "Drinks",
              image: "/images/drink.jpg",
              available: true,
            },
          ]
        : [
            {
              id: 1,
              name: "Everyday ceramic cup",
              description:
                "A fictional small-batch ceramic piece. Pickup at the booth.",
              price: 350,
              category: "Crafts",
              image: "/images/ceramic.svg",
              available: true,
            },
            {
              id: 2,
              name: "Handmade trinket dish",
              description:
                "A small place for everyday treasures. Sample product.",
              price: 240,
              category: "Crafts",
              image: "/images/ceramic.svg",
              available: true,
            },
          ],
      orders: [],
      offline: false,
      accounts: [],
      ledger: [],
      feedback: [],
      events: [],
      storefront: config({
        logo: "/images/market-mark.svg",
        modules: [
          { type: "loyalty", enabled: false },
          { type: "promotions", enabled: false },
          { type: "wifi", enabled: false },
        ],
        galleryAssets: [],
        promotion: { active: false },
        wifi: { name: profile.name + " Guest · DEMO" },
        loyalty: { enabled: false },
      }),
    },
    profile.id,
  );
}
export function eventOrderError(ctx) {
  if (!ctx) return "";
  try {
    const d = JSON.parse(localStorage.getItem("kawing-market-v1"));
    const b = d?.booths?.find((v) => v.id === ctx.boothId);
    if (d?.status !== "active")
      return "This event is not accepting new orders. Your cart is retained.";
    if (!b || b.blocked || b.merchant !== ctx.merchantId)
      return "This booth is no longer available for this business. Return to the map.";
    return "";
  } catch {
    return "Event information is unavailable. Return to the map before ordering.";
  }
}
