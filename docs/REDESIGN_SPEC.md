# Kawing premium redesign — specification (2026-11-05)

Branch: `redesign/premium-ui` (local work branch from main 430615c). Not merged, pushed or
deployed. Follows [DESIGN_NOTES.md](DESIGN_NOTES.md), the architecture documents and the
earlier [premium amendment](PREMIUM_EXPERIENCE_SPEC.md). There is no `DESIGN.md` or
`ARCHITECTURE.md` in this repository; those documents are the equivalents.

## The Standard Merchant is Matcha Mood
Matcha Mood replaces Salo as the business behind Standard Merchant, Customer View, the kitchen,
analytics and Studio. Its design language (dark photography, display serif, spring motion, a
customizer with live photo and price) is the Customer View. The internal merchant id stays
`"salo"` so storage keys (`kawing-demo-v1`, `kawing-cart-v2:salo:*`, `kawing-last-order`), loyalty
ledger keys and operations are untouched; older docs that say "Salo" describe the same record.
A seed marker (`seed: "matcha-mood-1"`) discards a browser's old Salo demo record once.

## Goal
A product-wide visual and interaction redesign that feels premium, calm and modern on a
phone first, without changing what the product does: Customer, Merchant and Admin views, and
Events. Evolve the existing identity (warm paper, ink, one forest accent, editorial serif
headlines) rather than replace it.

## Audit (what was wrong)
- Type: 7–10 px text in ~60 places (eyebrows, status chips, session bar, kanban, map legend).
- Chrome: session header + breadcrumbs + demo strip + role tabs compete with the content.
- Imagery: almost no large photography outside menu cards; entry page is text and diagrams.
- Customer view: boxed hero with a thumbnail avatar; presenter controls ("Demo entry") sit
  above the storefront; desktop shows a phone mock on a dotted canvas.
- Buttons: 148 of them are unclassed and styled by context, so there was no shared tactile
  language; one forest colour but several hover/press behaviours.
- Events: functional map and dossiers, but flat and dense.

## Principles
1. Premium minimalism: restrained palette, generous space, hierarchy before decoration.
2. First impressions: one strong, photographic top fold per major surface.
3. Plain language and progressive disclosure: presenter/demo controls recede; essentials lead.
4. Tactile, not theatrical: magnetic lean + cursor light + press "give" only on primary
   actions and only with a fine pointer; touch gets a press and a fingertip bloom instead.
5. Motion is short, interruptible and optional (`prefers-reduced-motion`).
6. Every state change has feedback (skeletons, optimistic updates, undo, toasts).

## Design system (`src/ds/`)
- Tokens: paper `#f7f6f0`, surface `#fffdf8`, ink `#1f2e26`, forest `#1f4d3a`/`#2f6b50`, sage
  `#e4ecdf`, moss `#6b8a5e`, amber for pending/offline only. Muted text ≥ 4.5:1 on paper.
- Type: Manrope (headings), DM Sans (UI) as before; Cormorant Garamond for display headlines
  and large figures. Floor: 11.5 px labels, 12.5 px controls, 15 px body.
- Shape: 14/20/28 px radii; `corner-shape: squircle` where supported. Soft layered shadows.
- Components: buttons (primary/secondary/ghost/icon), inputs, selects, switches, chips, cards,
  tables, sheets, toasts, skeletons — styled through shared selectors, not per-screen rules.
- Behaviour: `tactile.js` (magnet, light, press, fingertip bloom), `reveal.js` (scroll reveal).

## Scope by area
- Shell: calmer session header, labelled sidebar, consistent page headers, mobile bottom nav.
- Entry: cinematic hero with real photography; photo-led scenario and view cards.
- Customer: photo-led hub, category rail with a sliding indicator, item sheet with live photo
  and rolling price (size, milk, strength, sweetness, toppings), fly-to-bag cart, bottom-sheet
  order on phones, order → receipt tracker, loyalty and payments restyled. Mobile-first.
- Merchant: overview hierarchy, kitchen board, menu manager, analytics, Studio chrome.
- Admin: overview, packages, setup review, support.
- Events: map and booths, vendor desk, readiness, orders.

## Boundaries (unchanged)
Browser-local state (`kawing-demo-v1`, event keys), simulated payments and fulfilment, no
backend, tracking, payment SDK or real identity. Order, loyalty, offline-queue and idempotency
logic are not modified. No magnetic motion on touch. No autoplay film or 3D during checkout.
Existing routes, query parameters, hashes and the six spaces keep working.

## Order model (unchanged trust boundary)
A line is `{ id, sel, qty }`. The unit price is recomputed from the menu at submission
(`orderLine` in `src/merchant.js`); a tampered cart cannot change a price. The photograph shown
for a selection is the closest photographed variant (`images.rules`), not a render of every
combination. Payments and fulfilment remain explicitly simulated.

## Acceptance
- `npm run build` passes; the full Playwright suite (72) passes unchanged.
- No visible text below 11 px; focus visible everywhere; contrast ≥ 4.5:1 for body text.
- 360 px and desktop screenshots of every area reviewed; no horizontal scroll at 360 px.
- Reduced motion disables magnet, parallax, reveals and flights (light and press remain static).
- Primary actions stay discoverable; every new interaction has a keyboard path.
- Verification and known limits recorded in `REDESIGN_VERIFICATION.md`.
