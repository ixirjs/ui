# API compatibility contract

Status: additive-first policy, adopted for the current working-tree baseline. This is **not** a
claim that the baseline matches the published `1.0.0-alpha.48` package. Earlier release compatibility
has not been reconstructed. No removals are scheduled, including during the remaining alpha period.
This policy supersedes the pre-1.0 removal permissions in ADR 0008, not its package layering.

## What is supported

A public interface includes package paths, exported values **and types**, namespace parts,
component instance exports (`getBond`), bindable properties, generic inference, augmentation,
callbacks and timing, snippets and their reachable state, factory substitution, presets and keys,
rendering capabilities, documented DOM/ARIA/data output, lifecycle, SSR/hydration, dependencies and
performance guarantees. A class hidden from a facade can still be reachable through a snippet.
`@internal` comments do not retroactively revoke members already reachable from stable interfaces.

- Retain all supported baseline expressions, values, defaults, bindings and observable behavior.
- Retain current aliases, factory contracts and accepted custom renderers. Do not normalize names
  or remove `as`/`base`/motion to make an implementation cheaper.
- New optional props require a collision review: presets and custom renderers already consume flat
  consumer-defined names. Adding a prop can change behavior without causing a type error.
- Adding union members, required interface members, or stricter types is not automatically compatible.
  Test callers **and implementers**, including augmented props, generic wrappers and custom factories.
  Adding private/protected instance members to a formerly structural class introduces nominal typing
  and can reject object-based factory substitutes even when its public methods are unchanged.
- Prefer existing props, snippets, preset records and behavior models. No speculative plugin system,
  universal options object, or version prop on every component.
- Declare new state contracts independently of implementation classes. Do not derive stable member
  signatures from concrete implementations using `Pick`, `ReturnType`, or inferred class layouts.
  Existing exposed state members remain obligations; do not narrow return types to hide them.
- Preserve object identity, reactivity and ownership. A root owns its state and cleanup; standalone
  popup owners dispose their state. Do not insert a wrapper object merely to rename a state handle.
- `setPreset` remains request/subtree scoped; `installPreset` is module-global configuration only.
- `/experimental` remains explicitly experimental, but never demote an existing stable contract into
  it. Changes to experimental declarations also require visible review. Its classes reached through
  stable props/snippets are covered by the stable compatibility obligation.
- Deprecated means supported but not preferred. No time-based retirement; a breaking exception
  requires a separate explicit approval, affected-consumer analysis, migration and rollback plan.
- Security/accessibility corrections require behavioral review too; never silently call a material
  behavior change an implementation detail.

## Today / tomorrow review card

For every new or changed export, prop, callback, snippet member, factory, preset key or behavior:

1. **Today:** identify a real consumer expression and its current result. Include absence, `undefined`,
   empty values, repeated calls, controlled state and teardown where applicable.
2. **Invariant:** record ownership, timing, identity, typing, defaults and required quality.
3. **Tomorrow:** name one credible change pressure (new mode/provider, alternative implementation,
   new metadata, windowed data, nested host, new theme) rather than speculative flexibility.
4. **Evolution:** explain how that change remains additive; identify collisions and implementer risk.
5. **Check:** keep the old expression/trace runnable against the candidate, without editing it.

Do not implement tomorrow's hypothetical feature. Demonstrate that today's contract can survive it.
See [family evolution decisions](./evolution.md), the generated [entry inventory](./inventory.md),
[member-level review](./member-review.md), and [implementation status and remaining work](./implementation.md).
The full declarations, including each prop/method and namespace part, are in `current-baseline.json`.

## Checks and evidence

- `bun run check:api`: rebuild the package and compare its declarations/export manifest with the
  frozen baseline plus exact reviewed differences, including dependencies, package file selection,
  side-effect declarations and engine requirements. It is deliberately **conservative**: even an
  additive or representation-only declaration change requests review. It does not claim a general
  TypeScript semantic compatibility algorithm. Reachable internal declarations are included, so
  internal file moves can also request review.
