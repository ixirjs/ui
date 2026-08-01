# Presentation kernel performance — the v1 → v3 journey

Companion to [ADR 0004](./adr/0004-convergence-one-mechanism-per-job.md) Decision 5
("one merge kernel for presentation"). This documents how the class-merge memo went
from _losing to the legacy code on one axis_ to **14.8x faster with zero-allocation
hits**, including the two designs that were built, measured, and discarded along the
way — the failures carry most of the lessons.

Continued in
[performance/atom-utils-hot-path.md](./performance/atom-utils-hot-path.md) — the
follow-up round on the variant/preset resolution path (preset record identity
stabilization, LRU touch-on-hit, hit-path allocations) — and
[performance/resolvers-stages.md](./performance/resolvers-stages.md) — the
orchestration layer: how the inline `html-atom.svelte` presentation logic became
the staged resolver pipeline that consumes this kernel.

All numbers come from the committed harnesses:

- **Time**: [`presentation.bench.ts`](../src/lib/components/atom/utils/presentation.bench.ts)
  (`npx vitest bench --run src/lib/components/atom/utils/presentation.bench.ts`)
- **Memory**: [`presentation.memory.spec.ts`](../src/lib/components/atom/utils/presentation.memory.spec.ts)
  (`NODE_OPTIONS=--expose-gc npx vitest run src/lib/components/atom/utils/presentation.memory.spec.ts`;
  auto-skips without the gc hook, so normal CI runs never pay for it)
- **Baseline**: the pre-kernel implementations, frozen verbatim in
  [`presentation.legacy.ts`](../src/lib/components/atom/utils/presentation.legacy.ts)
  so the comparison survives refactors of the live code.

Benchmark scenarios mirror real usage:

| Scenario         | What it models                                                                                                                           |
| ---------------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **Hot path**     | `class={['fallback classes', '$preset', klass]}` — the array-with-placeholder shape every component root emits, repeated (lists, tables) |
| **Plain string** | a bare string user class, no placeholder (leaf atoms without preset wiring)                                                              |
| **Varied**       | 1,000 distinct user classes cycling — permanent cache-miss steady state, the adversarial worst case                                      |
| **Rest-props**   | the `fallback → preset → variants → restProps` attribute cascade                                                                         |

---

## v0 — what the legacy code did, and why it was slow

The discovery that shaped everything: component roots pass
`class={[fallbackClasses, '$preset', klass]}`, so **the `$preset` array path is the
hot path**, not the exception. The legacy `mergeClassesWithPreset` flattened that
array with a _full_ `cn()` (clsx + tailwind-merge) **just to locate the placeholder**,
then ran `cn()` again on the spliced result — **two tailwind-merge parses per atom
render**. tailwind-merge is regex-heavy string parsing; it is the single most
expensive call in the presentation cascade.

The structural fix (constant across all versions): walk the array items directly for
the exact `'$preset'` item and merge **once**. The memo's job is to make repeated
inputs skip even that single merge — and lists repeat inputs by the hundreds.

---

## v1 — flat `Map<builtKey, result>` + touch-on-hit true-LRU ❌

**Design.** Build a string key by joining the inputs with sentinel separators
(`before + SEP + preset + SEP + variant + SEP + after`, control-char separators), store results in one
`Map<string, string>` with classic LRU semantics: on every hit, `delete` + re-`set`
the entry to mark it most-recently-used; evict the oldest at capacity 500.

**Result.**

| Scenario     | vs legacy (node / browser)               |
| ------------ | ---------------------------------------- |
| Hot path     | 1.10x / 1.01x faster — _barely anything_ |
| Varied       | 1.26x / 1.20x faster                     |
| Plain string | **4.13x / 3.31x SLOWER**                 |

**Why it failed.** Two compounding mistakes:

