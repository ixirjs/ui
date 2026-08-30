# On-demand Bond / Atom / capability initialization — 2026-08

**Verdict: do not build it.** Both candidate mechanisms were measured against the work they would
save, and neither clears the bar. The lazy infrastructure already in the library captured the win
that existed; what remains is 0.3–2.6 µs per Bond on components that appear a handful of times per
page.

This document records the measurements so the question does not get re-opened from intuition.

## The question

Initialize bonds, atoms and capabilities only when needed — "based on the props supplied we do run
the needed logic."

## What was already lazy before this study

Worth stating first, because two thirds of the idea is shipped and re-proposing it wastes a cycle:

- **Atoms are on demand.** `KernelNode` registers a `LazyNodeDescriptor` carrying only `id` and
  `roles`; the Atom is constructed in `materialize()`, reached only from a public query
  (`nodeByPart` / `nodeByRole` / `values()`). Role-less synthesized slots are `inert` and register
  nothing — eight of Card's nine slots construct nothing.
  (`shared/bond/node-registry.svelte.ts`)
- **The Bond base is lean.** `new Bond()` is three field writes plus a `NodeRegistry` whose every
  index is `??=`-lazy. `CapabilityRegistry` has no constructor; `#host` stays `undefined` until
  first use.
- **Stateless descriptors are interned.** `lazyCapability` / `internCapabilityFactory` share one
  frozen descriptor page-wide (`shared/capability/intern.ts`).
- **`deferSetupFreeCapability`** already defers a thunk without allocating the host. One caller:
  `components/card/bond.svelte.ts:31`.

The remaining eager work is in family Bond subclass constructors — 27 `this.capability(...)` calls
across 11 families — and it splits into two populations.

## Population B — overlay bond-effects (the client cost)

Every overlay registers policies whose `$effect` is a guarded no-op while closed. Because _any_
capability declares `setup`, the Bond misses `CapabilityRuntime`'s setup-free fast path
(`runtime.svelte.ts:123-128`) and allocates an `$effect.root`.

The census is deterministic, and is pinned by `src/lib/test/perf/capability-cost.svelte.spec.ts`:

| bond             | capabilities | with `setup` | slots                                           |
| ---------------- | ------------ | ------------ | ----------------------------------------------- |
| dialog (closed)  | 7            | **4**        | focus, body-scroll-lock, inert-siblings, escape |
| popover (closed) | 6            | **3**        | focus, escape, outside-press                    |
| collapsible      | 3            | 0            | —                                               |
| card             | 1            | 0            | —                                               |

So the premise holds: a closed dialog does pay a lifecycle owner plus four setups to observe a state
it is not in. The question is how much.

### Measurement

`src/lib/test/perf/capability-activation.svelte.spec.ts`, chromium, three arms over the same Bond,
atoms and context. `stripped` replaces those four slots with setup-free stand-ins — the floor a
perfect deferral could reach for an overlay that is never opened.

| arm                       | µs / closed dialog |
| ------------------------- | ------------------ |
| construct (Bond only)     | 4.57               |
| activate (today)          | 8.00 – 8.29        |
| stripped (deferral floor) | 5.71 – 6.00        |

**Activation costs ~3.1–3.7 µs per closed dialog. The ceiling on deferring it is ~2.0–2.6 µs**, and
the achievable win is strictly less, because a gate effect still has to watch the open edge — that
is one effect that cannot be removed, since something must notice the transition.

At ~2 µs, twenty overlays on a page is 40 µs. That is inside the ±15% thermal drift this repo
already documents for its bench rig, and an order below the wins it has accepted elsewhere
(4.4 µs/menu item × hundreds of items; 6.3 µs/part × dozens). **Not worth the machinery**, which
would have had to preserve `requires` validation before setup, LIFO transactional rollback, the
permanent-`disposed` state on failed rollback, and the SSR rule that teardown is kept whenever a
setup ran because it may hold module-global escape-stack or focus state.

## Population A — setup-free stateful models (the SSR cost)

