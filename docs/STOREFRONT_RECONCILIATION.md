# Shared merchant storefront presentation — 2026-11-08

Owner-authorized amendment: reconcile Matcha Mood, the usual. and Blackball Cafe into one neutral hospitality interface; fix clipped/missing imagery. No transaction, pricing, payment or identity changes.

All storefront layouts now use the same warm neutral canvas, ink, heading hierarchy and separate image/text composition. Merchant logos, copy and action colors remain distinct. Quick Actions, Visual Storefront and Minimal Utility remain selectable; module configuration and saved content remain intact. The neutral canvas intentionally supersedes older dark stage presentation. Brand color is reserved for identity and useful actions.

The image slot has a real layout column/row and a full-height cover image. The old split-template 240px cap and dark photographic overlay no longer truncate or obscure it. Mobile places the photo above the content and avoids horizontal overflow. Promotions and ordering use the same neutral treatment.

Blackball's category SVG placeholders are replaced with licensed illustrative reference photography. Original downloaded photo bytes are retained. Branding and “Illustrative photo” are separate UI overlays, including the modifier sheet. These images represent categories, not verified photographs of individual Blackball dishes. Published merchant photos and menu prices remain unchanged. Existing browser records receive an idempotent imagery-only migration for retired placeholder paths; owner custom imagery, prices, availability and transaction records are preserved. No seed revision/reset.

Provenance: public/images/blackball/reference/CREDITS.txt. No new dependencies, tracking or backend.

Verification: relevant browser regression suites, explicit mobile/desktop image bounds and loading checks, all menu/variant URLs, stored-data migration, production build and screenshot inspection. GitHub push remains deferred by owner instruction; publication uses local main's exact committed source.

Verification result: 37 distinct targeted checks passed across Blackball, usual, commerce,
neutral-design and the eight new shared-storefront checks. Two initial test runners
collided over Playwright's artifact directory; affected checks were rerun sequentially
and passed. The usual entry assertion was updated to the previously approved Start here
behavior. Screenshots at 390px and 1440px were captured and visually inspected; the
Blackball reference-photo list/modifier sheet also loaded without browser errors.
