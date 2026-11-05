// Browser-local demo contracts. Config never contains executable routes or content.
import { ASSETS } from "./merchant";
// Other fictional merchants (event-only sellers) still use these earlier photographs.
const LEGACY = ["/images/bowl.jpg", "/images/salad.jpg", "/images/plate.jpg", "/images/drink.jpg"];
// Internal id of the Standard Merchant record. It keys browser storage and operations, so it stays
// stable even though the visible business is Matcha Mood.
export const MERCHANT = "salo";
export const moduleTypes = [
  "order",
  "loyalty",
  "promotions",
  "wifi",
  "review",
  "feedback",
  "social",
  "game",
];
export const labels = {
  order: "Order now",
  loyalty: "My rewards",
  promotions: "Today’s offers",
  wifi: "Guest Wi-Fi",
  review: "Review us on Google",
  feedback: "Private feedback",
  social: "Follow us",
  game: "Play while you wait",
};
export const defaults = () => ({
  version: 1,
  layout: "quick",
  featured: "order",
  theme: {
    mode: "light",
    primary: "#1f4d3a",
    secondary: "#e7eee2",
    accent: "#b4743e",
    background: "#f7f7f0",
    typography: "editorial",
    button: "soft",
    cards: "outlined",
    spacing: "comfortable",
    radius: "rounded",
    hero: "cover",
    menu: "grid",
    modules: "rows",
  },
  logo: ASSETS.logos[0],
  cover: ASSETS.covers[0],
  modules: moduleTypes.map((type, order) => ({
    id: type,
    type,
    enabled: true,
    order,
    title: labels[type],
    description: "",
    cta: "",
  })),
  reviewUrl: "",
  reviewLabel: "Review us on Google",
  socialStyle: "cards",
  socials: [
    {
      id: "instagram",
      platform: "Instagram",
      label: "Matcha moments",
      url: "",
      enabled: true,
    },
    {
      id: "facebook",
      platform: "Facebook",
      label: "Around the counter",
      url: "",
      enabled: true,
    },
  ],
  wifi: {
    name: "MatchaMood-Guest-DEMO",
    password: "fictional-matcha-2026",
    instructions:
      "Open your phone’s Wi-Fi settings, choose the guest network, then enter the demo password. This fictional network will not connect.",
  },
  loyalty: {
    enabled: true,
    threshold: 9,
    reward: "A matcha latte on the house",
    eligible: [1, 3, 4, 9],
    card: "sage",
  },
  promotion: {
    active: true,
    kind: "Featured product",
    title: "One sip, and the mood unwinds.",
    description: "Pair a Matcha Latte with a slice of Berry Cake — a quiet little break.",
    image: ASSETS.promos[0],
    cta: "Explore the menu",
    code: "MATCHADEMO",
    price: "₱1,350 sample pairing",
    start: "2026-01-01",
    end: "2027-12-31",
    placement: "hub",
  },
  tables: { "05": true, "03": true, "08": true },
});
const pick = (v, allowed, fallback) => (allowed.includes(v) ? v : fallback);
export function safeUrl(value, platform = "Website") {
  if (!value) return "";
  try {
    const u = new URL(value);
    if (u.protocol !== "https:" || u.username || u.password) return null;
    const host = u.hostname.toLowerCase();
    if (host === "localhost" || !host.includes(".") || /^\d/.test(host))
      return null;
    const hosts = {
      Instagram: ["instagram.com"],
      Facebook: ["facebook.com", "fb.com"],
      TikTok: ["tiktok.com"],
      YouTube: ["youtube.com", "youtu.be"],
      Messenger: ["m.me", "messenger.com"],
      WhatsApp: ["wa.me", "whatsapp.com"],
      "Google Maps": ["google.com", "maps.app.goo.gl"],
      "Google Review": ["google.com", "g.page", "maps.app.goo.gl"],
    };
    if (
      hosts[platform] &&
      !hosts[platform].some((h) => host === h || host.endsWith("." + h))
    )
      return null;
    return u.href;
  } catch {
    return null;
  }
}
const text = (v, f = "", max = 160) =>
  typeof v === "string" ? v.slice(0, max) : f;
