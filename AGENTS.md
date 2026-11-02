# Kawing project workflow

## Source and live demo

- GitHub `main` is the source of truth for the hosted Kawing demonstration.
- The owner explicitly authorized on 2026-11-02: always update the existing ChatGPT
  Site to match `main` after completing and merging project changes, unless a newer
  user instruction explicitly requests source-only work or prohibits publication.
- Publication is a required completion step for changes to `main`. Keep the current
  Site ID in `.openai/hosting.json` and its existing public audience; do not create
  replacement Sites. Use the Sites skill and native version/deployment tools.
- Build and publish the exact pushed `main` commit. Verify deployment success and
  report its URL and source commit. If release fails, report the mismatch clearly.
- This is standing authorization for the agent's release workflow, not a claim that
  an unattended GitHub-to-Sites CI pipeline is installed. Do not promise automatic
  publication of changes made elsewhere without verifying such an integration.
- Preserve unknown work and check remote updates before merging or publishing.
  Never force-push or rewrite `main`.

## Checks and boundaries

- For application changes, run the relevant browser tests and production build.
  Reuse passing checks for unchanged source; build the final published revision.
- Payments, identity recovery, feedback, Wi-Fi, loyalty and analytics remain explicit
  browser-local demonstrations. Publication does not authorize a production backend,
  real payment processing, or handling actual sensitive customer data.
- Older documents describing a source-only release are historical verification records;
  this current policy supersedes their publication restriction.
