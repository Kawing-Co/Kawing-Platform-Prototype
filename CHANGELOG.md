# Changelog

## 2026-11-08 — Remove logo orbit

- Removed the rotating ring and dot surrounding the stacked Kawing & Co. logo.
- Preserved original SVG artwork, entrance motion and other Lottie interactions.

## 2026-11-07 — LottieFiles motion and interactive landing story

- Added local, navy/white LottieFiles connection, cart and directional microinteractions;
  immediate landing entrance and subtle orbit preserve the supplied original logo.
- Made the three-step visit story interactive, with illustrative perspective previews.
- Added persistent pause, reduced-motion/static fallbacks, focus replay and offscreen/
  hidden-page suspension. Player is lazy-loaded; no animation account or credentials needed.
- Added visible animation credits/licenses, source provenance, 29 passing targeted checks
  and compiled responsive screenshot evidence. GitHub push remains deferred.

## 2026-11-07 — Separate entry pages and interactive booth map

- Split introduction, experience selection and view selection into addressable pages,
  retaining history, direct entry and Studio draft guards.
- Rebuilt the market schematic in company navy/white with two facing booth rows,
  entrances, walkways, clear booth states and connected merchant details.
- Added bounded drag/pinch/keyboard zoom and pan, Fit/normal-scroll recovery, spatial
  filtering, mobile detail sheets and cross-access validation.
- Preserved assignment, lifecycle, ordering, shared local records and customer themes.
  Guide and verification: docs/BOOTH_MAP_GUIDE.md. GitHub push remains deferred.

## 2026-11-07 — Company theme isolation

- Corrected the incomplete green-to-navy platform migration. The workspace accent
  now follows Kawing ink instead of the selected merchant's brand color.
- Migrated legacy company and Studio/engagement color literals to navy/white tokens,
  including form chrome, navigation, canvas frames, dashboard and market surfaces.
- Preserved merchant theme records and customer storefront styles; added regression
  checks for company/merchant color isolation. Evidence: docs/COMPANY_THEME_CORRECTION.md.

## 2026-11-07 — Supplied vector identity and reactive motion

- Replaced the company-name fallback with the supplied SVG symbol, stacked mark and
  flat/depth/reversed wordmarks. All five originals are retained byte-for-byte.
  Native SVG rendering/CSS cropping preserve the artwork; no replacement font or tracing.
- Added bounded logo response, depth artwork on hover/focus, tactile entry action,
  press feedback on cards/controls, and short confirmation transitions. No idle loop;
  reduced motion removes movement. Company navy/white and merchant themes stay separate.
- Added four asset/motion checks. Final focused set: 36 passed; full mobile overhaul
  baseline: 94 passed. Compiled preview 24-case sweep passed; screenshots updated.

## 2026-11-07 — Mobile demo journey

- Added a branded proposal introduction explaining customer, merchant and admin
  perspectives, the connected visit and the proposed 3–5-establishment pilot.
- Choose your experience focuses the experience choices; selecting an experience
  replaces the introduction with a concise business/view picker. Removed the repeated
  hero/collage and old presentation stepper from the view-selection screen.
- Removed command search, its trigger, catalog, keyboard listener and pointer-intent
  helper. Kept undo as an independent host; normal navigation and draft guards remain.
- Added compact phone role cards, business choices, touch controls and phone/tablet
  session rows. Corrected tablet action overflow and retained merchant theme identity.
- Updated browser coverage and demo guide. Screenshots: docs/screenshots/mobile-entry/.
  GitHub push remains explicitly deferred; the existing public Site is the release target.

## 2026-11-07 — Company palette and signature-drink poster

- Applied navy/white company tokens and a Kawing & Co. text-name fallback in the
  entry, session header and merchant sidebar. Merchant themes remain independent.
- Replaced the usual. interior photo on entry posters and business previews with
  the owner-confirmed "the usual" signature drink photo. Interior/gallery assets remain.
- Exact supplied logo artwork is pending original PNG/SVG/ZIP files; the text fallback
  is explicitly not a reproduction of that artwork. See .codex/CURRENT.md.
- Production build and 22 session/merchant browser regressions passed. Compiled preview
  at 360/1440px: no console errors or page overflow; screenshots inspected.

## 2026-11-06 — Kawing identity restored; second merchant "the usual."

- The platform is Kawing again: the entry page is paper, ink and forest with a swipeable collage of
  several businesses, and the product film shows two merchants inside a Kawing frame. Matcha Mood's
  look stays inside merchant profiles.
- New merchant "the usual." (coffee bar): theme from its printed menu (warm grey, black, olive, Jost
  lowercase), 25-drink menu with the printed prices and add-ons as options, generated drink photography,
  the owner's interior photo as hero, seeded kitchen orders. Standard Merchant has a business picker.
- Merchant profiles now follow a per-merchant theme (display/body type, case, hero tint, light or dark
  photography, CTA contrast). Registry in `src/businesses.js`; reset and storage are per business.
- the usual. uses its supplied wordmark logo; its palette and copy were refined from its Instagram feed
  (ivory-grey, olive green, matcha pop-ups, ceremonies and after-hours nights; "the matcha loop" offer).
- Matcha Mood's prices and option deltas are reconciled to the usual.'s scale (matcha latte ₱230,
  oat +₱50, more matcha +₱30); analytics baselines are per business.
- Fix: the customizer's rolling price was misaligned in the photo tag (line-height).

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

## 2026-11-08 — Compact introduction

- Fit the landing introduction to standard phone, tablet and desktop viewports.
- Removed Pause motion; decorative playback is finite and story steps advance manually.
- Retained accessible text zoom scrolling and system reduced-motion support.

## 2026-11-08 — Neutral functional design system

- Replaced decorative navy panels with warm paper and stone surfaces; reserved navy
  for primary actions and used navy-tinted charcoal for dark text.
- Migrated pure UI extremes to tinted materials; preserved independent merchant brands.
- Updated entry, shell, Studio, admin, map and shared chrome; corrected logo blending,
  footer composition and compact Studio rail overflow. Preserved ordering and motion.
- Added contrast/action regression checks and design guidance with verified screenshots.

## 2026-11-08 — Independent masthead and the usual. market reconciliation

- Separated the entry symbol at left from the centered wordmark and right-hand caption.
- Added the usual. as a standard market merchant with B04 in the default layout.
- Reconciled older local catalogs once without overwriting occupied/blocked booths;
  retained later owner removals. Standard merchants show their real demo menu samples.

## 2026-11-08 — Blackball Cafe and merchant entry

- Added independent Blackball Cafe branding, 104 source-backed menu entries and local
  ordering, plus safe one-time Pop-up Market catalog reconciliation.
- Preserved separate original cup/wordmark imagery; documented source prices, media
  and ambiguous menu rows excluded from checkout. Linked the published original menu.
- Standard Merchant View opens Start here; Customize still opens Studio. Welcome copy
  follows the selected merchant. Removed selected-card top arcs and decorative stars.
