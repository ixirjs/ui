# Atom utils hot path — the cache-identity round

Follow-up to [presentation-kernel-perf.md](../presentation-kernel-perf.md) (the v1→v3
class-memo journey); the orchestration layer these utils serve is documented in
[resolvers-stages.md](./resolvers-stages.md). That round made the **class axis**
allocation-free; this round
(2026-06-12) attacks what was left: the **variant/preset resolution path**, where the
avoidable cost turned out to be concentrated not in computation but in **cache-identity
defeats** — caches that were correct, present, and never hitting.

Headline: the variant-resolution hit path is **2.4x faster**, preset-bearing atoms
stopped paying a ~3x cache-defeat tax, and preset-neutral invalidations now
short-circuit at the `$derived` level so the downstream stages don't run at all.
Aggregate, ~0.7–0.9 µs of avoidable work per atom per invalidation was removed —
about 0.7–0.9 ms on a 1000-atom render pass, plus the GC pressure of the garbage
those misses produced.

All numbers: bun (JSC) for the composite paths, node 24 (V8) cross-checks for the
micro-costs. Fixtures model the real `button` preset
(`class + variants.variant{3 axes} + defaults`) with a 6-key rest-props object.

---

## Finding 1 — factory-fresh preset records defeated every reference-keyed cache ✅ the structural fix

**The defect chain.** Preset entries are factories:

```ts
button: () => {
	const variants = buttonVariants(); // fresh object EVERY call
	return { class: '…', variants, defaults: { variant: 'primary' } };
};
```

`resolvers.resolvePreset` calls `entry(bond)` per atom per invalidation, so every
call produced a fresh object graph — and **every downstream cache keys by object
reference**:

| Cache                                   | Keyed by                          | Effect of fresh identity                                  |
| --------------------------------------- | --------------------------------- | --------------------------------------------------------- |
| `presetDefCache`                        | `variants` reference              | missed every call → new def built every call              |
| per-def variant LRU (`getDefCacheMap`)  | def reference                     | the new def never hits → full `resolveVariants` recompute |
| `mergeCache`                            | resolved-pair references          | missed → fresh merged object every call                   |
| `hasOwnKeysCached` / `getCachedOwnKeys` | `defaults` / `variants` reference | missed and re-populated every call                        |

The caches were all individually correct. None of them ever hit for presets.
Measured: 242 ns with a stable record vs **707 ns factory-fresh** for the same
`mergeVariants` call.

**The fix — reference stabilization, not memoization.**
[`utils/stable.ts`](../../src/lib/components/atom/utils/stable.ts):
`stabilizePresetRecord(entry, bond, fresh)`, integrated in
`resolvers.resolveEntry`. The factory **still runs on every recompute** — that is
load-bearing: blind-caching the factory's output would stop Svelte from tracking
reactive reads inside it (`bond.state.open ? … : …`) and freeze the preset forever.
Stabilization runs _after_ the factory and only restores _identity_ to equal output:

- whole record structurally equal to the last one seen for `(entry, bond)` →
  return the **previous** record, same reference;
- record changed, but some cache-keyed fields (`variants`, `defaults`,
  `compounds`, `class`) individually equal → **graft** the previous field
  references into the fresh record, so field-keyed caches keep hitting even when a
  sibling field genuinely changed.

`structurallyEqual` is bounded-depth (4: record → variants → axis → value), plain
objects/arrays only, functions by reference. A factory that creates closures inline
(attachments, function variant values) opts those fields out — correct, just
uncached, exactly as before.

**The bonus that outweighs the numbers.** `$derived` propagates by reference
inequality. Returning the previous reference means a preset-neutral invalidation
stops at the `preset` derived — `mergedVariants`, `foldLayers`, `resolveClass`
never re-run. The steady-state cost of "nothing changed" is now ~0, not 707 ns.

| Path                                  | before | after                                                                  |
| ------------------------------------- | ------ | ---------------------------------------------------------------------- |
| `mergeVariants`, factory-fresh record | 707 ns | **339 ns** through stabilization (≈0 steady-state via non-propagation) |

The 339 ns includes the structural compare (~100–200 ns) — the honest price of
keeping the factory reactive. It buys back 2x immediately and ~everything in steady
state.

> **Lesson:** when every cache keys by reference, the bug is never _in_ the caches —
> it's whoever mints fresh identities upstream. Fix identity once at the source
> instead of teaching N caches about structural equality.

---

## Finding 2 — `lruGet` touch-on-hit, again ✅

