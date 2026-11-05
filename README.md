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
storage only; payments and offline operation are simulations. The public presentation uses ChatGPT Sites.

### Customer engagement upgrade

Owner Studio now configures three customer hub layouts, branding, approved modules,
promotions, loyalty and guest links. Customer ordering connects to explicit cashier
verification, fulfillment and a loyalty ledger. Feedback, review/social demonstrations,
Wi-Fi guidance, a small memory puzzle and local engagement reporting are included.
See the [partner script](docs/UPGRADE_PARTNER_SCRIPT.md),
[architecture](docs/STOREFRONT_ARCHITECTURE.md), and
[upgrade verification](docs/STOREFRONT_VERIFICATION.md).
The public Site is released from checked GitHub main under the repository policy.

Current release policy (2026-11-02): keep the existing public ChatGPT Site aligned
with GitHub `main` as part of the agent workflow. This supersedes earlier source-only
release notes. See [AGENTS.md](AGENTS.md).


### Interactive spaces and Studio

Choose **Standard Merchant** or **Pop-up Market**, then **Merchant View**, **Customer
View** or **Admin View**. The session header shows `Scenario · Tier · View` with Switch
View, Customize, Change Scenario and Reset. Studio supports actual device-size previews
and direct section editing. Customer View opens the finished experience at once, with
optional device/package previews; the event workspace connects vendor readiness, logistics, issues
and booth-specific ordering. See the [current partner guide](docs/INTERACTIVE_WORKSPACES_GUIDE.md),
[architecture notes](docs/INTERACTIVE_WORKSPACES_ARCHITECTURE.md), and
[verification](docs/INTERACTIVE_WORKSPACES_VERIFICATION.md). The current amendment is
[KAWING-DEMO-UX-002](docs/DEMO_UX_002_AMENDMENT.md).

Local browser checks: `npm test` uses `/usr/bin/chromium` when present; elsewhere set
`CHROMIUM_PATH` to a Chromium executable or install Playwright's managed browser.

[Open the public Kawing demo](https://kawing-connected-kitchen.adrianoearl04.chatgpt.site).
