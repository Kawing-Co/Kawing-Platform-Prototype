# Neutral materials, purposeful color

Owner-authorized design amendment, 2026-11-08. Baseline: c38b05c, public Site18.
The company identity is a signature; it is no longer the surface treatment of the app.

## Color roles

- Paper: #f0eee9. Warm complementary tint instead of white.
- Raised surface: #f5f2ec. Equivalent to white with approximately 10% warm pigment
  (#9b7d41), exceeding the requested 5% tint floor.
- Grouped surface: #e7e6e1. Quiet stone panels establish hierarchy without brand blocks.
- Main ink: #1d2430. Navy-tinted charcoal instead of pure black or brand-blue text.
- Secondary ink: #60656c. Use size/weight/spacing before adding more color.
- Primary action: #14284b; hover #263e62. Reserved for committing/continuing actions.
- Status colors retain semantic meaning for warnings, availability and errors.

Use borders and material contrast to group information. Avoid brand-colored welcome
panels, decorative footers, chart bars or presentation banners. Selected navigation
uses neutral fill plus weight/outline, not a wall of navy. Illustrative map surfaces
and Lottie vectors follow neutral materials. Strong action contrast marks what to do.

Company SVG originals remain unchanged; neutral rendering/blending removes their white
artboard seams. The footer uses the compact mark on paper instead of a reversed mark
on a decorative navy strip. Merchant branding remains independent inside storefronts
and Studio previews; company chrome does not borrow the merchant palette. Legacy pure
white/black UI colors and nearly-white backgrounds were migrated to tinted materials.
Photographic pixels and original supplied identity assets are not recolored source files.

## Scope and preservation

Shared tokens, legacy CSS bridges, entry, shell, Studio, admin, map and feedback/payment
chrome now follow the neutral system. Original typography, responsive navigation,
viewport-fit introduction, finite motion and keyboard/reduced-motion behavior remain.
No operational data schema, payment transition, pricing, order lifecycle, identity,
loyalty rule or persistent merchant configuration is changed. No new dependency.

Fixed the compact Studio sidebar mark overflowing into the editor heading and adapted
the footer logo layout for the light surface. Natural text-zoom scrolling remains.

## Verification and release

Use the neutral-design contrast/action tests, company/merchant isolation checks,
viewport/motion/branding tests, connected ordering/offline regression checks and map
controls. Review actual phone/desktop screenshots across entry, Studio, admin, customer
map and organizer. Production build and complete diff review are required. Publish
exact local main to the existing public Site; GitHub pushing stays explicitly deferred.
Rollback is saved Site18. Do not claim a full accessibility audit or physical device test.

Verification completed: first focused run 21/24 passed; the legacy color expectation
was updated to the new neutral ink, and footer compact-mark layout was repaired to
restore tablet/desktop viewport fit. The follow-up 15-check set passed, including all
three prior failures and five booth-map checks. Thus 29 distinct relevant checks are
covered across the runs. Ordering, offline replay, saved merchant customization,
analytics/reset and six mobile workspaces were exercised. Production build passed.
Compiled 12-case phone/desktop review across six entry/workspace routes reported zero
page/console errors or horizontal overflow. Screenshots were actually inspected and
retained under docs/screenshots/neutral-design. Contrast smoke check passed >4.5:1 for
story text on its neutral surface; this is not a full accessibility audit. The existing
large-main-chunk advisory remains. No configured lint/typecheck script or full-suite
rerun is claimed. Whitespace and logical diff reviewed before commit.
