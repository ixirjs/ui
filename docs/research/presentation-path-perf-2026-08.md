# Presentation-path perf pass (2026-08-12)

Status: **historical measurement preceding Kernel-only authoring.** Retired benchmark layer names
below are preserved as evidence. Two changes landed, byte-identical and verified by interleaved A/B. One further
change was tried, measured, and reverted. Continues the 2026-08-02 anchor diet; that one cut DOM
mass, this one cuts per-part CPU and allocation.

## 1. Where the gap actually is

Against shadcn-svelte on the compare harness, measured on one subject after fixing the split
described in §4:

| axis                                   | ixir      | shadcn   | gap   |
| -------------------------------------- | --------- | -------- | ----- |
| micro `card`, marginal µs              | 60.27     | 11.76    | 5.13× |
| `card1` — bare `Card.Root`, zero parts | 27.11     | 7.83     | 3.46× |
| client heap per row @1000              | 128.1 KiB | 45.6 KiB | 2.81× |
| SSR latency, `/table?rows=1000`        | 228.16 ms | 88.45 ms | 2.58× |

Everything else is at parity or better: `button` 1.03×, `badge` 1.00×, `plain` control 1.14× in our
favour, sort-1000-rows now _faster_ than shadcn, and ixir ships less HTML on every route.

Decomposing `ssr-baseline.json`: `plain` 0.22 → `htmlatom` 11.08 (four elements, ~2.7 µs/element of
presentation pipeline) → `card` 29.91 (four parts). The `nesting` study puts raw Svelte at
0.33–0.47 µs per nesting level, so **the overwhelming majority of per-part cost is library
machinery, not the framework.**

## 2. The profile

`node bench/src/profile.mjs ixir '/micro?kind=card&n=400'`, aggregated by function name (the bundled
analyzer reports per _node_, so a function inlined at several call sites appears many times and no
single row looks significant — aggregate before reading it):

| self% | ms   | function                                                          |
| ----- | ---- | ----------------------------------------------------------------- |
| 13.4% | 1124 | (garbage collector)                                               |
| 7.7%  | 647  | `(anonymous)` — per-part closures                                 |
| 5.9%  | 496  | `spread_props`                                                    |
| 5.0%  | 420  | `hash` — Kit ETag, fixed per request, cancels in a marginal slope |
| 4.9%  | 411  | `#traverse_components`                                            |
| 4.8%  | 403  | `#collect_content`                                                |
| 4.7%  | 396  | `get_or_init_context_map`                                         |
| 3.2%  | 268  | `mergeClassesWithPreset`                                          |
| 2.3%  | 192  | `withoutPreset`                                                   |

Two things this killed before any code was written:

- **`cn` / `tailwind-merge` is not hot.** It does not appear in the top 30. tailwind-merge carries a
  500-entry LRU internally and the 400 identical cards on the micro route hit it every time. A memo
  on `cn` was on the candidate list and is now off it.
- **Chunk-level attribution is a trap.** By source file, `use-element-motion.svelte.js-…` reads as
  14.9% of self time on a page that renders no motion at all, which looks like a serious regression
  in the in-flight motion extraction. It is a rollup _chunk name_: the chunk carries the whole
  presentation pipeline. Read the function table, not the file table.

## 3. What landed

Both are behaviour-preserving and leave every SSR fingerprint untouched.

**`resolve/classes.ts` — stop walking strings that hold nothing.** `withoutPreset` ran
`split(PLACEHOLDER).join('')` on both halves of the class string on every rendered part. The tail is
sliced from _after_ `lastIndexOf(PLACEHOLDER)`, so it provably contains no sentinel — that call was a
guaranteed no-op allocation and walk. The head keeps the strip but guards it with `includes`, which
hits for the near-universal one-sentinel case. Together the pair was 5.5% of self time.

