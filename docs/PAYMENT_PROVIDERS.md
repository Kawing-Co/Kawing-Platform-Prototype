# Payment provider matrix — KAWING-DEMO-UX-002 · UX-05

Verified 2026-11-05 (Asia/Manila). Re-verify before any live integration.

The demo has **no merchant credentials, no provider contract and no hosted-checkout
session**, so no order-specific provider URL exists. Every `Continue with <provider>`
therefore opens truthful in-page instructions. The demo builds no custom URI scheme,
shows no QR code or receiver number, and collects no money.

| Provider | Mobile app direct? | Supported URL / hosted fallback | Desktop behavior | Verified in test? |
| --- | --- | --- | --- | --- |
| GCash | Only inside an approved GCash checkout session ("Open in GCash"); API access is partner-only | Order-specific checkout URL from an approved provider integration (none connected) → demo shows QR Ph scan instructions | Same instructions; no QR is shown | Yes: fallback, no navigation, no popup, status stays `selected` (desktop and Pixel 7 emulation) |
| Maya (formerly PayMaya) | **No.** Maya documents the Pay with Maya app deep link as "temporarily disabled" | Maya-hosted payment page from a Create Single Payment `redirectUrl` (none connected) → demo shows instructions | A real hosted page offers login or QR Ph; the demo shows instructions | Yes: fallback copy and status checked |
| GoTyme Bank | No verified merchant launch route | QR Ph scan inside the customer's own app → demo shows instructions | Same instructions | Yes: fallback, repeat taps, Back, claim and reload |
| MariBank | No verified merchant launch route | QR Ph scan inside the customer's own app → demo shows instructions | Same instructions | Covered by the pure route test only |
| Cash | Not applicable | Pay at counter; staff confirm in the cashier view | Same | Yes: no Continue button, status stays `selected` |

## Payment-state invariant

`selected → claimed` (the customer says they paid) `→ reviewing → confirmed` (cashier).
Opening the guide, returning, repeating a tap, reloading or claiming never reaches
`confirmed`. Only the existing cashier review and confirm actions do. Cash timing
follows the existing preparation policy (`approve-counter`). It is unchanged.

## How a live route would be enabled (not done here)

`src/payments.js` releases a `hosted` route only when all of the following hold. An
approved checkout session for **the same provider and the same order** is supplied. Its
URL is `https:`. Its host appears in that provider's `verifiedHosts`. Each host list is
empty today. Adding a host requires a separate, authorized provider integration with
real merchant credentials and callback/reconciliation. That is a production decision
outside this demo, and a client redirect would still never mark an order paid.

## Sources

- Maya: [One-time payment using Maya Wallet](https://developers.maya.ph/reference/one-time-payment-using-maya-wallet).
  Page metadata `updatedAt` 2026-10-26. It states the app deep link is temporarily
  disabled and that the hosted page is used.
- GCash: [API portal FAQs](https://gcash.com/business/api-portal-faqs) says the portal
  is "only available for selected partner organizations". The
  [How to pay online](https://help.gcash.com/hc/en-us/articles/900006144666-How-to-pay-online-with-GCash)
  article returned HTTP 403 to automated fetch and was not re-read.
- GoTyme Bank: the [QR Ph instructions](https://www.gotyme.com.ph/help/help-center-topics/scan-qr/pay-using-qrph)
  URL returned HTTP 404 on 2026-11-05. No public merchant launch route was found. The
  instructions use generic QR Ph wording, not a specific in-app label.
- MariBank: [Help article 10064](https://www.maribank.ph/help-center/article/10064)
  contains no merchant payment link or app deep link.
