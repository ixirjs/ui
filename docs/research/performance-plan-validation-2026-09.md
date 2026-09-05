# Performance plan: integrated validation

## Verdict

The seven-mission implementation preserves the tested public behavior and reduces specific algorithm
and construction work. **It does not establish a general UI or competitive speed advantage.**
The strongest fresh browser result is lower synchronous mount time and retained heap for this
animate-only Button workload. Static-preset browser acceleration remains unproven.

All measurements below use Chromium 147.0.7727.15 on an AMD Ryzen 9 PRO 8945HS, 16 logical CPUs,
Node 24.13.1, Bun 1.4.0, Svelte 5.56.8 and Vite 7.3.2. This is one machine, not a cross-device claim.
Raw evidence, source hashes and runnable comparison helpers are in
[evidence/performance-plan](./evidence/performance-plan/README.md).

## Acceptance checks

| Axis               | Final evidence                                                           | Qualification                                                                                                                                                                       |
| ------------------ | ------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Behavior/API       | 827 tests, 166 files pass                                                | Controlled writes, equality, live mutable backings, callbacks, tree navigation, ARIA/keyboard, custom renderers and motion lifecycle covered; not an exhaustive accessibility audit |
| Types              | Zero errors or warnings                                                  | `bun run check`                                                                                                                                                                     |
| Lint               | ESLint and strict prop synchronization pass                              | Full `bun run lint` stops at pre-existing `.codex/hooks.json` formatting; left untouched. Formatting passes excluding that file                                                     |
| Algorithm gates    | Full suite plus 10 focused evaluator/sampling checks pass                | Work counts, not latency claims                                                                                                                                                     |
| Mount growth       | Nine scenarios pass existing budgets                                     | Tree-depth k=1.22 remains a known open defect, not a new target or proof of linearity                                                                                               |
| SSR/hydration      | Eight SSR fixture fingerprints unchanged; Button hydration parity passes | Machine-specific SSR timing budgets disabled; historical percentage annotations are not used as evidence of this patch's speedup                                                    |
| Styled integration | Seven scenarios pass; positioning and expanded-tree checks pass          | CSS, callbacks, reactive updates, portal teardown and unexpected browser diagnostics checked                                                                                        |
| Stress/motion      | 1,000-node selection and motion pass; reduced-motion also passes         | No remaining animations after workload teardown                                                                                                                                     |
| Browser scope      | Chromium required and verified                                           | Firefox/WebKit optional and not re-run; prior WebKit system-dependency limitation remains                                                                                           |

An initial manual invocation of the Vitest gate file with `node --test` was invalid; it was corrected
to Vitest. The focused 10-test run and full suite both pass. Existing unit-test diagnostic noise remains;
the independent styled browser driver rejects unexpected warnings/errors and passed.

Production build and all **five Chromium E2E tests** pass, including documentation-page controlled
round trips and Escape dismissal. Storybook builds successfully. `svelte-package` and `publint` pass;
packaging warns about inferred declarations for the two size-benchmark entry files under `test/perf`,
which are excluded from the published package. Production/Storybook builds report large-chunk warnings.
The release-time surface-archive write was intentionally not invoked during validation.

## Verified work reductions

- Disclosure uses direct booleans while retaining the characterized access/write semantics.
- Default-equality bulk selection and Accordion bulk operations use temporary membership indexes;
  custom equality and live externally mutable arrays retain their existing behavior.
- Motion-batch node/axis deduplication is linear; measurement/write/restore/start order is unchanged.
- Native tree visibility uses one output array and an iterator stack; a 10,000-level model chain
  succeeds. Custom visibility getters remain authoritative. Navigation shares pre-write reads but
  validates fresh controlled state after writes.
- Installed preset composition reuses structure, never factory results: the 100/200/400 gate eliminates
  2n outer freezes while retaining every factory call, tracked dependency, precedence and fresh output.
- Animate-only Kernel delegation constructs one motion runtime instead of two; a custom Kernel
  wrapper uses one instead of three. Native local/global transition leaves still use one. Lifecycle,
  live motion changes and custom renderer replacement retain their tests.

These gates independently justify retaining the optimizations even where wall-clock intervals remain
inconclusive. They do not imply that every rendered workload improves.

## Cumulative before/after browser comparison

Both arms use identical current styled fixtures and measurement code. The reference substitutes only
nine runtime files from `3f05960e2f7239b66e2093bf34fcd2e645d68eca`; all other inputs stay current.
This isolates the cumulative runtime patch, **not** an entire historical checkout or an individual
mission. The manifest identifies each substituted file and both source hashes.

Each case mounts 500 Buttons, then changes a shared class; selection also selects all 500 values.
There are 20 counterbalanced rounds, four warmups and 16 retained pairs. Full GC happens outside
timing. Timings cover synchronous mount/flush and update/flush, **excluding layout, paint and animation
completion**. Completion is awaited before output checks and teardown. Both arms must produce exactly
the same HTML and satisfy CSS, callbacks, reactive theme, selection/motion and DOM cleanup assertions.

