# Performance evidence

The runtime microbenchmarks, styled integration workloads and algorithm/growth gates answer different questions. Do not combine them into a blanket claim that one library is faster.

## Authoritative commands

```sh
# SSR: builds from source, exposes GC, reports endpoint medians and paired intervals.
bun run bench:vs-shadcn -- button card table
# Client: mount/hydrate/targeted/broad, raw samples and reachable heap.
bun run bench:vs-shadcn:client -- button card table --json
# After building, invoke the driver directly for JSON without Vite build logs.
node scripts/bench-vs-client.mjs button card table --json > /tmp/client.json

# Growth gate: JSON still evaluates budgets and returns a failing exit status.
bun run bench:growth
node scripts/bench-growth.mjs --json > /tmp/growth.json
# Pure evaluator and algorithm ceiling tests.
bunx vitest run --project server scripts/growth-gate.spec.mjs src/lib/test/perf/samples.spec.ts
bunx vitest run --project client src/lib/test/perf/algorithm-baseline.svelte.spec.ts
bunx vitest run --project client src/lib/components/tree/tree-traversal.svelte.spec.ts

# Styled application CSS + assertions, raw end-to-end timings and frame intervals.
# This command puts build output on stderr, so stdout is valid JSON.
bun run bench:workloads > /tmp/workloads-chromium.json
# Optional cross-browser diagnostics, not required M1/CI gates:
node scripts/bench-workloads.mjs --browser=firefox > /tmp/workloads-firefox.json
node scripts/bench-workloads.mjs --browser=webkit > /tmp/workloads-webkit.json
node scripts/bench-workloads.mjs --reduced-motion motion > /tmp/reduced-motion.json
BENCH_N=1000 node scripts/bench-workloads.mjs selection > /tmp/selection-1000.json
```

Browser commands require Playwright browsers and their system dependencies. Missing browsers, CSS, markup, scenarios, samples or unexpected browser warnings/errors are failures, not skips. CI builds the styled bundle once and exercises it in Chromium. Playwright E2E, Vitest browser tests and workload defaults all use Chromium. Firefox/WebKit workload overrides remain optional diagnostics, not required gates. Run scripts with bounded execution time, not watch mode.

## Claims and fixtures

| Workload                                       | What is asserted / measured                                                                       | What it does not establish                                           |
| ---------------------------------------------- | ------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------- |
| Button pair                                    | Same count, text, native button type, consumer click callback, class updates, mount and hydration | Pixel identity, every Button feature, or all-library superiority     |
| Card, grid/table, input, accordion, menu       | Diagnostic integration costs; semantic differences explicitly classified                          | Behavioral equivalence merely because tag counts match               |
| Direct-import arms                             | Cost of an ixir call-site choice                                                                  | A fair direct-versus-direct competitive claim                        |
| Popover comparison                             | ixir now includes a Root portal host so content actually mounts; opponent is ContentStatic        | Equivalent positioned-overlay work                                   |
| Tree comparison                                | Library versus handwritten floor                                                                  | A shadcn comparison                                                  |
| Styled default/static/merged/variants/reactive | Context-scoped presets, expected attrs, live updates, click and teardown                          | Global-install fast-path numbers; exhaustive theme parity            |
| Styled selection                               | Bulk selection and every item's selected ARIA, including a 1,000-item run                         | A Select/DataGrid end-to-end competitor comparison                   |
| Styled motion                                  | Real animate driver per node, geometry, completion, cleanup and reduced-motion mode               | Native microsecond overhead separated from animation duration        |
| Positioned overlay smoke                       | Portal content, reactive offset movement, closed-state opacity/inertness and teardown             | Exhaustive focus policies or a positioning-throughput benchmark      |
| Expanded tree smoke                            | Expanded breadth, exact node count and ArrowDown focus                                            | Deep-tree timing; the existing depth-growth fixture covers that axis |

Styled timings include two frame waits and animation completion. `frameIntervals` are observed rAF intervals, not proof of a particular paint time or layout count. The application stylesheet is compiled with the installed Tailwind plugin; JS/CSS hashes identify the measured artifacts. No theme is simplified to remove motion or customization.

## Sampling and interpretation