1. **Touch-on-hit churn.** Every hit paid `Map.delete` + `Map.set` on top of the
   `get`. Meanwhile tailwind-merge has its _own_ internal cache whose hits are a
   single `Map.get` — so on repeated plain strings, "no memo at all" (legacy) beat
   the memo by 3–4x. A cache whose hit path is slower than recomputing-via-the-
   downstream-cache is a pessimization.
2. **Key construction on every call** — even hits paid the array slices, `join`s,
   and concatenation needed to build the lookup key (see v2, where this became the
   visible bottleneck).

> **Lesson 1:** _true-LRU recency tracking is not free. If the cached computation
> already sits behind a cheaper cache, your hit path must be cheaper than THAT, not
> cheaper than the computation._

---

## v2 — flat map + generational eviction ⚠️

**Design.** Same built string keys, but eviction copied from tailwind-merge's own
internal design: **two generations**. Hits in the hot map are a bare `Map.get` (no
touching). When the hot map reaches 500 entries it _becomes_ the previous generation
wholesale (one pointer swap); hits in the previous generation are promoted back.
Approximate LRU, exact O(1) hits.

**Result.**

| Scenario     | Time vs legacy (node / browser) | Memory (kernel vs legacy, B/op) |
| ------------ | ------------------------------- | ------------------------------- |
| Hot path     | 1.22x / 1.24x faster            | 368.8 vs 384.0                  |
| Varied       | 1.46x / 1.46x faster            | 1,032.3 vs 741.6                |
| Plain string | 1.28x / 1.19x **slower**        | —                               |
| Rest-props   | 1.10x / 1.04x faster            | 301.4 vs 288.3                  |

Retained footprint at capacity: ~336 KiB.

**Diagnosis.** The LRU churn was gone (plain-string deficit collapsed from 4x to
1.2x), but the kernel still allocated ~370 B per _hit_. The profile said why: **key
construction dominated the hit path** — `slice` the array around the placeholder,
`join` both halves, concatenate five fragments, then hash the resulting ~150-char
string for the `Map.get`. The memo did less work than tailwind-merge, but not by
much, and it built garbage on every call.

> **Lesson 2:** _generational (two-map) eviction is the right shape for hot caches —
> hits must be a single lookup._
>
> **Lesson 3:** _a flat string-keyed cache pays key construction + full-key hashing
> on every access. If that cost is comparable to the cached work, the cache can't
> win big._

---

## v3 — generational trie walked by the raw inputs ✅

**The out-of-the-box insight.** The memo key does not need to _describe_ the merge —
the raw inputs `(userClass, presetClass, variantClass)` already **uniquely determine
the output**. So don't build a key at all: walk the inputs themselves through a trie
of nested Maps. Two properties of real component trees make this near-free:

1. The string parts are **reference-stable across renders** — module-scope literals,
   preset registry strings, resolved variant classes. V8 caches a string's hash _on
   the string object_, so each `Map.get` along the walk is a near-pointer-speed
   lookup. No 150-char key is ever hashed.
2. **All analysis moves to the miss path.** The `$preset` scan, slicing, splicing,
   and clsx flattening only run when the trie misses. A hit is a handful of
   `Map.get`s — **zero allocation, zero scanning** (measured: 0.0 B/op).

Token stream per entry: `…userParts (falsy skipped), END (U+0001), preset|U (U+0000),
variant|U → result`. Non-string parts (object ClassValues, nested arrays) bail to
the uncached path; `undefined` slots walk as the `U` sentinel.

First trie iteration (Map-chain tail) already landed: hot path **10.3x / 3.5x**, and
the plain-string scenario flipped from a loss to **2.5x / 1.4x faster**. But the
varied (all-miss) case allocated 1,369 B/op vs legacy's 742 — inserting an entry
created three Maps for the `END → preset → variant` chain.

### v3 refinements — closing the miss path

1. **Path-compressed tail.** A user class almost always pairs with exactly _one_
   preset/variant combo, so the three-Map tail became a single linked record
   `{p, v, r, n?}` (~60 B instead of ~360 B), compared by string `===`; rare
   collisions chain through `n`. Bonus: _hits_ got cheaper too — two `===` instead
   of two `Map.get`s — which is what pushed the hot path from 10.3x to 14.8x.
