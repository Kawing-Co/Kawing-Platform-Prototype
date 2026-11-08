// The demonstration merchant: Matcha Mood, a matcha specialty café.
//
// This replaces the earlier "Salo" seed. The internal merchant id stays `salo`
// (see commerce.js MERCHANT) so existing storage keys, the event-merchant mapping
// and the cashier/loyalty ledgers keep working; only the visible identity, menu,
// photography and copy are Matcha Mood.
//
// Item names and base prices (₱, VAT included) come from the café's printed menu.
// Option names/prices, descriptions, hours and address are temporary placeholders.
// All photography is generated editorial imagery (public/images/matcha).
//
// Customization model: a line is { id, sel, qty }. `sel` maps an option id to a choice id
// (or an array of ids for multi-select). The unit price is ALWAYS recomputed from the menu
// item by `unitPrice` (see main.jsx submit), so a client can never choose its own price.
// Photographs are chosen as the closest photographed variant of the selection (`images.rules`).

export const BRAND = {
  name: "Matcha Mood",
  accent: "#1f4d3a",
  tagline: "One sip, and the mood unwinds.",
};

export const MENU_ITEMS = [
  {
    "id": 1,
    "slug": "latte",
    "name": "Matcha Latte",
    "description": "Stone-ground matcha over cold milk. The layers settle, then soften.",
    "price": 230,
    "category": "Drinks",
    "image": "/images/matcha/latte-iced.jpg",
    "available": true,
    "glow": "#7da24a",
    "images": {
      "base": "latte-iced",
      "rules": [
        {
          "src": "latte-hot",
          "when": {
            "temp": "hot"
          }
        },
        {
          "src": "latte-topped",
          "when": {
            "top": [
              "azuki",
              "cream",
              "pearl"
            ]
          }
        }
      ]
    },
    "options": [
      {
        "id": "temp",
        "label": "Temperature",
        "type": "single",
        "default": "iced",
        "choices": [
          {
            "id": "iced",
            "label": "Iced",
            "delta": 0
          },
          {
            "id": "hot",
            "label": "Hot",
            "delta": 0
          }
        ]
      },
      {
        "id": "size",
        "label": "Size",
        "type": "single",
        "default": "m",
        "choices": [
          {
            "id": "s",
            "label": "Small",
            "note": "300 ml",
            "delta": -30,
            "scale": 1
          },
          {
            "id": "m",
            "label": "Regular",
            "note": "400 ml",
            "delta": 0,
            "scale": 1.08
          },
          {
            "id": "l",
            "label": "Large",
            "note": "520 ml",
            "delta": 40,
            "scale": 1.18
          }
        ]
      },
      {
        "id": "milk",
        "label": "Milk",
        "type": "single",
        "default": "whole",
        "choices": [
          {
            "id": "whole",
            "label": "Whole",
            "delta": 0
          },
          {
            "id": "oat",
            "label": "Oat",
            "delta": 50
          },
          {
            "id": "soy",
            "label": "Soy",
            "delta": 40
          }
        ]
      },
      {
        "id": "strength",
        "label": "Matcha strength",
        "type": "single",
        "default": "classic",
        "choices": [
          {
            "id": "gentle",
            "label": "Gentle",
            "delta": 0,
            "tone": "saturate(.88) brightness(1.05)"
          },
          {
            "id": "classic",
            "label": "Classic",
            "delta": 0
          },
          {
            "id": "deep",
            "label": "Deep",
            "note": "double",
            "delta": 30,
            "tone": "saturate(1.22) brightness(.93) contrast(1.05)"
          }
        ]
      },
      {
        "id": "sweet",
        "label": "Sweetness",
        "type": "range",
        "default": 50,
        "steps": [
          0,
          30,
          50,
          100
        ],
        "suffix": "%"
      },
      {
        "id": "top",
        "label": "Toppings",
        "type": "multi",
        "choices": [
          {
            "id": "azuki",
            "label": "Azuki red bean",
            "delta": 40,
            "fx": [
              "#6a2d33",
              "#8a4a47"
            ]
          },
          {
            "id": "cream",
            "label": "Whipped cream",
            "delta": 30,
            "fx": [
              "#fffdf4",
              "#efe8d2"
            ]
          },
          {
            "id": "pearl",
            "label": "Mochi pearls",
            "delta": 40,
            "fx": [
              "#e6edcf",
              "#c6d5a0"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 2,
    "slug": "strawberry",
    "name": "Strawberry Matcha Latte",
    "description": "Ripe strawberry beneath, matcha above. Stir once, or not at all.",
    "price": 260,
    "category": "Drinks",
    "image": "/images/matcha/strawberry.jpg",
    "available": true,
    "glow": "#d0566f",
    "images": {
      "base": "strawberry",
      "rules": [
        {
          "src": "strawberry-topped",
          "when": {
            "top": [
              "bits",
              "cream"
            ]
          }
        }
      ]
    },
    "options": [
      {
        "id": "size",
        "label": "Size",
        "type": "single",
        "default": "m",
        "choices": [
          {
            "id": "s",
            "label": "Small",
            "note": "300 ml",
            "delta": -30,
            "scale": 1
          },
          {
            "id": "m",
            "label": "Regular",
            "note": "400 ml",
            "delta": 0,
            "scale": 1.08
          },
          {
            "id": "l",
            "label": "Large",
            "note": "520 ml",
            "delta": 40,
            "scale": 1.18
          }
        ]
      },
      {
        "id": "ice",
        "label": "Ice",
        "type": "single",
        "default": "regular",
        "choices": [
          {
            "id": "less",
            "label": "Less",
            "delta": 0
          },
          {
            "id": "regular",
            "label": "Regular",
            "delta": 0
          },
          {
            "id": "extra",
            "label": "Extra",
            "delta": 0
          }
        ]
      },
      {
        "id": "berry",
        "label": "Berry layer",
        "type": "single",
        "default": "regular",
        "choices": [
          {
            "id": "light",
            "label": "Light",
            "delta": 0
          },
          {
            "id": "regular",
            "label": "Regular",
            "delta": 0
          },
          {
            "id": "extra",
            "label": "Extra",
            "delta": 30,
            "tone": "saturate(1.15)"
          }
        ]
      },
      {
        "id": "milk",
        "label": "Milk",
        "type": "single",
        "default": "whole",
        "choices": [
          {
            "id": "whole",
            "label": "Whole",
            "delta": 0
          },
          {
            "id": "oat",
            "label": "Oat",
            "delta": 50
          },
          {
            "id": "soy",
            "label": "Soy",
            "delta": 40
          }
        ]
      },
      {
        "id": "top",
        "label": "Toppings",
        "type": "multi",
        "choices": [
          {
            "id": "bits",
            "label": "Freeze-dried berry",
            "delta": 30,
            "fx": [
              "#f4a9b8",
              "#e0667f"
            ]
          },
          {
            "id": "cream",
            "label": "Whipped cream",
            "delta": 30,
            "fx": [
              "#fffdf4",
              "#efe8d2"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 3,
    "slug": "softserve",
    "name": "Matcha Soft Serve",
    "description": "Slow-churned and barely sweet. One clean swirl of matcha.",
    "price": 160,
    "category": "Sweets",
    "image": "/images/matcha/softserve-cone.jpg",
    "available": true,
    "glow": "#92b35a",
    "images": {
      "base": "softserve-cone",
      "rules": [
        {
          "src": "softserve-cup",
          "when": {
            "vessel": "cup"
          }
        },
        {
          "src": "softserve-topped",
          "when": {
            "top": [
              "kinako",
              "azuki",
              "gold"
            ]
          }
        }
      ]
    },
    "options": [
      {
        "id": "vessel",
        "label": "Served in",
        "type": "single",
        "default": "cone",
        "choices": [
          {
            "id": "cone",
            "label": "Wafer cone",
            "delta": 0
          },
          {
            "id": "cup",
            "label": "Paper cup",
            "delta": 0
          }
        ]
      },
      {
        "id": "size",
        "label": "Size",
        "type": "single",
        "default": "reg",
        "choices": [
          {
            "id": "reg",
            "label": "Regular",
            "delta": 0,
            "scale": 1.06
          },
          {
            "id": "large",
            "label": "Large",
            "note": "taller swirl",
            "delta": 50,
            "scale": 1.2
          }
        ]
      },
      {
        "id": "top",
        "label": "Toppings",
        "type": "multi",
        "choices": [
          {
            "id": "kinako",
            "label": "Kinako dust",
            "delta": 30,
            "fx": [
              "#c8a063",
              "#e0c48e"
            ]
          },
          {
            "id": "azuki",
            "label": "Azuki red bean",
            "delta": 40,
            "fx": [
              "#6a2d33",
              "#8a4a47"
            ]
          },
          {
            "id": "gold",
            "label": "Edible gold leaf",
            "delta": 60,
            "fx": [
              "#f5d77a",
              "#d9a92c"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 4,
    "slug": "berrycake",
    "name": "Matcha Berry Cake",
    "description": "Soft matcha sponge, light cream and whole strawberries.",
    "price": 220,
    "category": "Sweets",
    "image": "/images/matcha/berrycake.jpg",
    "available": true,
    "glow": "#c9605f",
    "images": {
      "base": "berrycake",
      "rules": [
        {
          "src": "berrycake-candle",
          "when": {
            "top": [
              "celebrate"
            ]
          }
        }
      ]
    },
    "options": [
      {
        "id": "top",
        "label": "Make it yours",
        "type": "multi",
        "choices": [
          {
            "id": "celebrate",
            "label": "Celebration set",
            "note": "extra strawberries + a candle",
            "delta": 50,
            "fx": [
              "#e0485f",
              "#ffd978"
            ]
          },
          {
            "id": "cream",
            "label": "Cream rosettes",
            "delta": 30,
            "fx": [
              "#fffdf4",
              "#efe8d2"
            ]
          },
          {
            "id": "dust",
            "label": "Matcha dusting",
            "delta": 0,
            "fx": [
              "#9dc05a",
              "#6d8f33"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 5,
    "slug": "crepe",
    "name": "Matcha Mille Crêpe",
    "description": "Twenty thin crêpes, each brushed with green tea cream.",
    "price": 240,
    "category": "Sweets",
    "image": "/images/matcha/crepe.jpg",
    "available": true,
    "glow": "#86a944",
    "images": {
      "base": "crepe",
      "rules": [
        {
          "src": "crepe-topped",
          "when": {
            "top": [
              "azuki",
              "cream",
              "brulee"
            ]
          }
        }
      ]
    },
    "options": [
      {
        "id": "top",
        "label": "Make it yours",
        "type": "multi",
        "choices": [
          {
            "id": "azuki",
            "label": "Azuki red bean",
            "delta": 40,
            "fx": [
              "#6a2d33",
              "#8a4a47"
            ]
          },
          {
            "id": "cream",
            "label": "Cream dollop",
            "delta": 30,
            "fx": [
              "#fffdf4",
              "#efe8d2"
            ]
          },
          {
            "id": "brulee",
            "label": "Torched sugar top",
            "delta": 30,
            "fx": [
              "#e8a447",
              "#b8651f"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 6,
    "slug": "roll",
    "name": "Matcha Roll Cake",
    "description": "Airy matcha sponge rolled around whipped cream.",
    "price": 190,
    "category": "Sweets",
    "image": "/images/matcha/roll.jpg",
    "available": true,
    "glow": "#8aae47",
    "images": {
      "base": "roll",
      "rules": [
        {
          "src": "roll-share",
          "when": {
            "portion": "two"
          }
        }
      ]
    },
    "options": [
      {
        "id": "portion",
        "label": "Portion",
        "type": "single",
        "default": "one",
        "choices": [
          {
            "id": "one",
            "label": "One slice",
            "delta": 0
          },
          {
            "id": "two",
            "label": "To share",
            "note": "two slices, strawberry cream",
            "delta": 160
          }
        ]
      },
      {
        "id": "top",
        "label": "Toppings",
        "type": "multi",
        "choices": [
          {
            "id": "cream",
            "label": "Cream dollop",
            "delta": 30,
            "fx": [
              "#fffdf4",
              "#efe8d2"
            ]
          },
          {
            "id": "berry",
            "label": "Fresh strawberry",
            "delta": 40,
            "fx": [
              "#e0485f",
              "#f4a9b8"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 7,
    "slug": "cheesecake",
    "name": "Matcha Cheesecake",
    "description": "Dense, silky and quietly bitter, on a buttery biscuit base.",
    "price": 210,
    "category": "Sweets",
    "image": "/images/matcha/cheesecake.jpg",
    "available": true,
    "glow": "#9bb64d",
    "images": {
      "base": "cheesecake",
      "rules": [
        {
          "src": "cheesecake-topped",
          "when": {
            "top": [
              "azuki",
              "compote",
              "cream"
            ]
          }
        }
      ]
    },
    "options": [
      {
        "id": "top",
        "label": "Toppings",
        "type": "multi",
        "choices": [
          {
            "id": "compote",
            "label": "Berry compote",
            "delta": 40,
            "fx": [
              "#c4304c",
              "#e0667f"
            ]
          },
          {
            "id": "azuki",
            "label": "Azuki red bean",
            "delta": 40,
            "fx": [
              "#6a2d33",
              "#8a4a47"
            ]
          },
          {
            "id": "cream",
            "label": "Whipped cream",
            "delta": 30,
            "fx": [
              "#fffdf4",
              "#efe8d2"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 8,
    "slug": "cookie",
    "name": "Matcha Cookie",
    "description": "Crisp edge, tender centre, a crackle of powdered sugar.",
    "price": 110,
    "category": "Bites",
    "image": "/images/matcha/cookie.jpg",
    "available": true,
    "glow": "#7fa043",
    "images": {
      "base": "cookie",
      "rules": [
        {
          "src": "cookie-trio",
          "when": {
            "pack": "trio"
          }
        }
      ]
    },
    "options": [
      {
        "id": "pack",
        "label": "Pack",
        "type": "single",
        "default": "one",
        "choices": [
          {
            "id": "one",
            "label": "Single",
            "delta": 0
          },
          {
            "id": "trio",
            "label": "Trio",
            "note": "three cookies",
            "delta": 200
          }
        ]
      },
      {
        "id": "size",
        "label": "Size",
        "type": "single",
        "default": "reg",
        "choices": [
          {
            "id": "reg",
            "label": "Regular",
            "delta": 0,
            "scale": 1.05
          },
          {
            "id": "jumbo",
            "label": "Jumbo",
            "delta": 40,
            "scale": 1.2
          }
        ]
      },
      {
        "id": "top",
        "label": "Extras",
        "type": "multi",
        "choices": [
          {
            "id": "choc",
            "label": "White chocolate chunks",
            "delta": 20,
            "fx": [
              "#f6f0dd",
              "#e3d9b4"
            ]
          },
          {
            "id": "salt",
            "label": "Sea salt flakes",
            "delta": 0,
            "fx": [
              "#ffffff",
              "#dfe6d0"
            ]
          }
        ]
      }
    ]
  },
  {
    "id": 9,
    "slug": "mochi",
    "name": "Matcha Mochi",
    "description": "Soft rice dumplings dusted with matcha. A set of two.",
    "price": 140,
    "category": "Bites",
    "image": "/images/matcha/mochi.jpg",
    "available": true,
    "glow": "#9fb860",
    "images": {
      "base": "mochi",
      "rules": [
        {
          "src": "mochi-berry",
          "when": {
            "fill": "berry"
          }
        },
        {
          "src": "mochi-four",
          "when": {
            "count": "four"
          }
        }
      ]
    },
    "options": [
      {
        "id": "fill",
        "label": "Filling",
        "type": "single",
        "default": "anko",
        "choices": [
          {
            "id": "anko",
            "label": "Anko red bean",
            "delta": 0
          },
          {
            "id": "berry",
            "label": "Strawberry cream",
            "delta": 20
          }
        ]
      },
      {
        "id": "count",
        "label": "Set",
        "type": "single",
        "default": "two",
        "choices": [
          {
            "id": "two",
            "label": "Two pieces",
            "delta": 0
          },
          {
            "id": "four",
            "label": "Four pieces",
            "delta": 120
          }
        ]
      },
      {
        "id": "top",
        "label": "Finishing",
        "type": "multi",
        "choices": [
          {
            "id": "kuromitsu",
            "label": "Kuromitsu syrup",
            "delta": 20,
            "fx": [
              "#2a1511",
              "#5a2f3a"
            ]
          }
        ]
      }
    ]
  }
];

// Photograph variants live next to their business: /images/<dir>/<name>[-sm].jpg (dir defaults to matcha).
export const photoPath = (item, name, sm = false) => {
  const ext=['png','svg'].includes(item?.photoExt)?item.photoExt:'jpg';
  return `/images/${item?.dir || "matcha"}/${name}${sm&&ext==='jpg'&&!item?.illustrative?"-sm":""}.${ext}`;
};
export const itemOptions = (item) => item.options || [];
export const hasOptions = (item) => itemOptions(item).length > 0;

export function defaultSel(item) {
  const sel = {};
  for (const o of itemOptions(item)) sel[o.id] = o.type === "multi" ? [] : o.default ?? o.choices?.[0]?.id;
  return sel;
}

// Drop anything that is not a real option/choice of this item (never trust a stored/posted selection).
export function cleanSel(item, raw = {}) {
  const sel = defaultSel(item);
  for (const o of itemOptions(item)) {
    const v = raw?.[o.id];
    if (o.type === "multi") sel[o.id] = Array.isArray(v) ? o.choices.filter((c) => v.includes(c.id)).map((c) => c.id) : [];
    else if (o.type === "range") sel[o.id] = o.steps.includes(v) ? v : sel[o.id];
    else if (o.choices.some((c) => c.id === v)) sel[o.id] = v;
  }
  return sel;
}

export function unitPrice(item, sel) {
  let p = item.price;
  for (const o of itemOptions(item)) {
    if (o.type === "range") continue;
    const v = sel?.[o.id];
    for (const c of o.choices || []) if (o.type === "multi" ? v?.includes(c.id) : v === c.id) p += c.delta || 0;
  }
  return p;
}

const matches = (when, sel) =>
  Object.entries(when).every(([k, want]) => (Array.isArray(want) ? want.some((w) => (sel[k] || []).includes(w)) : sel[k] === want));
/** The photographed variant closest to this selection. */
export function pickImage(item, sel = defaultSel(item)) {
  for (const r of item.images?.rules || []) if (matches(r.when, sel)) return r.src;
  return item.images?.base;
}
const choiceOf = (item, sel, id) => itemOptions(item).find((o) => o.id === id)?.choices?.find((c) => c.id === sel?.[id]);
export const scaleOf = (item, sel) => choiceOf(item, sel, "size")?.scale ?? 1.06;
export const toneOf = (item, sel) =>
  itemOptions(item).map((o) => o.choices?.find((c) => c.id === sel?.[o.id])?.tone).filter(Boolean).join(" ");

export function summarize(item, sel, { all = false } = {}) {
  const out = [];
  for (const o of itemOptions(item)) {
    const v = sel?.[o.id];
    if (o.type === "range") { if (all || v !== o.default) out.push(`${v}${o.suffix || ""} sweet`); }
    else if (o.type === "multi") for (const id of v || []) out.push(o.choices.find((c) => c.id === id)?.label);
    else { const c = o.choices.find((c) => c.id === v); if (c && (all || v !== o.default)) out.push(c.label); }
  }
  return out.filter(Boolean);
}
export const sigOf = (id, sel) =>
  id + "|" + Object.keys(sel || {}).sort().map((k) => `${k}=${Array.isArray(sel[k]) ? [...sel[k]].sort().join("+") : sel[k]}`).join("&");

// A priced, snapshot-ready order line for a menu item and selection.
export function orderLine(item, sel, qty) {
  const clean = cleanSel(item, sel);
  return { ...item, sel: clean, summary: summarize(item, clean), price: unitPrice(item, clean), qty };
}

// Illustrative opening orders for the kitchen board (clearly seeded demo data).
export function seedOrderLines(menu) {
  const it = (id) => menu.find((m) => m.id === id);
  return {
    "KW-1048": [orderLine(it(1), { size: "l", milk: "oat" }, 2), orderLine(it(4), {}, 1)],
    "KW-1047": [orderLine(it(3), { vessel: "cup" }, 1), orderLine(it(8), {}, 2)],
    "KW-1046": [orderLine(it(2), { size: "l" }, 2)],
  };
}

// Approved photography per business for the Studio pickers and for storefront config validation.
// Config only ever stores one of these paths; anything else falls back to the default.
const img = (n) => `/images/matcha/${n}.jpg`;
export const ASSETS = {
  logos: ["latte-iced", "mochi", "strawberry", "cookie"].map(img).concat("/images/market-mark.svg"),
  covers: ["ritual", "latte-iced", "softserve-topped", "strawberry-topped", "berrycake-candle", "crepe-topped"].map(img),
  promos: ["berrycake-candle", "strawberry-topped", "ritual", "mochi-four", "softserve-topped"].map(img),
};
const NAMES = {
  "latte-iced": "Iced matcha latte", mochi: "Mochi", strawberry: "Strawberry matcha", cookie: "Cookie",
  ritual: "Matcha ritual", "softserve-topped": "Soft serve", "strawberry-topped": "Strawberry matcha, topped",
  "berrycake-candle": "Berry cake", "crepe-topped": "Mille crêpe", "mochi-four": "Mochi, four ways",
  "market-mark": "Kawing mark",
  // the usual.
  interior: "The café", "interior-square": "The café, square", logo: "the usual. logo", "the-usual": "The usual", "dirty-horchata": "Dirty horchata",
  "americano-cloud": "Americano cloud", "spanish-latte": "Spanish latte", americano: "Americano",
  "seasalt-latte": "Seasalt latte", "mocha-latte": "Mocha latte", "biscoff-latte": "Biscoff latte",
  horchata: "Horchata", "dark-cocoa": "Dark cocoa and cream", "strawberries-cream": "Strawberries and cream",
  blush: "Blush", "golden-hour": "Golden hour", blossom: "Blossom", amber: "Amber",
  "classic-matcha": "Classic matcha", "ube-matcha": "Ube matcha", "dango-matcha": "Dango matcha",
  "cookie-butter-matcha": "Salted cookie butter matcha", hojicha: "Hojicha", "hojicha-cocoa": "Hojicha cocoa",
};
/** Plain-language name for an approved image path (used for labels and alt text). */
export const assetName = (path) => NAMES[String(path).replace(/^.*\//, "").replace(/(-sm)?\.(jpg|svg)$/, "")] || "Photo";

// Viewport composition only: retain the published image bytes and isolate one serving.
export function photoCropStyle(item) {
  const crop = item?.photoCrop;
  if (!Array.isArray(crop) || crop.length !== 4 || !crop.every(Number.isFinite)) return undefined;
  const [x,y,w,h] = crop;
  if (x<0 || y<0 || w<=0 || h<=0 || x+w>1.001 || y+h>1.001) return undefined;
  return {position:'absolute', width:`${100/w}%`, height:`${100/h}%`, maxWidth:'none',
    left:`${-100*x/w}%`, top:`${-100*y/h}%`, objectFit:'fill', transform:'none'};
}
