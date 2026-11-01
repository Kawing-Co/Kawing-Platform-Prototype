# Kawing presentation prototype

Status: implementation authorized by the user brief; no repository approval gates found.
Baseline: invicta-ctrl/qrmenu, main f5bbb084d3fd60f1771c49b20125e8c3922eb998.
Branch: feature/kawing-interactive-prototype. Existing README and LICENSE preserved.
Only origin/main and one local worktree observed. No governance files, accepted prior specs,
or local concurrent writers found. Remote activity cannot be conclusively excluded.

## Experience
A premium, warm ivory and forest-green merchant workspace for a fictional Filipino
restaurant, Salo. Start at an actionable business overview. Switch between owner,
customer menu and staff kitchen views, all using a shared browser-local demo state.
Provide menu search/categories, cart quantities, simulated checkout, order progress,
merchant branding/menu availability, reporting period, and an ecosystem growth story.
A guided demo explains the connected journey. Responsive desktop and mobile layouts.

## Acceptance criteria
- Customer can find food, add/remove quantities and submit a simulated paid or cash order.
- Submitted orders appear in staff queue and owner activity; staff can progress to served.
- Owner can change restaurant name/accent and menu availability with immediate preview.
- Analytics period changes chart and values; clearly distinguish seeded illustrative data.
- Offline simulation queues orders; reconnect syncs once, without duplicating orders.
- Demo survives reload; reset restores seeded data through explicit confirmation.
- Keyboard-accessible controls, reduced-motion handling, legible responsive layouts.
- Build passes and browser checks cover the connected journey, persistence and mobile.
- Provide run instructions, demonstration script and verification record.

## Exclusions
No real payment processing, personal customer data, authentication, backend, infrastructure,
production offline guarantee, external writes, deployment, or push to main. Pilot and growth
numbers are illustrative assumptions, not actual traction. Local assets and browser storage.

## Verification
Production build; Playwright interaction checks at desktop and mobile widths; screenshots
and visual review. Validate calculations and repeated offline/reconnect behavior.

## Partner navigation improvement — 2026-11-01
Authorized: improve the existing hosted demo and republish under its current audience.
- Default entry is a plain-language Start here page with three roles and a complete feature map.
- Eight-step action-based walkthrough retains progress, supports pause/resume/skip/back,
  tracks a real demo order, and ends with founder discussion prompts.
- Every product view explains its purpose and suggests a connected next action.
- Receipt links directly to kitchen; staff can return to the same receipt.
- Mobile has visible Demo home navigation and touch-friendly controls.
- URL hash navigation supports reload, deep links and browser Back/Forward.
- A dedicated payment/offline explanation walks through queue, reconnect, and limits.
- Verify complete guided journey, resume/back/deep links, mobile map and existing flows.
