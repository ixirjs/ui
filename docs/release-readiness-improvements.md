# Release Readiness Improvements

Date: 2026-06-28

Assumption: "relate" means "release". This file records the product-owner and senior-engineer release-readiness pass for `@svelte-atoms/core`.

## Current Recommendation

The core release blockers identified in the first pass have been fixed. The package is now suitable for a release-candidate review, with a few non-blocking warnings still worth triaging before a stable release.

Keep the package export strategy from finding #7 as-is for now: unstable/non-stable modules remain explicitly excluded with `null`, and wildcard component exports remain available during alpha.

## Verified Gate Results

| Gate                 | Command                               | Current result                                                             | Release impact                   |
| -------------------- | ------------------------------------- | -------------------------------------------------------------------------- | -------------------------------- |
| Type check           | `npm run check`                       | Passes with Svelte warnings only                                           | Non-blocking warnings remain     |
| Lint                 | `npm run lint`                        | Passes                                                                     | Clear                            |
| Unit tests           | `npm run test:unit -- --run`          | Passes: 80 files, 523 tests, 4 skipped                                     | Clear                            |
| E2E tests            | `npm run test:e2e`                    | Passes: 1 Chromium test                                                    | Clear                            |
| App production build | covered by Playwright `webServer`     | Passes via `npm run build && npm run preview`                              | Clear                            |
| Storybook build      | `npm run storybook:build`             | Passes                                                                     | Clear, with bundle-size warnings |
| Package validation   | `npm run prepack`                     | Passes with no declaration-generation warnings; `publint` reports all good | Clear                            |
| Tarball dry run      | `npm pack --dry-run --ignore-scripts` | Passes: 1,174 files, 325.0 kB packed, 1.7 MB unpacked                      | Clear, content review advised    |

## Fixed Findings

### 1. Type-check gate restored

`npm run check` now exits 0. Fixes included moving Vitest config out of `vite.config.ts`, moving path aliases into `svelte.config.js`, correcting strict optional props, fixing docs example types, and preventing generated/stale `dist` from poisoning source checks.

### 2. Capability model tests restored

`npm run test:unit -- --run` now exits 0. The bond compatibility path was repaired so legacy `BondState` instances passed into `Bond` still expose their public state and capabilities through the merged authoring facade.

### 3. Public declarations now generate cleanly

`npm run prepack` no longer reports missing declaration files. The internal bond brand was removed from the public class shape, public return types were pinned where inference leaked internals, and previously anonymous atom classes used in public declarations were made nameable.

### 4. Vite-only library env checks replaced

Library `import.meta.env?.DEV` checks were replaced with `DEV` from `esm-env`, and `esm-env` was declared as a direct dependency.

### 5. Lint gate restored and scoped intentionally

`npm run lint` now exits 0. Mechanical lint errors were fixed, generated `llms.txt` templates and build outputs are ignored, and docs-specific rules such as trusted `{@html}` rendering are scoped in ESLint config.

### 6. Package self-import/build hygiene improved

Storybook no longer imports `../../dist` for local types. Source aliases now resolve through SvelteKit alias config, so local checks and stories do not depend on prebuilt package output.

## Remaining Non-Blocking Follow-Ups

### A. Triage Svelte compiler warnings

Current checks/builds still report warnings such as `state_referenced_locally`, deprecated `<svelte:component>` in docs, and some form-label accessibility warnings in playground code. They do not fail the gates today, but they should be reviewed before a stable 1.0 release.

### B. Add warning-failing release automation

`prepack` is clean now, but CI should still fail if declaration-generation warnings return. Add a release script that captures package output and fails on known warning phrases.

### C. Review bundle-size warnings

The app and Storybook builds complete, but both report large chunks. This is acceptable for the current alpha docs/stories build, but should be tracked as a performance/product follow-up.

### D. Review tarball contents

The latest dry run passes with 1,174 files, 325.0 kB packed, and 1.7 MB unpacked. Tests and stories are excluded, but generated docs/readmes and public helper artifacts should still be deliberately accepted before publishing.

### E. README and maturity matrix

README positioning should still be reconciled with alpha maturity. Add a component maturity matrix covering exported, documented, story exists, unit tested, keyboard/a11y tested, SSR tested, and release status.