[presentation-kernel-perf.md](../presentation-kernel-perf.md) lesson 3 ("generational
eviction > true-LRU, hits must be one lookup") was applied to the class memo — but
the **variants LRU** still did `delete` + re-`set` on every hit. Measured on V8:
30 ns (map of 8) to 161 ns (map of 100) per hit vs **6 ns** for a plain `Map.get`.

The per-`(def, bond)` maps hold one entry per distinct variant-prop combination —
in practice 1–4 entries against a capacity of 100, so eviction never comes and the
recency bookkeeping bought nothing, forever.

**Fix:** [`cache.ts`](../../src/lib/components/atom/utils/cache.ts) — `lruGet` only
touches when `map.size >= max`. Below capacity nothing can be evicted, so eviction
order is unobservable. 251 ns → **12 ns** per hit (JSC).

---

## Finding 3 — `{...defaults, ...props}` allocated before the cache lookup ✅

`resolveVariants` spread defaults+props into a fresh object on **every call** —
including the calls that hit the cache two lines later and threw it away. ~66 ns +
one allocation per hit (the object carries all rest props, not just variant keys).

**Fix:** [`variants.ts`](../../src/lib/components/atom/utils/variants.ts) — a
`effectivePropValue(props, defaults, key)` helper reads props-then-defaults per
key; the key builder, the variant loop, and the compound matcher all use it. The
merged object is never materialized at all, on hit _or_ miss.

**Semantics pinned, not changed.** Spread semantics say an own key in `props` wins
_even when its value is `undefined`_ — `variant={undefined}` does **not** fall back
to the default. The helper preserves this (`Object.hasOwn(props, k)` before the
defaults fallback), and the contract — previously an unspecified artifact of spread
behavior covered by no test — is now pinned in
[`stable.spec.ts`](../../src/lib/components/atom/utils/stable.spec.ts).

| Path                                       | before | after     |
| ------------------------------------------ | ------ | --------- |
| `resolveVariants` cache hit, with defaults | 214 ns | **91 ns** |

---

## Finding 4 — four symbol scans per fold, almost always for nothing ✅

`foldPresentation` called `Object.getOwnPropertySymbols` once per layer per fold —
~46 ns + an array allocation each on V8, even when the object has no symbols (the
99% case).

**Fix:** `getCachedOwnSymbols` (WeakMap, same stability contract as
`getCachedOwnKeys`) for the three reference-stable layers (fallback / preset /
variants — the preset is stable _because of finding 1_). The `rest` layer keeps the
raw scan: it's a fresh object every render (`lifecycle.rest` rebuilds it), so a
cache entry for it can never hit — caching there would be pure insert overhead.

Net ~25–30 ns/fold on V8; neutral on JSC (whose raw scan was already ~1 ns).
The smallest win of the round, kept because it's free once the stability contract
exists.

---

## Finding 5 — `snapshotPrimitiveProps` sorted keys every render ✅

The plain-function-variants snapshot did `Object.keys(props).sort()` per render —
~131 ns + two allocations — purely for key-order stability. But a component
instance's rest-prop keys keep stable insertion order across re-renders, which is
all the snapshot comparison needs; a differently-ordered-but-equal object would only
cause a spurious cache miss (recompute, not corruption). The `.sort()` is gone.

Only affects legacy plain-function variants; `defineVariants`-tagged definitions
never enter this path.

---

## Minor, while passing through

- `resolvers.resolvePreset` no longer allocates a `[presetKey]` wrapper array for
  the common single-key case.
- The `k in finalProps` prototype-walking double-lookup in the key builder fell out
  of finding 3's rewrite (`Object.hasOwn` + single read).

## Not pursued, recorded

- **`mergePreset` override wrappers** still run `resolvePreset` twice +
  `mergePresetRecords` per overridden key per invalidation. Finding 1's
  stabilization absorbs the downstream cost (output identity is restored after the
  wrapper), so the remaining double-resolve wasn't worth its own cache.
- **`copyStringKeys` iteration**: benchmarked `for…in + Object.hasOwn` against a
  cached-`Object.keys` loop — 112 vs 109 ns, parity. The fold's string-copy loop is
  at its floor; left untouched.
- **Stabilizing function identity** (comparing closures by `toString()` or similar)
  to extend finding 1 to inline-attachment factories: rejected — fragile, and those
  fields are correctly treated as changed.

---

## Scoreboard

| Path (JSC, 200k iters)                       | before | after                |                        |
| -------------------------------------------- | ------ | -------------------- | ---------------------- |
| `mergeVariants`, stable preset record        | 242 ns | 130 ns               | 1.9x                   |
| `mergeVariants`, factory-fresh preset record | 707 ns | 339 ns               | 2.1x (≈∞ steady-state) |
| `resolveVariants`, cache hit with defaults   | 214 ns | 91 ns                | 2.4x                   |
| `lruGet` hit (below capacity)                | 251 ns | 12 ns                | 21x                    |
| `foldPresentation` (V8, stable layers)       | —      | ~25–30 ns/fold saved |                        |
| class trie hit (control — untouched)         | 28 ns  | 28 ns                | —                      |

## Verification

- 93 tests pass across the atom suites, including 13 new in
  [`stable.spec.ts`](../../src/lib/components/atom/utils/stable.spec.ts):
  `structurallyEqual` semantics (functions by reference, symbols, non-plain
  objects, depth), identity retention, field grafting, per-`(entry, bond)`
  scoping, downstream-cache hit-through, and the explicit-`undefined` variant
  contract.
- Full `src/lib` suite: 259 passed (the one failing file, `alert.spec.ts`,
  pre-exists this work — it imports a `alert-test.svelte` that isn't on the
  branch).
- `svelte-check`: no errors in any touched file.

## Lessons, condensed

1. **Audit cache _hit rates_, not cache designs.** Every cache in this path was
   well-designed and reference-keyed; the entire defect was that their keys never
   repeated. A cache that never hits is pure overhead with extra steps.
2. **Restore identity at the source; keep effects running.** Stabilize _after_ the
   factory call so reactivity stays tracked — memoizing the call itself would have
   been faster and wrong.
3. **Reference stability compounds in a `$derived` graph.** Returning the same
   reference doesn't just hit caches — it stops invalidation propagation, which is
   worth more than the nanoseconds.
4. **LRU recency below capacity is unobservable** — don't pay for it (second time
   this lesson was paid for in this codebase; see the kernel doc's v1).
5. **Don't allocate before the lookup.** Anything materialized before the cache
   check is paid on hits too — read-through helpers beat merged snapshots.
6. **Pin semantics you preserve.** The explicit-`undefined`-beats-default behavior
   survived only as a spread artifact; the rewrite kept it _and_ wrote it down as a
   test, so the next rewrite can't lose it silently.
