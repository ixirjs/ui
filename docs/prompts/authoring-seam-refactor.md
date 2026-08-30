# Authoring-Seam Consolidation & Infrastructure Reorganization

## Mission

Refactor `@ixirjs/ui`'s internal authoring and runtime infrastructure so that:

1. Building a Bond or Atom family requires materially fewer functions and steps.
2. The infrastructure (`src/lib/shared/*`, the Kernel, preset resolution, the portal system) is
   reorganized into coherent, documented modules with clear ownership.
3. Performance does not regress on any existing gate, and the new structure makes future
   performance work easier — fewer layers to instrument, one canonical path to optimize.
4. Authoring DX measurably improves: one canonical way to write each kind of file, fewer imports
   and barrels, fewer concepts per file.

This is a **hard-cutover** refactor: new seams replace old ones, every call site migrates in the
same pass, superseded functions are deleted. Two surfaces are fixed points: the public package
surface (`@ixirjs/ui`, `src/lib/public`) stays stable, and **the Kernel rendering API is
preserved** — `Kernel.plan` / `Kernel.node` / `Kernel.element` / `Kernel.render` /
`Kernel.static` keep their signatures and semantics. The refactor removes the redundancy layered
around Kernel (duplicate authoring variants, re-stated steps, barrel fragmentation); it does not
redesign the rendering interface.

## Why now (current state, measured)

- The authoring surface spans ~25 seams across four import barrels (`$ixirjs/ui/shared`,
  `$ixirjs/ui/authoring`, `$ixirjs/ui/bond`, `$ixirjs/ui/components/atom`) — and the
  two most-used seams, `Kernel` and `definePart`, are deep imports the authoring barrel does not
  even export.
- The same conceptual descendant part is written **four different ways** across the library:
  `definePart(...)`; `Kernel.plan` + `Kernel.node`; `Kernel.plan` + `Kernel.node` +
  `Kernel.element`; and `Kernel.plan` + `Kernel.node` + a hand-rebuilt four-prop seam object
  (`collapsible-indicator.svelte` — the exact shape ADR 0009 set out to remove).
- Roots are written **two different ways**: `useRoot(...)` vs. Card's manual lifecycle
  (`Kernel.plan`, `$props.id`, `Object.defineProperty`, `CardBond.create`, `activateCapabilities`,
  `share`, `onDestroy` + `destroy`, `Kernel.node`, `Kernel.render` — 9 distinct functions and 11
  distinct concepts in one component).
- A simple bonded family's `bond.svelte.ts` (collapsible) takes 8 distinct functions and ~9
  distinct concepts; its root takes 5 functions and ~8 concepts (id seeding, controlled cells,
  thunk specs, `$preset` sentinel, the curried `Kernel.render(el)(el, …)` dispatch, …).

Every variant is a place a future perf lever must be applied N times instead of once.

## Scope

**In scope**

- Authoring seams: `defineBond`, `defineAtom`, `useRoot`, `bindBond`, `definePart`,
  `createAtomInstance`, `controlledProp`, and the Kernel chain (`plan` / `node` / `element` /
  `render` / `static`).
- Shared infrastructure: `src/lib/shared/bond`, `src/lib/shared/capability` (+ models),
  `src/lib/shared/authoring`.
- Kernel internals: `src/lib/components/atom/kernel/`, `…/atom/render/`, `…/atom/resolve/` —
  internal module structure and implementation only; the `Kernel.*` API itself is a fixed point
  (see Out of scope).
- Preset resolution: `src/lib/preset/`, `src/lib/context/preset.svelte.ts`, `mergeAtomProps` /
  `mergePresetProps` / `presetLayer` plumbing.
- Portal system: portal / teleport / portal-surface mounting infrastructure.
- Module reorganization with READMEs (`render/`, `resolve/`, `preset/`, `runes/` currently have none).
- Migration of ALL call sites: every family under `src/lib/components/`, the scaffold generator
  `scripts/scaffold.mjs`, tests, stories, and the seam documentation in `AGENTS.md` and the kernel
  README.

**Out of scope**

- The Kernel rendering API: `Kernel.plan` / `Kernel.node` / `Kernel.element` / `Kernel.render` /
  `Kernel.static` keep their names, signatures, and semantics. Target authoring shapes still
  render through the existing `Kernel.render(el)(…)` dispatch. Internal reorganization behind
  those entry points is fine; changing the interface is not.
- The public API of `@ixirjs/ui` (`src/lib/public`): `public-surface.spec.ts` +
  `docs/public-surface.snapshot.json` is the gate. A proposed public change is a design-report
  item requiring explicit approval, never a silent edit.
- Rendered output and behavior: byte-identical wherever the design does not explicitly claim
  otherwise (`bench:ssr` sha fingerprints are the proof).
- Styling/visual changes of any kind.

## Non-negotiable constraints

**Performance**

- Capture baselines FIRST, before touching code: `bun run bench:ssr` (µs/bytes/sha per layer),
  `bun run bench:growth` (exponent k per family), `bun run bench:lanes`, and current anchor-budget
  numbers. Save them to a file later phases diff against.
