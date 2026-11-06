// A second demonstration merchant: "the usual.", a neighbourhood coffee bar.
//
// Item names, groups and base prices (₱, VAT included) are the printed menu as supplied; the add-on
// prices are the menu's add-ons. Descriptions, hours and address are temporary placeholders.
// Photography: the café interior is the owner's own photograph; every drink image is generated
// editorial imagery (public/images/usual). Where two drinks share a look (biscoff, seasalt hojicha)
// they share a photograph.
//
// Same order model as Matcha Mood (see merchant.js): a line is { id, sel, qty }, and the unit price
// is always recomputed from the menu item at submission.
import { orderLine } from "./merchant";

export const BRAND = {
  name: "the usual.",
  accent: "#141412",
  tagline: "same time tomorrow?",
  kicker: "your corner coffee bar",
  eyebrow: "coffee · matcha · hojicha",
  searchHint: "find your usual",
  welcome: "everyone has an order. what's yours?",
  category: "Coffee & matcha",
};

const MILK = {
  id: "milk",
  label: "Milk",
  type: "single",
  default: "house",
  choices: [
    { id: "house", label: "House milk", delta: 0 },
    { id: "whole", label: "Whole milk", delta: 40 },
    { id: "oat", label: "Oat", delta: 50 },
  ],
};
const EXTRAS = {
  shot: { id: "shot", label: "Extra shot", delta: 30, fx: ["#3b2a1e", "#c9a27a", "#e6d3b3"] },
  foam: { id: "foam", label: "Foam", delta: 30, fx: ["#f4f1e8", "#d9d4c4", "#b8ad7a"] },
  matcha: { id: "matcha", label: "More matcha (1g)", delta: 30, fx: ["#7da24a", "#cfe79a", "#e8e9e4"] },
  syrup: { id: "syrup", label: "Syrup", delta: 20, fx: ["#c98a3b", "#f0d9a8", "#84794c"] },
};
const extras = (...ids) => ({ id: "extras", label: "Add-ons", type: "multi", choices: ids.map((i) => EXTRAS[i]) });

let n = 0;
const drink = (name, category, price, image, description, { milk = false, add = ["syrup"] } = {}) => ({
  id: ++n,
  slug: name.replace(/[^a-z0-9]+/g, "-"),
  name,
  description,
  price,
  category,
  image: `/images/usual/${image}.jpg`,
  dir: "usual",
  available: true,
  glow: "#b8ad7a",
  images: { base: image, rules: [] },
  options: [...(milk ? [MILK] : []), ...(add.length ? [extras(...add)] : [])],
});

export const MENU_ITEMS = [
  drink("the usual", "signatures", 190, "the-usual", "our house iced coffee: espresso, milk and a brown-sugar cream cap.", { milk: true, add: ["shot", "foam", "syrup"] }),
  drink("dirty horchata", "signatures", 180, "dirty-horchata", "cinnamon rice milk with a shot of espresso poured over.", { add: ["shot", "syrup"] }),
  drink("americano cloud", "signatures", 160, "americano-cloud", "iced americano under a cloud of cold foam.", { add: ["shot", "syrup"] }),
  drink("spanish latte", "classics", 160, "spanish-latte", "espresso and milk, sweetened with condensed milk.", { milk: true, add: ["shot", "foam", "syrup"] }),
  drink("americano", "classics", 120, "americano", "espresso over ice and water. clean and simple.", { add: ["shot", "syrup"] }),
  drink("seasalt latte", "classics", 180, "seasalt-latte", "an iced latte finished with sea-salt cream.", { milk: true, add: ["shot", "foam", "syrup"] }),
  drink("mocha latte", "classics", 160, "mocha-latte", "espresso, milk and dark chocolate.", { milk: true, add: ["shot", "foam", "syrup"] }),
  drink("biscoff latte", "classics", 180, "biscoff-latte", "a caramel-spiced latte with crushed biscoff.", { milk: true, add: ["shot", "foam", "syrup"] }),
  drink("biscoff", "non-coffee", 160, "biscoff-latte", "biscoff milk, no coffee. sweet and spiced.", { milk: true, add: ["foam", "syrup"] }),
  drink("horchata", "non-coffee", 160, "horchata", "creamy rice milk with cinnamon, over ice.", { add: ["syrup"] }),
  drink("dark cocoa and cream", "non-coffee", 160, "dark-cocoa", "deep dark cocoa under a lazy cap of cream.", { milk: true, add: ["foam", "syrup"] }),
  drink("strawberries and cream", "non-coffee", 160, "strawberries-cream", "strawberry milk with fresh berries and cream.", { milk: true, add: ["syrup"] }),
  drink("blush", "refreshers", 180, "blush", "rose and lychee, light and sparkling."),
  drink("golden hour", "refreshers", 150, "golden-hour", "mango and passionfruit over ice."),
  drink("blossom", "refreshers", 160, "blossom", "peach and a little lavender, with edible flowers."),
  drink("amber", "refreshers", 160, "amber", "iced black tea with citrus and a twist of peel."),
  drink("classic matcha", "matcha", 230, "classic-matcha", "ceremonial-style matcha whisked into cold milk.", { milk: true, add: ["matcha", "foam", "syrup"] }),
  drink("seasalt matcha", "matcha", 250, "classic-matcha", "matcha latte topped with sea-salt cream.", { milk: true, add: ["matcha", "foam", "syrup"] }),
  drink("salted cookie butter matcha", "matcha", 260, "cookie-butter-matcha", "matcha with cookie-butter cream and a salty crunch.", { milk: true, add: ["matcha", "foam", "syrup"] }),
  drink("ube matcha", "matcha", 260, "ube-matcha", "purple ube milk, white milk and green matcha, layered.", { milk: true, add: ["matcha", "foam", "syrup"] }),
  drink("matcha crunch", "matcha", 260, "cookie-butter-matcha", "matcha latte with a crunchy cookie topping.", { milk: true, add: ["matcha", "foam", "syrup"] }),
  drink("dango matcha", "matcha", 270, "dango-matcha", "matcha latte with a skewer of chewy dango.", { milk: true, add: ["matcha", "foam", "syrup"] }),
  drink("classic hojicha", "hojicha", 200, "hojicha", "roasted green tea, toasty and mellow, with milk.", { milk: true, add: ["foam", "syrup"] }),
  drink("hojicha cocoa", "hojicha", 230, "hojicha-cocoa", "roasted hojicha and dark cocoa with a cream cap.", { milk: true, add: ["foam", "syrup"] }),
  drink("seasalt hojicha", "hojicha", 230, "hojicha", "hojicha latte with sea-salt cream.", { milk: true, add: ["foam", "syrup"] }),
];

