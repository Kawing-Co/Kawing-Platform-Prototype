# Active slice — LottieFiles microinteractions

Authority: explicit owner request 2026-11-07; AGENTS.md; Context Vault
TOKEN-OPT-001-A8 read live. Clean /workspace/qrmenu main at
76001b320fb1267491a84b78dadf85750921ebd3; live public Site 13. One worktree,
no unknown changes or concurrent writer. GitHub push remains explicitly deferred.

Approved scope: use the supplied LottieFiles microinteraction collection for actual
locally hosted animations; immediate landing entrance/brand motion, responsive CTA
and experience-card feedback, interactive connected-visit story. Keep original SVG
identity and navy/white palette. Public animation files require no account access;
no credentials or sign-in needed. Preserve licenses and creator/source provenance.

Constraints: no operational/data/checkout changes, no backend, no redesign of merchant
themes, no merge or GitHub push. Preserve separate entry pages and map/workspace flows.
Use a small lazy SVG player; offscreen/hidden-page pause, reduced-motion static fallback,
visible persistent pause/play control, cleanup on unmount; no motion-blocked actions.
Rollback is Site 13 and parent commit. New dependency limited to Lottie SVG runtime.

Acceptance: landing visibly animates on load; clickable narrative changes detail;
Lottie renders from local data with no third-party runtime requests; hover/focus replay;
pause/reduced motion stop autoplay including hidden/offscreen; fallback leaves usable
content and navigation; phone360+, keyboard and existing entry/branding/map checks pass.
Verify relevant Playwright coverage, production build, actual mobile/desktop screenshots,
console/overflow and diff; commit local main and publish exact source to existing Site.

Completed: actual local Lottie vectors on landing/entry actions, immediate CSS entrance
and original-logo orbit, interactive/auto-advancing story, persistent pause and reduced
motion, offscreen/hidden-page handling, static failure fallback, visible credits/licenses.
Implementation: MotionExperience.jsx, motion JSON data and scoped lottie-motion.css;
Spaces only changes the introduction and decorative action icons. Added light SVG
lottie-web dependency. Source/provenance/design notes: docs/LOTTIE_MOTION.md.

Verification: 29 targeted Playwright checks passed (new motion + existing branding,
mobile entry, map and session). Build passed. Compiled nine-case responsive sweep at
360/768/1440 passed with zero overflow/console/page errors. Desktop/phone screenshots
inspected and retained. Complete diff/whitespace check passed. Full operational suite
not rerun for this bounded presentation slice; previous baseline evidence retained.
Existing main-bundle advisory remains. Next: exact-source Site update, preserve public
audience; record returned deployment/version in .git/kawing-brand-release.json. GitHub
push remains deferred; no credentials were used for LottieFiles.

External checkpoint: Site 14 published successfully from c2f3373; public motion,
pause/resume and interactive entry passed at360/1440 with no errors/overflow. Exact
JS/CSS/runtime and license bytes verified. The host returned an empty document for
nested credits.html; replace the owned credits page with a plain-text credits artifact,
which uses the verified static .txt delivery path. Publish this bounded link repair;
do not repeat Site14 deployment. No animation or operational source behavior changes.
Credits repair verified locally: targeted fallback/credits check 1 passed. Updated
source retains the 29-test motion/integration evidence; build/package next exact commit
and verify nonempty public text attribution after publication.

## Active amendment — remove decorative logo orbit (2026-11-08)
Owner explicitly requests removal of the rotating circle around Kawing & Co.
Clean main baseline e634dd0; public Site15. Remove orbit markup, ring/dot styles and
unused keyframes; preserve original SVG, logo entrance and other Lottie interactions.
Update existing motion assertions; run motion/branding regressions and build, review
diff, then commit local main and publish exact source to existing public Site. GitHub
push remains deferred. Rollback: Site15. No operational or data changes.
Verification: all nine motion/branding tests passed; production build and complete diff
review passed. No operational source changed. Existing bundle-size advisory remains.
Publish exact local main to the existing Sites source remote; record actual deployment
and public verification in .git/kawing-brand-release.json. GitHub push remains deferred.

