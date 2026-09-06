# API review implementation and remaining work

## Target and contract

Adopt the current worktree API, not an assumed published alpha.48 surface. Preserve supported
behavior and require additive-first changes with no scheduled removals. No release, version bump,
legacy API restoration, universal configuration system or runtime wrapper was introduced.

## Capability ledger

Evidence is E2 (executable development checks) unless noted. Verification is scoped to the named
fixtures; it does not mean every possible consumer or input was exercised.

| Capability                                                     | Evidence / check                                                                                             | Result                                                                         |
| -------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------ |
| Imports, types, namespace parts, bindings and instance exports | 57 typed entries / 534 reachable declarations; built and packed contract comparison; source runtime snapshot | Preserved under the adopted baseline and exact T3 review                       |
| Callbacks and bindings                                         | Frozen consumer, existing callback suites and controlled-root E2E                                            | Preserved in exercised scenarios                                               |
| Snippet state and identity                                     | Frozen concrete and structural Card factory consumers; popup type parity                                     | Preserved in exercised scenarios                                               |
| Factory/subclass substitution                                  | Object-based factory runs; subclass fixture compiles against old and new declarations                        | Preserved for representative substitutes                                       |
| Presets and augmentation                                       | Frozen augmentation fixtures, contextual preset, existing resolver suites                                    | Preserved in exercised scenarios                                               |
| Rendering, motion and lifecycle                                | Existing browser/SSR/workload suites and strict packed hydration/teardown                                    | Preserved in exercised scenarios                                               |
| Accessibility and portals                                      | Existing composition/browser suites and E2E                                                                  | Preserved in exercised scenarios                                               |
| Forms, dates and collections                                   | Existing family suites; packed Form/Select fixture                                                           | Preserved in exercised scenarios                                               |
| Virtualization                                                 | Packed consumer, layout suite and existing growth/workload gates                                             | Preserved in exercised scenarios                                               |
| Authoring                                                      | External Kernel/context/disclosure part                                                                      | Preserved in exercised scenario                                                |
| Utilities, experts and optional dependencies                   | Declaration/metadata evidence plus existing suites                                                           | Type/package contracts preserved; dependency-version matrix unverified         |
| Publication history                                            | Immutable archive helper, exact mismatch and retry checks in temporary directories                           | Tooling verified; no publication performed or historical release reconstructed |

## Diagnosis

The old name-only snapshot omitted type signatures, binding flags and namespace members. Stable
props/snippets exposed concrete state; popup member signatures were derived from their implementation.
The old archive silently skipped same-version mismatches, and current guidance included removed APIs.
See `public-surface.spec.ts`, `overlay/popup/types.ts`, `scripts/archive-surface.mjs` and ADR 0008.

## Complexity classification

Essential: domain values, accessibility, state ownership, rendering and theme extension. Supporting:
Kernel, models, curated facades and tests. Accidental: unreviewed exposure, incomplete inventories and
conflicting guidance. Deferred as unproven: a new plugin framework, universal props bag or controller
wrapper. Existing broad contracts and inconsistent names are retained, not deleted for neatness.

## Canonical backbone

Existing package layers remain. Independently declared contracts and exact review evidence separate
API evolution from implementation refactoring. Today/tomorrow review cards govern future changes.

## Transformation register

| ID  | Action                                   | Delivery / verification                                                                                                                                        |
| --- | ---------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| T1  | Make the baseline and policy explicit    | Implemented: ADR 0011, policy, inventory and frozen declarations/metadata                                                                                      |
| T2  | Automate compatibility evidence          | Implemented: declaration and tarball gates, frozen consumers, CI and gate self-tests                                                                           |
| T3  | Contain state coupling                   | Implemented for popup member groups; retained Card's structural class/factory contract without narrowing or wrapping                                           |
| T4  | Standardize evolution review             | Family-level decisions and automatic coverage implemented; Kernel/Input member tranche reviewed and characterized; other individual members remain open        |
| T5  | Make release/migration evidence reliable | Archive tooling and current guidance implemented; the main migration example is live, shared by both docs formats, and compiled/run against the packed package |
| T6  | Retain existing extension points         | Retained: no supported API removal, no default changes, no new runtime dependencies                                                                            |