- `bun run check:consumer`: rebuild and unpack the actual tarball outside repository aliases. Compile
  the frozen consumers against both baseline declarations and the candidate, and compare the entire
  unpacked declaration graph so omitted package files cannot escape the gate. Exercise packed SSR,
  hydration with recovery disabled, augmentation, custom factory/state identity, bindings, callback
  timing/equality, presentation, forms, virtualization and teardown. By default dependencies are the
  installed lockfile versions. After building, `node scripts/check-consumer.mjs --minimum` installs
  the declared Svelte minimum with isolated checker/compiler/plugin/runtime dependencies and repeats
  the rehearsal. CI and prepublish require both runs; this is not an exhaustive version matrix.
- The live migration example under `src/routes/docs/migration/examples/` supplies the displayed
  code in both human and LLM docs. It is compiled and exercised against the packed candidate.
  Current docs may adopt additive APIs; they do not replace or alter frozen old-consumer fixtures.
- Existing browser, E2E, SSR fingerprint, growth and styled workload tests remain independent gates.
  A declaration match cannot prove behavior, accessibility or performance compatibility.
- `bun run archive:surface`: archive the built publication contract under `releases/<version>.json`.
  An existing different archive is an error, even on retries; there is no `--force` escape hatch.
  This command is not proof that a version was actually published. Retain its record with the
  release commit/artifact. Name-only historical archives under `src/docs/migrations/surfaces` are
  retained as historical evidence, not overwritten or presented as authoritative shipped contracts.

### Reviewing a declaration change

Do not regenerate `current-baseline.json` or edit frozen consumer fixtures to obtain a green check.
It records the original adopted worktree. `reviews.json` records exact before/after SHA-256 pairs,
reason and repository-resolvable checks. No wildcard allowlist. A later change invalidates the
matching pair and needs another review. Review records are subject to normal code review; hashes
prevent accidental reuse, not a malicious maintainer rewriting repository history.

A review requires preserved consumer checks plus relevant behavioral/quality evidence. New APIs
also need a today/tomorrow card. Retain all prior baseline fixtures when adding a newer cohort.
The consumer hash registry may gain entries for additional fixtures, but existing entries and
consumer contents stay unchanged. New cohorts must compile against the adopted baseline when they
exercise baseline APIs. This distinguishes additional coverage from rewriting old expectations.
The `--initialize` operation can only create an absent baseline or verify the identical baseline;
it cannot overwrite. Protect baseline/fixture changes in repository review policy.

## Release lifecycle

Draft → classified → validated → published. A source, fixture, toolchain or baseline change makes
previous validation stale. Missing/failed evidence blocks the corresponding release claim. Release
records are immutable; publication is a separate human/release-system action. Deprecation does not
transition a supported API into removal. Recovery is a new candidate or rollback to the prior
artifact, not rewriting an archived version.

## Known gaps and limits

- The baseline is a worktree, not verified historical release evidence. External consumers are not
  inventoried; retain their possible factory/subclass contracts.
- `skipLibCheck: false` fails on the baseline's `InputTimeControl` declaration with TS2590 (union too
  complex). The rehearsal uses the repository's existing `skipLibCheck: true`. This is not a claim
  of compatibility with stricter declaration checking.
- The external consumer covers representative workflows, not every prop's semantic behavior. The
  declaration inventory is exhaustive over the resolved graph; per-member runtime characterization
  remains ongoing. Do not equate automatic inventory classification with a completed human review.
- Svelte 5.46.4 and installed 5.56.8 are exercised with TypeScript 5.9.3. Other framework/compiler
  versions, duplicate package copies, registry publication and multiple browsers need additional
  checks before making those support claims.
- A benchmark or existing snapshot is not automatically an immutable historical consumer trace.

Owners: API maintainer (contract/member coverage), release maintainer (history/artifacts), CI
maintainer (consumer/toolchain matrix), docs maintainer (example consistency). Open gaps block their
corresponding claims, not necessarily ordinary development.
