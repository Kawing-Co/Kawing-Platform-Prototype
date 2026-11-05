# Changelog

## Unreleased — KAWING-DEMO-UX-002 (branch `feature/kawing-demo-ux-002`)

- UX-01: Scenario → View entry uses the public names Standard Merchant and Pop-up Market;
  the view step is addressable (`?scenario=`) so Back/Forward work. Views are ordered
  Merchant, Customer, Admin and say what each opens. The session header shows
  `Scenario · Tier · View` with a Switch View menu, Customize (opens the scenario's
  tier/setup panel), Change Scenario and a confirmed, scenario-scoped Reset that keeps the
  Kawing Studio draft unless the visitor opts in. Compact header on small screens.
  Customer View opens the finished experience at once with the saved package.
- UX-02: Kawing Studio tabs follow the brief's order and end with **Review & publish**,
  which now shows a live validation checklist (name, modules, review/social link safety,
  promotion dates, package gallery quota). User-facing "Storefront" wording is replaced
  by Business Profile / Kawing Studio (page title, guide, engagement labels, back link,
  "Visual Showcase" template); internal IDs, hashes and event keys are unchanged.
- UX-05: Checkout offers GCash, Maya (formerly PayMaya), GoTyme Bank, MariBank and Cash.
  `Continue with <provider>` releases only an approved, order-specific https checkout on
  a verified provider host; none exists in the demo, so each opens truthful QR Ph
  instructions. No custom scheme, QR or receiver number; opening, returning, repeating
  or claiming never confirms payment. Matrix and sources: docs/PAYMENT_PROVIDERS.md.
- Playwright honours `CHROMIUM_PATH` and only uses `/usr/bin/chromium` when present.
- See docs/DEMO_UX_002_AMENDMENT.md. Not merged or published.

## 2026-11-05 — Spaces and Kawing Studio

- Added two-step Merchant Setup / Booth Setup and Merchant / Admin / Customer views.
- Added one shared interactive market fixture, booth participation, profile details,
  admin layout draft/validation/undo/local publish, temporary merchants and lifecycle.
- Renamed creator navigation to Customization; reorganized Kawing Studio around tasks,
  retained drafts, review, profile details, media quotas and optional tier controls.
- Preserved existing commerce, legacy hashes, simulation boundaries and public Site ID.
- See docs/SPACES_STUDIO_AMENDMENT.md and docs/SPACES_STUDIO_GUIDE.md for scope/limits.