**`use-part-element.svelte.ts` / `presentation.svelte.ts` — plain values on the server.**
`PresentationOptions` is a _thunk_ shape: one closure per axis, so the browser can re-read every axis
inside one tracked `$derived` on invalidation. A server render has no tracking to do, so it was
allocating **eleven closures and an options object per rendered part** to deliver values the caller
already held, then calling all eleven. `resolvePresentationSnapshot` is now `resolvePresentation`
over a plain `PresentationValues`; the server builds that object directly and the browser still goes
through `createPresentation`, whose `$derived` genuinely needs the thunks. One resolver, two callers.

### Measured

Interleaved same-process A/B (`.bench-ab/perf-ab.mjs`) — both bundles built from this tree, one with
the change reverted, Svelte external so they share a runtime, arms interleaved per round, endpoints
floored separately. Medians of three runs; **output byte-identical on every layer**:

| layer         | change                                                    |
| ------------- | --------------------------------------------------------- |
| `htmlatom`    | −6% (noisiest layer; individual runs spanned −15% to +9%) |
| `card`        | **−5.5%**                                                 |
| `card-preset` | −4.5%                                                     |
| `datagrid`    | −7.4%                                                     |
| `tree`        | −7.9%                                                     |
| `collapsible` | −4.1%                                                     |

On the compare harness `micro.card` went 60.27 → 54.36 µs, ratio 5.13× → **4.51×**.

## 4. Measurement fixes made along the way

- **`results/` was split across two subjects.** `ssr/client/micro/parts/fidelity` had been re-run on
  a newer tarball while `bundle/build/dx/scaling` sat on an older one, so `bundle.json` reported the
  table route at 1,998,814 B against `ssr.json`'s 1,746,334 B for the _same page_ — the anchor diet
  had landed in between. `gate.mjs` only checked provenance on four of nine tasks; it now checks all
  nine, with a test that walks each. `install` stays out: it wipes `node_modules` and is excluded
  from `bench all`.
- **The compare harness's `scaling` task has ≥16% run-to-run noise.** Between two runs where shadcn's
  code did not change at all, its fitted marginal moved 13.54 → 11.30 µs. Never read a single run of
  it; the interleaved A/B is the instrument for anything under ~10%.
- **`link:` is intended, not drift.** `apps/ixir` consumes the sibling checkout's `dist/` live
  (`compare/README.md:130`), with `resolve.dedupe` preventing two Svelte copies. The consequence
  worth knowing: provenance hashes the _tarball_, so the documented "rebuild the library, no re-pack"
  workflow can leave `subjectSha256` describing source the run did not use. Always `bun run setup`.

## 5. Tried and reverted — do not redo without an A/B

**`PartElement` as a class.** `buildPartElement` returns an object literal with five methods, i.e.
five closures per rendered part. Moving them onto a shared prototype should have cut allocation on
the hottest path in the library. It measured _worse_: against an identical base, `card` fell from
−7.1% to −2.8% and `datagrid` from −7.4% to −2.5%. The closures capture one context object and the
call sites stay monomorphic; the class added a prototype hop and a `this` load to getters the
renderer calls several times per part. The comment at the return site records this.

## 6. Still open

Ranked by what the profile says is left, not by guesswork:

1. **GC at 13.4%** — the largest single line. The remaining per-part allocations are the config
   object, `elementAttrs`' output plus its unconditional `getOwnPropertySymbols` array, the merged
   attrs from `mergeAtomPresentationProps`, and the snapshot.
2. **`get_or_init_context_map` at 4.7%** — three context reads per part (`usePart`'s definition,
   `RootBond.get()`, `getPreset()`). Collapsing them needs one combined render-environment context,
   which is a publication change, not a local one.
3. **The Bond + Atom + registration cost**, ~4.7 µs/part and the whole of the 3.46× on `card1` where
   there are no parts at all. This is what the inert-part fast path in the plan targets: a slot
   declaring neither `atom` nor `role` is statically known at `defineBond` time (`define.svelte.ts`
   already synthesizes a default Atom for exactly those), so it could skip Atom construction,
   registration and capability activation while still computing the same id string — which is what
   keeps the markup, and therefore every fingerprint, unchanged.