- SSR and synchronous client benchmarks counterbalance family/side order and count order. Client GC runs between arms, outside timing; SSR GC runs before each side. Warmup rounds remain excluded.
- Defaults are 19 total rounds with 3 warmups: 16 measured rounds. Raw endpoint samples are retained. Displayed endpoint-median slopes and the ratio-of-means interval estimator are different summaries and are labeled accordingly.
- `pairedComparison` uses a deterministic 2,000-resample percentile bootstrap over adjacent two-round blocks. Opposite execution orders remain paired. At least eight such blocks are required; odd/short runs return `inconclusive`. Invalid/unpaired/nonfinite data throws; nonpositive marginal costs cannot establish a ratio.
- Reported 95% intervals describe one run under its sampling assumptions. They are not simultaneous confidence bounds across all families, do not eliminate autocorrelation or systematic bias, and do not prove reproducibility.
- A competitive claim requires an executable equivalent workload, a quiet machine, repeated independent runs with consistent direction, and an interval below 1 for the named axis. Busy runs and integration-only fixtures remain diagnostic even if their interval excludes 1. No timing threshold is silently applied to unrelated memory, bundle or visual axes.
- Growth uses all four log-time points. Historical endpoint budgets remain compared to historical endpoints, avoiding a silent baseline reinterpretation. Both fitted and endpoint exponents face the 1.5 ceiling; endpoint regression allowance remains 0.3. These broad, pre-existing budgets detect gross growth defects, not small constant-factor regressions. Load/GC/fixed overhead still affect fitted growth.
- Algorithm tests enforce linear membership work for default-equality bulk selection and Accordion bulk open/close (M2). Custom equality still scans by contract. Roving uses two complete-list reads for a successful navigation request (M4): one before and one after the write. Probes restore temporary Array/Set instrumentation before assertions or asynchronous work.

## M1 verification checkpoint

At M1, runtime source was unchanged. Local checks passed: typecheck without warnings; sampling/growth evaluator tests; algorithm work ceilings; all nine growth fixtures; Chromium and Firefox styled workloads; Button parity on both creation paths; positioning and expanded-tree smoke; reduced-motion and 1,000-item selection runs.

A diagnostic 16-round Chromium run on Ryzen 9 PRO 8945HS (load 3.05/16, Svelte 5.56.8, bits-ui 2.19.0, registry b7278016a3be6377) reported these **within-run** Button ratios (ixir/opponent): mount 0.746 [0.686, 0.807], hydrate 0.887 [0.832, 0.961], targeted 0.930 [0.845, 1.058], broad 1.090 [1.016, 1.148]. SSR in a separate run was higher, not lower. These are a baseline, not an optimization result or a production claim; raw local artifacts live under `/tmp/m1-*` and are ephemeral. Re-record independently before claiming reproducible competitive wins.

**User-approved scope revision:** M1 and its CI gates are Chromium-only. Local WebKit could not launch because host dependencies were missing; after installation attempts, the user explicitly removed the Firefox/WebKit requirement. This resolves the M1 acceptance blocker by changing verification scope, not by proving WebKit compatibility. Cross-browser parity is not claimed; optional browser overrides remain available.

## M2 behavior-model checkpoint

Disclosure now performs boolean operations directly, preserving even backing read/write order and
repeated requests. Default-equality batches of eight or more use temporary Sets; smaller requests
retain scans. Stored duplicates, insertion order, SameValueZero, sparse-array behavior, custom
comparator direction, array-valued items and rejected controlled commits remain covered by tests.
Accordion bulk open/close uses the same membership approach and retains its equality-gated callbacks.

**User-approved boundary:** Accordion's `isValueOpen` keeps live scans. Plain mutable arrays are
supported, so an identity-based persistent cache would be unsafe without a new backing contract.
No new public switch, persistent cache or registration dependency was added. Bulk Sets add transient
O(n + m) space, not retained state.

The full suite passed (792 tests), followed by the added Accordion work gate and focused checks
(35 tests). Typecheck was clean; all nine growth scenarios, SSR output fingerprints, seven styled
Chromium scenarios, 1,000-item selection, Button mount/hydration and positioned-overlay assertions
passed. SSR timing budgets were disabled for the machine-specific comparison. Growth ran under
heavy load and is evidence against gross nonlinear regression, not a constant-factor speed claim.

Exploratory same-process **server-compiled model** measurements (20 rounds, four warmups, alternating
sides, GC before each arm) reported new/old ratios: disclosure construction/read/toggle at 20,000
instances 0.234 [0.209, 0.262]; select 10,000 then deselect 5,000 at 0.0090 [0.0073, 0.0111]. Intervals
use the M1 paired block bootstrap. These are one-run diagnostics, not browser, allocation, memory
or competitive claims. Local source snapshots, raw samples and logs in `/tmp/ixir-m2/` are ephemeral;
M7 must re-record any published comparisons independently.