- After each implementation phase, ALL of these hold: `bun run check`, `bun run lint`,
  `bun run test:unit -- --run`, `bun run bench:growth` (k ≈ 1 everywhere), `bun run bench:ssr`
  (fingerprints identical wherever output is claimed unchanged, µs within noise),
  `anchor-budget.spec.ts` (budgets may only go DOWN), `resolve-count.svelte.spec.ts`, the
  lifecycle-seam specs, `root-identity-audit.spec.ts`, `growth-coverage.spec.ts`,
  `props-augmentation.type-test.ts`, `public-surface.spec.ts`.
- Bench discipline: rebuild bench apps before comparing (stale builds lie); ±15% thermal drift is
  normal — re-run before declaring a regression or a win; bench under the compiler version apps
  actually use.

**Settled decisions — honor them; cite the doc when a target shape touches one; never relitigate
from intuition**

- No on-demand Bond/Atom/capability init — measured and closed in
  `docs/research/on-demand-bond-init-2026-08.md`.
- The rendering lane is decided once, in `KernelNode`'s constructor, never in the render pass
  (`bench:lanes` escalated arm; `anchor-budget.spec.ts` pins it).
- Hydration-anchor diet rules — snippet dispatch over `{#if}`, the per-construct cost model —
  `docs/research/hydration-anchor-diet-2026-08.md`.
- Packet-vs-seam: a part that renders its own element passes `atom:` through the Kernel config and
  never pre-merges a `mergeAtomProps` packet — `docs/research/menu-item-atom-seam-2026-08.md`.
- Virtualization ships as a rune, not a capability —
  `docs/research/virtualization-decision-2026-07.md`.
- No component-specific fast paths — `docs/research/card-performance-options-2026-08.md`.
- The portal family keeps "portal" naming; "layer" only for elevation vocabulary.
- Borrow insights from other frameworks, never their APIs/naming/distribution — the adoption
  filter, `docs/research/architecture-review-2026-07.md` §3.0.

**Process**

- Never run long-lived processes (`vite dev`, `--watch`) in the foreground.
- Do not `git commit` unless explicitly asked.
- After modifying code, run `graphify update .`.

## Process

### Phase 0 — Recon & baseline (read-only + benches)

1. Build the seam relationship graph. Use graphify first (`graphify query`, `graphify path`,
   `graphify explain`; `graphify-out/wiki/index.md` for navigation), then verify against source.
   The graph must cover: every authoring/runtime seam, where it is defined, who calls it,
   call-site counts, and which barrel exports it.
2. Read, in order: the seam-rules document (`AGENTS.md` / `CLAUDE.md`), `docs/adr/0008-*.md` and
   `docs/adr/0009-*.md`, `src/lib/shared/*/README.md`, `src/lib/components/atom/kernel/README.md`,
   and the research docs cited above.
3. Capture and persist the perf baselines listed under Constraints.

### Phase 1 — Design report, then STOP

Produce `docs/research/authoring-seam-consolidation-<YYYY-MM>.md` containing:

1. **Seam inventory + relationship graph** from Phase 0.
2. **Per-seam verdict**: keep / merge-into-X / delete / relocate — one evidence line each.
3. **Target authoring shapes**: complete before/after code for four canonical files — a
   `bond.svelte.ts`, a root, a simple part, a logic-bearing part — with functions and concepts
   counted before and after. One canonical way per file kind: the four-way part split and the
   two-way root split must be gone, or the surviving exception justified in one paragraph with
   measurements. Every target shape renders through the unchanged Kernel API.
4. **Target module layout**: the new directory tree for `shared/`, `components/atom/`, `preset/`,
   and the portal infrastructure, one-line ownership per module, and which modules get READMEs.
5. **Migration map**: ordered implementation phases, each independently gate-able, with blast
   radius (files touched) per phase.
6. **Perf-risk register**: for each consolidation, which gate would catch a regression, and why
   the target shape cannot cost µs/anchors — or what it deliberately trades and where that is
   measured.
7. **Open questions** requiring user decisions.

**STOP HERE. Present the report and wait for explicit approval before any code change.**

### Phase 2..N — Implementation (only after approval)

- Execute the migration map phase by phase. Hard cutover per phase: migrate every call site,
  delete the superseded seam, run the full gate list, record the bench delta in the design doc.
- Keep auxiliary surfaces in lockstep within the same phase: `scripts/scaffold.mjs` emits the new
  shape; `root-identity-audit.spec.ts`'s binding-seam classification covers every new
  authoring-barrel export; the seam sections of `AGENTS.md`, the kernel README, and module READMEs
  describe only the new seams.
- Finish with `graphify update .`, a final full-gate run, and a before/after summary table:
  functions per file kind, concepts per file kind, barrels, µs, hydration anchors.

## Success criteria

**DX** (measure and report, before → after)

- Distinct functions to author: bond file (today 8), root (today 5; Card 9), simple part (today
  2–3), logic-bearing part (today 5).
- One canonical authoring path per file kind — grep proves no family still uses a removed variant.
- One authoring barrel exporting everything an author needs (`Kernel` and the consolidated
  part/root helpers included); no deep imports remain in family code.
- Every infrastructure module has a README stating what it owns.

**Performance**

- All gates green; anchor ratchet unchanged or lower; `bench:ssr` fingerprints identical where
  claimed; µs within run-to-run noise; growth exponents k ≈ 1.

**Future-perf leverage** (argued in the report)

- Fewer places a lever must be applied; name at least two concrete future optimizations the new
  structure turns from N-site into single-site changes.
