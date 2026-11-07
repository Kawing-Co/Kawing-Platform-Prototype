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
