# Changelog

## 2026-11-05 — Premium redesign: Matcha Mood is the Standard Merchant

- Matcha Mood replaces Salo as the Standard Merchant everywhere (brand, nine-item menu with
  options, generated photography, seeded orders, loyalty, Studio). Internal id `salo` unchanged.
- New design layer `src/ds/`: tokens, type floor, tactile buttons (magnet + cursor light + press
  give on fine pointers, fingertip bloom on touch), scroll reveal, rolling digits, fx.
- Entry: photographic opening, photo-led scenario cards, re-rendered Matcha Mood product film.
- Customer: photographic hub with bento modules; ordering with sliding category rail, customizer
  sheet (live photo + price), fly-to-bag, bottom-sheet order on phones, receipt tracker.
- Merchant/Admin/Events: option summaries on kitchen cards, menu option hints, photographic
  Events header, calmer chrome, legibility floor and 44 px touch targets.
- Docs: REDESIGN_SPEC.md, REDESIGN_VERIFICATION.md. Not merged, pushed or deployed.

## 2026-11-05 — Premium experience and spatial product story

- Refined the shared interface with warm paper/ink tones, editorial entry typography,
  responsive hierarchy, stronger operational labels and restrained microinteractions.
- Added scenario-aware Quick actions (Ctrl/Cmd K), native modal focus, keyboard search,
  pointer intent, mobile swipe dismissal, destination previews and interruptible view
  transitions. Existing Studio draft-cancellation guards remain in place.
- Added single-use, field-scoped undo for module visibility and catalog availability;
  loading skeletons, genuine BlurHash image placeholders, local snapshot revalidation,
  safe insets/touch targets, code autofill and reduced-motion fallbacks.
- Added an optional original WebGL café story: Guest / Team / Owner stages, rotation,
  zoom, keyboard controls, on-demand rendering and honest unavailable/lost-GPU fallback.
  Reviewed Earl's three reference repos; retained no restricted portfolio code/assets.
- Rendered an original, captioned 12-second product film using Hyperframes CLI and
  FFmpeg. Video and WebGL are user-requested; orders never wait for either.
- Preserved the six spaces, map-first market merchant entry, live Studio drafts,
  browser-local ordering, verified payment distinction, loyalty ledger and offline demo.
- Added focused regression coverage and updated screenshot, reference and demo guides.
  See docs/PREMIUM_EXPERIENCE_VERIFICATION.md for checks and known limits.

## 2026-11-05 — KAWING-DEMO-UX-002 reconciliation

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
- UX-06: Session header buttons are at least 40px (44px at ≤1000px). A responsive sweep of
  9 surfaces at 5 widths found no overflow or console errors. Verification record and
  acceptance checklist: docs/DEMO_UX_002_VERIFICATION.md. UX-03/UX-04 are verified
  against the existing map, booth, editor and lifecycle tests, with no code change.
- Pop-up Merchant View now opens on the shared booth map, with My participation one tab
  away. This supersedes the participation-first landing at Earl's direction.
- Playwright honours `CHROMIUM_PATH` and only uses `/usr/bin/chromium` when present.
- Reconciled PR #1 with main, preserving the original four commits and historical branches.
  Studio refuses blank names without discarding the draft or saved configuration.
  Current authority, checks and release workflow: docs/BRANCH_RECONCILIATION.md.

## 2026-11-05 — Spaces and Kawing Studio

- Added two-step Merchant Setup / Booth Setup and Merchant / Admin / Customer views.
- Added one shared interactive market fixture, booth participation, profile details,
  admin layout draft/validation/undo/local publish, temporary merchants and lifecycle.
- Renamed creator navigation to Customization; reorganized Kawing Studio around tasks,
  retained drafts, review, profile details, media quotas and optional tier controls.
- Preserved existing commerce, legacy hashes, simulation boundaries and public Site ID.
- See docs/SPACES_STUDIO_AMENDMENT.md and docs/SPACES_STUDIO_GUIDE.md for scope/limits.
