# Blackball brand cutouts — 2026-11-08

Owner requested removal of the white backgrounds and tighter logo/wordmark crops.
Transparent display PNGs were prepared with the image editing tool from the published
merchant source assets. Unedited originals are archived in
`docs/sources/blackball-original-branding` (the source provenance manifest describes
these originals). The cup and wordmark retain separate placements.

The wordmark's transparent artboard is trimmed by a responsive layout viewport;
the cup uses contain sizing. Removed multiply blending and cover sizing so the
surrounding neutral surface shows through without white rectangles or clipped art.
Existing asset paths are preserved, including in saved browser configurations.
No merchant record migration, menu, pricing, payment or ordering changes.

Verification: mobile/desktop visual inspection, alpha-channel/background checks,
existing Blackball navigation/checkout tests and production build. Publish to the
existing public Site; GitHub push remains deferred.

Result: both PNGs have true RGBA transparency (alpha range 0–255; transparent corners).
Mobile 390px and desktop 1440px screenshots inspected: no white rectangle, no clipped
wordmark, no horizontal overflow. Four Blackball browser/model regression tests pass.
