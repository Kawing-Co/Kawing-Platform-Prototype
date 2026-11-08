// The demonstration businesses. Each is a full merchant profile with its own menu, photography,
// storefront theme and copy; the platform around them (Kawing) is the same for every business.
//
// Internal ids are stable storage keys: "salo" is Matcha Mood (it keeps the original record
// `kawing-demo-v1`), "usual" is the usual. (`kawing-merchant-v2:usual`).
import * as matcha from "./merchant";
import * as usual from "./usual";
import * as blackball from "./blackball";

export const BUSINESSES = {
  blackball: {id:"blackball",name:"Blackball Cafe",kind:"Café & restaurant",seed:"blackball-1",brand:blackball.BRAND,menu:blackball.MENU_ITEMS,assets:blackball.ASSETS,storefront:blackball.STOREFRONT,seedOrderLines:blackball.seedOrderLines,previewPhoto:"/images/blackball/matcha-tray.png"},
  salo: {
    id: "salo",
    name: "Matcha Mood",
    kind: "Matcha café",
    seed: "matcha-mood-1",
    brand: {
      ...matcha.BRAND,
      kicker: "YOUR NEIGHBORHOOD TABLE",
      eyebrow: "Matcha specialty café",
      searchHint: "Find your mood",
      welcome: "A little familiar. A little extraordinary.",
      category: "Matcha café",
      avgBasket: 330,
      heroPhoto: "/images/matcha/latte-iced.jpg",
      bannerPhoto: "/images/matcha/ritual.jpg",
      heroLines: ["A seat at", "the Matcha Mood table."],
      insight: "Matcha lattes lead the sample menu. A good starting point for a lunch pairing.",
    },
    menu: matcha.MENU_ITEMS,
    assets: matcha.ASSETS,
    storefront: null, // the platform defaults are Matcha Mood's own look
    seedOrderLines: matcha.seedOrderLines,
    previewPhoto: "/images/matcha/latte-iced.jpg",
  },
  usual: {
    id: "usual",
    name: "the usual.",
    kind: "Coffee bar",
    seed: "the-usual-1",
    brand: {
      ...usual.BRAND,
      heroPhoto: "/images/usual/interior.jpg",
      bannerPhoto: "/images/usual/interior.jpg",
      heroLines: ["pull up a chair.", "the usual?"],
      avgBasket: 310,
      insight: "The usual and the spanish latte lead the sample menu. Matcha and hojicha are the rising pair.",
    },
    menu: usual.MENU_ITEMS,
    assets: usual.ASSETS,
    storefront: usual.STOREFRONT,
    seedOrderLines: usual.seedOrderLines,
    previewPhoto: "/images/usual/the-usual.jpg",
  },
};

export const BUSINESS_IDS = Object.keys(BUSINESSES);
/** True for the Standard Merchant businesses (as opposed to event-only vendors). */
export const isStandard = (id) => Object.prototype.hasOwnProperty.call(BUSINESSES, id);
export const businessOf = (id) => BUSINESSES[isStandard(id) ? id : "salo"];
/** The business named by `?business=` (default: Matcha Mood). */
export const businessFromSearch = (search = globalThis.location?.search || "") => {
  const id = new URLSearchParams(search).get("business");
  return isStandard(id) ? id : "salo";
};
/** Every approved image path across all businesses (config validation accepts any of them). */
export const allAssets = () => ({
  logos: [...new Set(Object.values(BUSINESSES).flatMap((b) => b.assets.logos))],
  covers: [...new Set(Object.values(BUSINESSES).flatMap((b) => b.assets.covers))],
  promos: [...new Set(Object.values(BUSINESSES).flatMap((b) => b.assets.promos))],
});