2026-11-08 owner amendment: remove the pictured optional product-story/film/3D
section from the landing page. Remove only its entry render/import; preserve the
primary introduction, connected-visit card, experience selection and operational views.
Publish to existing public Site; GitHub push remains deferred. Prior Site16 is rollback.

2026-11-08 owner amendment: fit the introduction within normal desktop/phone viewport
and remove visible Pause motion. Use compact responsive composition, preserving readable
content and text-zoom scrolling. Replace continuous decorative playback/automatic story
rotation with finite entrance and manual story selection. Preserve reduced motion.
Publish to existing public Site; GitHub push remains deferred.
Verification: ten branding/motion/viewport checks passed, including no scrolling at
360x640,390x844,768x1024 and1440x900. Diff reviewed. Build/package and publish exact
local main; GitHub push deferred. Current rollback: Site17.

2026-11-08 active owner amendment: neutral functional design system. Navy brand is an
action accent, not a decorative panel/chart/background color. Use warm complementary
paper/surfaces with >=5% visible tint and navy-tinted near-black ink; no pure white/black
UI literals. Preserve original identity assets and merchant-specific brand identities.
Scope: shared tokens, company presentation/shell/Studio/map/admin chrome, neutral text
and surfaces, primary action contracts. No routes/data/operational changes. Verify
contrast, representative workspaces, viewport fit and relevant regressions, then publish
exact local main to existing public Site. GitHub push remains deferred; rollback Site18.

Completed neutral design slice: warm tinted surfaces/legacy extremes migrated; charcoal
text, stone panels, navy primary actions, neutral map and illustration colors. Original
identity sources preserved with blend/grayscale presentation, compact footer adapted;
Studio rail logo overflow fixed. Data/operational contracts unchanged.
Verification: 21/24 initial checks; updated legacy neutral-color expectation and fixed
footer viewport layout, then 15/15 passed including all three failures and map controls.
29 distinct relevant checks covered. Production build, contrast smoke and 12-case
compiled responsive review passed. Desktop/phone screenshots inspected and retained.
Design contract: docs/NEUTRAL_DESIGN_SYSTEM.md. Full suite not rerun; existing bundle
advisory remains. Publish exact local main to existing public Site; rollback Site18.
Record actual returned version in .git/kawing-brand-release.json. GitHub push deferred.

2026-11-08 owner amendment: separate the header symbol and typography. Use a clear
three-column entry masthead: left home symbol, independently centered wordmark, right
supporting label (hidden on phones). Preserve supplied SVG sources, neutral palette,
responsive landing fit, navigation and workspace state. This is a conventional editorial
placement, not a claim of measured conversion improvement. Verify branding/motion and
viewport tests/build; publish exact local main to existing public Site. Rollback Site19;
GitHub push remains deferred.

Owner steering: reconcile missing the usual. in Pop-up Market. Add standard merchant
profile and default B04 booth; one-time catalog migration appends the missing profile
and uses only an available booth, preserving existing assignments, blocked booths,
closed-event behavior and subsequent owner removals. Existing usual catalog/storage
routing remains authoritative. Generalize sample menu preview to standard merchants.
Verify migration idempotency and actual usual ordering entry alongside header checks.
Header/map/migration focused run: 17 passed after updating the reduced-motion selector
for the separated symbol. Additional usual checkout check and build run before release.
Preserve original identity SVGs and existing layouts/assignments. No real transactions.
Additional checkout/migration run: 2 passed; actual usual item customization and order
submission succeeded using its own merchant record. Build and diff checks passed.
Publish exact local main to existing public Site; GitHub push remains deferred.

2026-11-08 owner-approved slice: remove decorative crescent/top card borders; add
Blackball Cafe as an independent standard merchant with source-backed branding/menu
from the owner's public Canva menu URL. Preserve original raster source assets;
separate logo and wordmark in the merchant identity. Menu labels/prices must be checked
against source; ambiguous rows must not invent prices. Keep ordering browser-local,
independent merchant records, Studio/pilot/demo flows and neutral company chrome.
Owner steering: Standard Merchant → Merchant View defaults to Start here; Customize
still opens Studio, explicit deep links preserved. Include Blackball in market catalog
through one-time non-destructive reconciliation. Verify menu prices, migration, checkout,
start/customize routing, mobile and build. Publish existing Site; GitHub push deferred.
Source read: public HTML/embedded menu data plus running page screenshot. Canva connector
accepts design IDs rather than this published menu URL, so direct public-page read used.

