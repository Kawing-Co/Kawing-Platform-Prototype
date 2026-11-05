# Branch and PR reconciliation — 2026-11-05

## Authority and starting state

The founder requested: “What branch is the site based on right now? I want you to
reconcile the branches and existing pr.” This is the current integration request.
The earlier UX-002 delivery stopped at a draft PR; its hold instructions record that
session's scope. This reconciliation reviews the PR, fixes the issue below, merges
through GitHub and follows AGENTS.md's standing release requirement for main.

Repository: `https://github.com/invicta-ctrl/qrmenu`. The checkout was clean, on main,
with one worktree and no other active agent writers. No additional AGENTS, project
policy, CURRENT file or branch-specific approval gate was found. No branch is deleted,
force-pushed, rebased or reset. Kawing-Platform is outside this task.

At preflight, the existing public Site was version 5, built from main at
`1005b0625eea05a19351ff64650a6668fc433dba`. GitHub main matched that SHA.

| Ref at preflight                       | SHA                                      | Relationship to main                            |
| -------------------------------------- | ---------------------------------------- | ----------------------------------------------- |
| main / origin/main                     | 1005b0625eea05a19351ff64650a6668fc433dba | Live baseline                                   |
| feature/kawing-demo-ux-002 (PR #1)     | 875d25558fc1ee61b91d4169a654dc6e4fb87685 | Four unique commits ahead; main is its ancestor |
| feature/kawing-interactive-prototype   | 629a126662d901b5f4bb24b63c3f040f3ae04d94 | Fully contained in main                         |
| feature/interactive-workspaces (local) | 1005b0625eea05a19351ff64650a6668fc433dba | Same as main                                    |
| feature/spaces-studio-overhaul (local) | f15654234952c5f85a77d8fddc589b572bac9c9a | Fully contained in main                         |

There were no divergent source histories or merge conflicts. The one open PR was
[#1](https://github.com/invicta-ctrl/qrmenu/pull/1), in draft, with no submitted reviews
or review threads and no reported commit status checks. Local checks supply the
verification evidence; absent GitHub checks are not treated as passed CI.

## Integration decisions

Keep all four UX-002 slices: addressable Scenario → View navigation, session controls
and scoped reset, immediate Customer View with optional device/package previews,
provider-specific simulated payment guidance, Studio Review & publish, and touch
refinements. Existing commerce records, frame editing, merchant namespaces, cashier
verification, loyalty integrity, booth logistics and event admission checks are retained.

The updated customer entry intentionally supersedes the old mandatory preview
selection step; controls remain available without blocking ordering. Documentation
now describes that final behavior. Scenario names are Standard Merchant and Pop-up
Market. Storage keys and legacy links remain compatible.

Review found that the new checklist flagged an empty business name but Save design
still persisted it. Saving now rejects a blank/whitespace name, keeps the draft for
correction and leaves the last saved configuration intact. A browser regression checks
both rejection and a successful corrected save. Existing over-quota media remains
preserved on package downgrade; this review does not introduce a destructive quota fix.

The existing ten Studio tabs and participation-first market merchant screen are kept.
Changing those product decisions is deferred; neither is needed to reconcile histories.
Payments remain browser-local and no provider checkout or custom URI is enabled.

## Verification and release

- Original PR head: production build and all 57 Playwright checks passed locally.
- Reconciled revision: production build and all 58 Playwright checks passed locally.
- `git diff --check` passed; no new dependency or hosting/access configuration change.
- Desktop/mobile browser inspection covers the new session controls, direct Studio
  editing, review/save, customer entry, and simulated payment guide. Fresh captures in
  [screenshots/reconciliation](screenshots/reconciliation) had no console errors or
  horizontal overflow at 1440×900, 390×844 and 360×800.
- Merge uses PR #1 with an expected head SHA; a moved head must be reviewed again.
- Publish the exact resulting main SHA to the existing public Site. Verify native
  publication and anonymous served JS/CSS against the build, then report final SHA,
  version and URL in the task handoff. Historical branches retain their original tips.

The source release note records the intended verified integration; native deployment
results and final refs are reported in the handoff. No unattended GitHub-to-Sites
pipeline, production authentication, real payments or cross-device data sync is claimed.
