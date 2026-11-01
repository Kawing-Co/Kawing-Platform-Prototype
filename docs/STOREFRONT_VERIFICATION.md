# Storefront upgrade verification — 2026-11-01

Repository: https://github.com/invicta-ctrl/qrmenu
Branch: feature/kawing-interactive-prototype
Starting commit: dc168f0057c0e546ee4fb729f40f0905b0f2cf7d
Scope: source/local prototype only. No Site deployment, source sync to Sites, access
change, merge to main, real payment, backend, or external customer data transmission.

## Executed checks

- Complete Playwright suite: **21 passed**, 1.3 minutes, system Chromium.
- After final food-only add-on refinement, targeted cart/modifier/context/table-control
  and customer-only guest-entry checks: **2 passed**, 6.7 seconds.
- Final `npm run build`: passed, 1.83 seconds. JS ~111 kB gzip, CSS ~15 kB gzip.
- `git diff --check`: passed. No runtime dependencies added. No configured lint or
  typecheck scripts exist; none were claimed.
- Console-error, keyboard focus/Enter, Studio arrow-tab navigation, dialog focus,
  reduced-motion and 360px overflow smoke checks are included in browser tests.
  These are smoke checks, not a full WCAG certification or real-device matrix.

## Coverage

All original nine regressions remain, adapted to hub entry, explicit cashier
verification and saved studio drafts. New coverage includes:

- Quick Actions, Visual Storefront and Minimal Utility; theme persistence, module
  ordering, visibility, save/restore and preview event isolation.
- HTTPS/platform validation, truthful demo review destination, neutral reviews after
  negative private feedback, owner inbox reviewed/resolved status, outgoing-click
  counts and view-based CTR.
- Completed eligible confirmed purchases, exactly-once ledger credits across reload,
  redemption, refund reversal, and rejected foreign-merchant transitions.
- Explicit simulated recovery proof, failure without a valid code, forget-browser flow,
  Wi-Fi capability disclaimer, complete memory puzzle and restart.
- Context-scoped persistent cart and add-on price, disabled table preserved across
  presentation restore, selected context retained in query on reload.
- Cash-at-counter approval distinguished from payment confirmation; prepaid kitchen
  admission blocked until cashier confirms. GCash and Maya exercised end-to-end;
  all five preferences render from the same checkout control.
- Promotion active/date visibility, hidden games and no arbitrary module routes,
  current receipt reopening after browsing, deterministic whole-demo reset.
- Customer-only entry links omit owner/staff presentation controls despite a staff hash.

## Visual evidence

Screenshots captured with system Chromium, local assets, loaded fonts and reduced motion.
The integration owner actually viewed the desktop studio, Visual Storefront, dark
palette, mobile Quick Actions, Minimal Utility, guest entry, loyalty and checkout.
Mobile checkout’s redundant floating cart shortcut was removed during review.

- [Owner Studio](screenshots/upgrade/desktop-studio.png)
- [Visual Storefront](screenshots/upgrade/desktop-visual-storefront.png)
- [Quick Actions](screenshots/upgrade/mobile-quick-actions.png)
- [Minimal Utility](screenshots/upgrade/mobile-minimal-utility.png)
- [Midnight theme](screenshots/upgrade/desktop-midnight-theme.png)
- [Guest-only entry](screenshots/upgrade/mobile-guest-entry.png)
- [Loyalty](screenshots/upgrade/mobile-loyalty.png)
- [Checkout](screenshots/upgrade/mobile-checkout.png)

Three read-only specialists reviewed customer UX, model contracts and quality/policy.
Their concrete findings led to fixes for malformed configuration, color contrast,
operational table preservation, integer thresholds, merchant guards, stale loyalty,
context reload/history, and receipt navigation. Final review found no remaining
blocker against the bounded amendment. The integration owner reviewed the complete
source diff; hosted configuration and dependency manifests remain unchanged.

## Limits and deferred work

This is one fictional merchant and Alex’s seeded fictional account. Every guest,
payment, recovery code, stamp, refund, feedback message and event stays browser-local.
There is no actual financial or identity authority. Customer-only links are presentation
separation, not authorization. Wi-Fi credentials are fictional; there is no universal
connect action or active Wi-Fi QR integration. External link validation checks scheme
and platform hosts, not ownership or merchant authenticity.

Opening stamps and original business baselines are illustrative. Engagement counts
are local actions; journey stages have different units and are not presented as a
unique-person conversion funnel. No order attribution or external review completion
is inferred. Promotions show illustrative prices/codes; they do not change checkout
pricing. Media customization uses approved local assets, not uploads.

Deferred: additional merchants, real account recovery, payment providers, production
permissions/storage/offline resilience, wallet passes, advanced tiers, coupons/pricing
engine, uploads, sponsored network campaigns, cross-device identity/analytics and
campaign attribution. No known blocking source defect remains in tested scope.
