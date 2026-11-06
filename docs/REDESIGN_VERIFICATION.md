# Kawing premium redesign — verification (2026-11-05)

Branch `redesign/premium-ui` (local; not merged, pushed or deployed).

## Automated
- `npm run build` passes.
- Playwright: **93 / 93** (72 existing + 10 in `tests/matcha.spec.js` + 11 in `tests/usual.spec.js`) (`CHROMIUM_PATH=/opt/pw-browsers/chromium npx playwright test`).
  Tests changed only where the product changed: Matcha Mood replaces Salo in names, prices and
  totals; the add-on test became an option-sheet test (Large + Oat = ₱320); on phones the order
  is a bottom sheet, so tests open it from the bag pill first.
- Sweep at 360 px over 15 routes: no horizontal scroll; smallest visible text 11 px (the map's
  SVG labels scale with the map and have a keyboard list alternative).
- Touch: controls under 44 px get an invisible hit slop or a 44 px minimum (`src/ds/floor.css`).

## Manual (screenshots reviewed at 390 px and 1280 px)
Entry and view picker, Customer hub and every module page, ordering (cards, customizer, bag,
checkout, receipt), Merchant Overview / Orders / Menu / Analytics / Studio / Engagement /
Payments / Ecosystem, Admin, Events (vendor desk, map). Reduced motion: drift, rings, flights,
reveals and rolling digits are disabled by `prefers-reduced-motion`.

## The second merchant and platform identity
`tests/usual.spec.js`: printed menu and add-on prices, forged selections cleaned, every photo exists,
business parameter and reset-key partition, the entry page is Kawing's own (collage of three
businesses, ink on paper), the business picker opens the chosen business, the usual.'s theme tokens
(greige, Jost, lowercase) reach the hub, an order with oat + extra shot is ₱270 and reaches the kitchen,
and Matcha Mood's record is untouched.

## Price scale
Matcha Mood's menu is on the same scale as the usual.'s (a matcha latte is ₱230 at both; oat +₱50,
more matcha +₱30, cream/foam +₱30; sweets ₱110–240). Analytics baselines follow each business's own
average basket. `tests/matcha.spec.js` checks the two menus agree where the drinks and add-ons are the same.

## Known limits
- Hallmark, Impeccable and BRAG were not available in this environment; the design system in
  `src/ds/` follows the project notes instead. Hyperframes and FFmpeg were used (product film,
  poster, BlurHash).
- Photography is generated, not real products (the usual.'s café interior is the owner's own photo). Selecting options shows the closest photographed
  variant; it is not a render of every combination.
- The map's booth labels are small on phones by design; the accessible booth list is the
  phone-first path.
- A saved Salo-era demo record in a browser is discarded once by the seed marker.
- Presenter controls ("Demo entry") are kept for the walkthrough but recede visually.
- Not verified on physical iOS/Android devices or with a screen reader; `corner-shape: squircle`
  falls back to ordinary rounded corners in browsers without it.
- the usual. is not a booth in the Sunday Commons yet; its menu has no photo variants per option
  (the price and chips change; the drink photograph stays).
- the usual.'s Instagram could not be read by the tool (the site blocks automated access); its
  look and copy come from the printed menu, the supplied photographs and logo, and a screenshot of the feed.