The full suite still emits diagnostic noise: virtual Select's stderr `null` was reproduced with the
saved **pre-M2** selection implementation; composed DatePicker attribute conflicts, route-test missing
portal sinks and the deliberate Button precedence conflict also appear. A cold Vite dependency scan
cannot resolve exported Svelte snippets and can reload tests; the subsequent focused run was clean.
These are not counted as benchmark parity: the styled harness separately rejects unexpected browser
diagnostics and passed. No unrelated diagnostic behavior was changed in M2.

## M3 motion-batch checkpoint

`flushPending` now uses two batch-local Sets (width/height) rather than scanning the displaced-value
list. The list still owns first-value capture and restoration order; runs, measurements and animations
are **not** deduplicated. All writes precede all reads, all restores precede all starts, and membership
is discarded after the flush. Auxiliary space is O(unique node/axis pairs), with no retained node cache.

`bunx vitest run --project server src/lib/utils/animate.spec.ts` covers duplicate runs and dimension
aliases, both axes, zero-size bounding-rect fallback, phase order, subsequent batches, queued/started
cancellation, rejected animation promises, completion/fill cleanup, reduced motion and missing WAAPI.
The work gate failed on the old implementation at 40,000 comparisons for 100 nodes; the new path is
bounded by four node-membership lookups per node at 100/200/400 nodes, with zero displaced-list scans.

Verification: 800 tests across 162 files passed; typecheck and targeted lint passed; all nine growth
scenarios and SSR fingerprints passed (SSR timing budgets disabled). Freshly built styled Chromium
motion passed at 1,000 nodes in normal and reduced-motion modes, including completion/teardown,
Button mount/hydration and positioning assertions, with no unexpected browser diagnostics. The first
full-suite attempt was invalidated by Vite dependency discovery/reloads; the unchanged warmed-cache
rerun passed. The diagnostic noise documented under M2 remains outside benchmark parity claims.

A one-run Node/mock-node diagnostic at 4,000 nodes (20 alternating rounds, four warmups, GC outside
timing) measured after/before 0.086 [0.054, 0.157] for four auto-dimension targets per node. The no-auto
opacity control was inconclusive: 1.027 [0.889, 1.164]. These paired-bootstrap intervals describe CPU
work with resolved mock WAAPI promises, **not** browser layout, actual animation duration or competitive
performance. Scripts, snapshots and raw samples are ephemeral under `/tmp/ixir-m3/`; M7 must re-record
any published comparisons independently.

## M4 tree-navigation checkpoint

Native `TreeBond.visibleHeaderIds` now walks live child iterators with one output array and an explicit
O(depth) iterator stack. It preserves preorder, disabled/closed subtree pruning and headerless nodes,
without recursive calls or copying every descendant into each ancestor's array. Subclasses, instance
visibility overrides and structural `ITreeNode` adapters still own their `visibleHeaderIds` contract:
their getter is called rather than bypassed. The linear/stack-safe guarantee applies to native nodes,
not arbitrary extension getters (including recursively implemented subclasses). No public seam changed.

Roving navigation shares only the pre-write ID list. Its return value still validates live membership
after `active.set`, including rejection, normalization, array replacement and in-place mutation by the
owner. No pre-write snapshot is used to validate a write. The existing active-slot validation cache and primitive
`focusedId` equality gate remain unchanged; no reactive collection or per-registration fan-out was added.

The old 100-node chain failed the work gate at 4,950 copied descendant IDs; native traversal now copies
at most n IDs at 100/200/400 nodes. A 10,000-level native chain also passes. Successful next/previous/
first/last/goto requests read the list twice, down from four reads for next/previous. Verification:
810 tests across 163 files; clean typecheck and targeted lint; nine growth scenarios; unchanged SSR
fingerprints with timing budgets disabled; seven freshly built styled Chromium scenarios, expanded-tree
keyboard smoke, Button mount/hydration parity and positioning/teardown checks. Existing unit-test
warnings described under M2 remain; the styled harness reported no unexpected browser diagnostics.

One-run server-compiled Bond diagnostics (1,000 nodes, 40 operations per arm, 20 alternating rounds,
four warmups, GC before each arm) produced these after/before paired-bootstrap ratios:

