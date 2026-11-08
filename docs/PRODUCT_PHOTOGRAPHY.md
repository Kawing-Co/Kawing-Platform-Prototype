# Product photo correction — 2026-11-08

The breakfast product cards previously reused the complete merchant breakfast spread.
Owner-authorized scope: replace those with dish-specific internet references, prevent
unframed category collages in individual product cards, and preserve browser records.

Eight breakfast entries now use seven licensed Wikimedia dish references. Bangus
preparations share an illustrative bangsilog reference; this does not establish exact
merchant plating. Photos are visibly labeled illustrative. Attribution, source pages
and license links are available through the menu's Photo credits & licenses link and
in docs/sources/blackball-dish-photos.json. Downloaded preview bytes remain unchanged.

Other published merchant category spreads have explicit normalized viewports that
isolate the relevant serving, shared by the menu and modifier sheet. These are browser
layout crops, not modified image files. Hero/gallery showcase photographs may still
show multiple products because they represent the business rather than a single SKU.
Ribeye references no longer point to tea; lechon/karaage mains use their corresponding
new references. Other broad illustrative category photos remain demo approximations;
merchant-approved photography is still needed for exact variations and preparations.

A visual revision migrates only recognized old demo paths, preserving owner custom
paths, menu IDs/prices/options, availability, orders and loyalty. No seed reset.

Checks: explicit collage framing and eight breakfast paths, URL regression, mobile
rendering and persisted migration, Blackball checkout, production build and screenshot
inspection. GitHub push remains deferred; publish exact local main to the existing Site.

Verification result: 14 targeted browser/model checks passed (Blackball, shared
storefront and product-photography suites); mobile breakfast and pizza cards and
all category viewports were visually inspected. Build passed. Existing prices,
checkout and cross-merchant separation remain verified. These are illustrative
references, not exact merchant plating or confirmed portion sizes.
