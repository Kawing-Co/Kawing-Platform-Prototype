# Premium experience amendment — 2026-11-05

Baseline: main 525ea4608b7079d19e4102f1dfef1e3bce6e0a23 (includes the newer
release-documentation PR). Initial checkout clean; only main exists. Follow AGENTS.md:
keep the existing public Site aligned with checked main; retain only main at completion.

User authorizes a premium product-wide visual/interaction upgrade, including the
listed interface patterns, lightweight spatial interaction, Hyperframes, FFmpeg and
Node >=22. Keep the six spaces, immediate customer entry, map-first merchant entry,
Studio drafts, connected orders, cashier verification, loyalty and offline workflow.

Design: warm paper, ink, restrained forest accent, editorial headlines, readable body
text, stronger contrast, consistent corners and hierarchy. Customer themes retain
merchant identity. Adapt density and control placement to the device. Motion is brief,
interruptible, reduced-motion aware, and isolated from operational payment state.

Implement: richer interactive entry and selectable product-story stages; optional native
WebGL spatial preview with keyboard/touch controls and static fallback; a user-played
Hyperframes-rendered short film; global command menu and shortcut hints; reversible
presentation/catalog actions via undo; skeleton frames; real BlurHash image placeholders;
local cached snapshots with focus/storage revalidation; meaningful static entry markup;
view transitions and destination previews; swipe-dismiss on the command sheet; touch
hit areas/safe insets; demo code autofill; tabular numbers; balanced type; progressive
continuous corners; safe pointer intent for the command menu. Retain submission
idempotency and add regression coverage where meaningful.

Boundaries: no production backend, tracking, payment SDK, real identity/code delivery,
magnetic motion on touch, autoplay film, 3D during checkout, or claim that browser
storage is a network cache or supports transactional multi-user synchronization.
Predictive navigation is an app destination preview, not a claim of native OS gestures.
No new public Hyperframes hosting; its CLI renders an asset used by the existing Site.

Acceptance: primary actions remain immediately discoverable; every new interaction works
with keyboard and small screens; command actions follow the scenario/view model and
retain draft guards; undo touches only the selected field and never financial records;
images/frames maintain layout while loading; graphics/video are optional, lazy and
motion-safe. Verify build, full regression plus focused new browser checks, console,
360px/desktop screenshots, reduced motion, lost WebGL fallback, rapid navigation,
checkout exactly once, final diff, public deployment provenance and served asset hash.

## Requested 3D references

Use the supplied brag, 3D-Experiences and interactive-portfolio repositories as
reviewed references. Build original café miniatures with deliberate detail/rotation,
keyboard stage selection, zoom/reset and on-demand drawing. Preserve navigation and
orders without canvas. Do not redistribute all-rights-reserved portfolio code/assets.
Record pinned source revisions and specific lessons in 3D_REFERENCE_REVIEW.md.
