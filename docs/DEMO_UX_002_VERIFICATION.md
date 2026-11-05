> Current integration evidence: [BRANCH_RECONCILIATION.md](BRANCH_RECONCILIATION.md). The draft status and original-machine results below describe the initial PR delivery.

# KAWING-DEMO-UX-002 — verification record

- Branch: `feature/kawing-demo-ux-002`. Base: `main` `1005b06`.
- PR: https://github.com/invicta-ctrl/qrmenu/pull/1 (draft). **Not merged, not published.**
- Scope and authority: [DEMO_UX_002_AMENDMENT.md](DEMO_UX_002_AMENDMENT.md).
- Payment matrix: [PAYMENT_PROVIDERS.md](PAYMENT_PROVIDERS.md).

## Slice status

| Slice | Status | Commit |
| --- | --- | --- |
| UX-01 Scenario → View, session header, Customize, Reset | Done | `4a5e03b` |
| UX-02 Studio Review & publish checklist, Storefront wording | Done | `5239c76` |
| UX-03 Pop-up map, customer booth profile, merchant selection | Existing build verified by the existing tests. No new code | — |
| UX-04 Admin editor, temporary profiles, lifecycle | Existing build verified by the existing tests. No new code | — |
| UX-05 Provider-aware payment launch and fallback | Done | `1a150c4` |
| UX-06 Touch targets, responsive sweep, docs | Done | this commit |

## Commands and results (Windows 11, Node 26.3, Chromium 1243 via `CHROMIUM_PATH`)

- Baseline on `main` 1005b06: `npm run build` passed; `npx playwright test` gave **36 passed**.
- `npm run build`: passes on every slice.
- `npx playwright test`: **57 passed**. That is the 36 original tests plus 11 in
  `session.spec.js`, 7 in `payments.spec.js` and 3 in `studio.spec.js`.
- Responsive sweep (a scratch script, not in the repo) covered 9 surfaces (landing, two
  view pickers, six scenario×view spaces) at 360, 430, 768, 1024 and 1440 px with
  reduced motion. Results: no horizontal overflow, no console errors, and session
  buttons of at least 44 px at 1000 px and below and at least 40 px above.

## Acceptance checklist (brief §G)

1. **Scenario → View with no setup gate**: pass. See `session.spec` "Scenario → View entry…".
   The test asserts that no package or account text appears before a view is chosen.
2. **Both scenarios expose three views; switching preserves the session and hides
   irrelevant actions**: pass. See `session.spec` (Switch View menu, Customer View has no
   organizer controls) and `spaces.spec` (first test).
3. **Standard Merchant regressions**: pass. All 36 pre-existing tests still pass: menu,
   order, cashier verification, kitchen, loyalty, Studio, offline and guide.
4. **Pop-up Customer opens an occupied booth's profile and returns to the map**: pass,
   by the existing `interactive.spec` and `spaces.spec` tests. The behavior is unchanged,
   except that the booth's customer experience now opens immediately.
5. **Pop-up Merchant booth selection, rejection and propagation**: pass, by the existing
   `spaces.spec` "shared booth assignment propagates…" test.
6. **Admin temporary profile, geometry, validation and local publish**: pass, by the
   existing `spaces.spec` lifecycle and layout validation tests. *Not re-audited:*
   whether the admin preview is pixel-identical to the customer map.
7. **Event end disables new actions and keeps history and the ordinary profile**: pass, by
   the existing `spaces.spec` lifecycle and `interactive.spec` closed-event checkout tests.
8. **Studio categories, preview, tier locks, draft/revert, customer rendering, no
   Storefront wording**: pass. See `studio.spec` and `spaces.spec` "Studio drafts
   survive…". *Gap:* Studio keeps 10 focused tabs rather than merging into the brief's
   6 categories. The order and the final Review & publish step follow the brief.
9. **Pagination/filter, 360 px, motion-safe**: partial. The existing booth and merchant
   pagers and filters are in place, and the 360 px sweep is clean. New animations honor
   `prefers-reduced-motion`. *Not re-audited:* pagination of orders and products.
10. **Payments use only verified routes, show a fallback, never self-confirm**: pass in
    Chromium desktop and Pixel 7 emulation (`payments.spec`). *Unrun:* real iOS and
    Android devices with each app installed or uninstalled.
11. **Fictional labels; no false success toast**: new surfaces are labeled. *Not
    re-audited:* every pre-existing toast.
12. **Build, tests and complete diff reviewed**: pass. Each slice's staged diff was
    reviewed before its commit.

## Demo navigation map

```text
/                      Choose scenario: Standard Merchant | Pop-up Market
/?scenario=standard    Choose view → Merchant (Kawing Studio) | Customer (Salo page) | Admin (operator)
/?scenario=market      Choose view → Merchant (participation) | Customer (event map) | Admin (organizer desk)
Session header         Scenario · Tier · View   [Switch View] [Customize] [Change Scenario] [Reset]
```

**Standard Merchant walkthrough.**

1. Open Merchant View. Edit Brand, then check Review & publish and save.
2. Use Switch View to open Customer View and order with "GoTyme Bank · simulated".
3. Tap Continue with GoTyme Bank. The instructions appear, and no app opens.
4. Tap "I've sent the demo payment". The order shows "Customer claims payment sent".
5. In Merchant View, open Orders. The cashier reviews and confirms the payment.
6. In Admin View, Customize opens Packages. Choose Basic, and the header updates to
   Basic tier.

**Pop-up Market walkthrough.**

1. In Customer View, open an occupied booth to see its profile and menu, then return
   to the map.
2. In Merchant View, select an open booth and confirm it locally.
3. In Admin View, open Layout Editor, then validate and publish locally.
4. Still in Admin View, set the event to ended. Customer View blocks new event actions.
5. Reset Pop-up restores The Sunday Commons and leaves Salo untouched.

## Known gaps and decisions for Earl

- **Pop-up Merchant View first screen.** It opens the participation desk, as accepted in
  `INTERACTIVE_WORKSPACES_SPEC.md`. The brief suggests booth selection directly, which
  is one click away on the Map tab. Changing the first screen means reversing an
  accepted spec, so it is left for an explicit decision.
- **Studio categories.** Merging the 10 tabs into 6 categories is a larger information-
  architecture change. It is not done here.
- **Header tier in Pop-up Market** shows the demo merchant's (Salo's) platform package.
  Event participation packages stay inside the organizer and vendor desks.
- **Master spec** `KAWING_PLATFORM_DEMO_MASTER_SPEC.md` was unavailable and was not used.
- **Release.** Merging and Site publication need Earl's separate authorization. After
  that, `AGENTS.md` requires publishing the exact merged `main` to the existing Site.