const hex = (v, f) => (/^#[a-f\d]{6}$/i.test(v) ? v : f);
export function config(raw = {}) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) raw = {};
  raw = {
    ...raw,
    modules: Array.isArray(raw.modules)
      ? raw.modules.filter((m) => m && typeof m === "object")
      : [],
    socials: Array.isArray(raw.socials)
      ? raw.socials.filter((l) => l && typeof l === "object")
      : undefined,
    loyalty: {
      ...(raw.loyalty || {}),
      eligible: Array.isArray(raw.loyalty?.eligible)
        ? raw.loyalty.eligible
        : undefined,
    },
  };
  const d = defaults(),
    t = raw.theme || {};
  return {
    ...d,
    ...raw,
    version: 1,
    layout: pick(raw.layout, ["quick", "visual", "minimal"], d.layout),
    featured: pick(raw.featured, moduleTypes, "order"),
    logo: pick(
      raw.logo,
      [...ASSETS.logos, ...LEGACY],
      d.logo,
    ),
    cover: pick(
      raw.cover,
      [...ASSETS.covers, ...LEGACY],
      d.cover,
    ),
    theme: {
      ...d.theme,
      mode: pick(t.mode, ["light", "dark"], "light"),
      primary: hex(t.primary, d.theme.primary),
      secondary: hex(t.secondary, d.theme.secondary),
      accent: hex(t.accent, d.theme.accent),
      background: hex(t.background, d.theme.background),
      typography: pick(
        t.typography,
        ["editorial", "modern", "friendly"],
        "editorial",
      ),
      button: pick(t.button, ["soft", "pill", "square"], "soft"),
      cards: pick(t.cards, ["outlined", "elevated"], "outlined"),
      spacing: pick(t.spacing, ["compact", "comfortable"], "comfortable"),
      radius: pick(t.radius, ["rounded", "crisp"], "rounded"),
      hero: pick(t.hero, ["cover", "split"], "cover"),
      menu: pick(t.menu, ["grid", "list"], "grid"),
      modules: pick(t.modules, ["rows", "cards"], "rows"),
    },
    modules: moduleTypes
      .map((type) => {
        const m =
          raw.modules?.find((m) => m.type === type) ||
          d.modules.find((m) => m.type === type);
        return {
          id: type,
          type,
          enabled:
            type === "order"
              ? true
              : typeof m.enabled === "boolean"
                ? m.enabled
                : true,
          order: Number.isFinite(m.order) ? m.order : moduleTypes.indexOf(type),
          title: text(m.title, labels[type], 50),
          description: text(m.description, "", 100),
          cta: text(m.cta, "", 45),
        };
      })
      .sort((a, b) => a.order - b.order)
      .map((m, order) => ({ ...m, order })),
    reviewUrl: safeUrl(raw.reviewUrl, "Google Review") || "",
    reviewLabel: pick(
      raw.reviewLabel,
      ["Review us on Google", "Share your experience on Google"],
      "Review us on Google",
    ),
    socialStyle: pick(raw.socialStyle, ["cards", "icons"], "cards"),
    socials: (Array.isArray(raw.socials) ? raw.socials : d.socials)
      .slice(0, 8)
      .map((l, i) => ({
        id: String(i),
        platform: pick(
          l.platform,
          [
            "Instagram",
            "Facebook",
            "TikTok",
            "YouTube",
            "Website",
            "Messenger",
            "WhatsApp",
            "Google Maps",
          ],
          "Website",
        ),
        label: text(l.label, "Visit us", 45),
        url: safeUrl(l.url, l.platform) || "",
        enabled: l.enabled !== false,
      })),
    wifi: {
      ...d.wifi,
      ...raw.wifi,
      name: text(raw.wifi?.name, d.wifi.name, 50),
      password: "fictional-matcha-2026",
      instructions: text(raw.wifi?.instructions, d.wifi.instructions, 300),
    },
    loyalty: {
      ...d.loyalty,
      ...raw.loyalty,
      enabled: raw.loyalty?.enabled !== false,
      threshold: Math.max(
        3,
        Math.min(12, Math.round(Number(raw.loyalty?.threshold)) || 9),
      ),
      reward: text(raw.loyalty?.reward, d.loyalty.reward, 90),
      eligible: (raw.loyalty?.eligible || d.loyalty.eligible).filter(
        Number.isFinite,
      ),
      card: pick(raw.loyalty?.card, ["sage", "ink"], "sage"),
    },
    promotion: {
      ...d.promotion,
      ...raw.promotion,
      ...Object.fromEntries(
        ["title", "description", "cta", "code", "price"].map((k) => [
          k,
          text(
            raw.promotion?.[k],
            d.promotion[k],
            k === "description" ? 250 : 100,
          ),
        ]),
      ),
      start: /^\d{4}-\d{2}-\d{2}$/.test(raw.promotion?.start)
        ? raw.promotion.start
        : d.promotion.start,
      end: /^\d{4}-\d{2}-\d{2}$/.test(raw.promotion?.end)
        ? raw.promotion.end
        : d.promotion.end,
      active: raw.promotion?.active !== false,
      image: pick(
        raw.promotion?.image,
        [...ASSETS.promos, ...LEGACY],
        d.promotion.image,
      ),
      kind: pick(
        raw.promotion?.kind,
        [
          "Featured product",
          "Limited-time offer",
          "Seasonal promotion",
          "Promotional banner",
          "Discount code",
          "New item",
          "Bundle offer",
          "Upcoming event",
        ],
        "Featured product",
      ),
      placement: pick(raw.promotion?.placement, ["hub", "after-order"], "hub"),
    },
    tables: { ...d.tables, ...raw.tables },
  };
}
export function extend(base, merchant = base.merchantId || MERCHANT) {
  const sf = config(
    base.storefront || { theme: { primary: base.brand?.accent } },
  );
  return {
    ...base,
    brand: {
      ...base.brand,
      name: text(base.brand?.name, "Matcha Mood", 28),
      tagline: text(base.brand?.tagline, "One sip, and the mood unwinds.", 90),
      accent: hex(base.brand?.accent, "#1f4d3a"),
    },
    schemaVersion: 2,
    merchantId: merchant,
    storefront: sf,
    savedStudio: base.savedStudio || null,
    operations: { policy: "prepaid", ...base.operations },
    accounts: Array.isArray(base.accounts)
      ? base.accounts.filter((a) => a && typeof a.id === "string")
      : [
          {
            id: "alex",
            merchantId: merchant,
            name: "Alex",
            email: "alex@example.test",
          },
        ],
    guestId: base.guestId || null,
    ledger: Array.isArray(base.ledger)
      ? base.ledger.filter((l) => l && Number.isFinite(l.amount))
      : [
          {
            id: "opening:alex",
            guestId: "alex",
            merchantId: merchant,
            amount: 7,
            reason: "Illustrative opening balance",
          },
        ],
    feedback: Array.isArray(base.feedback)
      ? base.feedback.filter((f) => f && typeof f.id === "string")
      : [
          {
            id: "sample-feedback",
            category: "Food and drinks",
            rating: "4",
            message: "Fictional feedback: loved the fresh lunch options.",
            status: "new",
            consent: false,
          },
        ],
    events: Array.isArray(base.events)
      ? base.events.filter((e) => e && typeof e.type === "string")
      : [],
    orders: base.orders
      .filter((o) => o && typeof o.id === "string")
      .map((o) => ({
        ...o,
        merchantId: merchant,
        paymentStatus: o.seed ? "confirmed" : "selected",
        policy: "prepaid",
        ...o,
        items: Array.isArray(o.items)
          ? o.items.filter(
              (i) =>
                i &&
                typeof i.name === "string" &&
                Number.isFinite(i.price) &&
                Number.isFinite(i.qty),
            )
          : [],
      })),
  };
}
export const uid = () => crypto.randomUUID();
export function event(d, type, detail = "") {
  const merchant = d.merchantId || MERCHANT;
  return {
    ...d,
    events: [
      ...d.events,
      { id: uid(), merchantId: merchant, type, detail, time: Date.now() },
    ].slice(-2000),
  };
}
export function balance(d, id = d.guestId) {
  const merchant = d.merchantId || MERCHANT;
  return d.ledger
    .filter((x) => x.guestId === id && x.merchantId === merchant)
    .reduce((s, x) => s + x.amount, 0);
}
export function reconcile(d) {
  const merchant = d.merchantId || MERCHANT;
  let ledger = [...d.ledger];
  for (const o of d.orders) {
    if (o.merchantId !== merchant) continue;
    const key = "purchase:" + merchant + ":" + o.id;
    const credited = ledger.find((l) => l.id === key);
    if (
      o.status === "served" &&
      o.paymentStatus === "confirmed" &&
      o.guestId &&
      o.loyaltyEligible &&
      !credited
    )
      ledger.push({
        id: key,
        merchantId: merchant,
        guestId: o.guestId,
        orderId: o.id,
        amount: 1,
        reason: "Verified completed purchase",
      });
    if (
      o.status === "refunded" &&
      credited &&
      !ledger.some((l) => l.id === "reverse:" + key)
    )
      ledger.push({
        id: "reverse:" + key,
        merchantId: merchant,
        guestId: o.guestId,
        orderId: o.id,
        amount: -1,
        reason: "Refund reversal",
      });
  }
  return { ...d, ledger };
}
export function orderAction(d, id, action) {
  const merchant = d.merchantId || MERCHANT;
  let changed = false;
  const orders = d.orders.map((o) => {
    if (
      o.merchantId !== merchant ||
      o.id !== id ||
      o.status === "queued" ||
      o.status === "refunded"
    )
      return o;
    if (
      action === "claim" &&
      o.payment !== "Cash" &&
      o.paymentStatus === "selected"
    ) {
      changed = true;
      return { ...o, paymentStatus: "claimed" };
    }
    if (
      action === "review" &&
      ((o.payment !== "Cash" && o.paymentStatus === "claimed") ||
        (o.payment === "Cash" && o.paymentStatus === "selected"))
    ) {
      changed = true;
      return { ...o, paymentStatus: "reviewing" };
    }
    if (action === "confirm" && o.paymentStatus === "reviewing") {
      changed = true;
      return { ...o, paymentStatus: "confirmed" };
    }
    const authorized =
      o.paymentStatus === "confirmed" ||
      (o.payment === "Cash" && o.policy === "counter" && o.counterApproved);
    if (
      action === "approve-counter" &&
      o.payment === "Cash" &&
      o.policy === "counter"
    ) {
      changed = true;
      return { ...o, counterApproved: true };
    }
    if (
      action === "advance" &&
      authorized &&
      ["new", "preparing", "ready"].includes(o.status)
    ) {
      changed = true;
      return {
        ...o,
        status: { new: "preparing", preparing: "ready", ready: "served" }[
          o.status
        ],
      };
    }
    if (
      action === "refund" &&
      o.status === "served" &&
      o.paymentStatus === "confirmed"
    ) {
      changed = true;
      return { ...o, status: "refunded", paymentStatus: "refunded" };
    }
    return o;
  });
  if (!changed) return d;
  const next = reconcile({ ...d, orders });
  return action === "advance" &&
    orders.find((o) => o.id === id)?.status === "served"
    ? event(next, "order_completed", id)
    : next;
}
export function redeem(d) {
  const merchant = d.merchantId || MERCHANT;
  const n = d.storefront.loyalty.threshold;
  if (!d.guestId || !d.storefront.loyalty.enabled || balance(d) < n) return d;
  return {
    ...d,
    ledger: [
      ...d.ledger,
      {
        id: "redemption:" + uid(),
        merchantId: merchant,
        guestId: d.guestId,
        amount: -n,
        reason: "Redeemed: " + d.storefront.loyalty.reward,
      },
    ],
  };
}
export function contextFromUrl() {
  const p = new URLSearchParams(location.search),
    entry = p.get("entry");
  if (["shared", "counter", "takeaway"].includes(entry))
    return { kind: entry, table: null };
  if (
    ["table", "nfc"].includes(entry) &&
    ["03", "05", "08"].includes(p.get("table"))
  )
    return { kind: entry, table: p.get("table") };
  return { kind: "shared", table: null };
}
export const contextLabel = (c) =>
  c.table
    ? "Table " + c.table
    : c.kind === "takeaway"
      ? "Takeaway pickup"
      : c.kind === "counter"
        ? "Counter pickup"
        : "Choose table or pickup";
