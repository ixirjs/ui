# Authoring-seam consolidation & infrastructure reorganization

**Date:** 2026-08-22 · **Status:** complete — all ten phases shipped · **Follows:** ADR 0008, ADR 0009

`@ixirjs/ui` renders fast — ADR 0009's Kernel and the 2026-08 perf passes did that. What did not
keep up is the authoring surface layered around it. This document records the measured starting
state, the target seams, the module layout, the migration order, and the perf-risk register.

---

## 1. Seam inventory

Counts exclude `*.spec.*` and `src/lib/test/**`.

| Seam                                                                 | Defined at                                   | Exported by                      | Sites                   | Verdict                                                                                                                  |
| -------------------------------------------------------------------- | -------------------------------------------- | -------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `defineBond`                                                         | `shared/authoring/define.svelte.ts:144`      | `shared/authoring` → `shared`    | 36                      | **keep** · relocate to `authoring/define-bond.svelte.ts`; its spec **types** move down to `bond/spec.ts`                 |
| `defineAtom`                                                         | `shared/bond/atom.svelte.ts:534`             | `shared/bond` → `shared`         | 8                       | **keep** · relocate to `bond/`                                                                                           |
| `bondContextKey`                                                     | `shared/bond/context.ts:2`                   | `shared/bond` → `shared`         | 11                      | **keep** · relocate to `bond/`                                                                                           |
| `useRoot`                                                            | `shared/authoring/use-root.svelte.ts:154`    | `shared/authoring` → `shared`    | 29 roots                | **merge** · absorbs the root's second `Kernel.element` call and card-root's hand-rolled lifecycle                        |
| `bindBond`                                                           | `shared/bond/bind.svelte.ts:267`             | `shared/bond` → `shared`         | **1** (only `use-root`) | **keep, demote** · stays the primitive, stays exported from `@ixirjs/ui/experimental`; not a family-facing seam          |
| `controlledProp`                                                     | `shared/bond/bind.svelte.ts:75`              | `shared/bond` → `shared`         | 45                      | **keep** · relocate to `bond/`, re-export from the authoring barrel                                                      |
| `connect`                                                            | option key on `useRoot`/`bindBond`           | —                                | 4 option sites          | **keep** · `calendar-root`, `popover-root`, `datagrid-row` need late wiring                                              |
| `definePart`                                                         | `components/atom/define-part.svelte.ts:69`   | **no barrel** — 35 deep imports  | 33 files                | **merge-target** · becomes the single descendant seam for all 82 bonded parts                                            |
| `createAtomInstance`                                                 | `shared/bond/use-atom.svelte.ts:44`          | `shared/bond` → `shared`         | 8                       | **keep** · the documented exception for repeated/virtual/polymorphic parts                                               |
| `mergeAtomProps`                                                     | `shared/bond/presentation-props.ts:48`       | `components/atom` **only**       | 15                      | **keep, relocate export** · the one crossed layering wire                                                                |
| `mergePresetProps`                                                   | same                                         | same                             | 50                      | **merge** · absorbed by `defineLeaf` at 43 of those sites                                                                |
| `generateId`                                                         | `shared/bond/identity.ts:10`                 | `shared/bond` → `shared`         | 11                      | **keep**                                                                                                                 |
| `getElementId`                                                       | `utils/dom.svelte.ts:1`                      | **no barrel**                    | 8                       | **keep in `utils/`, re-export** from the authoring barrel                                                                |
| `Kernel.plan` / `node` / `element` / `render` / `static` / `forward` | `components/atom/kernel/index.svelte.ts:591` | **no barrel** — 151 deep imports | 43/42/113/148/56        | **fixed point** · API unchanged; internals relocate to `kernel/`, and it joins the barrel as the documented escape hatch |

`presetLayer`, `activateCapabilities` and `capability()` are **not** standalone seams — they are
methods on `Bond`/`Atom` (`presetLayer(slot)`, `activateCapabilities(bond)`, `this.capability(…)`).
The capability factories are `capabilityKey`, `sharedCapabilityKey`, `defineCapability`,
`defineBondCapability`, `defineAtomCapability`, `partCapability`.

### Barrel fragmentation

| Barrel                      | Exports                                                                                          | Missing                                                              |
| --------------------------- | ------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------- |
| `shared/index.ts`           | `export *` of bond + capability + authoring + validation, plus `animate`/`DURATION`              | —                                                                    |
| `shared/authoring/index.ts` | `defineBond`, `useRoot`, 14 types                                                                | **`definePart`, `Kernel`**                                           |
| `shared/bond/index.ts`      | Bond/Atom runtime, `bindBond`, `controlledProp`, `Collection`, merge helpers                     | `presentation-props` (deliberately routed through `components/atom`) |
| `components/atom/index.ts`  | types, `componentBase`, `resolvePreset`, `mergeAtomProps`, `mergePresetProps`, lifecycle helpers | **`definePart`, `Kernel`**, and most of `resolve/`                   |

**The two most-used seams are in no barrel at all.**

### Call-site populations

Roots — 34 `*-root.svelte`:

| Style                                                      | Count |
| ---------------------------------------------------------- | ----- |
| `useRoot`                                                  | 27    |
| hand-rolled lifecycle (`card-root.svelte`)                 | 1     |
| delegating wrapper (renders another root with a `factory`) | 4     |
| bondless static root                                       | 2     |

`useRoot` is also used by 4 non-root files (`datagrid-column`, `datagrid-row`, `portals.svelte`,
`root.svelte`).

Descendant parts — 228 non-root `.svelte` under `components/`:

| Style                                                              | Count | Representative                           |
| ------------------------------------------------------------------ | ----- | ---------------------------------------- |
| (a) `definePart` only                                              | 33    | `card-footer`, `dialog-body`             |
| (b) `Kernel.plan` + `Kernel.node`                                  | 11    | `card-title`, `dialog-content`           |
| (c) `plan` + `node` + `element`                                    | 28    | `alert-close`, `calendar-body`           |
| (d) hand-rebuilt `{ atom, bond, preset, presetLayer }` seam object | 10    | `collapsible-indicator`, `field-control` |
| (e) bondless static leaf `Kernel.element(Kernel.static, …)`        | 43    | `button`, `badge`, `avatar`              |
| (f) no seam (stories, pure markup)                                 | 100   | —                                        |

**Five shapes for what is conceptually two jobs.** Styles (b)(c)(d) differ from (a) only by needing
`attrs` / `beforePreset` / `rest` / `eagerElement` / `context` / `message` — every one of which is
already a `KernelNodeOptions` field.

---

## 2. Baselines — captured 2026-08-22, before any code change

Machine: AMD Ryzen 9 PRO 8945HS w/ Radeon 780M Graphics ×16. Every gate green at capture.

### `bun run bench:ssr`

