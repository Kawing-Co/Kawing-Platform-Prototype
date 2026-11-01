# Prototype verification

Date: 2026-11-01. Browser: system Chromium, controlled by Playwright.
Scope: local Vite preview at http://127.0.0.1:5173. No deployment performed.

## Browser results

`npm test`: **6 passed**, 14.9 seconds, after final app integration.

- Customer quantity adjustment produces ₱570 for two Harvest bowls and ₱285 for
  one; simulated checkout creates exactly one order with the expected contents.
- That order appears in the staff kitchen, advances through preparing and ready
  to served, and its customer receipt reflects service after role navigation.
- Owner sales update from the seeded ₱12,840 to ₱13,125. The order survives reload.
  No browser page errors occurred during the connected order journey.
- An offline order is queued locally, survives reload, and reconnects as a new
  kitchen order. Repeated connection toggles preserve a single order record.
- Restaurant name, brand color, and dish availability update the customer view
  and persist after reload. Unavailable food cannot be added.
- Reporting period changes both illustrative revenue and chart; dish search
  produces a meaningful empty result. Reset requires a confirmation dialog.
- At 390 × 844, owner overview, customer ordering, kitchen, and storefront have no
  document horizontal overflow. Mobile navigation and checkout are operable.
- Tour Next changes the explanation; Tab and Shift+Tab wrap within the modal;
  Escape dismisses it. CSV export contains the expected header and seeded orders.
- All six customer dish images load successfully from local image paths.

## Visual review

Screenshots captured with reduced motion after fonts were ready:

- [Desktop overview](screenshots/desktop-overview.png), 1440px wide.
- [Desktop customer menu](screenshots/desktop-customer.png), 1440px wide.
- [Mobile overview](screenshots/mobile-overview.png), 390px wide.
- [Mobile customer menu](screenshots/mobile-customer.png), 390px wide.

Desktop overview and mobile customer screenshots were visually inspected. The
shared ivory/green palette, hierarchy, imagery, cards, and responsive spacing
remain coherent. Customer cards and checkout are legible at the mobile width.

## Limits

These checks cover a presentation prototype, not production commerce assurance.
Offline behavior is an explicit state simulation; it does not establish service
worker caching or real network resilience. Browser-local records are not shared
between devices. Payment labels are simulations and no money moves. Baseline
analytics are illustrative. No real payment provider or backend was tested.

## Final source checks

Root implementation agent reports: `npm run build` passed; `git diff --check`
passed. Remote main remained at baseline
`f5bbb084d3fd60f1771c49b20125e8c3922eb998` at final verification. Root visual review
also passed desktop/mobile overview and desktop customer menu. Work remains on
the isolated feature branch, with no production deployment or remote push.
