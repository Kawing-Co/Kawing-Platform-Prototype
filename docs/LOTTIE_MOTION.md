# LottieFiles motion enhancement

Owner-authorized presentation slice, 2026-11-07. Baseline local main
76001b320fb1267491a84b78dadf85750921ebd3 / public Site 13.
Authority: AGENTS.md, live Context Vault TOKEN-OPT-001-A8 and .codex/CURRENT.md.
GitHub push remains deferred. Rollback: saved Site 13.

## Experience

The introduction animates immediately with a short typography/card arrival, an original
logo reveal. The decorative orbit was removed at the owner’s request on 2026-11-08. The supplied company SVGs are untouched.
A decorative Lottie connection motif accompanies the headline. Directional Lottie
arrows play on arrival and replay on hover/focus for the CTA and experience cards.
The three journey steps are now real buttons with an illustrative perspective preview.
The visible story rotates every 4.5 seconds until the user deliberately selects a step.
This illustration does not create orders or claim payment was verified.

Pause motion persists locally between entry pages/reloads. System reduced motion
always wins and presents static icons; no player chunk is requested. Intersection
observers pause vector playback offscreen; visibility events pause hidden-page players,
CSS entrance motion and story rotation. Pointer/focus replay stays decorative. Unmount destroys
players and observers. Navigation never waits for runtime availability.

## Source and licensing

Public collection: https://lottiefiles.com/free-animations/microinteraction
Retrieved 2026-11-07; public CDN files needed no credentials, account or paid access.
Only three approved vector-only assets were incorporated; no third-party runtime
analytics, iframe, account integration or hosted animation request is introduced.

- Infinity Loader — menee design:
  https://lottiefiles.com/free-animation/infinity-loader-5S0tGTfa8x
  CDN: https://assets-v2.lottiefiles.com/a/1869325c-1171-11ee-a3d3-e7002b76b3ed/oMMQ59q96X.lottie
  Original SHA256: 3a4eb64e7d4f4d8e9a3600ba333c08bb24d49832a04605005d342960094fad39
- Shopping Cart Animation — Pedro Aquino:
  https://lottiefiles.com/free-animation/shopping-cart-animation-WMW61d1kbk
  CDN: https://assets-v2.lottiefiles.com/a/a727e7a4-1153-11ee-842f-27be99859b6c/jz0Ha4t4t0.lottie
  Original SHA256: 1a497cef623c9571ad727269853d3d712c3553d045a82521737c35e86bff1248
- Scroll down nudge — Rama:
  https://lottiefiles.com/free-animation/scroll-down-nudge-uS9qGp7rrR
  CDN: https://assets-v2.lottiefiles.com/a/d0732af2-117f-11ee-b586-4b0f0aa7667e/oxwHOjrK8r.lottie
  Original SHA256: dedb60c36fbc80f8fa0fb97d3ad9951a6ddc078ebe3164a831932a243f9253c6

Derived data lives in src/motion. Colors were adapted to navy/white; crops improve
small-icon legibility; the nudge background circle and decorative cart text counters
were removed. These derivatives retain the Lottie Simple License at
public/motion/LICENSE.txt. Visible Animation credits links to public/motion/CREDITS.txt.
The connection asset is a motif, not a loading-state claim.

The only added dependency is lottie-web 5.13.0 (MIT); its light SVG player is lazy-loaded
as a separate ~49kB gzip chunk. No expression runtime, canvas/WASM renderer, external
fonts, images or scripts are loaded by these animations. Illustration data is bundled
locally. The existing main-bundle advisory remains; this slice does not restructure
operational routing or add prefetching to the customer checkout.

## Verification

The new tests exercise real changing SVG frames, interactive story/manual control,
hover/focus replay, pause persistence, offscreen/hidden-page handling, reduced-motion
no-runtime behavior and runtime failure fallback. Existing branding, mobile entry,
map and session regressions remain the relevant integration checks. No operational
schema, payment, loyalty, merchant styling, route contract or market assignment changed.

Verification completed: 29 targeted Playwright tests passed; production build passed.
Compiled preview: nine cases at 360/768/1440px across introduction, experience selection
and view choice passed with zero console/page errors and no horizontal overflow.
Actual desktop/phone screenshots inspected; evidence in docs/screenshots/lottie-motion/.
The previous release's complete operational regression evidence is retained; the full
110-test suite was not rerun for this presentation-only slice. No lint/typecheck script
is configured. Physical iOS/Android testing and a formal accessibility audit are not
claimed. Existing bundle-size advisory remains. Public release verification is recorded
in the local release checkpoint and completion response after exact-source publication.

Hosted-page correction: nested credits.html returned an empty response from Sites.
The visible link now opens /motion/CREDITS.txt, using the same static delivery path
as the verified license files. Targeted runtime-fallback/credits check passed again;
this follow-up does not change playback or operational behavior.

2026-11-08: owner requested a viewport-fitting introduction and removal of Pause motion.
Entry now uses compact responsive composition; phone narrative descriptions yield to
three directly selectable steps and their preview. Decorative playback is finite, and
story rotation is manual. System reduced motion remains respected. At increased text
zoom or unusually short viewports, natural scrolling remains available for accessibility.