| layer       | µs/unit | gc    | B/unit | sha            |
| ----------- | ------- | ----- | ------ | -------------- |
| plain       | 0.23    | —     | 346    | `c637c8c7f82b` |
| cardroot    | 3.12    | 31.0% | 213    | `9dc883fba5fa` |
| card        | 9.56    | 26.4% | 607    | `49ce40f336cc` |
| collapsible | 35.72   | 20.3% | 572    | `7d60ee06ee0e` |
| datagrid    | 16.43   | 21.7% | 725    | `e217614d6dd2` |
| tree        | 51.87   | 20.3% | 569    | `460d99917901` |
| card-preset | 10.78   | 25.6% | 661    | `b66589e771fa` |
| menu        | 7.12    | 21.8% | 415    | `1463d698858e` |

**The eight `sha` values are the contract.** Every phase must reproduce them exactly unless the
phase explicitly claims and justifies an output change.

### `bun run bench:lanes`

| arm            | µs/card  | vs node   | anchors/card |
| -------------- | -------- | --------- | ------------ |
| element        | 8.88     | 1.116     | 8.00         |
| node           | 7.96     | 1.000     | 10.00        |
| direct         | 7.73     | 0.971     | 8.00         |
| **inlinePlan** | **7.26** | **0.912** | 8.00         |
| escalated      | 11.92    | 1.498     | 10.00        |

Gate: element arm ≤ 18.00 µs. **`inlinePlan` is the arm that prices `definePart` calling
`Kernel.plan` per instance instead of hoisting it to `<script module>` — and it is the fastest arm
on the board, 8.8% under `node`.** That is the empirical answer to the main perf objection against
consolidating styles (b)(c)(d) into `definePart`: per-instance `plan` is not a cost, because the
plan is memoized in a `WeakMap<definition, Map<slot\0as\0class>>` and the lookup is cheaper than the
indirection the hoisted constant introduces.

### `bun run bench:growth`

| family        | unit   | n=50    | n=100   | n=200   | n=400    | k        |
| ------------- | ------ | ------- | ------- | ------- | -------- | -------- |
| accordion     | item   | 16.9 ms | 41.3 ms | 82.0 ms | 230.5 ms | **1.26** |
| tabs          | tab    | 6.7     | 11.7    | 21.2    | 39.0     | 0.85     |
| tree          | node   | 11.1    | 20.0    | 37.0    | 69.0     | 0.88     |
| datagrid      | row    | 7.8     | 14.2    | 24.7    | 51.0     | 0.90     |
| dropdown-menu | item   | 4.6     | 7.5     | 13.7    | 23.9     | 0.79     |
| select        | option | 7.1     | 10.3    | 18.7    | 33.1     | 0.74     |
| stepper       | step   | 7.7     | 14.3    | 26.7    | 54.1     | 0.94     |

Accordion's 1.26 is the recorded known defect with an open cause — **not a target of this refactor,
and its baseline entry must never be raised.**

### `bun run bench:lazy-kernel`

| arm     | µs/card | Δ ceiling | anchors/card |
| ------- | ------- | --------- | ------------ |
| ceiling | 7.45    | 0.00      | 9.0          |
| lazy    | 8.56    | 1.11      | 9.0          |
| current | 11.90   | 4.44      | 19.0         |

This is the bench that watches barrel-induced module-graph eagerness in phase 4.

### Hydration anchors — `anchor-budget.spec.ts`

card 20 · card+preset 19 · collapsible 16 · datagrid row 20 · menu item 9 · transition leaf 4
(both arms) · lane node 10 · lane escalated 10 · plain 1 · card-in-`<Root>` 19 · fast-root 9.

A ratchet: these may only go **down**.

### Suite

`bun run check` — 6194 files, 0 errors, 0 warnings.
`bun run lint` — clean.
`bun run test:unit -- --run` — **193 files, 1103 tests, all passing.**

---

## 3. Target authoring shapes

Kernel's API is a fixed point throughout. Every shape below still ends in the same dispatch:
`{@render Kernel.render(handle)(handle, children, arg)}`.

| File kind                                                     | Functions before → after | Concepts before → after |
| ------------------------------------------------------------- | ------------------------ | ----------------------- |
| Bond file (`collapsible/bond.svelte.ts`)                      | 8 → 8                    | 12 → 12                 |
| Root (`collapsible-root.svelte`)                              | 5 → 1                    | 12 → 6                  |
| Root, hand-rolled (`card-root.svelte`)                        | **12 → 1**               | **14 → 6**              |
| Simple part (`card-footer.svelte`)                            | 1 → 1                    | 3 → 3                   |
| Logic-bearing part (`collapsible-indicator`, `field-control`) | 3–5 → 1                  | 10–14 → 6               |
| Static leaf (`button.svelte`)                                 | 3 → 1                    | 6 → 2                   |

**The bond file does not change.** It is the one file kind where the concept count is irreducible:
each of its 12 concepts (atom slot strings, `attrs` projection, capability registration order,
trigger↔content roles, context capture for nesting) names a distinct decision the author is
genuinely making. Collapsing them would be hiding the family's semantics, not its ceremony.

### Root — `useRoot` returns the renderable handle

Before (`card-root.svelte`, 111 lines, 12 functions): `$props.id()`, `Object.defineProperty`,
`CardBond.create`, `activateCapabilities`, `share`, `onDestroy`, `destroy`,
`hasCapabilityTeardown`, `nodeIdByRole`, `Kernel.plan`, `Kernel.node`, `Kernel.render` — plus
`onclick`/`onkeydown` written **twice**, once in `source` and once in `attrs`.

After:

```svelte
const root = useRoot(CardBond, { disabled: [() => disabled, (v) => (disabled = v ?? false)] }, {
	id: () => ID, preset: () => preset, factory: () => factory,
	class: 'card bg-card border-border flex flex-col overflow-clip rounded-lg border shadow-sm',
	rest: () => restProps,
	beforePreset: () => (disabled ? 'opacity-50 cursor-not-allowed' : ''),
	attrs: () => ({ role: …, tabindex: …, 'aria-labelledby': root.bond.nodeIdByRole('label'), … })
});
export const getBond = root.getBond;
```

```svelte
{@render Kernel.render(root)(root, children, { card: root.bond })}
```

Internally `useRoot` mirrors `definePart`'s declared-Atom branch: `Kernel.plan` →
`Kernel.node(plan, props, { bond, … })` → `Kernel.element(node, node.elementConfig)`, built **once**.

### Part — one seam for all 82 bonded parts

`definePart` forwards `attrs` / `beforePreset` / `rest` / `context` / `message` to `Kernel.node` and
keeps `eagerElement: plan.synthesized`. The 10 hand-rebuilt `{ atom, bond, preset, presetLayer }`
objects are exactly what passing the node to `Kernel.element(part, …)` already does —
`dialog-close.svelte` proves it in the current tree. Pure legacy; delete.

### Leaf — `defineLeaf`