Entries are after/before ratios of means with paired two-round-block 95% bootstrap intervals
(2,000 resamples). Intervals crossing 1 are inconclusive, not proof of equality or absence of regression.
Heap is the median of four reachable-object snapshot slopes, bytes per Button, using 100 and 800
mounted nodes after motion settles. Heap numbers have no confidence interval.

| Workload  | Mount ratio [95% interval] | Update ratio [95% interval] | Retained bytes, before → after |
| --------- | -------------------------- | --------------------------- | ------------------------------ |
| default   | 1.009 [0.917, 1.105]       | 0.942 [0.761, 1.136]        | 4616 → 4620                    |
| merged    | 0.992 [0.952, 1.029]       | 0.978 [0.920, 1.041]        | 4642 → 4646                    |
| static    | 1.019 [0.948, 1.099]       | 0.964 [0.884, 1.052]        | 4607 → 4624                    |
| reactive  | 1.004 [0.936, 1.075]       | 1.020 [0.971, 1.071]        | 4627 → 4627                    |
| motion    | 0.904 [0.846, 0.968]       | 0.817 [0.738, 0.927]        | 19236 → 17117                  |
| selection | 1.062 [0.959, 1.195]       | 0.889 [0.827, 0.961]        | 4618 → 4610                    |

### Repeatability and limits

A separate final-source repeat found motion mount **0.937 [0.901, 0.975]**, consistent with the first
run's 0.904 [0.846, 0.968]. Motion update was **0.932 [0.832, 1.050]**, inconclusive. Selection update
was **0.964 [0.875, 1.046]**, also inconclusive; its initially lower interval did not repeat.
**Claim only lower synchronous mount cost for this animate-only fixture in these two final runs.**
Do not claim reproducible selection-update, motion-update or static-preset UI acceleration.

Motion heap repeated at approximately 19,234 → 17,127 bytes/Button: about **2.1 KB less per Button**,
roughly 11%. Ordinary controls remain around 4.6 KB; default consistently adds about four bytes per
Button, compatible with the extra prepared-plan reference on each Handle. Static/merged/reactive
variations are small relative to these observations. Fixed per-installation weak-cache metadata cancels
in the slope and is **not quantified**; these numbers do not establish lower total application memory.
DOM/animation teardown checks are not a general heap-leak proof.

Earlier exploratory results are retained as `comparison-*.json`. Their heap collection did not explicitly
await motion completion, so those motion heap samples are excluded from accepted findings. That pilot's
motion mount interval crossed 1. Final data uses the settled protocol in the checked-in helpers.
No multi-comparison correction or multi-machine replication was performed; all intervals are scoped.

## Size and complexity trade-offs

The same minified five-family slice (Button, Card, Accordion, menu, table/DataGrid), with Svelte external,
grows from **249.0 to 250.5 KiB raw**, **65.2 to 65.6 KiB gzip**, **55.6 to 55.9 KiB Brotli**. CSS remains
about 0.4 KiB in this slice; this is not the full application stylesheet. The nine runtime files have
207 added and 78 removed lines (+129), including explanatory comments. No dependency or public tuning
switch was added. This is less repeated runtime work, not less shipped code.

The existing size driver also prints shadcn figures, but these differently capable slices do not prove
application equivalence. A fresh Button runtime diagnostic is archived separately: its mount interval
was lower, other axes inconclusive, and the run is flagged **busy-machine**. It is unstyled runtime
measurement, not competitive styled paint/interaction evidence. No competitive performance claim is
accepted from it.

## Deferred opportunities: profile evidence, not redesign authorization

Freshly built, warmed client profiles provide attribution only:

- Expanded tree, 2,000 nodes: 685 samples over 327 ms; GC ~17%, attribute spreading ~7%, DOM insertion
  ~6%, `setAttribute` ~5%, Kernel resolution ~4%. Model flattening is not the whole mount cost.
- Card broad update, 40 flushes over 400 cards: 356 samples over 150 ms; resolution, class/attribute
  writes, rest-prop proxy enumeration and GC recur. Below 500 samples, rankings are particularly noisy;
  treat this as a stack-shape observation, not precise percentages or a forecast of possible savings.

Priorities for a later, separately authorized investigation:

1. Profile the remaining depth-shaped tree mount directly. The breadth profile above does not explain
   it. Keep the historical depth budget unchanged; DOM depth and effect-tree traversal remain hypotheses.
2. Attribute rich presentation merges and rest-prop enumeration under real updates. Do not revive the
   universally split-memo design: prior measurement rejected it, and this pass did not retest it.
3. Quantify fixed preset-installation metadata under many independent themes before proposing more
   caching. Keep dynamic factory results live and never add mutation-invalidation obligations casually.

No speculative changes were made for these opportunities. Required verification is complete with the
explicit unrelated formatting exception and measurement limitations above.