export function themeTokens(c) {
  const dark = c.theme.mode === "dark";
  return {
    "--sf-primary": c.theme.primary,
    "--sf-on-primary": onColor(c.theme.primary),
    "--sf-secondary": c.theme.secondary,
    "--sf-on-secondary": onColor(c.theme.secondary),
    "--sf-accent": c.theme.accent,
    "--sf-bg": dark ? "#17251f" : c.theme.background,
    "--sf-ink": dark ? "#fff" : onColor(c.theme.background),
    "--sf-muted": dark ? "#dee9d8" : onColor(c.theme.background),
    "--sf-surface": dark
      ? "#22372c"
      : onColor(c.theme.background) === "#fff"
        ? "#22372c"
        : "#fffefa",
    "--sf-line": dark ? "#49604e" : "#dce5d5",
    "--sf-radius": c.theme.radius === "crisp" ? "5px" : "19px",
    "--sf-gap": c.theme.spacing === "compact" ? "12px" : "22px",
    "--sf-font":
      c.theme.typography === "editorial"
        ? "Georgia,serif"
        : c.theme.typography === "friendly"
          ? "Manrope,sans-serif"
          : "DM Sans,sans-serif",
    "--sf-button":
      c.theme.button === "pill"
        ? "40px"
        : c.theme.button === "square"
          ? "3px"
          : "12px",
  };
}
export function onColor(hex) {
  const rgb = hex
    .slice(1)
    .match(/.{2}/g)
    .map((h) => parseInt(h, 16) / 255)
    .map((v) => (v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return rgb[0] * 0.2126 + rgb[1] * 0.7152 + rgb[2] * 0.0722 > 0.179
    ? "#000000"
    : "#fff";
}
export const paymentLabel = (o) =>
  ({
    selected:
      o.payment === "Cash"
        ? "Cash not yet collected"
        : "Method selected · not verified",
    claimed: "Customer claims payment sent",
    reviewing: "Cashier reviewing",
    confirmed: "Cashier confirmed · simulated",
    refunded: "Refunded · simulated",
  })[o.paymentStatus] || "Unverified";