Construction is where `createDisclosure` / `createSelection` / `createInput` run as field
initializers, plus one ~0.63 µs frozen descriptor per registration.

`src/lib/test/perf/bond-construct.svelte.spec.ts`, same methodology:

| bond                                       | µs / construction |
| ------------------------------------------ | ----------------- |
| card                                       | 0.00              |
| collapsible                                | 2.00 – 2.57       |
| tree                                       | 4.29 – 4.86       |
| dialog                                     | 4.86 – 5.43       |
| menu                                       | 8.57 – 8.86       |
| **select**                                 | **11.14 – 11.71** |
| _select's input model + descriptor, alone_ | **0.29 – 0.57**   |

Two results, one of which refutes the hypothesis this study started from.

**Card at 0.00 µs** is the useful confirmation: the `deferSetupFreeCapability` shape is genuinely
free. A family with no stateful capability pays nothing measurable for the capability system.

**Select's input capability costs 0.29 µs, not the several µs predicted.** The hypothesis was that
`inputCapability(createInput({ query }))` — built for every Select including non-filterable ones,
and replaced outright by Combobox at the same slot — was the clearest waste in the library and the
best case for role-keyed deferral. It is 2.5% of Select's construction cost. Deferring it saves
nothing worth a mechanism.

Select's 11.14 µs is instead mostly **inherited from the menu base at 8.57 µs** — roving,
navigation, typeahead and the item collection. That is a real number and the largest per-Bond cost
measured, but it is not an on-demand problem: a menu that renders its items projects those roles, so
demand-driven deferral would materialize all of it immediately. Whether the menu base is doing too
much work per bond is a separate question, and this study does not answer it.

## Rejected designs

- **Prop-snapshot registration** (`if (props.sortable) this.capability(...)`) — reads a reactive
  cell at construction. `values` / `sortable` / `query` can arrive later, and a registration missed
  on the snapshot silently drops ARIA rather than failing. Rejected on correctness before cost.
- **Role-keyed deferral** (`deferCapability(slot, projects, build)`, materializing only when a
  projected role is actually requested) — the design is sound and would have worked, but the
  measurements above leave it nothing to reclaim. Note also the dependency-edge case it would have
  had to handle: Tabs registers roving purely to satisfy `navigation`'s `requires: [ROVING]`, with
  no atom claiming `container` (`components/tabs/bond.svelte.ts:90-92`).
- **Activate-on-open gating for bond effects** — 2.0–2.6 µs ceiling, see above.
- **Lazy model getters** (`get disclosure() { return (this.#disclosure ??= …) }`) — never measured,
  because the descriptor cost it would have complemented did not justify it. It also collides with
  the documented rune trap (_"a lazy collection inside a `$derived` poisons tracking"_), so it would
  have needed `untrack` at every materialization point.

## Incidental findings

- **`activateCapabilities()` cannot run outside a component init context.** `escapePolicy`'s setup
  reaches `useEscapeStack` → `Bond.get()` → `getContext`, which throws. Any future bench or test
  that activates capabilities must do so from inside a mounted component; this cost an iteration
  here.
- **DEV capability replacement is expensive under a browser test runner.** The last-wins
  `console.debug` at `host.ts:117` costs ~310 µs per replacing Bond when vitest's browser provider
  forwards it to the node process — two orders above the signal. Any bench that substitutes
  capabilities must stub `console.debug` around the timed region.

## Reproducing

```
bunx vitest run --project client src/lib/test/perf/capability-cost.svelte.spec.ts
bunx vitest run --project client src/lib/test/perf/capability-activation.svelte.spec.ts
bunx vitest run --project client src/lib/test/perf/bond-construct.svelte.spec.ts
```

The census spec asserts its invariants and is a genuine regression pin: if a family stops being
setup-free, or Card stops deferring, it fails. The two timing specs assert only direction
(activation costs more than construction; card is the floor) — their numbers are printed, not
gated, because a wall-clock threshold in the unit suite would flake on shared CI hardware.
