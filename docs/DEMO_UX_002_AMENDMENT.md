> Reconciliation update, 2026-11-05: the founder subsequently requested branch and PR reconciliation. See [BRANCH_RECONCILIATION.md](BRANCH_RECONCILIATION.md) for current integration/release authority. The original draft-delivery scope below remains a historical record.

# Demo UX amendment KAWING-DEMO-UX-002 — 2026-11-05, Asia/Manila

## Authority and baseline

- Source: founder implementation brief `KAWING_STUDIO_DEMO_OVERHAUL_IMPLEMENTATION_PROMPT.md`
  (Prompt ID KAWING-DEMO-UX-002). Earl wrote "authorized this prompt" on 2026-11-05.
- Baseline: `invicta-ctrl/qrmenu` `main` at `1005b0625eea05a19351ff64650a6668fc433dba`.
  The fresh clone was clean and matched `origin/main`. The only other remote branch is
  `feature/kawing-interactive-prototype`, which is historical. No `.codex/CURRENT.md`,
  `CLAUDE.md` or writer lock exists. Root `AGENTS.md` applies.
- Work branch: `feature/kawing-demo-ux-002`, delivered as a pull request.
- Baseline checks: `npm run build` passes, and Playwright passes 36 of 36 tests.
- `KAWING_PLATFORM_DEMO_MASTER_SPEC.md` (v1.1.0, §19) is **not in this repository** and was
  not found on the executing machine. This amendment relies on the brief and the accepted
  repository specs only. It makes no claim about the master spec's content.
- The separate `invicta-ctrl/Kawing-Platform` repository is out of scope and untouched.

## Reconciled conflicts

1. **Release step.** `AGENTS.md` requires the agent to merge, then publish `main` to the
   existing ChatGPT Site. For this brief the executing session holds **no merge or publish
   authorization**: Earl must authorize those actions separately. The work therefore stops
   at a reviewed pull request. The Site, its ID in `.openai/hosting.json` and its audience
   are unchanged. After an authorized merge, the standing `AGENTS.md` release step applies.
2. **Customer entry.** `INTERACTIVE_WORKSPACES_SPEC.md` made Customer View choose a device
   and tier before the preview. The newer brief requires Customer View to open the
   finished experience immediately, with tier controls kept off the customer path.
   Superseded: the preview now starts at once with the merchant's saved package, and the
   device and package-preview choices stay available as optional controls.
3. **Payment launching.** `SPACES_STUDIO_AMENDMENT.md` excluded provider app launching. This
   brief authorizes provider-aware launching **only through verified, provider-supported
   routes**. The demo has no merchant credentials, provider contract or hosted-checkout
   session, so no order-specific provider URL exists. The truthful result is fallback
   instructions for every provider (UX-05). No scheme is invented and no order is promoted.
4. **Pop-up Merchant View first screen.** `INTERACTIVE_WORKSPACES_SPEC.md` opened the
   participation desk first. On 2026-11-05 Earl directed that it open the booth map
   first. Superseded: Merchant View now lands on **Map**. **My participation** stays
   one tab away and is still where Customize leads.
5. **Terminology.** "Merchant Setup" and "Booth Setup" become the public scenario names
   **Standard Merchant** and **Pop-up Market**. Storage keys and internal identifiers
   (`scenario=standard|market`, `workspace=merchant|customer|admin`) are unchanged.

## Accepted scope (slices)

- **UX-01** Scenario → View entry. The view step is addressable as `?scenario=…`, so
  Back works in both the page and the browser. The views are exactly Merchant View,
  Customer View and Admin View. The session header shows `Scenario · Tier · Current
  View` with Switch View, Customize, Change Scenario and Reset. Small screens get a
  compact session drawer. Customize opens the tier/setup panel of the right workspace.
  Reset is deterministic and scenario-scoped, with confirmation. It never discards a
  Studio draft unless the visitor asks.
- **UX-02** Kawing Studio naming and remnant cleanup, tier gating, shared renderer checks.
- **UX-03/UX-04** Pop-up map, booth selection, admin editor, temporary profiles,
  lifecycle. These largely exist already. This amendment verifies them and closes gaps.
- **UX-05** GCash, Maya, GoTyme Bank, MariBank and Cash choices with verified-route
  fallback and a payment-state invariant.
- **UX-06** Accessibility, pagination, regression, documentation and changelog.

## Exclusions

No merge to `main`, Site publication, deployment, real payment, provider SDK, custom URI
scheme, real receiver number or QR, account creation, backend, 3D map, new package or
font. No change to `Kawing-Platform`. No branch deletion.

## Invariants

- No route, button, redirect, return or modal close marks an order `PAID`. Only the
  existing cashier verification transition does, and the current cash timing policy
  is unchanged.
- One canonical record per merchant, event and booth. Tier is stored only as
  `presentationTier` in the Salo business record.
- Existing localStorage keys are unchanged. Reset removes only the keys of the chosen
  scenario.

## Verification

`npm run build`; Playwright (existing 36 tests plus new scenario/session/payment tests);
desktop 1440 px and mobile 360 px screenshots; complete diff review before the PR.
