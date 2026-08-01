# Code Quality Pass

Improve code quality across `src/lib/` without changing public API or runtime
behavior. This is a Svelte 5 component library built on the
bond/atom/capability/preset architecture — respect those seams; don't invent new
abstractions. The five goals, in priority order, are **consistency**,
**reusability**, **composability**, **performance**, and **maintainability**.

Above all: **never introduce a re-rendering regression, and always reach for the
most efficient logic.** Correctness and the goals below are non-negotiable, but
every change must also preserve (or improve) reactive granularity — a "cleaner"
diff that widens an effect's dependency surface or remounts an element is a
regression, not an improvement.

## Ground rules

- **Survey before you touch.** Read `CLAUDE.md`, `docs/adr/`, and the memory
  index first. Several patterns are already the single source of truth
  (`mergeAtomProps`, `mergePresetProps`, `bondFactory`, `clamp`,
  `DisclosureState`, `defineBond`). Find code that _should_ use these but
  doesn't — that is the highest-value work.
- **Don't re-litigate** decisions already recorded as rejected (e.g.
  controlClass / defineContext / daysInMonth). No churn for its own sake.
- **Behavior-preserving only.** No public API changes, no runtime behavior
  changes. Keep diffs small and reviewable.
- **Skip `virtual/`** — it's unfinished and may be dropped.

## 1. Consistency

- Match the surrounding code's idioms, naming, and comment density. New code
  should be indistinguishable from the file it lives in.
- Apply the repo's own conventions uniformly:
  - preset resolved in `<script>`, never computed inline in the template;
  - never `createAttachmentKey()` in a `spread` getter (remounts the element);
  - never spread a rest-props proxy inside `$derived` (collapses fine-grained
    reactivity);
  - eagerly `void this.rows / this.columns` in the constructor to avoid the
    collection-getter derived trap.
- Normalize inconsistent component-part naming, prop shapes, and file layout so
  sibling components read the same way.
- Use the spec-derived type utilities (`BondOf`, `ViewOf`, `StateOf`) instead of
  ad-hoc `InstanceType` / `Bond & { state: X }` constructions.

## 2. Reusability

- Fold duplicated prop-merging, factory, and clamping logic into the existing
  SSOT helpers listed above.
- Promote genuinely-repeated patterns (3+ real occurrences with matching
  structure) into a shared helper — but resist premature abstraction; two
  lookalikes are not a pattern.
- Prefer composition over the existing seams (atoms, capabilities, `defineBond`
  parts) rather than bespoke one-off wiring.

## 3. Composability

The architecture is deliberately "lego": behavior should be assembled from small,
swappable units rather than hardcoded into roots. Lean into this — **especially
with capabilities**.

- **Prefer capabilities over bespoke wiring.** Cross-cutting behavior (trigger,
  focus, escape-stack, choreography, lifecycle) belongs on the capability seam,
  not duplicated in each root. Move stragglers onto it where one already exists.
- **Activate whole-bond.** Favor `useCapabilities(bond)` + `setup()` (returning
  a `Disposable` for LIFO teardown) over per-root `$effect` hooks. This is the
  preferred activation pattern; migrate per-root effects toward it.
- **Key by symbol.** Capability slots are `CapabilityKey<S>` symbols, not
  strings — preserve typed retrieval; keep private seams out of barrel exports.
- **Override by composition, not forking.** Use `decorateCapability` +
  `Capability.compose(prior)` to wrap/delegate (the dual of atom `behavior()`
  chaining); register the override _after_ the base. Don't copy-paste a
  capability to tweak it.
- **Compose bonds via `defineBond` parts** (flat composition) rather than
  re-implementing shared structure; reuse part atoms when fusing.
- Keep capabilities orthogonal and single-purpose so they stack cleanly; if two
  capabilities must know about each other, that's a design smell worth flagging.

## 4. Performance & re-rendering

Treat avoiding re-render regressions as a hard constraint, and prefer the most
efficient logic at every step.

- **Protect reactive granularity.** Keep `$derived`/`$effect` dependency sets as
  narrow as possible. Don't read more state than a computation needs, and don't
  funnel unrelated values through one effect.
- **Known footguns (do not introduce, fix where found):**
  - never spread a rest-props proxy inside `$derived` — it collapses
    fine-grained reactivity into one coarse dependency;
  - never `createAttachmentKey()` in a `spread` getter / reactive update — it
    remounts the element and re-fires lifecycle;
  - eagerly `void this.rows / this.columns` in constructors to avoid the
    collection-getter derived trap.
- **Compute at the right altitude.** Resolve presets and other invariants in
  `<script>` once, not inline in the template where they re-run per render. Hoist
  work out of hot paths (render bodies, loops, per-item callbacks).
- **Prefer keyed `{#each}`** with stable keys so lists patch instead of
  re-creating; lean on Svelte transitions over manual show/hide churn.
- **Choose the efficient algorithm/data structure.** Avoid O(n²) scans, repeated
  array rebuilds, and redundant `twMerge`/`cn` passes; reuse the memoized merge
  kernels and stabilized preset records rather than recomputing.
- **Preserve reference identity** where downstream `$derived`/memoization depends
  on it — don't return fresh objects/arrays from getters on the hot path.
- When in doubt, measure or reason explicitly about how often a piece of logic
  runs before changing it; flag any change whose render-frequency impact is
  unclear instead of guessing.

## 5. Maintainability

- Remove dead code, write-only state, and vestigial props.
- Tighten or correct types so intent is checkable, not just inferred.
- Eliminate Svelte-reactivity footguns and clarify any non-obvious code with a
  short comment explaining _why_, not _what_.

## Workflow

1. Produce a prioritized findings list **before editing**: `file:line`, the
   problem, the proposed fix, and a confidence level.
2. Apply trivial mechanical fixes directly; pause for approval on anything
   larger.
3. Verify each change: run the Svelte MCP autofixer on touched `.svelte` files,
   plus `npm run check` / lint / tests (whatever the repo provides).
4. Report what changed and what was deliberately left alone.
