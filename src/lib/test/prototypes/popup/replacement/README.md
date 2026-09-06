# Canonical popup regression harness

The implementation ships from `src/lib/components/overlay/popup/`; local implementation modules
only forward imports. All eight roots and both item paths use canonical construction. No legacy
constructors, constructor substitution, custom factories or source transforms remain here.

- `model.svelte.spec.ts`: disclosure, capability discovery, commands, callback order, dates,
  position promises, registration ownership and disposal.
- `lifecycle.svelte.spec.ts`: nested focus/Escape, outside press, Tooltip hover, modal teardown,
  selection and menu typeahead.
- `motion.svelte.spec.ts`: one lifecycle owner, custom rendering and superseded animation cleanup.
- `contracts.type-test.ts`: full implementation-to-family shape checks and negative authoring checks.
- `ssr.spec.ts`: exact body/head against frozen pre-removal HTML for eight families.
- Shipped family suites and `components/overlay/popup/defaults.svelte.spec.ts` exercise production
  construction directly. Duplicate legacy replays and identity mirrors were removed.

`ssr-reference.json` was captured from the final paired production-compiled bundle before removing
legacy constructors. It is evidence, not an implementation. Do not regenerate it to hide a parity
failure. The client benchmark hydrates this saved HTML with `recover: false`, asserts canonical
root/item identities, compares mount/hydrate DOM counts and checks teardown and browser diagnostics.

```sh
bun run check
bunx vitest run

POPUP_BENCH_TARGET=ssr BENCH_ENTRY=test/prototypes/popup/replacement/ssr.ts \
  BENCH_OUT=.bench-out/popup-replacement-ssr \
  bunx vite build -c src/lib/test/prototypes/popup/replacement/bench.vite.config.ts

BENCH_CLIENT_ENTRY=test/prototypes/popup/replacement/client.svelte.ts \
  BENCH_CLIENT_NAME=PopupReplacement BENCH_CLIENT_FILE=client.js \
  BENCH_CLIENT_OUT=.bench-out/popup-replacement-client \
  bunx vite build -c src/lib/test/prototypes/popup/replacement/bench.vite.config.ts

node src/lib/test/prototypes/popup/replacement/bench.mjs
```

The driver retains the existing menu/select growth gate and baseline. `benchmark-result.json`
records a canonical-only run, not a new baseline or a live comparison with the deleted runtime.
Workloads remain unstyled; published bundle size and retained heap are not measured.
