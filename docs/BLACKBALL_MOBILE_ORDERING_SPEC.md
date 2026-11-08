# Blackball mobile ordering upgrade — 2026-11-08

Owner-authorized amendment: implement the current request's mobile gallery,
customization, visual feedback and complete demo order journey within the existing
Blackball profile. Baseline main 337d6d8, clean tree, canonical Kawing-Co repository.
Authority: current owner request, AGENTS.md, .codex/CURRENT.md, live Context Vault
TOKEN-OPT-001-A8. One writer, no new branch, no GitHub push (still deferred).

Scope: responsive, swipe/keyboard/button featured product gallery in the hub and
ordering view; finite entry/product motion with reduced-motion support; curated
Latte/Spanish/Biscoff/Matcha size and topping options; live total and photographic
preview; cart animation; connected confirmation and completion. Source Canva page
retrieved successfully 2026-11-08. Existing menu names/base prices are retained.
Unpublished size/topping choices and surcharges are explicitly fictional demo options.
Photo variants are approximate visual previews, not verified product configurations.

Data: keep merchant ID/seed, orders, cart, payment states and source prices. Enrich
only curated source option contracts once with a versioned, idempotent migration;
retain owner edits and unrelated records. Item price is recomputed from its current
menu options. Preserve existing unique submission ID and loyalty issuance rules.
No accounts, real payments, backend or trackers. No new dependencies or generated
merchant photography. Preserve logos, neutral design philosophy and other merchants.

Guest-facing operator simulation is in an explicit disclosure panel. It invokes the
existing orderAction lifecycle one step at a time: cashier review -> confirm ->
preparing -> ready -> served. Wallet customer claim remains separate; no automatic
verification, prep before authorization or false external payment action. Offline
orders stay queued. The staff kitchen still operates the same record.

Acceptance: swipe and accessible gallery controls select actual available products;
customization changes price and image; Add creates the chosen line exactly once;
receipt survives reload; separate demo operator actions complete that same order;
mobile 360/390 and desktop have no overflow, dialogs retain focus management and
reduced motion works. Relevant browser/model regressions, build and actual screenshot
review. Publish exact local main to existing public Site, preserve audience.
