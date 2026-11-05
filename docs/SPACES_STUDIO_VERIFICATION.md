# Spaces / Studio verification — 2026-11-05 (Asia/Manila)

Baseline: qrmenu main 433c1190b590bf7ddab343907555a743895bd43f.
Implementation branch: feature/spaces-studio-overhaul. Root AGENTS.md governs release.

## Executed

- Complete browser suite: **26 passed**, 1.5 minutes. Existing 21 commerce/guide
  regressions retained with explicit legacy-entry URLs and new Customization naming.
- After final fixture-category/profile-display/reset refinements: **6 targeted checks
  passed**, 12.9 seconds (reset, entry/spaces, shared map, layout validation, temporary
  lifecycle, retained Studio draft and media quota).
- Final production build: passed, 1.77 seconds; JS ~123 kB gzip, CSS ~20 kB gzip.
- `git diff --check`: passed. No runtime dependencies added.
- Browser screenshots captured with Chromium, loaded fonts and reduced motion.
  Desktop landing, editor and Studio plus mobile Studio/customer map were actually
  inspected. Studio 360px document width was explicitly checked to fit the viewport.

New tests cover immediate two-step entry and exactly three views; customer isolation;
package persistence; merchant assignment seen by customer/admin; blocked pre-confirm
state; walkway, overlap and bounds rejection; undo and published layout reload;
temporary profile creation/assignment/end visibility; mobile map/list/pagination;
unsaved Studio drafts across role changes; real media-limit disabling and mock-style
gating; saved brand/gallery propagated to Customer View.

## Visual references

- [Simulation chooser](screenshots/spaces/desktop-simulations.png)
- [Three spaces](screenshots/spaces/desktop-three-spaces.png)
- [Admin layout editor](screenshots/spaces/desktop-layout-editor.png)
- [Desktop Studio](screenshots/spaces/desktop-studio.png)
- [Mobile chooser](screenshots/spaces/mobile-simulations.png)
- [Mobile customer map](screenshots/spaces/mobile-customer-market.png)
- [Mobile Studio](screenshots/spaces/mobile-studio.png)

## Limits

This is one fictional local event, numeric geometry editing on a 2D map, local
reservations and simulated profile lifecycle. There is no server synchronization,
real locking, event checkout, publication service, staff authentication, account
onboarding or payment activation. Temporary profiles use text/avatar placeholders;
real media uploads and contact integrations are deferred. Package controls illustrate
media quotas and mock suggestions, not billing/POS activation. Mobile app-launch
success/failure tests were not run because payment integrations are outside this
accepted UI slice and no verified provider integration was supplied. No unsupported
scheme or real receiver was added. Referenced master spec was unavailable; the user's
explicit request and recorded amendment define this bounded implementation.

Existing restaurant state is preserved; separate event reset restores deterministic
fixtures without wiping commerce. Legacy #Storefront remains an internal alias, while
new creator navigation is Customization / Kawing Studio. Release follows the standing
policy: merge tested source into main and publish the exact pushed main to the same
public Site. Native deployment success and served bundle checks are required before
calling it live; final release status is reported in the conversation.
