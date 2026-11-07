# Company theme isolation — 2026-11-07

Baseline: a843fdb8ce65eaaa5f8e034da016d9b07ba73c1a, Site version 11.
Owner reported a green/navy clash. GitHub push remains explicitly deferred.

Root causes:
- Workspace .app bound --brand to the selected merchant's accent.
- Legacy platform styles used literal café greens despite the newer navy tokens.
- storefront.css contains both customer styles and Studio management styles, so the
  management controls still carried green surfaces, text and borders.

Correction: bind the workspace accent to --k-ink; replace green literals in company
styles with the navy/white palette tokens (preserving alpha on overlays/shadows).
Studio/engagement rules in the shared stylesheet are migrated independently. Customer
.sf/.cx/.mm/.us selectors, merchant theme records, preset color choices and inline
merchant product configuration remain independent. No data migration or order change.
Photos and merchant color swatches are content, not company-theme decoration.

Verification:
- Production build passed.
- Initial 37-case commerce/interactive/merchant/logo run: 36 passed; one case hit a
  Playwright trace-file collision from overlapping runners. The affected craft-booth
  case and two new theme regressions were re-run sequentially: all three passed.
- After the final Studio field-color pass: five Studio/theme regressions passed.
- New tests show an owner changing merchant accent to terracotta without changing
  company --brand; Studio controls remain blue-neutral; storefront primary stays
  independent from company navy.
- Compiled Chromium review at 360/390/768/1440px across six surfaces: all 24 cases passed with no errors/overflow; updated screenshots inspected. No physical iOS/Android or full screen-reader audit is claimed.
- Review complete diff and publish the exact Site-source commit. Keep the public
  audience and GitHub push deferral; rollback is Site version 11.
