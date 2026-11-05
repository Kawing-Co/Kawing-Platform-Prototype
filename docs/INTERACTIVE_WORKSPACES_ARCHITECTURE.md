# Interactive workspace architecture

This amendment extends the prior [commerce architecture](STOREFRONT_ARCHITECTURE.md)
and [space model](SPACES_STUDIO_GUIDE.md), preserving their records and entry routes.

- `Viewport.jsx`: same-origin real-size iframe canvas, fit scaling and Customer Lab.
  Studio sends normalized draft data; the receiver renders the shared hub without
  mutations/events. Messages validate origin, exact sender window and approved edit
  IDs. Native section buttons send selected IDs back to the parent inspector.
- `experience.js`: standard devices, nonmutating tier projection, business/receipt
  storage keys, isolated sample merchant catalogs and fresh event-admission checks.
- `operations.js`: additive event-record defaults, logistics request/verification
  contracts, derived readiness, issue creation and note-required resolution.
- `VendorDesk.jsx`: merchant participation and organizer dossiers share event records;
  the order desk applies the existing commerce transition functions.
- `AdminSpace.jsx`: standard merchant's persistent setup/support workspace; package
  and presentation settings stay distinct from payment and preparation policies.
- `interactive.css`: compact desktop Studio and operator layouts, independent form
  overflow, mobile editor/preview switching, focus and reduced-motion behavior.

## Data boundaries

Salo retains `kawing-demo-v1`, `kawing-last-order` and existing cart keys. Other event
merchants use `kawing-merchant-v2:<id>`, `kawing-last-order:<id>` and context/merchant
cart keys. Event data remains `kawing-market-v1`; normalization adds ops and issues
without recreating existing booths. Temporary profile deletion/lifecycle does not
rewrite the ordinary merchant's identity or order store. An unavailable business
cannot be opened through a stale deep link. The current event assignment/status is
checked again at submission, rather than trusting a previously opened map card.

Each order snapshots merchant ID, event/booth context, preparation policy, eligible
products and prices. Model operations and loyalty use the selected merchant ID;
foreign-merchant transitions remain rejected. Existing Salo ledger IDs are retained.
New isolated vendors have no sample Salo orders, accounts, feedback or loyalty credit.
A storage listener refreshes separate same-origin local views when another document
updates that merchant's records. This is not a concurrent-write transaction protocol.

Studio drafts retain the existing key and save/restore behavior. Customer tier
projection clones presentation configuration; it never writes a subscription change
or changes product/payment records. Event package allocation belongs to the event
profile; Salo's current platform package is read from its canonical business record.
Requests, fulfillment and tent installation remain separate facts. Readiness derives
from those facts and blocking issues, with no independent override toggle.

No new dependency, backend, authentication, payment SDK, analytics network, external
support message, production safety certification or infrastructure was added.
