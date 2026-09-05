# Integrated performance evidence

See [the report](../../performance-plan-validation-2026-09.md) for accepted claims and limitations.
`manifest.json` pins the nine-file baseline, runtime/fixture/helper hashes and size artifacts.
`final-a/b/c.json` and `final-repeat.json` are accepted final-protocol samples; `comparison-*.json`
are exploratory and are not accepted motion-heap evidence. Other JSON and text files retain verification,
profiling, styled integration and a separately qualified competitive runtime diagnostic.

Run from the repository root. Builds never rewrite runtime source: the reference Vite plugin substitutes
nine git blobs in memory. All other source—including current fixtures—is identical between arms.

```sh
for side in before after; do
  ref=''
  if [ "$side" = before ]; then ref=3f05960e2f7239b66e2093bf34fcd2e645d68eca; fi
  timeout 180s env BENCH_REFERENCE="$ref" BENCH_STYLED=1 \
    BENCH_CLIENT_ENTRY=../../docs/research/evidence/performance-plan/client.mjs \
    BENCH_CLIENT_NAME=Integrated BENCH_CLIENT_FILE=client.js \
    BENCH_CLIENT_OUT=.bench-out/m7-$side \
    bunx vite build -c docs/research/evidence/performance-plan/build.config.mjs || break
done
# Run in separate bounded calls; memory snapshots are deliberately outside latency sampling.
timeout 180s node docs/research/evidence/performance-plan/compare.mjs default merged > /tmp/final-a.json
timeout 180s node docs/research/evidence/performance-plan/compare.mjs static reactive > /tmp/final-b.json
timeout 180s node docs/research/evidence/performance-plan/compare.mjs motion selection > /tmp/final-c.json
# Repeat the last command separately for repeatability evidence.
```

Stop if any command fails or times out; do not interpret partial JSON as evidence. Run on an idle machine.
The driver checks exact HTML equality, styling, callbacks, reactive updates and teardown, and fails on
browser diagnostics. It records raw pairs, bundle hashes and four heap slopes. Heap snapshots sum all
node `self_size` fields after full GC; the 100→800 slope cancels fixed page cost but cannot quantify fixed
cache metadata. Initial warmups precede snapshots. Animation completion is awaited before snapshots.

For independent gates and SSR/styled drivers, use [the canonical command list](../../../../src/lib/test/perf/README.md).
The five-family size reference was built with `scripts/bench-vs-size.mjs`, inserting only
`build.config.mjs`'s first (source substitution) plugin before its existing Svelte plugin and using the
same reference revision. No bundler options or family entries were otherwise changed; before/after
`slice.js` sizes and hashes are recorded in the manifest.

Profiles use a freshly built `VsBench` bundle and `scripts/bench-vs-profile.mjs tree ixir 2000` /
`card ixir 2000 --broad`. These are warmed attribution samples, not comparative latency measurements.
