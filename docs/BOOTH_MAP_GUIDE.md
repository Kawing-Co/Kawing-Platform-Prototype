# Separate entry pages and interactive market map

Approved owner scope, 2026-11-07. Starting local main:
459f98dbcb33758225e429b0d31c97aac1fe65ed (Site 12).
GitHub publication remains explicitly deferred; the existing public Site is the
release target. This supplements the mobile demo guide and earlier specifications.

## Presentation sequence

1. `/` introduces the company and explains the proposal. Choose your experience
   opens `/?screen=experiences`; the introduction is no longer on that page.
2. Choose Standard Merchant or Pop-up Market. The next page is solely the business/
   view picker. Browser Back/Forward restores these stages; direct workspace and
   guest links remain supported. The logo returns to the introduction.
3. Choose Pop-up Market → Customer View. Select B02 for Matcha Mood and open its
   business profile to continue the existing ordering demonstration.
4. Try search/category filters. Nonmatching booths dim rather than disappear, keeping
   the arrangement understandable. Clear filters restores the full map.
5. Zoom, pan, and Fit map. Touch scrolling works normally until gestures are enabled;
   the map then supports pinch/drag. Fit restores normal page scrolling. Keyboard:
   focus map, +/−, arrows, Home. Each booth also supports Enter/Space. A paginated
   booth list is available as an alternative.
6. On phones, details open in a bottom sheet with a close button. Escape returns focus
   to the booth. Merchant and admin retain assignment, layout editing and event controls.

## Architecture and boundaries

`BoothMap.jsx` owns only camera/gesture state. Market owns selection and existing
persistent records. IDs, assignment references, event lifecycle and storage keys are
unchanged. `market-layout.js` extracts the existing fixture/validation and additionally
protects a cross-access corridor. Layout publication rejects corridor obstruction,
overlap, invalid dimensions and out-of-bounds placement. Existing saved layouts are
not silently replaced. Camera/filter changes do not modify transactions or layouts.

The original navy/white SVG schematic has two facing booth rows, a central walkway,
two entrance markers and cross access. It takes broad inspiration from the supplied
annotated Orchard reference. No Google imagery was copied. It is explicitly fictional,
not an official/surveyed venue plan, physical accessibility certification, navigation,
geolocation or a real reservation service. Some old saved custom layouts may need
adjustment before republishing under the added corridor rule.

Temporary merchant details remain unavailable to customers after event expiry.
Customer details show booth identity rather than technical layout dimensions.
Payments, ordering, feedback and analytics retain their existing local-only boundaries.

## Verification

New Playwright coverage checks separate URLs/history, pure camera bounds, both
walkways, spatial filtering, merchant entry, drag suppression, keyboard controls,
phone sheet focus/Escape and actual Chromium touch pinch with Fit/scroll restoration.
The complete regression suite remains the operational acceptance check.

Compiled preview reviewed at 360, 768 and 1440px across introduction, experience
selection, view picker and customer map: no horizontal overflow or browser console/
page errors. Desktop and phone screenshots were inspected. Evidence is saved in
`docs/screenshots/booth-map/`. Chromium emulation is not physical-device certification.
Build retains the existing advisory about the main JavaScript chunk exceeding 500kB.
No lint or typecheck script is configured. No backend or additional dependency added.

Release verification: full suite ran 105 checks (101 passed initially). The remaining
four were two outdated zoom selectors, a checkout interrupted by development hot
reload during this work, and a 43.99997px/44px floating-point target assertion.
Selectors were updated; the size assertion now rounds to device CSS pixels. Seven
focused checks, including all four failures, then passed on stable source. No remaining
test failure. The earlier 29-check focused run also verified the affected entry/workspace
flows. Final production build and diff whitespace checks passed.

Rollback is the prior saved Site 12; publication keeps the existing public audience.
GitHub remains behind local main until the owner's deferred push is requested.
