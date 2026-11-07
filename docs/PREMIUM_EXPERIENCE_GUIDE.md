# Premium Kawing experience

Historical interaction record: command search and its shortcut were removed at the owner’s request on 2026-11-07. The current entry and demonstration sequence is in [MOBILE_DEMO_GUIDE.md](MOBILE_DEMO_GUIDE.md).

Start at the root. Choose Standard Merchant or Pop-up Market, then one of the three
views. Existing ordering, cashier confirmation, kitchen, loyalty, event logistics and
map-first Merchant View remain the interactive core.

The entry now uses paper/ink colors, an editorial headline, two compact scenario cards
and a selectable Guest → Team → Owner story. Explore in 3D loads a small native WebGL
illustration only when requested. Drag horizontally or use the rotation buttons; inspect detail with the zoom control.
When the scene is focused, Left/Right rotate, plus/minus zoom, and Home resets.
Story tabs support Left/Right and Home/End. Each stage is an original café miniature.
No graphics loop runs when the scene is still. Unsupported/lost contexts show an honest
static fallback. The scene is conceptual, not a real venue model or measured analytics.

Watch the product story opens a user-controlled 12-second film with captions and native
play/pause/scrubbing. It never autoplays during ordering. The source is `motion/index.html`,
a paused GSAP timeline rendered with Hyperframes CLI 0.9.15, then optimized with FFmpeg.
Node 24.19, Chromium and FFmpeg 7.1 were used. Rebuild from the repo root with
`bash scripts/render-story.sh`; the script requires Node >=22 and FFmpeg. The gsap.min.js
file is an authoring dependency in motion/, not a runtime script in the application.
The film uses the existing bundled Salo photography and original HTML product layouts.

## Demonstrate in three minutes

1. Choose a scenario and a view. Open Quick actions, or press Ctrl/Cmd K. Search for
   “Staff orders” and use arrows/Enter. Escape or the close button returns focus.
2. Open Kawing Studio through Quick actions. Click the live canvas to edit a section.
   In Modules, hide Private feedback, then Undo. In Menu, mark an item sold out and
   Undo; the saved catalog changes immediately, while transaction records stay intact.
3. On a phone, drag the command sheet's handle downward to dismiss it. Keyboard and
   close-button alternatives remain available. Header actions stay reachable.
4. Return to the root. Switch the Guest / Team / Owner story, enable 3D, rotate and
   reset, then open the film. These optional demonstrations do not change demo orders.
5. Open Customer View. Menu photographs use image-derived BlurHash placeholders;
   the frame and image positions stay stable while loading. Order, verify as cashier,
   and fulfill using the same preserved workflow.

## Pattern implementation map

| Requested pattern | Concrete behavior |
| --- | --- |
| Skeleton loaders | Device-frame loading shell and Studio handshake skeleton |
| Optimistic updates | Immediate local catalog/module changes, with reversible feedback |
| Command menu | Searchable, scenario-aware navigation; no arbitrary routes from input |
| Shortcut hints | Ctrl/Cmd K, arrows, Enter and Escape; visible desktop hints |
| Undo toasts | Nine-second, single-use undo of the selected availability/visibility field |
| Stale while revalidate | Cached browser-local order snapshots refreshed on focus/storage/local events |
| Pre-rendering | Meaningful static first-paint entry in index.html before React starts |
| BlurHash | Actual hashes computed from bundled photographs; small decoded placeholders |
| View transitions | Feature-detected native transition API with immediate fallback |
| Swipe-dismiss sheets | Command sheet handle; native modal focus and Escape remain available |
| Interruptible animation | New navigation skips the prior transition; reduced motion disables effects |
| Predictive back | App destination preview on Back, plus preserved browser Back/Forward |
| Hit slop | Comfortable coarse-pointer targets around small icons |
| Safe areas | viewport-fit=cover and safe-area padding on fixed controls/sheets |
| Code autofill | one-time-code, numeric mode, bounded six-digit demo recovery input |
| Tabular numbers | Stable figure widths for currency, counts and progress |
| Balanced headlines | CSS text-wrap:balance with normal text fallback |
| Continuous corners | Progressive corner-shape support and rounded fallback |
| Idempotency | Existing submission IDs/in-flight guard retained; repeat submission verified |
| Safe triangle | Pointer-intent delay when crossing categories toward command results |

Local snapshots do not contact a server and do not imply transactional multi-user
storage. Back previews do not imitate a native Android/iOS predictive gesture.
Financial/payment transitions have no optimistic “paid” state or arbitrary undo.
Module visibility undo is a draft change and must still be saved to affect guests.
Undo is cleared when leaving its context. Undo restores the previous value only while the field still matches that action’s result. Merchant theme colors remain authoritative in the customer hub.

## Verification and limits

Run `npm run build` and `npm test`. New tests cover keyboard command navigation,
draft cancellation, undo scope, swipe/close focus, spatial fallback, controlled film,
slow-frame skeleton, BlurHash loading stability, code autofill, reduced motion,
submission exactly once, rapid navigation and foreground local snapshot refresh.
Screenshots: docs/screenshots/premium/. Browser checks use Chromium, not physical
phones or a complete screen-reader/WCAG audit. Native view transitions, superellipse
corners and WebGL are progressive enhancements with simpler fallbacks.

Reference analysis, exact revisions and reuse boundaries: [3D_REFERENCE_REVIEW.md](3D_REFERENCE_REVIEW.md).