`defineLeaf(() => props, { as, class, preset })` wraps `Kernel.element(Kernel.static, …)` with the
preset merge inside the config thunk.

### The surviving exception, justified

Roots that hand props to **another component** rather than rendering an element — `Dialog.Root` →
`PortalSurface` and three siblings — keep `mergeAtomProps(root.atom, preset, …)`. They have no
renderer seam to forward a handle through, so `useRoot`'s `atom`/`props` accessors stay a permanent
superset rather than a deprecated path. Four files, and the alternative is inventing a packet seam
for them, which is the thing ADR 0009 removed.

---

## 4. Target module layout

`src/lib/shared/**` and `src/lib/components/atom/**` both disappear.

```
src/lib/
├─ bond/          Bond/Atom runtime, binding, identity, declaration metadata      README
│    bond · atom · bind · use-atom · collection · node-registry
│    capability-registry · identity · context · merge · presentation-props
│    spec.ts        ★ BondSpec/AtomSpec/AtomConstructor types
│    declaration.ts ★ was shared/authoring/metadata.ts
├─ capability/    Capability protocol + models — verbatim move                    README
├─ kernel/        Declaration + props → markup                                    README
│    was components/atom/{kernel,render,resolve,presentation,snippet,types}
├─ authoring/     ★ NEW. The four seams. Zero inbound edges.                      README
│    define-bond · use-root · define-part · define-leaf · index.ts
├─ preset/        Preset shape, defaults, manifest + context (was context/)       README
├─ validation/    verbatim move                                                   README
├─ utils/         + animate.ts (was shared/animation.ts); getElementId stays
├─ runes/ attachments/ icons/ types/ constants/    unchanged
├─ components/    families only; portal/ unchanged
└─ public/        fixed point
```

