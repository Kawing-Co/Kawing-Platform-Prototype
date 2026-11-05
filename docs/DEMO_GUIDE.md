# Kawing founder demonstration

Kawing connects the customer, restaurant team, and owner through one shared order.
This is a browser-local concept prototype for a business proposal, using fictional
restaurant Salo and illustrative operating data. No real payments are processed.

## Run locally

From the repository root:

```sh
npm install
npm run dev
```

Open the local URL printed by Vite. For a production bundle, run `npm run build`;
`npm run preview` serves that bundle locally. No deployment is required.

## Five-minute presentation

1. **Start with the guided demo.** The new Start here page explains all three roles. Tap Start guided demo to follow the connected story, or open Overview to explore freely. Explain the daily sales, active orders,
   and business snapshot. Point out that baseline figures are illustrative.
2. **Become the customer.** Open the customer menu, explore a category or search,
   and add a dish. Adjust its quantity to show that the total changes. Choose a
   simulated payment option and place an order for table 05.
3. **Follow the same order.** Open the staff kitchen. Find the submitted order and
   advance it through preparation to served. Return to the customer view to show
   the updated status, then to Overview to show the connected business activity.
4. **Make it the owner's own.** Open customization, change the restaurant name
   and accent, and adjust a dish's availability. Revisit the customer menu to show
   that the storefront follows the owner's settings. Reload to show persistence.
5. **Demonstrate a connection interruption.** Enable the offline simulation and
   submit another customer order. Show its queued state. Reconnect and show that
   the order enters the shared workflow once. Explain that this models a future
   offline experience; it is not a production networking guarantee.
6. **Show the business opportunity.** Change the reporting period, then visit the
   ecosystem/growth view. Frame three to five pilot establishments as a proposed
   starting point and the wider local-commerce network as a future hypothesis.

Use demo reset and its confirmation to prepare a fresh presentation. Browser
storage is specific to the browser and origin; separate devices do not share data.

## Scope boundaries

- Payment, connectivity, and operating data are simulations.
- Orders and customization are stored in this browser, with no backend or accounts.
- No sensitive customer information, real payment credentials, or live commerce.
- No production deployment or infrastructure changes are part of this prototype.

## Verification

Automated browser checks: `npm test`. Production check: `npm run build`.
See [VERIFICATION.md](VERIFICATION.md) for the six passing browser checks, screenshots, and observed limits.

## Hosted presentation

On 2026-11-01 the owner authorized ChatGPT Sites publication for phone access,
superseding the original local-only constraint. GitHub remains the source history:
`https://github.com/invicta-ctrl/qrmenu/tree/feature/kawing-interactive-prototype`.
The tracked `.openai/hosting.json` identifies the Site and static build directory.
Build with `npm run build`; publish the exact committed build through Sites.
The owner has authorized public access. Anyone with the Site URL can open it without signing in.
Browser-local demo data remains independent on each device and origin.


## Self-guided partner experience

Start at the Site root, tap **Start guided demo**, and follow the eight action cards.
Continue unlocks after the relevant action; Skip step allows free exploration.
Pause keeps progress. Demo home always returns to the role chooser and complete
feature map. Resume continues the saved step. Restart resets walkthrough progress
without clearing existing demo data. Use confirmed Reset demo for a fresh restaurant.
On a phone, a Next action appears at the bottom when the current step is complete.

The walkthrough follows a new order through customer checkout, staff service,
owner totals, branding, menu availability, analytics, offline queue/reconnect, and
the proposed ecosystem. The last screen offers prompts for the founder discussion.
Links between views explain how changes connect. Hash links support reload and
browser Back/Forward, so you can bookmark individual features.

## Customer-engagement source upgrade

The local prototype now includes the merchant hub, Owner Studio, payment-verification
states and engagement tools. See [UPGRADE_PARTNER_SCRIPT.md](UPGRADE_PARTNER_SCRIPT.md)
for the expanded demonstration and [STOREFRONT_ARCHITECTURE.md](STOREFRONT_ARCHITECTURE.md)
for contracts and limits. This task explicitly does **not** authorize publication;
the existing public Site remains on its prior version until a separate release request.

## Current release policy — 2026-11-02

The owner now authorizes publishing the existing public Site to match GitHub `main`
after changes are completed and merged. This supersedes the previous source-only
restriction. See `AGENTS.md` for the standing workflow. A verified Sites deployment
is required before calling a main-branch update live; no unattended CI sync is claimed.

## Current navigation — 2026-11-05

The landing page now starts with **Standard Merchant** or **Pop-up Market**, followed by
Merchant, Customer or Admin View (renamed from Merchant Setup / Booth Setup by
[KAWING-DEMO-UX-002](DEMO_UX_002_AMENDMENT.md)). Creator navigation is **Customization**, opening **Kawing
Studio**. See [SPACES_STUDIO_GUIDE.md](SPACES_STUDIO_GUIDE.md) for both walkthroughs,
state boundaries and the payment-provider matrix, and
[SPACES_STUDIO_VERIFICATION.md](SPACES_STUDIO_VERIFICATION.md) for tests/screenshots.
