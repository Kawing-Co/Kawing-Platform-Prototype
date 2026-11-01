# Storefront and connected commerce architecture

One merchant (`salo`) is implemented. State remains in `kawing-demo-v1`; its schema
version is now 2. `extend()` adds defaults to older data without changing order IDs,
brand identity, fulfillment state, or guide storage. Invalid new configuration arrays
fall back field-by-field; valid old records remain. Theme and displayed content are
bounded values, approved assets, enums and plain text. No arbitrary HTML or routes.

## Boundaries

- `commerce.js`: configuration registry/defaults, URL validation, theme foregrounds,
  state migration, payment/fulfillment transitions, idempotent loyalty ledger.
- `StorefrontHub.jsx`: shared customer/preview renderer, inline service pages,
  optional remembered demo account/recovery, guest Wi-Fi guidance and memory game.
- `Studio.jsx`: isolated drafts, saved configuration, presentation restore, accessible
  module organization, approved media library, content and loyalty configuration.
- `Customer.jsx`: preserved menu/cart/checkout/receipt, context-scoped persistent cart,
  bounded add-on, five payment preferences and explicit payment claim.
- `Engagement.jsx`: local demonstration activity, fulfilled sales, and private feedback
  inbox. It complements the original illustrative analytics rather than replacing it.
- `main.jsx`: shared state integration, entry query context, role navigation, staff
  cashier controls, kitchen progression, offline replay and deterministic reset.

## Configuration and operations

`data.brand` stays canonical for the restaurant name/tagline. `storefront.theme`
contains visual tokens. The studio saves the brand and normalized storefront together.
Draft previews share the renderer but do not emit events or place orders. Restore
swaps only presentation configuration and preserves live table-admission controls.
Preparation policy is an operational setting applied immediately and snapshotted
into future orders; it is not changed by a theme or template action.

All eight approved modules have stable IDs/types, visibility, order, title,
description and optional CTA. Ordering is always available. Layouts are structurally
distinct: compact action list, image-led visual storefront with featured products,
and minimal utility rows. Custom foregrounds use black/white contrast selection.

## Transactions and loyalty

Wallet choice starts at `selected`. The customer may record a `claimed` payment;
staff move it to `reviewing`, then `confirmed`. Only confirmation admits prepaid
orders to the kitchen. A configured cash-at-counter policy additionally allows staff
to approve preparation before collection; that approval does not confirm payment.
The same record progresses new → preparing → ready → served. Queued orders reconnect
once and retain their payment state. No wallet deep links or banking requests exist.

Submission IDs and UUID order IDs prevent duplicate submission. Order snapshots retain
context, guest, preparation policy, menu price/add-on and loyalty eligibility. Model
transitions reject foreign-merchant records. Valid local storage is a demo trust
boundary, not tamper-proof financial storage or production access control.

Loyalty credits use `purchase:salo:<orderId>` keys. Only completed, verified, eligible
purchases associated with the optional demo account earn one stamp per order. Refunds
append a single negative reversal. Redemptions atomically consume an integer threshold.
A redemption followed by a refund may create a negative ledger balance; the UI displays
zero available stamps until that debt is earned back, preventing reward duplication.
Alex’s seven opening stamps are explicitly illustrative seed data.

## Recognition, links and privacy

A remembered account pointer is separate from local account records. Forgetting clears
the pointer, while a displayed fictional inbox code can demonstrate re-linking. No
email is delivered. Clearing all data removes those records; the seeded sample demo
is not recovery of a real account. No fingerprinting or cross-device recognition.

External links require HTTPS, no embedded credentials, and matching hostnames for
named platforms. Empty destinations open honest demo notices. Reviews are neutral,
independent of private feedback and never rewarded. Clicks do not prove reviews,
follows, visits, or messages were completed. Feedback is fictional and browser-local;
there is no real staff authentication, so the owner inbox is a presentation role view.

Promotion visibility follows active flag and UTC display dates. Promotion pricing,
codes and conditions are illustrative and never mutate checkout pricing. Merchant
promotions are kept out of payment and verification; sponsored network placements
remain a clearly described future concept. No campaign attribution is inferred.

## Entry and reset

Query parameters carry only context: `?entry=table&table=03#Customer`, NFC table 08,
shared URL, counter, or takeaway. Selecting context updates the query so reload and
context-keyed cart storage agree. Shared links do not invent a table number. A copied
table link is not identity/location proof or staff authority. Disabled tables reject
new submissions while existing records retain context.

Reset restores seed orders/configuration/accounts/ledger/feedback and clears guide,
receipt and scoped carts. No new backend, package library or external service was added.

## Customer-only entry surface

Owner Studio includes example links with `surface=guest`. These render the same hub
without the presenter workspace, cashier/kitchen navigation or owner controls, even
if a staff hash is copied into that URL. Query context is still editable demonstration
data; this UI separation is not authentication or a production security boundary.
The normal presenter workspace remains available for the founder walkthrough.

Review CTR uses distinct review-view IDs with at least one outgoing click; repeat
clicks increase outgoing-click counts without artificially inflating CTR above 100%.
