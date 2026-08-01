# Iteration 15 — Runtime cost of the bond/context model at scale

_Date: 2026-06-22 · Focus: the last major thread — what each component instance costs vs shadcn's near-static markup, and where the bond/atom/capability/context architecture bites at scale._

## The verdict up front

**Cheap-per-leaf, well-memoized on re-render, but construction cost is real and UNBOUNDED for large collections because nothing windows them.** That's the one place the model loses decisively to shadcn — and it's fixable with **virtualization**, not by dismantling bonds.

## Per-instance cost ladder

| Tier                                   | What it allocates per instance                                                                                                                                               | vs shadcn                                             |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------- |
| **Stateless (Button/Switch)**          | **No bond, no nanoid, no setContext.** Just `HtmlAtom` (≈12 `$derived` cells + 1 context read) → `HtmlElement` (2 `$effect`s + 2 `$state` + `cn`). Switch = 2× (root+thumb). | heavier than a static `<button>`, but small + bounded |
| **Stateful root (collapsible/dialog)** | + `bindBond` → `new State` + `new Bond`, **1 nanoid(8)**, capability objects, **1 context read** (parent nesting) + **1 setContext** (share), props-cell object              | one-time per root; negligible                         |
| **Datagrid row (the problem)**         | **3 context reads + 1 setContext + 1 nanoid + 1 `$effect` + capability bridge + a bond + a state — PER ROW**                                                                 | ~order of magnitude heavier than a static row         |

### Key architectural facts confirmed

- **Stateless components carry no bond** — `button.svelte` is one `$derived` + `<HtmlAtom>`. The Bond tax is opt-in (only stateful components pay it). ✅ good design.
- **Atoms are lazy + cached** (`bond.svelte.ts:139`) — a 4-slot bond makes ≤4 atoms, once each.
- **No per-field `$state` explosion** in BondState — reactivity rides the props cells + capability surfaces; capabilities are plain array entries, not reactive cells.
- **The memo engine (iter 10, 14.8×/0 B/op) offsets STYLING re-render cost only** — it sits inside HtmlAtom's `$derived`s. It does **nothing** for construction cost (nanoid, context reads, allocations, effects all happen regardless).
- **Effect floor ≈ 2 per rendered DOM element** (HtmlElement mount/destroy + animate). A 100×5 datagrid (500 cells) ≈ **1000+ element-layer effects** + row mount effects. Capability `setup()` effects exist only on the 7 overlay roots — _not_ amplified across items.

## Where it bites: large collections, no virtualization 🔴

- **Confirmed: zero virtualization** — no windowing / `IntersectionObserver` in `datagrid` or `list`; the `virtual/` component is unfinished (and flagged may-be-dropped). A 1000-row grid eagerly constructs **1000 bonds, ~3000 context lookups, 1000 nanoids**, and cells multiply element effects.
- This is the **single place the bond/context model loses decisively to shadcn's static markup** — shadcn renders 1000 static rows; svelte-atoms constructs 1000 stateful row bonds.

## shadcn comparison takeaways

shadcn has no per-instance runtime model, so it "wins at scale" by default — but it also offers _no_ row state, selection, or keyboard model (you build those yourself). svelte-atoms pays construction cost to _give_ you those. The fix isn't to abandon bonds — it's to **cap how many exist at once**.

### Actions (ranked)

| #    | Action                                                                                                                                                                                                                                   | Why                                                                                                   | Effort    |
| ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------- |
| 15.1 | **Virtualization for datagrid/list** (windowing → only visible rows construct bonds)                                                                                                                                                     | caps per-item bond/context/effect cost regardless of dataset size; the highest-leverage missing piece | high ⭐⭐ |
| 15.2 | **De-dup datagrid row context reads** — `DataGridBond.get()` is called **twice per row** (`row/bond.svelte.ts:46` base ctor + `:100` state ctor) + a 3rd for header                                                                      | ~halves per-row context reads, free correctness-neutral win                                           | low ⭐⭐  |
| 15.3 | **Adopt the select-item pattern for rows that don't need a full child bond** — `select-item.svelte:34` uses a **bare atom (no per-item bond, no nanoid, 1 effect)**; rows mostly need selection projection + id, which an atom can carry | structurally lighter rows                                                                             | medium ⭐ |
| 15.4 | **Document the cost model** — "stateless components are free-ish; stateful roots are cheap; large collections need virtualization" so consumers know when to reach for windowing                                                         | sets expectations                                                                                     | low       |

### The select-item lesson (internal best practice to propagate)

`select-item` deliberately **avoids the queue/bond per item** (bare `new SelectItemAtom`) — it's the lightweight pattern. Datagrid rows use the heavy full-bond pattern. Converging rows toward the select-item shape (where a full bond isn't required) is a real, already-proven-in-repo mitigation.

## Meta-pattern (5th iteration running, slightly different this time)

Most prior gaps were "capability exists but unwired." This one is genuinely **missing capability (virtualization)** — the one major item on the whole roadmap that is _invention, not activation_. Everything else (row context de-dup, lighter row pattern) is still activation. So even the architecture's worst scaling weakness has a bounded, known fix.

## Roadmap deltas (feed into iter-12 v2)

- **Tier 1:** 15.2 (datagrid row context de-dup — low effort, real win).
- **Tier 2:** 15.1 (virtualization — high effort, high impact; supersedes/finishes the dead `virtual/` component) + 15.3 (lighter row pattern) + 15.4 (cost-model docs).

## Study status

This closes the **last major investigative thread.** Iterations 1–15 now cover: distribution, a11y depth, forms, theming, deps/bundle, SSR/testing, composition, animation, perf engine, API stability, RTL/keyboard, authoring DX, error DX, TS inference, and runtime-at-scale. A final "study complete" synthesis (consolidating into a single living roadmap + the recurring meta-pattern) is the natural next step; subsequent loop iterations can shift to **tracking implementation** of roadmap items or spot-deep-dives on request.