| Shape / operation | Ratio | Diagnostic 95% interval       |
| ----------------- | ----- | ----------------------------- |
| Deep flatten      | 0.047 | [0.043, 0.052]                |
| Deep navigation   | 0.024 | [0.022, 0.027]                |
| Broad flatten     | 1.115 | [0.879, 1.374] — inconclusive |
| Broad navigation  | 0.668 | [0.628, 0.709]                |

These measure model work without DOM focus, layout or rendering, not browser or competitive latency.
Broad flattening alone does not establish an improvement or absence of regression. Snapshots, the
benchmark script and raw samples are ephemeral under `/tmp/ixir-m4/`; M7 must independently re-record
published results. The known depth-mount defect is not claimed fixed by this traversal change.

## M5 rejected result-cache experiment (historical checkpoint)

Inspection found that the registry's public entries are factories. Neither a frozen registry nor a
frozen returned record proves that a factory is independent of Bond state or other live inputs.
The user approved a narrower experiment: keep factories invoked/tracked, and reuse only provably
immutable class-only composition results. Mutable/getter-backed/rich records must retain normal
resolution, and the authoring resolver must still return fresh mutable merged records.

The experiment used internal weakly keyed pair reuse, without changing the public API. Its parity
checks passed, including reactive factory reads and two independent Bond choices. However, the first
merge-only diagnostic was slower for all three controls. An early cache probe then improved frozen
composition but penalized mutable composition:

| 20,000 merges per arm   | After/before | Diagnostic 95% interval       |
| ----------------------- | ------------ | ----------------------------- |
| Frozen class-only pair  | 0.614        | [0.576, 0.654]                |
| Mutable class-only pair | 1.394        | [1.299, 1.467]                |
| Rich pair               | 1.071        | [0.851, 1.337] — inconclusive |

This was one Node run with 20 alternating rounds, four warmups and GC before each arm, using the
paired block bootstrap. It measures helper work, not browser latency. No end-to-end improvement was
established, and the mutable control clearly regressed within this run. **That experiment was removed before the structure-only work below.** The restored preset/resolver tests pass (14 tests).

At that checkpoint M5 needed refinement: an explicit static-entry contract, a different optimization,
or an expressly accepted trade-off. M5 was not marked complete at that checkpoint. Source snapshots,
candidate tests, the reproducible comparison script and raw samples are ephemeral in `/tmp/ixir-m5/`.

### M5 internal follow-up — no verified gain

The user chose another internal experiment, retaining the API and live-factory behavior. Lazy
allocation of the compounds/variants scratch arrays avoided constructing unused lists without adding
cache probes. Both the original 20,000-merge diagnostic and a longer 200,000-merge run were inconclusive.
The latter reported after/before: frozen 0.991 [0.911, 1.084], mutable 0.960 [0.900, 1.027], rich 1.022
[0.971, 1.064]. Sampling retained 20 alternating rounds, four warmups and GC outside timing.

The change was removed under the instruction to retain only verified improvements. No runtime change was retained at that checkpoint; investigation continued below. Candidate source and raw samples are under `/tmp/ixir-m5/`
(`preset-lazy-candidate.ts`, `lazy-long-comparison.json`). These negative results do not prove that
all internal optimizations are exhausted, only that these candidates have not justified shipping.

## M5 retained approach — reuse composition structure, not values

After the user chose another internal investigation, the useful invariant proved to be the immutable
**pair of entries installed by `mergePreset`/`setPreset`/`installPreset`**, not either factory's result.
The preset layer now records that pair weakly. Kernel prepares a shared resolver once for a composed
entry and retains a reference on its Handle. Resolution invokes both original sides before normalizing
either, preserving mutation/getter order and nested merge grouping, but skips the outer temporary
merged-layer object and frozen array. Every factory remains live and tracked; every merged record
remains fresh and mutable. No purity flag, deep-freeze requirement or public API was introduced.

The ordinary authoring resolver and legacy presentation path remain unchanged. A Kernel preset-key or
registry-entry change that no longer matches the prepared entry uses the ordinary path. Nested
composition wrappers are deliberately not flattened: their evaluation order is part of the contract.
Weak caches hold configuration plans only, not Bond-specific results. The trade-off is a prepared-plan
reference per Handle and small per-composed-entry metadata, not a claim of reduced retained heap.

The runnable gate in `kernel/resolve/prepared-preset.spec.ts` proves that 100/200/400 resolutions drop
outer-wrapper freeze calls from 2n to zero while both factories still execute n times each. Additional
checks cover fresh mutable output, accessor ordering, rich nested precedence, null motion, empty
results, reactive Bond isolation and registry replacement in rendered elements.

