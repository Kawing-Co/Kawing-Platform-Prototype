# Mobile demo verification — 2026-11-07

Authoritative source: Kawing-Co/Kawing-Platform-Prototype, local main starting at
62c556c22bda2031fa32ae5662a48c03d5fa1557 (Site version 10). The owner explicitly
requested Site publication before GitHub push; origin/main remains 2910c87. No
GitHub write retry or new branch is part of this release. Context: .codex/CURRENT.md.

Scope: branded navy/white introduction, purpose and simulation disclosure, experience
CTA with keyboard focus, compact business/view picker, removal of the old hero and
photo collage after selection, phone/tablet session layout, complete command-search
removal while preserving undo and existing connected operations.

## Checks

- Production build passed. Vite retains its pre-existing >500KB main-chunk advisory.
- Full 94-test Playwright regression before final brand-asset integration: 94 passed in 5.3 minutes.
- Focused mobile/merchant run: 14 passed before adding separate tablet coverage.
- Chromium compiled-preview sweep: 24 route/width combinations (360/390/768/1440px),
  no page or console errors, no horizontal page overflow, no command trigger/dialog,
  introduction present only on the initial landing. Six screenshots retained in
  docs/screenshots/mobile-entry/; desktop and phone landing/picker/Studio/admin reviewed.
- New tests verify the purpose/CTA/focus, both businesses, compact view selection,
  browser Back, command-shortcut absence, six views at 360px and at 768px.
- Existing regressions preserve data/payment/loyalty/offline and Studio draft boundaries.
- Complete logical diff and whitespace review: passed. No configured lint/type-check script.

Verification found and corrected a tablet session-header overflow; compact header
rows now apply through 1000px. Two obsolete test selectors were updated for the
intentional removal of the old hero/search. A new all-view test uses the actual More
menu on compact screens. A temporary JSX assembly error was corrected before the
successful build and focused run; no broken intermediate build was published.

## Limitations and release

Chromium desktop/touch-sized checks are not physical iOS/Android or screen-reader
certification. All operational records remain fictional and browser-local. The
original supplied SVGs are now used directly (no text fallback); five source files are preserved byte-for-byte. Merchant theme identities remain independent of company chrome.

Publish only the exact local commit pushed to the existing Site source repository.
Retain the public audience. Report actual saved version, commit and deployment result
in completion; record local release reconciliation in .git/kawing-brand-release.json.
Rollback: saved Site version 10, with no data migration required.

## Supplied assets and microinteractions

The owner subsequently supplied five original SVG files and requested more responsive
interaction. Native SVG artwork replaces the company-name fallback. Brand feedback is
reactive: depth variant on hover/focus, bounded pointer response, small symbol rotation,
press compression and reset. Buttons, cards and confirmations have subtle functional
feedback. No idle brand animation, motion engine dependency or payment-state change.
Reduced-motion preferences disable movement. Four new tests cover asset availability,
logo/focus behavior, tactile press/action, and reduced motion. Focused final verification
with logo, mobile/session, merchant and connected-order cases: 36 passed (1.5 minutes). Final build and 24-case compiled-preview sweep passed after SVG/motion integration.
