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

### Customer engagement upgrade (source only)

Owner Studio now configures three customer hub layouts, branding, approved modules,
promotions, loyalty and guest links. Customer ordering connects to explicit cashier
verification, fulfillment and a loyalty ledger. Feedback, review/social demonstrations,
Wi-Fi guidance, a small memory puzzle and local engagement reporting are included.
See the [partner script](docs/UPGRADE_PARTNER_SCRIPT.md),
[architecture](docs/STOREFRONT_ARCHITECTURE.md), and
[upgrade verification](docs/STOREFRONT_VERIFICATION.md).
The public Site remains on the earlier version until separately authorized for release.

Current release policy (2026-11-02): keep the existing public ChatGPT Site aligned
with GitHub `main` as part of the agent workflow. This supersedes earlier source-only
release notes. See [AGENTS.md](AGENTS.md).
