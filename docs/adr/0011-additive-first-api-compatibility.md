# ADR 0011: Additive-first API compatibility

## Status

Accepted by the maintainer through the API review/implementation plan. Applies to the adopted
current-worktree baseline, including pending popup consolidation; does not assert compatibility
with earlier published packages.

## Decision

[The API compatibility policy](../api/README.md) supersedes ADR 0008's pre-1.0 permission to remove
public APIs without compatibility paths. Package layering and the existing Kernel remain unchanged.

Supported APIs have no scheduled removals. Deprecation preserves availability and behavior. A
breaking exception requires explicit approval, affected-consumer evidence, migration and rollback.
Types reachable through stable props, snippets, callbacks and factory returns are part of that
contract even when their constructors are exported only from `/experimental`.

Each API change gets a today/tomorrow review: current consumer use, invariants, credible future
pressure, additive evolution path, and an unchanged consumer check. Keep the existing extension
points; do not add speculative extensibility or force a naming/composition migration.

## Enforcement

- Freeze emitted declarations and all resolved package entry exports in `docs/api/current-baseline.json`.
- Require exact before/after review records for declaration changes, not snapshot regeneration.
- Compile unchanged external consumers against baseline declarations and the actual candidate tarball;
  exercise packed SSR/hydration and behavior independently of repository aliases.
- Keep rendered-outcome, callback, accessibility, growth and performance gates.
- Record publication contracts immutably; do not overwrite historical name-only archives.

## Consequences and limits

Some inconsistent names and existing broad state/factory surfaces remain supported. Internal
refactors may request conservative declaration review even when semantically compatible. Neither
hashes nor type compilation prove behavioral equivalence. The baseline and fixtures must remain
review-protected; future cohorts supplement, not replace, them.

The first external rehearsal uses the installed toolchain and `skipLibCheck: true`, matching the
repository. Minimum-version and stricter declaration-checking claims require additional evidence.
See the policy's known gaps before claiming exhaustive or historical compatibility.

The continuation adds an isolated declared-minimum Svelte consumer to CI/prepublish. The checker,
ESM compiler/plugin and runtime resolve the same selected Svelte version; the CJS compiler alone
is insufficient evidence. See `docs/api/member-review.md` for the optional-parameter compiler
failure found and fixed without raising the peer minimum.
