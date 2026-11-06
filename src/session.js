// Demo session model: scenario, view, tier and scenario-scoped reset.
// Pure helpers take explicit inputs so they can be tested without a browser.
import { useEffect, useRef } from "react";
import { BUSINESS_IDS, businessFromSearch } from "./businesses";

export const SCENARIOS = {
  standard: { label: "Standard Merchant", short: "Standard" },
  market: { label: "Pop-up Market", short: "Pop-up" },
};
export const VIEWS = [
  ["merchant", "Merchant View"],
  ["customer", "Customer View"],
  ["admin", "Admin View"],
];
export const TIER_LABELS = {
  basic: "Basic",
  growth: "Growth",
  bespoke: "Bespoke",
};
export const viewLabel = (id) => VIEWS.find((v) => v[0] === id)?.[1] || "";

// URL → session. `?scenario=x` alone is the view picker; adding `workspace` enters a view.
export function parseSession(search) {
  const q = new URLSearchParams(search);
  const scenarioParam = q.get("scenario");
  const scenario = scenarioParam === "market" ? "market" : "standard";
  const view = VIEWS.some((v) => v[0] === q.get("workspace"))
    ? q.get("workspace")
    : null;
  return {
    scenario,
    view,
    step: view ? "inside" : scenarioParam ? "view" : "scenario",
    guest: q.get("surface") === "guest",
    customize: q.get("customize") === "1",
    // Which Standard Merchant business is open (Matcha Mood by default).
    business: businessFromSearch(search),
  };
}

// Builds the URL for a session step. Only parameters owned by the session change.
export function sessionHref(current, { scenario = null, view = null, customize = false, business }) {
  const u = new URL(current);
  const open = business ?? businessFromSearch(u.search);
  for (const k of ["scenario", "workspace", "customize", "business"]) u.searchParams.delete(k);
  if (scenario === "standard" && open !== "salo") u.searchParams.set("business", open);
  if (scenario) u.searchParams.set("scenario", scenario);
  if (scenario && view) u.searchParams.set("workspace", view);
  if (scenario && view && customize) u.searchParams.set("customize", "1");
  u.hash =
    scenario === "standard" && view
      ? { customer: "Customer", merchant: "Customization", admin: "Admin" }[view]
      : "";
  return u.toString();
}

// Where "Customize" leads for each scenario and view. Customer View never edits in place.
export function customizeTarget(scenario, view) {
  if (scenario === "market")
    return view === "merchant"
      ? { view: "merchant", label: "Your booth participation" }
      : { view: "admin", label: "Event setup" };
  return view === "admin"
    ? { view: "admin", label: "Packages" }
    : { view: "merchant", label: "Kawing Studio · Media & tier" };
}

export const tierOf = (business) =>
  TIER_LABELS[business?.presentationTier] ? business.presentationTier : "growth";

export function readTier(storage = globalThis.localStorage, id = "salo") {
  try {
    return tierOf(JSON.parse(storage.getItem(id === "salo" ? "kawing-demo-v1" : "kawing-merchant-v2:" + id)));
  } catch {
    return "growth";
  }
}

// Keys owned by each scenario. Matcha Mood (internal id "salo") holds the Standard Merchant record;
// Pop-up Market keeps its event and event-only merchants under separate keys.
export function resetKeys(scenario, keys, { discardStudioDraft = false } = {}) {
  // Every Standard Merchant business owns its record, receipt and carts; events own the rest.
  const others = BUSINESS_IDS.filter((i) => i !== "salo");
  const ownedByStandard = (k) =>
    others.some((i) => k === "kawing-merchant-v2:" + i || k === "kawing-last-order:" + i || k.startsWith("kawing-cart-v2:" + i + ":"));
  const standard = (k) =>
    k === "kawing-demo-v1" ||
    k === "kawing-last-order" ||
    k === "kawing-guide-v1" ||
    ownedByStandard(k) ||
    k.startsWith("kawing-cart-v2:salo:") ||
    (k.startsWith("kawing-cart-") && !k.startsWith("kawing-cart-v2:")) ||
    (discardStudioDraft && k === "kawing-studio-draft");
  const market = (k) =>
    k === "kawing-market-v1" ||
    (!ownedByStandard(k) &&
      (k.startsWith("kawing-merchant-v2:") ||
        k.startsWith("kawing-last-order:") ||
        (k.startsWith("kawing-cart-v2:") && !k.startsWith("kawing-cart-v2:salo:"))));
  return keys.filter(scenario === "market" ? market : standard);
}

export function hasStudioDraft(storage = globalThis.localStorage) {
  try {
    return !!storage.getItem("kawing-studio-draft");
  } catch {
    return false;
  }
}

export function applyReset(scenario, options, storage = globalThis.localStorage) {
  const keys = resetKeys(scenario, Object.keys(storage), options);
  keys.forEach((k) => storage.removeItem(k));
  return keys;
}

// Same-document writes do not raise `storage` events, so state owners announce changes.
export const announceLocalChange = () =>
  window.dispatchEvent(new Event("kawing:local-change"));

// Runs `open` when the visitor chooses Customize: on arrival via `?customize=1`, or in place.
export function useCustomize(open) {
  const latest = useRef(open);
  latest.current = open;
  useEffect(() => {
    const u = new URL(location.href);
    if (u.searchParams.get("customize") === "1") {
      u.searchParams.delete("customize");
      history.replaceState(history.state, "", u);
      latest.current();
    }
    const handler = () => latest.current();
    window.addEventListener("kawing:customize", handler);
    return () => window.removeEventListener("kawing:customize", handler);
  }, []);
}
