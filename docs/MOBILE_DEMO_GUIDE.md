# Kawing mobile demonstration

The landing page introduces Kawing & Co.'s proposed connected-commerce experience:
one guest visit connects a branded menu, ordering, cashier verification, fulfillment,
customer retention and merchant operations. The proposal remains a three-month pilot
with 3–5 establishments. All transactions, accounts and operating figures are fictional.

## Partner walkthrough

1. Read the brief introduction; Choose your experience opens a separate experience-selection page.
2. Choose Standard Merchant for one business, or Pop-up Market for event operations.
3. The introduction and experience cards never share a page. Standard Merchant lets you select
   Matcha Mood or the usual.; then choose Merchant, Customer or Admin View.
4. Customer View: browse, customize a drink, order and follow its progress.
5. Switch View: use Merchant View for brand customization, cashier verification,
   preparation, completion and loyalty. Admin View demonstrates packages/support.
6. In Pop-up Market, explore booths as a customer or handle participation, logistics,
   setup and support as a merchant/admin. Existing local shared-state behavior remains.
7. More contains Change Scenario and Reset on compact screens. Reset keeps the
   existing confirmation and scenario/data boundaries. Studio draft warnings remain.

Navigation is through visible actions and menus. Command search and Ctrl/Cmd K are
removed. Field-specific single-use undo, optional 3D story/film, browser Back/Forward,
deep links, guest ordering and Studio previews remain available.

## Mobile design

- Primary actions have comfortable touch targets and safe-area-aware placement.
- The view picker uses concise business selectors and three compact role cards.
- No repeating photo collage or presentation hero after selecting an experience.
- Session actions use a second row on phones/tablets; long context text yields to the
  current view. The session header scrolls away on phones to leave room for the app.
- Merchant identities are independent of the navy/white company presentation.
- Reduced motion keeps the same content and navigation without animated transitions.

Company branding uses the original supplied SVG stacked logo, symbol and wordmark
variants. Logo links react to hover/focus/press; primary buttons retain tactile
feedback, with no ambient logo loop. Reduced motion removes movement.

## Verification

Run `npm run build` and `npm test`. The mobile-entry tests exercise the landing CTA,
focus, compact selection, both businesses, browser history, absence of command search,
and all six views on a 360px screen. Existing tests retain transactional and draft safety.
The complete source, release checks and current release state are tracked through
.codex/CURRENT.md and the completion report. Browser QA uses Chromium, not a claim of
physical iOS/Android or a full accessibility audit.
