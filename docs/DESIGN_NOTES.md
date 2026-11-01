# Kawing visual and demo direction

## Character
Kawing should feel like a calm, well-run neighborhood restaurant translated into software.
Use warm ivory backgrounds (#f7f7f2), forest green (#204b3b), sage (#e7eee5),
ink (#24372d), and muted warm gray text. Reserve brighter citrus or amber for
pending and offline states. Cards use thin borders, generous padding and quiet shadows.
A restrained serif headline can give Salo its hospitality character; use a clean sans
for the operating workspace. Typography and spacing should do most of the work.

## Desktop composition
Use a persistent narrow sidebar with Kawing logo, a clearly selected navigation item,
a restaurant identity at the bottom, and space between primary and utility navigation.
The top bar identifies the current role and lets the presenter switch between owner,
customer and staff. Keep the demo marker and connection simulation visible.

The overview begins with an approachable greeting and a short operating summary.
A pale sage invitation banner introduces the customer journey with an actionable menu
preview button. Follow with four compact KPI cards, one generous sales chart and
an order activity panel. Use a single consistent green for chart marks. Thin grid
lines and useful axis labels support credibility without adding noise.

## Connected interactions
The cart should retain quantities while categories change. The checkout explicitly
labels payment as simulated before confirmation. A successful order gives a clear
number and next step: view it in the kitchen. Kitchen cards show the same number,
items and total. Advancing a card produces an immediate visual status change.
Owner activity and order totals then reflect that same order.

An offline simulation should describe the actual scope: this browser queues demo
orders locally. Show the pending count, and on reconnect show a single sync result.
Do not imply real terminal connectivity or production offline guarantees.

## Small screens and motion
On mobile collapse workspace navigation into a concise horizontal or drawer pattern.
Customer ordering should fill the viewport naturally, with a sticky cart action and
comfortable touch targets. Kitchen becomes a vertical stack. Charts may simplify
axis labels but should retain an intelligible trend.
Use short opacity and transform transitions for cards, role changes and confirmations.
Respect reduced motion. Avoid large looping animation or animated numeric counters
that make the metrics harder to inspect.

## Founder demonstration, approximately four minutes
1. Open overview: Kawing connects the restaurant's daily work in one place.
2. Switch to customer, choose a Filipino favorite, and complete a simulated payment.
3. Switch to kitchen, find that order and advance preparation to served.
4. Return to owner: activity and metrics reflect the shared transaction.
5. Change the restaurant name or accent, then preview its customer storefront.
6. Simulate offline ordering, then reconnect and demonstrate a single queued sync.
7. Show ecosystem: start with 3–5 pilot establishments, prove repeat usage and
   operational value, then connect more local merchants. Label all growth figures
   as illustrative assumptions, never actual traction.

The presenter should be able to follow this journey through visible buttons rather
than needing hidden routes or a memorized script.

## Storefront upgrade

The reference informed the value of quick guest services; Kawing's composition and
identity remain independent. The primary order action stays prominent, with service
modules secondary. Quick Actions uses compact identity/service rows, Visual Storefront
adds cover photography and featured dishes, and Minimal Utility removes large imagery
for concise shortcuts. Studio reuses the hub renderer rather than a disconnected mock.

Customer content has larger text, 44px primary actions, context/status strips, inline
module pages, visible keyboard focus and a bottom customer navigation. Cart actions,
module entrances, loyalty stamps and confirmations use short transform/opacity effects;
reduced motion disables transitions. Merchant colors receive computed foregrounds.
No looping animation, review incentives, checkout ads or forced account enrollment.