| Module               | Owns                                                       | Boundary rationale                                                                                                                                   |
| -------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bond/`              | Bond/Atom runtime, binding, identity, declaration metadata | The only module that knows what a _definition_ is; everything above reads it, it reads nothing above.                                                |
| `capability/`        | Capability protocol + state models                         | Separate vocabulary, separate test surface; mutually recursive with `bond` by design — a **co-layer**, not a layer.                                  |
| `kernel/`            | Turning a declaration + props into markup                  | One module, one question. `render/` and `resolve/` were already private to Kernel with no independent consumers.                                     |
| `authoring/`         | The four seams a family author calls                       | Highest infra layer, **zero inbound edges** — that is what makes "one barrel, no deep imports" mechanically enforceable.                             |
| `preset/`            | Preset shape, defaults, manifest, and its context          | `src/lib/context/` held exactly one thing and it was the preset context; a directory for one file is a boundary that is not there.                   |
| `utils/`             | Framework-free helpers                                     | Already correct. `getElementId` stays (8 non-authoring callers) and is re-exported. `animate` lands here rather than in a two-file `motion/` module. |
| `components/portal/` | The Portal family                                          | **Not moved.** It is a public component family; the only infra-looking part (`layering/z-layer`) has one out-of-family importer.                     |

### Layer DAG — every edge runs down

```
L0  utils · preset · validation
L1  bond ◄──► capability        (mutual, pre-existing, by design)
L2  kernel        → bond, preset, utils
L3  authoring     → kernel, bond, capability, preset
L4  components/*  → authoring ONLY
L5  public/**
```

**One forced placement.** `useRoot` returning a handle creates `authoring → kernel`. Kernel needs
`resolveBondPart` / `missingRootMessage` and the spec types. Leaving those in `authoring/` would be
a **value** cycle — `Kernel.plan` calls `resolveBondPart`, and `useRoot` calls `Kernel.plan` — not
the tolerable type-only kind. So `metadata.ts` → `bond/declaration.ts` and the spec types →
`bond/spec.ts`. Both are native to L1: `metadata.ts`'s only upward import today is type-only.

Cycles deliberately **not** created: `resolve/preset.ts` stays in `kernel/` (it consumes a preset to
produce classes; it does not define one); `presentation-props.ts` stays in `bond/`; `getElementId`
stays in `utils/` and is re-exported, not moved. `bond ↔ capability` stays mutual and is documented
in both READMEs rather than "fixed" — breaking it needs either an injection registry or moving
`Atom` into `capability/`, both net additions against a cycle that has never caused a failure.

**A lint rule is what makes the barrel real rather than prose** (`eslint.config.js`, ~15 lines):
`src/lib/components/**` may import `$ixirjs/ui/authoring` but not `$ixirjs/ui/authoring/*`,
`$ixirjs/ui/kernel*`, or `$ixirjs/ui/bond*`.

---

## 5. Migration map

Every phase ends green on: `check`, `lint`, `test:unit --run`, `bench:ssr` (fingerprints identical),
`bench:growth` (k≈1), `bench:lanes`, `anchor-budget`, `resolve-count`, the lifecycle-seam specs,
`root-identity-audit`, `growth-coverage`, `props-augmentation`, `public-surface`.

**Phases 1–3 are pure moves and re-exports.** A fingerprint diff there is unambiguously a mistake,
never an accepted trade. Phases 4–8 are behavior, ordered by ascending blast radius.

| #   | Goal                                                                                                                                          | Blast radius           | Catching gate                                                                                   |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | ----------------------------------------------------------------------------------------------- |
| 0   | ✅ **DONE** — baselines (§2), then the six doc-rot fixes (§7)                                                                                 | 0 source · 6 docs      | —                                                                                               |
| 1   | ✅ **DONE** — split `metadata.ts` → `bond/declaration.ts` + `bond/spec.ts`                                                                    | 15 source              | `check` (cycle), `bench:ssr` must not move at all                                               |
| 2   | ✅ **DONE** — `shared/{bond,capability,validation}` → top level; `animation.ts` → `utils/animate.ts`; `context/` → `preset/context.svelte.ts` | 197 files, path-only   | `public-surface`, `bench:ssr`, `check`                                                          |
| 3   | ✅ **DONE** — `components/atom/**` → `kernel/`; `define-part` + `shared/authoring/` → `authoring/`; the barrel; both audit specs rewritten    | 245 files, path-only   | `kernel-authoring-audit`, `root-identity-audit`, `bench:ssr`, `bench:lanes`                     |
| 4   | ✅ **DONE** — families switch to the single barrel; `shared/` and `components/atom/` deleted; lint rule → **error**                           | 295 family files       | `lint`, **`bench:lazy-kernel`**, `bench:growth`                                                 |
| 5   | ✅ **DONE** — `defineLeaf` + 26 static leaves migrated; 11 keep the explicit seam with cause                                                  | 1 new · ~45            | `bench:ssr`, `resolve-count`, `anchor-budget`                                                   |
| 6   | ✅ **DONE** — `definePart` absorbs (b)(c)(d); 63 parts on the seam; style (d) gone                                                            | 1 · ~49                | `bench:ssr` per family, `lifecycle-seam`, `component-composition`                               |
| 7   | ✅ **DONE** — `useRoot` returns the handle; all 27 roots migrated                                                                             | 1 · 27                 | `root-identity-audit`, `bench:ssr` cardroot layer, `family-ssr`, `control-ssr`, `anchor-budget` |
| 8   | ✅ **DONE** — card-root onto `useRoot`; hand-rolled lifecycle deleted                                                                         | 1                      | `bench:ssr` `card` sha, `anchor-budget` card=20, `atom-part-lifetime`, `atom-ssr-lifecycle`     |
| 9   | ✅ **DONE** — shims and dead dirs deleted; six READMEs; AGENTS.md; scaffold + spec; ratchets                                                  | ~10 deletions · 8 docs | `check`, `public-surface`                                                                       |

### Phase 1 result — 2026-08-22

`shared/authoring/metadata.ts` split into `shared/bond/declaration.ts` (the reader) and
`shared/bond/spec.ts` (the declaration types, lifted out of `define.svelte.ts`). All 12 importers
repointed; `define.svelte.ts` re-exports the types so the authoring barrel's surface is unchanged.

**The shim was written and then deleted in the same phase** — once every importer was repointed it
had zero references, and a shim nothing imports is dead code, not a rollback aid. The shims that
earn their keep are the barrel-level ones in phases 2–3.

`bond/` now imports nothing from `authoring/`. One `kernel → authoring` edge remains and is
**deliberate**: `SpecOf`/`AtomsOf` read the phantom type `defineBond` stamps on its result, so they
are authoring's to own. It is `import type`, therefore erased — not the value cycle the split
existed to break. `AtomInstance`/`BondSpec` were repointed to `bond/spec.ts`.

Gates: `check` 6195 files / 0 errors · `lint` clean · 193 files / 1103 tests passing ·
**all eight `bench:ssr` fingerprints byte-identical.**

One process note worth carrying: the first `bench:ssr` run after this phase **failed** its GC-share
gate on `menu` (24.0% vs 23.5%) with every layer's µs up 10–15% together. That uniform shift is the
drift signature, not a regression — a type-only move cannot change GC behaviour. A cooldown and
re-run came back green (menu 7.21 µs, gc 22.7%) with fingerprints unchanged. Re-run before
believing a bench failure whose numbers all moved the same direction.

### Phase 2 result — 2026-08-22

`git mv` for `shared/{bond,capability,validation}` → top level, `shared/animation.ts` →
`utils/animate.ts`, and `context/{preset.svelte.ts,preset.spec.ts}` → `preset/context.{svelte,spec}.ts`
with `context/index.ts` deleted. 193 files rewritten by one path sweep, plus 4 stragglers the sweep
could not see: three relative imports inside moved files and one `$lib/`-aliased import in
`src/stories/`. **A path sweep keyed on the package alias misses `$lib/` and `./`** — check both.

The three moved directories used absolute aliases exclusively (zero `../../` escapes), which is why
the move was mechanical. Their READMEs travelled with them and had their link depth corrected.

`shared/index.ts` is now a **barrel shim** re-exporting the new locations. This is deliberate: the
91 family files importing `$ixirjs/ui/shared` do not churn in this phase, then repoint **once** in
phase 4 to the authoring barrel. Rewriting them here and again in phase 4 would be double churn for
no intermediate benefit. `public/shared.ts` needed no repointing — it imports through the barrel.

`bond/` and `capability/` import nothing from `shared/`, `components/` or `authoring/`. Layers L0–L1
of the target DAG are real.

Gates: `check` 6194 / 0 errors · `lint` clean · 193 files / 1103 tests passing ·
**all eight `bench:ssr` fingerprints byte-identical**, gate OK.

### Phase 3 result — 2026-08-22

`components/atom/{kernel,render,resolve,types,presentation,snippet}` → `kernel/`;
`components/atom/define-part.svelte.ts` and all of `shared/authoring/` → `authoring/`, with
`define.svelte.ts` renamed `define-bond.svelte.ts`. 245 files rewritten. `components/atom/index.ts`
and `shared/index.ts` remain as barrel shims so family code does not churn until phase 4.

**`src/lib/authoring/index.ts` now exists** — 1 barrel, ~50 exports, named re-export form only.

Two findings from this phase, both about tests that were not testing anything:

1. **`kernel-authoring-audit.spec.ts` was green and guarding nothing.** It tested for four module
   paths (`components/atom/html-atom`, `part-element`, `use-part-element`,
   `shared/authoring/use-part`) and two call shapes (`usePartElement(`, `partElement(`) — every one
   of them already deleted from the library. Its `RENDER_MACHINERY` exception named a file that had
   also moved out of the scanned tree. A spec whose offender set is unreachable is a green light
   wired to no sensor. Replaced with two **ratchets** on things that exist: family files deep-importing
   infrastructure (ceiling **148**, → 0 in phase 4) and family files calling `Kernel.` directly
   (ceiling **145**, → down in phases 5–8). This is also where decision §8.2's ratchet landed.

2. **`root-identity-audit.spec.ts` fails closed, and proved it.** Repointing `AUTHORING_BARREL`
   surfaced 22 unclassified value exports; the barrel went from 3 to ~25. All 22 are
   `NON_BINDING` — declaration-time (`defineBond`, `defineAtom`, `Bond`), descendant seams that
   resolve a Bond from context but never construct one (`definePart`, `Kernel`,
   `createAtomInstance`), a prop cell adopted by `useRoot` (`controlledProp`), and presentation
   helpers. Its export scanner is a **regex over source text**, so the doc comment in the new barrel
   containing a named-re-export example was parsed as a real export named `x`. Reworded. Worth
   knowing before writing prose in any file that spec reads.

**The ESLint deep-import rule could not land in "warn" as planned.** `no-restricted-imports` takes
one severity per rule instance, and the block already declares the `@ixirjs/ui` pattern at `error`;
a second severity for a second pattern is not expressible. The rule lands at `error` in phase 4,
once the families it would flag are migrated — and the deep-import ratchet above guards the gap,
which is what the warn stage was for. The rule's `files` glob was updated for the moved directories.

Gates: `check` 6194 / 0 errors · `lint` clean · 193 files / **1104** tests passing (the ratchet spec
adds one) · **all eight `bench:ssr` fingerprints byte-identical** · `bench:lanes` OK, element arm
9.66 µs against an 18.0 budget, and **`inlinePlan` remains the fastest arm (7.87 vs `node` 8.33)** —
the per-instance `Kernel.plan` finding holds after the move.

`bench:ssr` again failed once on a GC-share gate (collapsible 23.2% vs 23.1%) immediately after the
test suite, then passed on a cold re-run with identical fingerprints. Second occurrence of the same
pattern; see the phase 1 note.

---

### Phase 4 result — 2026-08-22

**295 family files now import from one barrel.** A migration script split each import by
destination rather than blanket-swapping paths — `$ixirjs/ui/shared` re-exported the capability
catalogue as well as the seams, so those names had to route to `$ixirjs/ui/capability` instead.

Deep-path imports from family code went **148 → 7**, and both dissolved directories were deleted
outright: `src/lib/shared/` and `src/lib/components/atom/`. Neither needed to survive to phase 9 —
once every importer was repointed they held nothing.

**The seven survivors are named, not counted.** `element/{html,svg}-element.svelte`,
`input/shared.ts`, `popover/bond.svelte.ts`, `slider`, `switch`, `textarea-input` consume Kernel
internals (`createPresentation`, `extractMotion`, the element branches, `resolveBondPart`) that are
render machinery, not authoring seams. Promoting them into the barrel to satisfy a lint rule would
publish the machinery as though a family were meant to call it. A bare ceiling of "7 is fine" would
also let the next offender slot into the allowance unnoticed, so `kernel-authoring-audit.spec.ts`
lists them by name and has a **second test that fails when a listed file stops needing its
exemption** — an allowance that only ever grows is the failure mode being avoided.

**One real layer violation found and fixed:** four `kernel/` files and `preset/types.ts` imported
`Bond` from the `$ixirjs/ui/shared` barrel, which re-exported `authoring` — i.e.
`kernel → shared → authoring → kernel`. Type-only, so no runtime cycle, but it routed a low layer
through a high one. Repointed to `$ixirjs/ui/bond`.

**Two barrels, one division.** Capability models are deliberately _not_ re-exported from
`authoring`: ~284 names would make importing `definePart` reach the whole behavior catalogue, which
is the module-graph eagerness the barrel rules exist to prevent. The rule is now
**`authoring` is how a part is built, `capability` is how it behaves** — both top-level barrels,
neither a deep path.

`scripts/scaffold.mjs` was updated in the same phase and **verified by generating a real family and
typechecking it**, not by reading the template: all four emitted file kinds now open with a single
`$ixirjs/ui/authoring` import. (The generated docs page's missing `props.ts` is expected — `sync:props`
emits it, which is why scaffold prints that as next step #1.) The probe family was then removed.

The ESLint rule landed at `error` with the same seven files listed as `ignores`, cross-referenced to
the spec so the two lists cannot silently diverge.

Gates: `check` 6192 / 0 errors · `lint` clean · 193 files / 1105 tests · **all eight `bench:ssr`
fingerprints byte-identical** · `bench:growth` gate OK · `bench:lazy-kernel` shows **no barrel
eagerness**: all three arms rose ~14% together on a warm machine, but the ratios that matter
_improved_ — `lazy/ceiling` 1.149 → 1.086, `current/ceiling` 1.597 → 1.550, anchors unchanged at
9/9/19. Read that bench as ratios, not absolutes; it has no gate of its own.

---

### Phase 5 result — 2026-08-22

`defineLeaf` added and **26 static leaves migrated**. It is `definePart`'s shape with the Bond
removed — the two seams differ in what they render, not in how they are called.

**The measurement the plan asked for, taken before writing the seam:** `useKernelElement` already
wraps the config thunk in `const props = $derived(config())` — its own comment states "One config
call per invalidation, shared by every axis below", and the server path is one plain call. The
per-leaf `$derived(mergePresetProps(…))` cell was therefore a **second signal caching what Kernel's
own already caches**. Merging inside the thunk runs exactly as often, for one signal fewer per leaf.
The claim is measured, not assumed.

`mergePresetProps` itself also mostly dissolves: it is
`{ preset: preset ?? key, ...stripDefaults(rest) }`, and Kernel already reads `preset` off the config
and already splits rich render props from attributes. The only irreducible part is the default-key
fallback, which is one line in `defineLeaf`.

#### The population was not what recon said

"43 static leaves" was wrong in a way worth recording. Of 46 `mergePresetProps` call sites:

- **13 hand props to another component** (`<Trigger>`, `<Divider>`, `Input.Control`, …) rather than
  rendering an element. Those must **keep** `mergePresetProps` — it is the packet-vs-seam rule from
  `menu-item-atom-seam-2026-08.md`, and converting them would have been a regression dressed as
  consistency.
- **26 render their own element** and migrated.
- **11 render their own element and deliberately did not migrate** — see below.

#### Why 11 leaves keep the explicit seam

Seven (`divider`, `image`, `list-group`, `list-item`, `qr-code`, `slider`, `switch`) compose a
**conditional class array** rather than a string literal. `defineLeaf`'s `class` option is
deliberately typed `string`, because `kernel/resolve/classes.ts` caches merges keyed on
`userClass[0]` and **stores nothing that is not a flat array of strings** — nested arrays, clsx's
object form and class functions are all skipped. Accepting a `ClassValue` there would nest the array
and silently drop those leaves out of the merge cache. That is a measured constraint in the file's
own header, not a style preference.

The other four (`checkbox`, `radio`, `date-picker-calendar`, `input-file-control`) interleave motion
(`enter`/`exit`) and presetLayer entries through the config in an order that does not survive being
split into options. Forcing them through would mean growing `defineLeaf` an option per shape until
it is a config language — the abstraction looking for work.

#### Three real defects the gates caught

1. **Own props leaked onto the DOM.** Reconstructing a leaf's destructured props into the thunk —
   `() => ({ ...restProps, color })` — put `color="#336699"`, `src="" alt=""` and
   `keys="Ctrl,K" separator="+"` on rendered elements. A prop is destructured _precisely so it does
   not reach the element_; only `restProps` may cross. Caught by `family-ssr` and `control-ssr`
   snapshots, which is exactly the "a moved element snapshot is a defect, not an update" rule
   earning its keep.
2. **A dropped `as` default.** `list-root` rendered `<div>` instead of `<ul>` because `as` appeared
   as an object shorthand rather than `as:` and was routed into `attrs`. Caught by the `list`
   snapshot. Every migrated leaf's `as` default was then audited against `git show HEAD:` — one
   mismatch, fixed.
3. Neither would have been visible in `bench:ssr`: `plain`/`card`/`menu` contain none of these
   leaves. The snapshot suite is the gate for this phase, not the fingerprints.

Gates: `check` 0 errors · `lint` clean · 193 files / 1105 tests · **all eight `bench:ssr`
fingerprints byte-identical** · `bench:lanes` OK (element arm 8.86 µs).

---

### Phase 6 result — 2026-08-22

**The seam change is done and proven; the call-site sweep is partial.**

`definePart` now forwards `attrs` / `beforePreset` / `rest` to `Kernel.node`. Their absence was the
entire reason a part with logic of its own had to hand-write three Kernel calls — the split was
never about logic, it was about three options this seam did not pass through. Options are spread
conditionally rather than set to `undefined`: `KernelNodeOptions` is read under
`exactOptionalPropertyTypes` and `prepare()` tests `attrs === undefined` to pick the plain-attr lane.

**`definePart` is now generic over the definition.** `DefinedPart.bond` was a bare `Bond`, which was
invisible while only presentation-free parts used the seam — they pass `bond` into a snippet argument
and never call anything on it. The first logic-bearing conversion broke on
`bond.stageOpenChange(...)`, and the call-site fix would have been a cast, discarding exactly the
checking that catches a renamed Bond method. Fixed at the seam; all 36 existing call sites keep their
types.

Converted so far:

- **All 8 style-(d) hand-rebuilt seam objects.** `Kernel.element({ atom: part.atom, bond, preset,
presetLayer }, cfg)` is the longhand spelling of `Kernel.element(part, cfg)`. Passing the node also
  keeps `atom` **lazy** — the object literal read `part.atom` eagerly, materializing the Atom at init,
  which is the one thing the lazy-node design exists to avoid.
- **Card's three own-element parts** (`title`, `header`, `body`) from `plan`+`node` to `definePart`.
  All three are synthesized slots, so `definePart` returns the node and the lane is unchanged.
- **`dialog-close`**, the hardest shape in the population and AGENTS.md's logic-bearing exemplar:
  handlers, a `$derived`, `defaults`, a snippet body. It now reads as a plain part with one option.

Two traps found converting it, both worth stating before the remaining sweep:

1. **TDZ.** `definePart` resolves its element during init and reads the props thunk _then_, so
   everything the thunk names must already be initialized. A `$derived` the config references must
   precede the call. Function declarations hoist, so handlers do not care. Getting this wrong is a
   crash at mount, not a type error.
2. **A dropped `class`.** Leaving `class: klass = ''` in the destructure removes it from `restProps`,
   so the consumer's class never reaches the composed array and is **silently lost**. ESLint caught
   it only because `klass` then became unused — in a file that also uses `klass` elsewhere, nothing
   would have. Any conversion must either drop `class` from the destructure or pass it back in the
   thunk.

#### Completed sweep

All 27 remaining parts were converted. **63 parts now author through `definePart`** (was 33) and
**26 leaves through `defineLeaf`**. Element-building Kernel calls in family code went **89 → 61**.

The ordering problem turned out to have exactly two shapes, and telling them apart is the whole
skill:

- **Not a cycle** — a `$derived` reads the Bond but only feeds a _function_ (a default `animate`, a
  motion driver) or the template. `definePart` first, then `const bond = el.bond`, then the
  `$derived`. Runtime never cared (a `$derived` is lazy); only TypeScript's TDZ analysis did.
- **A real cycle** — the value feeds the _config itself_, or `beforePreset`, which is an option of
  the very call that would produce the handle. `field-control` (`name`), `accordion-item-body`
  (bound `onmount`), `select-selection` (`_base`), `tab-header` (`disabled`), `step-indicator`,
  `drawer-content`, `collapsible-indicator`, `tree-indicator` are all this. **The fix is the same
  every time and it is not a workaround: read the Bond from context** —
  `CollapsibleBond.getOrThrow()`. The Bond never depended on the part; it comes from context either
  way, and `stepper-header` was already written that way.

#### Conditional classes go through `beforePreset`

Four parts compose `[literal, conditional, '$preset', klass]`. That is exactly
`[plan.class, beforePreset(), '$preset', source.class]`, so `beforePreset` is not a workaround here
either — it is the slot. Each returns a **single string** rather than an array, so the class array
stays a flat array of strings and remains eligible for `kernel/resolve/classes.ts`'s merge cache,
which stores nothing else. (Same constraint that kept seven `defineLeaf` candidates on the explicit
seam.) `step-indicator`'s two adjacent literals were joined into `plan.class`; clsx flattens them
into one string before `twMerge` either way, so the merged output is unchanged.

#### What legitimately still calls Kernel (61 files)

Eight **hand props to another component** (`Stack.Root`, `Input.Control`, `PortalHost`) and own no
element — the packet case, correct as written. `datagrid-footer` composes
`['$preset', klass, 'contents']`, putting a literal _after_ the consumer's class, an order the seam
cannot express. `card-root` is phase 8. The rest is `Kernel.render`, the canonical dispatch.

**The ratchet was measuring the wrong thing and is fixed.** It counted every `Kernel.` and sat at
151 — a number that could never fall, because `Kernel.render(handle)(…)` ends every part. A ceiling
that cannot be reached measures nothing, which is the same defect as the vacuous spec this file
already replaced once. It now counts `plan`/`node`/`element`/`static` only, seeded at **61**.

#### A typing hole closed rather than cast past

`DefinedPart.bond` was a bare `Bond`, invisible while only presentation-free parts used the seam.
The first logic-bearing conversion broke on `bond.stageOpenChange(...)`. `definePart` is now generic
over the definition **and overloaded on `context`** — `'optional'` yields `B | undefined`, the
default yields `B`, mirroring `Kernel.node`. Without the overload every logic-bearing part would
carry a `!` on each Bond read, which is a cast in exactly the place a genuinely bondless part most
needs checking.

#### Two more silent-loss traps, both caught by gates

- **A dropped `class`.** Leaving `class: klass = ''` in the destructure removes it from `restProps`,
  so the consumer's class never reaches the composed array. ESLint caught it only because `klass`
  became unused — in a file using `klass` elsewhere, nothing would have.
- **A clobbered destructure.** A blanket destructure rewrite dropped `calendar-body`'s `outsideDays`
  prop. `check` caught it; the file was restored from HEAD and converted by hand. Note that
  `git checkout` on a single file also reverts its phase-3/4 import migration — re-apply both.

Gates: `check` 0 errors · `lint` clean · 193 files / 1105 tests, **every SSR snapshot unmoved** ·
**all eight `bench:ssr` fingerprints byte-identical** · `bench:lanes` OK (element arm 9.43 µs) ·
`bench:growth` gate OK, `k ≈ 1` everywhere, accordion's known defect unmoved at 1.23.

---

### Phase 7 + 8 result — 2026-08-22

`useRoot` gained `class` / `as` / `props` / `beforePreset` / `variantProps` / `spreadProps` / `attrs`
and now returns a renderable handle. **All 27 roots migrated**; zero call `Kernel.element(root, …)`.
`card-root`'s hand-rolled Bond lifecycle is gone — 12 functions to one call.

Three of the new options exist because a call site could not express the thing any other way, and
each replaced a back-reference that read `root` inside its own initializer:

- `variantProps: true` for `variantProps: root.props`. **Not** made automatic: handing variant
  inputs to every root would silently change what a function-form preset resolves.
- `spreadProps: true` for `...root.props`. Distinct from the above — `field-root` records what
  happened when Bond state was spread onto the element, namely `schema="[object Object]"`.
- The three thunks (`props`, `attrs`, `beforePreset`) **receive the Bond**, because `useRoot` calls
  them during the call that produces the handle.

#### Four defects, each caught by a different gate

1. **`Cannot access 'bond' before initialization`** at SSR, in `datagrid-row` and `datagrid-root`.
   On the server `Kernel.element` evaluates its config **immediately** rather than through a
   `$derived`, so a thunk closing over `const bond = root.bond` explodes. Passing the Bond as an
   argument is the fix. Caught by the DataGrid SSR specs.
2. **Consumer props silently discarded.** `Kernel.element`'s third parameter is
   `elementAttributes?.() ?? elementAttrs(props)` — it **replaces** attribute extraction rather than
   merging. Routing a root's ARIA through it dropped `data-testid` and every handler.
   `Kernel.node`'s `attrs` merges; they are not interchangeable. Caught by `transition-leaf`.
3. **The mount hook fired twice.** Folding `attrs` into the element _config_ put `nodeIdByRole(...)`
   inside the `$derived` that lifecycle tracks through `getBond()`. Descendants register on mount,
   the registry publishes, the config invalidates, `$effect.pre` re-runs — two mounts. This is
   precisely why `attrs` is a separate channel on `Kernel.node`. Caught by `lifecycle-seam`.
4. **Double slot registration.** `Kernel.node` registers the slot and so does `createPartAtom`; the
   node path must return before constructing an Atom. Caught by the Bond's own duplicate guard.

#### The finding that reframed phase 8

`card-root` was not hand-rolled by neglect. It rendered on Kernel's **class-only lane** and hand-fed
the semantic attrs that lane drops — a deliberate, measured bargain. Migrating it to full
presentation resolution took `cardroot` from **3.77 to 10.79 µs**, a real gate failure, not drift.
(The first suspicion — that the extra `Kernel.node` was the cost — was wrong: reverting to a direct
`Kernel.element` left it at 10.79. The lane was the cost all along.)

So `useRoot` exposes the lane as an explicit `attrs` option, documented as the bargain it is:
supplying `attrs` selects the class-only lane, and the root then owes that Atom's contribution
itself. `cardroot` is back to **4.41 µs**. Every other root resolves fully, because a root Atom
normally carries cross-slot ARIA the lane cannot fold in and the failure mode is silent attribute
loss — which is exactly what showed up mid-phase as DataGrid columns losing `role="columnheader"`
and `aria-sort` when a wrong `eagerElement` shortcut let declared-Atom roots onto the fast lane.

Worth recording for its own sake: `CardRootAtom.attrs` **already returns** `role`, `tabindex` and
`aria-disabled`, and `labelledControl` already projects the `aria-labelledby`/`describedby`. Card's
`attrs` duplicates them **because the lane never materializes the Atom** — that duplication is what
makes the lane correct, and it is now stated as such rather than looking like an oversight.

Gates: `check` 0 errors · `lint` clean · 193 files / **1106** tests · **all eight `bench:ssr`
fingerprints byte-identical**, gate OK with `cardroot` 4.41 µs.

---

### Phase 9 result — 2026-08-22

Six module READMEs written against the shipped tree (`authoring`, `kernel`, `bond`, `capability`,
`preset`, `validation`), AGENTS.md's seam sections rewritten, and `scripts/scaffold.mjs` plus
`scaffold.spec.mjs` moved to the new shapes together.

The scaffold was **verified by generating both family kinds and typechecking them**, not by reading
the template. That caught a pre-existing bug: the `--static` types template referenced
`HtmlElementTagName` without importing it, so every static family failed `check` until someone added
the import by hand. Fixed.

It also caught a **public-surface leak of my own making**: running the scaffold regenerates
`src/lib/index.ts`, and its regeneration added `animateSidebarContent` to the root package export.
`public-surface.spec.ts` failed exactly as it should — that surface is a fixed point — and the line
was reverted. Worth knowing before anyone runs the scaffold on a branch they intend to keep.

---

## 10. Final state

| Measure                                   | Before                      | After                                       |
| ----------------------------------------- | --------------------------- | ------------------------------------------- |
| Barrels an author imports from            | 4 (+2 deep paths)           | **2** — `authoring`, `capability`           |
| `Kernel` deep imports                     | 151                         | **0**                                       |
| `definePart` deep imports                 | 35                          | **0**                                       |
| Family files deep-importing infra         | 148                         | **0** (7 named render-machinery exemptions) |
| Ways to write a descendant part           | **5**                       | **1** — `definePart`                        |
| Ways to write a root                      | 2 (`useRoot` + hand-rolled) | **1** — `useRoot`                           |
| Bonded parts on the seam                  | 33                          | **63**                                      |
| Static leaves on a seam                   | 0                           | **26**                                      |
| Element-building Kernel calls in families | 89                          | **61** → ratcheted                          |
| Root: functions · concepts                | 5 · 12 (Card 12 · 14)       | **1 · 6**                                   |
| Logic-bearing part: functions             | 3–5                         | **1**                                       |
| Static leaf: functions · concepts         | 3 · 6                       | **1 · 2**                                   |
| Infra modules with a README               | 4 of 10                     | **6 of 6**                                  |

Rendered output is **byte-identical**: all eight `bench:ssr` fingerprints unchanged across every
phase, every SSR snapshot unmoved. 193 files / 1106 tests. `bench:lanes` OK, `bench:growth` `k ≈ 1`
with accordion's known defect unmoved.

### Future leverage, as promised in §6

Two known N-site changes are now single-site:

1. **The inert-descendant lane** (`card-performance-options-2026-08.md` Option 1.4, 1–3 µs/card)
   applies inside `definePart` and `useRoot` rather than at 89 hand-written call sites.
2. **Anchor-diet A3** — dropping the `{#snippet body()}` currying wrapper — becomes a change to what
   the seams return, not an edit to 60 templates.

A third emerged during the work: the class-only lane is now a **named option** with a measured
rationale (`useRoot`'s `attrs`) rather than a shape a root has to hand-roll to reach. Whatever
replaces that trade-off later has one place to change.

### What deliberately did not converge

Consistency was not pursued past the point where it would cost correctness or measurable µs:

- **13 leaves + 8 parts keep `mergePresetProps` / `Kernel.node`** because they hand props to another
  component and own no element. That is the packet-vs-seam rule, not an exception to it.
- **11 leaves and `datagrid-footer`** compose conditional or reordered class arrays that the seam's
  `class: string` cannot express without dropping them out of `resolve/classes.ts`'s merge cache.
- **`card-root` renders on the class-only lane**, stating its Atom's attrs by hand, because full
  resolution costs that layer 3.77 → 10.8 µs.
- **The 100 no-seam descendant parts** were not migrated. They render no bonded element.

Shims survive phases 1–8 deliberately: Vite drops them, and they are what makes each behavior phase
independently revertible. Hard cutover means _no old shape survives the refactor_, not _every phase
is a big bang_.

---

## 6. Perf-risk register

| Consolidation                      | Gate                                                                                 | Argument                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                         |
| ---------------------------------- | ------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Single barrel**                  | `bench:lazy-kernel`, `bench:growth`, `bench:ssr`                                     | Free at runtime; the real risk is module-graph eagerness — importing `defineLeaf` pulling in `use-root`'s `bindBond`/`createAtomInstance` chain. Mitigation is structural, not hopeful: the barrel uses `export { x } from '…'` only — never `export *`, never a value re-exported through an intermediate module. `root-identity-audit`'s export scanner only understands that form anyway, so the constraint is enforced by an existing gate.                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  |
| **`definePart` absorbs (b)(c)(d)** | `bench:ssr` per family, `bench:lanes`, `anchor-budget`                               | **Measured, not argued: the `inlinePlan` arm is 7.26 µs against `node`'s 7.96 — per-instance `Kernel.plan` is 8.8% _faster_ than the hoisted `<script module>` constant.** The plan is memoized in a `WeakMap<definition, Map<slot\0as\0class>>`. **The real risk is the lane, not the plan:** the migrated call must keep `eagerElement: plan.synthesized` and must not force `Kernel.element`. Backwards costs ~6.3 µs/part on synthesized slots; forwards silently drops declared-Atom attrs (the documented 91-byte Collapsible / 5-byte DataGrid case). Both directions show in fingerprints — hence a sub-commit per style.                                                                                                                                                                                                                                                                                                                                |
| **`defineLeaf`**                   | `resolve-count.svelte.spec.ts`, `bench:ssr`, `anchor-budget`                         | Today's shape allocates a `$derived` cell per leaf to hold `mergePresetProps`. Kernel already reads its config thunk inside its own tracked boundary and caches through `resolve/cache.ts`, so the cell may be droppable — **verify with `resolve-count` before writing the seam.** If Kernel reads the config more than once per render, keep the cell: `defineLeaf` is then a pure ergonomics win with zero perf delta, and the commit says so rather than claiming an unmeasured win. Anchors unchanged either way — same one element, no new block.                                                                                                                                                                                                                                                                                                                                                                                                          |
| **`useRoot` returns a handle**     | `bench:ssr` **cardroot** layer, `root-identity-audit`, `anchor-budget`, `family-ssr` | Today `useRoot` never touches `Kernel.plan`/`node`. The handle version adds one memoized plan lookup and one `KernelNode` allocation **per rendered tree**, not per part — invisible at grid scale, visible only in the bare-root layer, which is exactly what `cardroot` (3.12 µs, sha `9dc883fba5fa`) measures. It is free only if the node is what `Kernel.element` consumes, so the element is built **once**. Root Atoms are declared in `spec.atoms.root` for essentially every family, so `plan.synthesized` is false and full resolution is retained — no lane change, no attr loss. **Do not add a `synthesized → return node` shortcut for roots**, however correct it looks: a root Atom carries the family's cross-slot ARIA (`nodeIdByRole`), and the failure mode is silent attribute loss, not a crash. Offsetting win: `ElementRoot`'s five accessor getters exist only to satisfy the seam protocol and can shrink once the node _is_ the seam. |

**Anchors.** No consolidation adds a Svelte block, a dynamic-callee `{@render}`, an
`<svelte:element>`, or a `$props.id()`. Every migration is script-side; the render line at the
bottom of each file keeps its shape. `anchor-budget.spec.ts` should read identical through the whole
refactor — if it moves, the template plumbing changed and the diff is wrong.

**Future leverage.** Two known N-site changes become single-site: the inert-descendant lane
(`card-performance-options-2026-08.md` Option 1.4, the highest-ceiling shared win at 1–3 µs/card)
applies inside `definePart`/`useRoot` instead of 82 hand-written call sites; and anchor-diet A3
(dropping the `{#snippet body()}` currying wrapper) becomes a change to what the seams return rather
than an edit to 60 templates.

---

## 7. Auxiliary surfaces — lockstep, not follow-up

| Surface                           | Needs                                                                                                                                                                                                                                               |
| --------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/scaffold.mjs` + its spec | Emit exactly one import line (`$ixirjs/ui/authoring`); the root template's two-step collapses to one call; the leaf template becomes `defineLeaf`. **If this lags, the next new family reintroduces every shape just deleted.**                     |
| `root-identity-audit.spec.ts`     | `AUTHORING_BARREL` repoints to `src/lib/authoring/index.ts`; the barrel goes from 3 value exports to ~15 and **each must be classified** — `useRoot`/`bindBond` BINDING, the rest NON_BINDING. Fails closed by design; the loudest gate in phase 3. |
| `kernel-authoring-audit.spec.ts`  | Its offender regexes hard-code four already-dead paths. Repoint and invert: "no family `.svelte` imports under `$ixirjs/ui/kernel` or `$ixirjs/ui/bond`" subsumes the current check.                                                                |
| `AGENTS.md`                       | Seam sections ~106, 142–166, 204–320, 351–434. Line ~230 ("`definePart` covers only the ones with none") is the sentence phase 6 deletes — that prose _is_ the (b)(c)(d) split.                                                                     |
| Six READMEs                       | `bond/`, `capability/`, `kernel/`, `authoring/`, `preset/`, `validation/` — written in phase 9 against the shipped tree. `authoring/README.md` is the important one: the four-seam decision table AGENTS.md currently carries in 200 lines.         |

### Doc rot found in recon — fixed in phase 0, before anything moves

So no later reviewer has to guess whether a mismatch is pre-existing or introduced:

1. `shared/README.md` routes to a `motion.ts` that does not exist.
2. `shared/bond/README.md` lists a `diagnostics.ts` that does not exist.
3. `shared/authoring/README.md` documents `use-part.svelte.ts` — the directory has
   `use-root.svelte.ts`.
4. ADR 0008 still names `usePart` as the descendant seam; ADR 0009 replaced it.
5. `AGENTS.md` presents `card-title.svelte` as the `definePart` exemplar — it actually uses a
   module-scope `PLAN` plus `Kernel.node(PLAN, () => props, { eagerElement: true })`, style (b).
6. `AGENTS.md` writes `Kernel.part` where it means `Kernel.plan`.

---

## 8. Decisions taken (defaults; recorded so they are not re-argued)

1. **`useRoot`'s `atom`/`props` accessors stay a permanent superset**, not a deprecated path — the
   four component-forwarding roots genuinely need them (§3).
2. **`Kernel` stays exported from the barrel as the documented escape hatch, with a count ratchet**
   ("≤ N files call `Kernel.` directly", seeded at whatever phase 6 leaves). Without the ratchet the
   part seam decays back to style (c) within a quarter.
3. **The 100 no-seam descendant parts are not migrated.** They render no bonded element; forcing
   them through `definePart` is the abstraction looking for work.
4. **`animate` lands in `utils/animate.ts`**, not a two-file `motion/` module.
5. **`components/portal/**` is not split\*\* — one out-of-family importer does not justify a
   top-level module.
