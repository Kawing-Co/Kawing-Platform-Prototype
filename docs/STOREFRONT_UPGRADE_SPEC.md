# Customer engagement upgrade — implementation amendment

Authorization: user's 2026-11-01 customer experience brief. No additional accepted-spec
approval gate or Context Vault exists in this checkout. This amendment is the bounded
implementation plan, not authorization for any hosted release.

Baseline: https://github.com/invicta-ctrl/qrmenu, feature/kawing-interactive-prototype,
dc168f0057c0e546ee4fb729f40f0905b0f2cf7d. Clean worktree, single worktree, remote branch
matches; no observable concurrent local writer. Remote writers cannot be ruled out.
Hosted Site last published this baseline; no newer local/unpublished changes found.
Three parallel specialists review read-only; root is sole integration writer.

## Scope and sequence
1. P0: versioned additive state migration; approved module registry; customer hub with
Quick Actions / Visual Storefront / Minimal Utility compositions; studio with live
preview, saved configuration/restore/reset, theme/content/link/promotion editors,
accessible module reorder/visibility/featured action. Private feedback and neutral
Google review remain independent. Social destinations validated; placeholder actions
explicitly simulated. Merchant-owned promotions never interrupt checkout.
2. Bounded P1 in this same amendment: branded stamp card, explicit local demo identity
and simulated recovery proof, eligibility/idempotency/refund ledger; Wi-Fi assistance;
a complete small memory puzzle; event-based demo engagement, cashier verification,
entry context/table disable, persistent cart, and expanded founder story.
3. Verification/docs: retain and adapt existing 9 browser tests to new hub/verification,
add tests for all new contracts and 360px layouts; production build, visual screenshots,
keyboard/reduced motion smoke, complete diff review by read-only specialist.

## Contracts / acceptance
- Legacy brand, menu, order IDs/statuses and guide storage preserved by migration.
- Storefront configuration is allowlisted serializable data, separate from operational
policy. Theme/layout edits cannot alter prices, payment records or order states.
- Shared Hub renderer powers studio previews without event or transaction writes.
- Context is table/counter/takeaway/shared/NFC, never identity or authority. Disabled
example tables block new orders; submitted orders keep their original context.
- Wallet selection and customer claim never confirm payment. Staff review and explicit
confirmation release digital orders; cash counter workflow requires staff approval.
- Eligible completed and verified purchases issue one ledger stamp per order. Refund
reverses it once. Redemption is atomic and recorded; thresholds cannot be bypassed.
- Review clicks are outgoing intent only, not completed reviews. All feedback remains
browser-local; negative feedback cannot gate the neutral review module.
- Engagement labels distinguish sample figures, actual local demo events, and external
outcomes. No external analytics, fingerprinting or cross-device visitor claims.
- No executable content, unsafe URL schemes, fake merchant accounts, wallet deep links,
review incentives, or real Wi-Fi credentials. Fictional recovery/code clearly disclosed.
- Original ordering, guide, analytics, offline replay, reset and role navigation survive.
- All new functions work via keyboard, touch, and reduced-motion preference.

## Exclusions / deferred
No backend, real payments/identity/recovery, wallet passes, production offline promise,
external feedback transmission, sponsored advertisers, arbitrary embeds or page builder,
additional merchants, advanced attribution/tiers, full scheduling engine, or heavy libraries.
No merge to main, Site deployment/republish, or Site access changes. Prior publication
permissions are superseded for this task. Source commits stay on the feature branch;
GitHub source version control remains authorized by the earlier explicit instruction.
