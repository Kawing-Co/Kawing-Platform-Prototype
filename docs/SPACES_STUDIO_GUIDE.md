# Two simulations, three spaces — 2026-11-05

## Start here

Open the Site root. Choose **Merchant Setup** (Standard Merchant / Business Profile)
or **Booth Setup** (Pop-up Market / shared interactive layout), then choose exactly one
of **Merchant View**, **Admin View**, **Customer View**. No account or tier gate blocks
entry. The session header always offers Switch View and Change Simulation.

Merchant Setup:
- Merchant View opens **Customization → Kawing Studio**. Use the editing sidebar:
  Business details, Brand, Layout, Modules, Content, Loyalty, Operations, Media & tier,
  Review. Draft preview reuses the customer renderer; Save design commits locally.
- Customer View opens the branded business experience without merchant/admin chrome.
- Admin View opens a separate operator overview, Packages, Setup review and Support.
  Review/support confirmations are explicitly simulated; nothing is sent externally.
- Cashier/kitchen, catalog, loyalty, feedback and analytics remain merchant task areas.
  Original deep links and the guided founder story remain supported. The old
  `#Storefront` hash aliases Customization without renaming persisted commerce keys.

Booth Setup:
- Customer View: explore The Sunday Commons, search/filter, zoom/pan/fit, or use the
  paged accessible booth list. Tap B02 or B07 for fictional business details.
- Merchant View: select an available booth, choose an existing profile, then Confirm
  demo booth. A business has one booth; choosing another moves its assignment. Use
  My participation to create a short temporary profile. Cancel retains the business.
- Admin View: Layout Editor supports bounded numeric geometry, categories, unavailable
  flags, assignment/unassignment, add/remove, undo, cancel and local publish. Bounds,
  overlaps and the central walkway are validated. All views load one canonical state.
- Merchants manages temporary profiles; Event setup changes draft/active/ended state.
  Ending closes new reservations and hides temporary public profiles, retaining
  history and ordinary business profiles. Reset market is confirmed and isolated
  from restaurant commerce state.

## Suggested partner walkthrough

1. Choose Merchant Setup → Merchant View. Explain the Business Profile, configure its
   identity in Studio, change template and preview. Save design.
2. Switch View → Customer View. Browse and order. Switch back to merchant operations
   to show the existing cashier verification and kitchen workflow.
3. Change Simulation → Booth Setup → Customer View. Explore occupied booths using
   map and list. Show the same business identity joining a market.
4. Switch to Merchant View, select B01 and confirm a fictional assignment. Switch to
   Customer/Admin and show the shared result. No real reservation service exists.
5. In Admin Layout Editor, move a booth into the walkway; show rejection, Undo, adjust
   to a valid position and Publish demo layout. Explain local-only publication.
6. Create a temporary merchant, assign a booth, then end the event. Temporary profiles
   become inactive while the existing business survives.

## Architecture and migration

`Spaces.jsx` controls the scenario/view shell using URL query state. `Market.jsx`
contains the version-1 event fixture and local layout validation; data lives in
`kawing-market-v1`, separate from `kawing-demo-v1`. Role switches remount role-specific
controls while restoring the canonical published state. No multi-user locking is claimed.
`AdminSpace.jsx` isolates the operator surface and reusable tier selector. Studio
uses `kawing-studio-draft` for retained unsaved designs, with leave/reload warnings.
Internal `storefront` keys remain intact for compatibility. Existing files/data were
preserved; no other production-track repository was changed.

Packages demonstrate Basic/Growth/Bespoke with 2/6/12 approved gallery slots and a
Growth/Bespoke mock style suggestion. Downgrades preserve data and block additions
above quota. The existing rich sample configuration is retained; package selection
is optional, does not bill, and never changes payment or POS policy. Real uploads,
AI generation, production account authorization, 3D, real event booking, and provider
payment activation remain out of scope.

## Payment-provider boundary

The attachment's payment-launch section is contextual; the accepted user request
focuses spaces, maps and Studio. The existing checkout remains explicitly simulated.
No verified order-specific hosted-checkout credentials or mobile-app launch integration
were supplied. No custom payment schemes, personal receiver QR or fake success added.

| Provider | Direct mobile launch | Current safe behavior | Real device verified? |
|---|---|---|---|
| GCash | Not implemented | Simulated preference/claim; cashier verifies separately | No |
| Maya | Not implemented | Simulated preference/claim; no undocumented scheme | No |
| GoTyme | Not implemented | Simulated preference; no invented app URI | No |
| MariBank | Not implemented | Simulated preference; no invented app URI | No |
| Cash | Not applicable | Counter workflow and explicit cashier confirmation | Browser demo only |

## Release

Follow AGENTS.md: merge checked source into main and publish that exact commit to the
existing public Site. This is a presentation release, not production merchant service.