### Evidence and limits

Prepared-resolver model diagnostics use 100,000 resolutions per arm, 20 alternating rounds, four
warmups and GC outside timing. Two repeat runs reported these after/before paired-bootstrap ratios:

| Entry                       | Repeat 1             | Repeat 2             |
| --------------------------- | -------------------- | -------------------- |
| Frozen factory results      | 0.351 [0.309, 0.396] | 0.382 [0.323, 0.440] |
| Mutable factory results     | 0.351 [0.269, 0.458] | 0.360 [0.332, 0.393] |
| Rich results                | 0.572 [0.449, 0.724] | 0.714 [0.649, 0.770] |
| Ordinary uncomposed control | 0.964 [0.846, 1.049] | 0.969 [0.779, 1.146] |

These are resolver-work diagnostics, not browser speedup claims. An earlier busy run had an extreme
mutable-case interval [0.311, 6.007] and was inconclusive; it remains in the raw evidence. An initial
per-resolution plan lookup penalized ordinary factories, so preparation was moved to Kernel init and
the legacy resolver was left alone.

Styled Chromium A/B runs used the unchanged customization fixture, 500 buttons, 20 counterbalanced
rounds/four warmups, GC before each arm and synchronous mount/flush or update/flush timing (layout and
paint excluded). Both arms asserted exact rendered-HTML equality, CSS, callbacks, reactive updates
and teardown. The final-source run found all intervals inconclusive: default mount 0.974 [0.923, 1.035],
static mount 0.950 [0.903, 1.005], merged mount 0.971 [0.927, 1.017], reactive mount 0.945 [0.870, 1.031];
update intervals also crossed 1. Earlier runs occasionally showed lower updates, but not consistently.
**No reproducible component-level or competitive speedup is claimed.** The retained gain is reduced
composition work, with no statistically resolved regression in those styled controls.

Verification: 815 tests across 165 files; typecheck with zero errors/warnings; targeted lint; all nine
growth scenarios; unchanged SSR fingerprints with machine-specific timing gates disabled; all seven
freshly built styled Chromium workloads plus Button hydration, positioning and expanded-tree checks.
Unit-test diagnostic noise and graphify's partial Svelte extraction warnings remain as documented.
Scripts, source overrides, hashes and raw samples live under `/tmp/ixir-m5/structure/` and are ephemeral;
M7 must independently re-record any final published comparisons and assess retained-memory trade-offs.

## M6 — one motion owner on the active render path

Kernel retains motion options at initialization, but constructs the runtime only when a native
transition leaf is selected by `Kernel.render` (still during component initialization). HtmlElement
and custom component/snippet renderers continue receiving raw motion and owning their own lifecycle.
No owner-passing prop, renderer protocol, public option or rendering boundary was added. Explicit
native-leaf access through `motion()` also resolves the same owner once; it must happen during init.
The unused legacy `useKernelElement` implementation was not changed.

`kernel/render/motion-ownership.svelte.spec.ts` counts real runtime construction and verifies rendered
outcomes. Animate-only div/dynamic elements fall from two runtimes to one; a custom Kernel wrapper
falls from three to one. Native local/global div/dynamic transitions remain at one, plain leaves at
zero, and a custom snippet ignoring motion no longer creates an unused runtime. Mount, initial,
animate, cleanup, destruction, reactive motion changes and custom renderer replacement are checked;
existing transition tests retain intro/exit and post-intro animation coverage.

Verification includes the full unit suite, clean typecheck, targeted lint/format, nine growth gates,
unchanged SSR fingerprints and seven freshly built styled Chromium workloads. The motion workload
also passes at 1,000 nodes in normal and reduced-motion modes. Evidence is ephemeral under
`/tmp/ixir-m6/`. This is a verified construction-work reduction, **not a measured browser speedup**;
M7 owns integrated timing and retained-memory comparisons.

## Final integrated validation (M7)

The [final report](../../../../docs/research/performance-plan-validation-2026-09.md) records acceptance,
repeatability, size/memory trade-offs and deferred profile findings. Raw evidence and runnable cumulative
before/after helpers are checked in beside it, rather than relying on `/tmp` artifacts. The reproducible
browser finding is scoped to synchronous mount of the animate-only Button fixture; general presentation,
selection-update and competitive UI speedups remain unproven. Full lint retains the unrelated existing
`.codex/hooks.json` formatting exception; ESLint and scoped formatting pass independently.
