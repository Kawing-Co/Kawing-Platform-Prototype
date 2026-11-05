# Interactive workspaces verification — 2026-11-05

Repository: `https://github.com/invicta-ctrl/qrmenu`.
Starting main: `f15654234952c5f85a77d8fddc589b572bac9c9a`.
Integration branch: `feature/interactive-workspaces`; release target: `main`.
No unknown work was present at preflight. Main was re-fetched and unchanged during
implementation. No force push or replacement app was used.

## Automated evidence

- `npm run build`: Vite production build passes; no runtime dependencies added.
- Full regression: `npx playwright test` passed all 35 checks. After the final mobile vendor-picker refinement, `npx playwright test tests/interactive.spec.js` passed all 10 focused checks (36 distinct checks covered overall).
- `git diff --check`: passes. No separate lint or TypeScript script is configured.
- New browser coverage checks actual iframe widths (390/1280 and 360), keyboard
  direct-edit selection, live draft/save behavior, tier preview without saved-plan
  mutation, no false setup approval, paused accounts, logistical fulfillment distinct
  from requests, installed tent requirement and blocker resolution with a note.
- Booth checks run customer → payment claim → cashier review/confirm → preparation
  → ready → served → receipt against the same record; a separate-tab check verifies
  local live updates without reloading either document.
- Separate craft merchant catalog, cart, receipt and storage are verified; craft
  items have no food add-ons. Event closure or reassignment during browsing rejects
  checkout while retaining the cart.
- Existing checks cover loyalty exactly once, redemption/refund reversal, unsafe
  URLs, all hub compositions, reviews independent from feedback, Wi-Fi limitations,
  the complete puzzle, offline replay once, cash authorization, deterministic reset,
  founder walkthrough, retained Studio drafts and map validation/lifecycle.

## Visual/browser evidence

Chromium screenshots were captured and inspected in
[`screenshots/interactive`](screenshots/interactive). Reviewed sizes include
1440×900, 1366×768, 390×844 and 360×800. The latest capture run reported no browser
console errors or page exceptions, and no horizontal document overflow in ten views.
Desktop Studio fits within 1366×768 and 1440×900; the standard admin overview and
customer setup fit 1440×900. Mobile customer setup fits 360×800. Complex forms and
embedded menus use scrolling. Selected preview sections have visible outlines and
matching named inspectors. Native buttons/forms, keyboard selection, tab navigation,
focus styles and reduced-motion settings received smoke coverage. This is not a full
assistive-technology or WCAG certification.

Representative artifacts:

- [Studio: direct Wi-Fi editing](screenshots/interactive/desktop-studio.png)
- [Studio at 1366×768](screenshots/interactive/compact-desktop-studio.png)
- [Standard operator dossier](screenshots/interactive/desktop-admin.png)
- [Organizer logistics](screenshots/interactive/desktop-vendor-logistics.png)
- [Merchant participation](screenshots/interactive/desktop-participation.png)
- [Mobile customer selection](screenshots/interactive/mobile-customer-selection.png)
- [Mobile Studio](screenshots/interactive/mobile-studio.png)
- [Craft booth ordering](screenshots/interactive/mobile-booth-ordering.png)

## Release and limitations

AGENTS.md requires checked main to be pushed and published to the existing public
Site, preserving its audience and project ID. The release uses the exact pushed main
commit and matching local build archive. Native publication status and anonymous
served asset hash are checked in the release handoff; the ending SHA/URL are reported
there rather than embedding a self-referential commit ID in this source file.

This remains a browser-local proposal prototype. Same-origin storage updates are not
an atomic multi-user backend or tamper-proof ledger. Real device/browser Wi-Fi and
wallet integrations, account authorization, billing, support dispatch, capacity/load
calculations, weather/safety procedures and legal approvals are deferred. A green
readiness checklist means the configured fictional conditions were met; it makes no
claim that all real-world operational problems have been covered.