## Design delivered

See `README.md`, `evolution.md`, `inventory.md`, `current-baseline.json`, `consumer-baseline.json`
and `reviews.json`. Review exceptions require exact before/after fingerprints and named checks;
they are not reusable wildcard waivers. Existing fixtures and declaration records are not replaced
when adding coverage. Current mutable source snapshots remain separate from frozen consumer evidence. The initial popup contract change emits byte-identical runtime JavaScript. The authorized
continuation also repairs optional-parameter syntax in three renderer modules and three input
components for Svelte 5.46.4's ESM compiler. The input JS remains byte-identical; the renderer
aliases retain the same Svelte runtime-call counts, with no new derived signals or hydration anchors.
See `member-review.md` for source-level decisions and new frozen input scenarios.

## Before/after equivalence

| Area                             | Types / package                                     | Behavior                               | Performance / scale                                    |
| -------------------------------- | --------------------------------------------------- | -------------------------------------- | ------------------------------------------------------ |
| Public surface                   | Preserved; popup member equality explicitly checked | Representative suites pass             | Syntax-only compiler compatibility repair              |
| State/factories                  | Old and candidate consumers compile                 | Identity, live props and teardown pass | No mandatory state wrappers                            |
| Rendering/presets                | Preserved                                           | SSR fingerprints and hydration pass    | Existing growth gate passes; tree-depth defect remains |
| Forms/overlays/collections       | Preserved                                           | Existing tests and E2E pass            | Styled workload checks pass                            |
| Unexercised consumers/toolchains | Unverified                                          | Unverified                             | Unverified                                             |

## Validation and quality gates

| Invocation                        | Observed result                                                              | Limits / diagnostics                                                                                              |
| --------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| `bun run check`                   | 0 errors, 0 warnings                                                         | Installed toolchain                                                                                               |
| `bun run test:unit -- --run`      | 904 tests / 176 files passed                                                 | Existing PortalSurface/data-conflict diagnostics remain; not a warning-free suite                                 |
| `node scripts/check-consumer.mjs` | Baseline and packed declarations compile; strict hydration and behavior pass | Installed 5.56.8 and isolated minimum 5.46.4, TS 5.9.3; `skipLibCheck: true`; browser diagnostics must be absent  |
| `bun run prepack`                 | publint and declaration gate pass                                            | Existing test-only declaration emit warnings in size fixtures; not silently classified as production declarations |
| `bun run test:e2e`                | 5 passed; application builds                                                 | Existing chunk-size warning                                                                                       |
| `bun run storybook:build`         | Passed                                                                       | Existing chunk-size warning                                                                                       |
| `bun run bench:ssr -- --no-gate`  | All output fingerprints pass                                                 | Timing/GC budgets intentionally not claimed                                                                       |
| `bun run bench:growth`            | Existing nine-family gate passes                                             | Tree-depth k≈1.35 remains a declared known defect, not a target                                                   |
| `bun run bench:workloads`         | Passed                                                                       | Styled own-cost/behavior checks, no competitor or speedup claim                                                   |
| Targeted ESLint / formatting      | Changed code passes                                                          | Full lint subsequently passed after the explicitly approved whitespace-only cleanup                               |
| `graphify update .`               | AST graph refreshed without an LLM                                           | Svelte parser partial-extraction warnings; graph is not correctness evidence                                      |

Gate self-tests exercise missing evidence, package-path removal, namespace/binding/type changes,
exact review matching and immutable archive retries/mismatches. Archive creation uses exclusive
creation so a concurrent writer cannot overwrite a version. Unexpected consumer browser diagnostics
fail the rehearsal. Existing broad-suite warnings remain a classification gap rather than being
hidden by this change.

## Gap register

