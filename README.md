# qrmenu
Qr Menu System

## Kawing interactive prototype

A presentation-only, browser-local restaurant commerce demo. See the
[demo guide](docs/DEMO_GUIDE.md) for the founder walkthrough and scope,
[specification](docs/PROTOTYPE_SPEC.md) for acceptance criteria, and
[verification record](docs/VERIFICATION.md) for checks and limitations.

```sh
npm install
npm run dev
```

Open http://localhost:5173. Build with `npm run build`; run browser checks with
`npm test` (Chromium at `/usr/bin/chromium` in the Codex environment).

The prototype includes a merchant dashboard, customer menu and simulated checkout,
staff kitchen queue, menu availability, storefront branding, illustrative analytics,
CSV order export, guided tour, and proposed ecosystem roadmap. It uses browser
storage only; payments and offline operation are simulations. No deployment.
