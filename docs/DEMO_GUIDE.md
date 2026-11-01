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

1. **Start with the owner.** Open Overview. Explain the daily sales, active orders,
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