// Studio's approved photography for this business (logo, cover, offers and the tier galleries).
const img = (x) => `/images/usual/${x}.jpg`;
export const ASSETS = {
  logos: [img("logo"), img("the-usual"), img("classic-matcha"), img("blush")],
  covers: ["interior", "the-usual", "dirty-horchata", "americano-cloud", "seasalt-latte", "biscoff-latte", "classic-matcha", "ube-matcha", "dango-matcha", "blush", "golden-hour", "hojicha-cocoa"].map(img),
  promos: ["the-usual", "dirty-horchata", "ube-matcha", "dango-matcha", "blush"].map(img),
};

// Storefront theme taken from the printed menu: warm grey paper, black type, an olive flower, rounded pills.
export const STOREFRONT = {
  layout: "visual",
  theme: {
    mode: "light",
    primary: "#141412",
    secondary: "#dcdcd3",
    accent: "#84794c",
    background: "#e8e9e4",
    typography: "geometric",
    button: "pill",
    cards: "outlined",
    spacing: "comfortable",
    radius: "rounded",
    hero: "cover",
    menu: "grid",
    modules: "rows",
    stage: "light",
    tint: "#17120d",
  },
  logo: img("logo"),
  cover: img("interior"),
  galleryAssets: [img("interior"), img("the-usual"), img("blush")],
  socials: [
    { id: "instagram", platform: "Instagram", label: "daily regulars", url: "", enabled: true },
    { id: "facebook", platform: "Facebook", label: "the usual crowd", url: "", enabled: true },
  ],
  wifi: {
    name: "theusual-guest-DEMO",
    password: "fictional-usual-2026",
    instructions:
      "Open your phone’s Wi-Fi settings, choose the guest network, then enter the demo password. This fictional network will not connect.",
  },
  loyalty: { enabled: true, threshold: 9, reward: "a drink on the house", eligible: [1, 4, 6, 17], card: "sage" },
  promotion: {
    active: true,
    kind: "Featured product",
    title: "the usual, every day.",
    description: "our house iced coffee, ₱190. no need to say it twice.",
    image: img("the-usual"),
    cta: "Explore the menu",
    code: "USUALDEMO",
    price: "₱190 the usual",
    start: "2026-01-01",
    end: "2027-12-31",
    placement: "hub",
  },
  tables: { "05": true, "03": true, "08": true },
};

// Illustrative opening orders for the kitchen board (clearly seeded demo data).
export function seedOrderLines(menu) {
  const it = (name) => menu.find((m) => m.name === name);
  return {
    "KW-1048": [orderLine(it("the usual"), { milk: "oat", extras: ["shot"] }, 2), orderLine(it("biscoff latte"), {}, 1)],
    "KW-1047": [orderLine(it("dirty horchata"), {}, 1), orderLine(it("classic matcha"), { extras: ["matcha"] }, 1)],
    "KW-1046": [orderLine(it("americano cloud"), { extras: ["shot"] }, 2)],
  };
}