Completed: Blackball standard profile and catalog migration3, B05/fallback free booth,
104 source-backed prices and original separated raster identity; published-media
provenance recorded. Ambiguous bar-chow rows/services omitted from checkout and original
menu linked. Card accent arc/decorative welcome star removed. Start here default and
selected-merchant welcome applied; Customize/deep links retain Studio.
Verification: initial core26 run24 passed, then two outdated Studio-flow tests updated
for Customize→Brand and passed. Additional Blackball, usual, commerce, founder/mobile
and neutral checks passed: 39 distinct targeted tests covered across runs. All104 menu
image paths checked. Build/diff passed; compiled six-case mobile/desktop review passed;
actual screenshots inspected. Full suite not rerun; existing bundle advisory retained.
Next: exact-source local main commit and existing public Site publish; record final
version/source in .git/kawing-brand-release.json. GitHub push remains deferred.

2026-11-08 active owner slice: repair Blackball missing menu imagery and hero clipping;
use licensed internet reference photos with separate brand stamp/illustrative labeling.
Keep downloaded photo bytes intact; compose the stamp as responsive UI, not a claim of
actual merchant product photography. Source photo pages/license read; retain provenance.
Owner steering: reconcile Matcha Mood/usual/Blackball into a common storefront design
philosophy: neutral surfaces, shared type/layout, separate image/text, brand action
accents only. Preserve merchant names, logos, menus, selected Studio layouts/config,
order/payment states and customizations. No record reset or seed change.
Baseline ade3ee6 / public Site21; GitHub push remains deferred. Verify natural image
loading, no hero height truncation, shared style across all3, mobile, checkout, build,
actual screenshot review; publish exact local main to existing public Site.
Completed slice: shared neutral storefront and ordering composition; full-height hero
image fix; six licensed reference photos with separate brand/illustrative UI labels;
placeholder-only persistent imagery migration. 37 targeted checks passed (affected
artifact-collision checks rerun sequentially); mobile/desktop screenshots inspected.
No menu pricing, transaction or seed reset. Publish local main; GitHub push still deferred.
2026-11-08 owner follow-up: retire product-card category collages and unrelated
category reference photos. Source dish-specific, single-serving internet photos;
retain source/license metadata and visible illustrative/credit disclosure. Preserve
menu IDs/prices/options, merchant custom photos, orders and seed markers. Baseline
84fd9a5 / public Site22. Test catalog paths, persistent imagery migration and mobile
cards; build, inspect screenshots and publish existing Site. GitHub push deferred.
Completed photo correction: eight breakfast references, explicit single-dish frames
for 27 category-image product entries, shared card/sheet framing, photo attribution
link, imagery-only persistence migration. 14 targeted checks passed, screenshot
review complete. No GitHub push; release existing public Site from local main.
2026-11-08 owner-authorized branding cleanup: cut out the exterior white backgrounds
and trim excess canvas around the Blackball cup and wordmark. Preserve original
source assets in docs/sources/blackball-original-branding. Remove CSS crop/blend
workarounds and render isolated assets using contain/intrinsic proportions. Verify
mobile/desktop and checkout, build and publish existing public Site; no GitHub push.
Cutout slice complete: transparent PNGs at existing logo paths; contained cup and
trimmed wordmark viewport, no multiply blending. Original source files archived.
RGBA verified, mobile/desktop screenshots inspected and four Blackball checks pass.

2026-11-08 owner copy cleanup: remove “Illustrative photo” from image stamps in menu
and modifier sheets. Keep brand stamp, reference-photo note and attribution link.
Baseline 1a7a5a3/Site24. No image, transaction or persistence change. Verify relevant
render path/build, commit local main and publish existing Site; GitHub push deferred.
