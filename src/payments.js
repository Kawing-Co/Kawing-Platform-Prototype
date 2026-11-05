// Provider-aware payment launch for the browser-local demo (KAWING-DEMO-UX-002 · UX-05).
//
// A provider route is released only for an approved, order-specific checkout URL issued
// by that provider's integration, on an https host listed in `verifiedHosts`. The demo has
// no merchant credentials or provider contract, so every host list is empty and every
// provider resolves to truthful fallback instructions. No custom URI scheme is ever built,
// and nothing here changes an order's payment status.
//
// Evidence (re-verified 2026-11-05; see docs/PAYMENT_PROVIDERS.md):
// - Maya: developers.maya.ph one-time payment reference (updated 2026-10-26) says the
//   Pay with Maya app deep link is temporarily disabled; customers use Maya's hosted page.
// - GCash: API portal is for selected partner organizations; an "Open in GCash" path
//   exists only inside an approved provider checkout. Help article returned HTTP 403.
// - GoTyme Bank / MariBank: no public merchant-order-specific web-to-app route found;
//   customers pay through QR Ph scanning inside their own app.

export const PROVIDERS = [
  {
    id: "GCash",
    label: "GCash",
    kind: "wallet",
    appLaunch: "Only from an approved GCash checkout session",
    verifiedHosts: [],
    steps: [
      "Open the GCash app on your phone yourself.",
      "Ask staff for the merchant's official QR Ph code and scan it in GCash.",
      "Check the merchant name and amount before you approve in GCash.",
    ],
  },
  {
    id: "Maya",
    label: "Maya (formerly PayMaya)",
    kind: "wallet",
    appLaunch: "App deep link temporarily disabled by Maya; hosted page only",
    verifiedHosts: [],
    steps: [
      "Open the Maya app on your phone yourself.",
      "Ask staff for the merchant's official QR Ph code and scan it in Maya.",
      "Check the merchant name and amount before you approve in Maya.",
    ],
  },
  {
    id: "GoTyme",
    label: "GoTyme Bank",
    kind: "bank",
    appLaunch: "No verified merchant launch route",
    verifiedHosts: [],
    steps: [
      "Open the GoTyme Bank app on your phone yourself.",
      "Use its QR Ph scan option on the merchant's official code shown by staff.",
      "Check the merchant name and amount before you confirm.",
    ],
  },
  {
    id: "MariBank",
    label: "MariBank",
    kind: "bank",
    appLaunch: "No verified merchant launch route",
    verifiedHosts: [],
    steps: [
      "Open the MariBank app on your phone yourself.",
      "Use its QR Ph scan option on the merchant's official code shown by staff.",
      "Check the merchant name and amount before you confirm.",
    ],
  },
  {
    id: "Cash",
    label: "Cash",
    kind: "cash",
    appLaunch: "Not applicable",
    verifiedHosts: [],
    steps: [
      "Pay at the counter.",
      "Staff confirm the cash in the cashier view before it counts as paid.",
    ],
  },
];

export const provider = (id) => PROVIDERS.find((p) => p.id === id) || null;

// Returns how "Continue with <provider>" should behave. `checkout` is an approved
// provider session ({ provider, url, orderId }) or null. Pure: no navigation happens here.
export function resolvePaymentRoute(id, { checkout = null, orderId = null } = {}) {
  const p = provider(id);
  if (!p) return { kind: "unavailable", reason: "Unknown payment method." };
  if (p.kind === "cash")
    return { kind: "counter", reason: "Cash is paid at the counter and confirmed by staff." };
  const url = approvedUrl(p, checkout, orderId);
  if (url) return { kind: "hosted", url, reason: `Opens ${p.label}'s official checkout.` };
  return {
    kind: "instructions",
    reason: `No ${p.label} checkout is connected to this demo merchant, so no app or payment page is opened.`,
  };
}

function approvedUrl(p, checkout, orderId) {
  if (!checkout || checkout.provider !== p.id || !orderId || checkout.orderId !== orderId)
    return null;
  try {
    const u = new URL(checkout.url);
    return u.protocol === "https:" && p.verifiedHosts.includes(u.hostname) ? u.href : null;
  } catch {
    return null;
  }
}