| ID  | Gap                                                                                                                                            | Owner                            | Exit condition / blocked claim                                                                                                          |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------- |
| G1  | Per-member semantic review and runtime characterization is not exhaustive                                                                      | API maintainer                   | Kernel/Input tranche is in member-review.md; complete remaining cards/scenarios before claiming every API has been behaviorally audited |
| G2  | Historical releases and external applications not inventoried                                                                                  | Release/API maintainers          | Verified release artifacts and consumer fixtures before making historical/real-app migration claims                                     |
| G3  | Svelte minimum/current pair now exercised; other compiler versions and baseline TS2590 with skipLibCheck false in InputTimeControl remain open | CI/API maintainers               | Independent version-matrix and strict declaration checks before those support claims                                                    |
| G4  | Closed: full lint passed after approved formatting of `.codex/hooks.json` and the historical archive                                           | Repository maintainer            | Both parsed JSON values were asserted unchanged before/after formatting                                                                 |
| G5  | Existing diagnostic noise, tree-depth defect and additional tutorial fragments                                                                 | Relevant family/docs maintainers | Classified diagnostics, calibrated depth fix, compiled supported examples before broader quality claims                                 |

G1–G3 are open high-evidence gaps for their corresponding unqualified claims, not evidence of a new
runtime regression. G5 is existing/remaining quality debt. No gap was resolved by weakening a budget
or replacing an old expectation. G4 is closed with explicit user approval and semantic JSON equivalence.

## Compatibility and lifecycle

All existing stable paths, members, aliases, factory contracts and presets are retained. The
pre-baseline removals remain historical; no restoration or further retirement is attempted.
External dependents remain unknown. Publication records are created only by the explicit archive
or publish workflow, never by ordinary prepack; no new release archive was created in this pass.

Draft → classified → validated → published. A changed candidate invalidates prior validation;
missing evidence fails the relevant gate. Archives reject differing retries and concurrent creation
fails closed. Deprecation retains behavior. Rollback uses the prior artifact, not an overwritten
version record. No runtime lifecycle was redesigned.

## Residual trade-offs

- A conservative declaration gate can flag harmless internal moves or additive changes; explicit
  review is preferable to silently missing a break. It is not a semantic TypeScript diff engine.
- Existing broad state/factory contracts still cost maintenance; new implementation details must not
  silently expand them. Even adding a private class brand can break structural factory substitutes.
- Inconsistent names and compatibility aliases remain because consumer migration costs matter.
- Two Svelte versions with one TypeScript version are useful evidence, not proof across the peer range.
- The Svelte floor check freshly resolves transitive dependencies, intentionally detecting upstream
  compiler/printer incompatibilities; it requires registry access and does not pin all transitives.

## Missions checklist and rollback

- [x] M1: adopt the worktree baseline and additive-first policy.
- [x] M2: detect declaration, package and representative consumer breakage.
- [x] M3: separate popup signatures; preserve and test existing factory contracts.
- [ ] M4: family-level review and Kernel/Input member tranche implemented; finish remaining individual member review (G1).
- [x] M5: immutable archive tooling and unified, executable current migration example; historical snippets remain labeled as explanatory history.
- [x] M6: representative packed upgrade and all existing integration gates pass; expanded support-matrix claims remain unverified (G3).

Rollback boundaries: the independent popup signatures can revert to the previous Pick-based
representation without consumer migration. The later Svelte syntax repair can be reverted separately,
but that reopens the declared-minimum compiler failure; do not call that a supported release.
Keep the original baseline and all accepted frozen consumer cohorts on either path. No compatibility
path is retired. No package has been published and no version archive has been created.

## Completion declaration / plan status

Delivery: **partial whole-plan implementation**, with compatibility infrastructure, high-risk type
containment, the declared-Svelte-floor repair, and Kernel/Input member decisions delivered. Evidence: E2 functional/type/package checks,
plus existing browser workload/growth evidence; not a production or all-toolchain guarantee.
Compatibility retirement: retained. Remaining exhaustive per-member review is explicit in M4; do not mark the
whole audit complete or claim that arbitrary future changes are safe merely because these checks pass.
