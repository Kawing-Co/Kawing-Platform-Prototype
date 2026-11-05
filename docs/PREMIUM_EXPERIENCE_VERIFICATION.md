# Premium experience verification — 2026-11-05

Repository: https://github.com/invicta-ctrl/qrmenu
Branch: `main` only, following Earl's standing main-only instruction and AGENTS.md.

Preflight started at `9b3bcf8471a17f5f0dca69c3e2c921433791fd43` with a clean
working tree. GitHub had subsequently merged documentation PR #3. Fast-forwarded to
`525ea4608b7079d19e4102f1dfef1e3bce6e0a23` before implementation, preserving that
release-state documentation. No other worktree, active local writer, unknown changes,
additional policy file or formal approval gate was found. Remote refs were fetched
and reviewed; only main remains. No branch was reset or force-pushed.

## Automated checks

- Final production build: passed with Vite 6.4.5 / Node 24.19.0.
- Final Playwright regression run: 72/72 passed in 3.4 minutes.
- Earlier complete regression runs: 70/70, then 71/71 passed. After mobile scene review,
  added the touch-device clipping/overlap test and fixed the canvas aspect-ratio minimum.
  The focused touch check passed before the final complete run.
- Hyperframes CLI 0.9.15 composition lint: 0 errors, 0 warnings.
- Hyperframes render: 360 frames at 30 fps, 1280 × 720. FFmpeg 7.1.5 optimized the
  result to H.264, 12.000 seconds, 240,376 bytes, fast-start MP4. Poster and captions
  are included. The actual rendered Guest, Team and loyalty scenes were inspected.
- No configured application lint/type-check script. No claim of a TypeScript check.
- Final staged diff and whitespace review: passed; 45 intended files only.

The 14 added tests cover command keyboard navigation and unsaved-draft cancellation;
field-scoped, single-use undo; mobile sheet swipe/Escape/focus return; unavailable/lost
WebGL; no autoplay; lazy graphics loading; idle draw count; focused rotation/zoom/reset
and story-tab keys; delayed-frame skeleton; genuine BlurHash/image layout stability;
reduced motion; demo recovery autofill; immediate cart updates and duplicate-submit
protection; rapid navigation; foreground local-cache revalidation; visible touch controls.

Existing tests retain connected ordering, cashier claim/confirmation distinction,
fulfilled-order analytics and loyalty exactly once, refunds, offline replay exactly
once, cross-merchant isolation, cart/table context, preview isolation, module controls,
feedback/review independence, unsafe-link rejection, disabled games, logistics,
blocking support issues, lifecycle, founder navigation, reset and persistence coverage.

Production output: main JavaScript 480.45 KB (144.84 KB gzip), CSS 162.88 KB
(31.99 KB gzip), optional spatial chunk 7.24 KB (3.49 KB gzip). No model or scene
texture downloads are required. These are file-size measurements, not mobile FPS or
Lighthouse scores.

## Browser and visual review

Local Chromium was actually run. Eleven screenshots were captured in
[docs/screenshots/premium](screenshots/premium/); desktop/mobile entry, Studio, command
menu, menu, organizer logistics and all three spatial stages were inspected. The scene
is visible and framed, including after the mobile canvas fix. Final capture scripts
reported no console/page errors and no horizontal overflow on eight representative
surfaces at 360/390/1440 px. An additional 360/768/1024 px sweep covered entry, Studio
and organizer; all three mobile story stages retained accessible detail controls.

Findings corrected during verification: navigation during native transitions could
replace a command's destination hash; a page-width check alone missed a clipped canvas
child. The command now sets the final destination inside the transition, and the
canvas container has explicit constrained width. Its new regression checks card bounds
and overlap, using a touch-enabled Chromium context. An image-height assertion was
adjusted for sub-pixel floating-point noise (<0.1 px) while retaining layout-shift checks.

Keyboard/modal focus, reduced motion, native feature fallbacks, image/network loading
states and GPU loss are covered by browser tests. This is a Chromium smoke review,
not a complete WCAG audit or physical iOS/Android/Safari test.

## Release and limits

The existing public Site ID and audience are retained. Build/package/publish the exact
pushed main commit; native deployment status and public served-asset verification are
reported in the task's completion message. This record does not promise an unattended
GitHub-to-Sites CI connection.

Everything remains browser-local and fictional: payments, identity recovery, feedback,
loyalty, charts and event operations. 3D illustrates the proposition; it is not live
operational state. Predictive back is an app destination hint, pre-rendering is a static
first-paint shell, and stale-while-refresh is a local snapshot pattern. Graphics are
optional; there is no 3D prerequisite for ordering, continuous animation loop, production
backend, analytics tracker, real bank transaction, cross-device identity or wallet pass.

Reference revisions, rights and asset decisions: [3D_REFERENCE_REVIEW.md](3D_REFERENCE_REVIEW.md).
Partner demonstration sequence: [PREMIUM_EXPERIENCE_GUIDE.md](PREMIUM_EXPERIENCE_GUIDE.md).