2. **Dual-generation single walk.** A miss used to walk the hot trie fully, then the
   previous-generation trie fully. Both generation pointers now step together in one
   pass over the tokens.
3. **Miss fast lane (`mergeJoined`).** By the time a cacheable lookup misses, every
   part is a _verified plain string_ — so skip `cn` (clsx's recursive type dispatch)
   entirely: join the parts with `' '` manually and call `twMerge` directly. One
   parse, no intermediate parts array.

---

## Final scoreboard — legacy vs v1 vs v2 vs v3

Time, as kernel-vs-legacy speedup (node / browser; >1 = kernel faster):

| Scenario                             | v1 (flat + LRU)      | v2 (flat + generational) | v3 (trie, final) |
| ------------------------------------ | -------------------- | ------------------------ | ---------------- |
| Hot path (`$preset` array, repeated) | 1.10x / 1.01x        | 1.22x / 1.24x            | **14.8x / 4.6x** |
| Plain string, no placeholder         | **0.24x / 0.30x** ❌ | 0.78x / 0.84x ❌         | **3.4x / 1.6x**  |
| Varied inputs (all-miss)             | 1.26x / 1.20x        | 1.46x / 1.46x            | 1.3x / 1.7x      |
| Rest-props cascade (fold)            | 1.12x / 1.06x        | 1.10x / 1.04x            | ≈ parity (noise) |

Memory, transient allocations per op (node, kernel vs legacy):

| Scenario             | v2        | v3 (Map-chain tail) | v3 (final)  | legacy                                  |
| -------------------- | --------- | ------------------- | ----------- | --------------------------------------- |
| Hot path             | 368.8 B   | **0.0 B**           | **0.0 B**   | 384.0 B                                 |
| Varied (all-miss)    | 1,032.3 B | 1,369.3 B           | **791.3 B** | 743.4 B                                 |
| Rest-props           | 301.4 B   | 318.6 B             | 305.0 B     | 288.3 B                                 |
| Retained at capacity | 336 KiB   | 376 KiB             | 362 KiB     | — (twMerge cache only, present in both) |

The varied case remains the honest trade-off: ~6% more garbage per miss and a
1.3–1.7x (not 14x) speedup, because tailwind-merge's parse now dominates that path
almost entirely. Real component trees are hit-dominated — few distinct class combos,
thousands of repeats — which is exactly the row where the kernel does 14.8x at
0 B/op.

### Not pursued, recorded

**Incremental/compositional merging** (pre-merge the static prefix once, merge only
the varying suffix against it) could attack the remaining varied-case ceiling, but
it relies on tailwind-merge being associative — plausible, undocumented, and
unguaranteed across versions. Out of risk budget for a cache that real workloads
hit rather than miss.

---

## Lessons, condensed

1. **Measure before designing**: the "obvious" hot path (plain strings) wasn't the
   real one — component roots emit the `$preset` array shape. The first benchmark
   reshaped the entire design.
2. **A cache must beat the _next-best_ path, not the worst path.** tailwind-merge's
   internal cache set the bar; v1's LRU churn ducked under it.
3. **Generational eviction > true-LRU** for hot in-process caches: hits must be one
   lookup, recency can be approximate.
4. **The best key is no key.** When inputs are reference-stable and uniquely
   determine the output, walking them through a trie beats building and hashing
   composite keys — and makes hits allocation-free.
5. **Path-compress the boring suffix.** Fixed-shape key tails (here: preset,
   variant) don't deserve a Map level each; a compared record is smaller _and_
   faster.
6. **Move every cost you can to the miss path**, then give the miss path its own
   fast lane using the invariants the lookup already established (all-strings →
   manual join + direct `twMerge`).
7. **Freeze the baseline.** Copying the legacy implementations into a
   never-refactored module is what made every claim above reproducible after the
   live code changed three times.
