# Head-to-head harness: `@ixirjs/ui` vs shadcn-svelte

Everything a third party needs to re-run the comparison in
`docs/research/perf-vs-shadcn-2026-08.md`.

## What lives here

- `shadcn/` — **vendored shadcn-svelte source**, exactly what their CLI writes into a project, with
  the `$UTILS$` placeholder pointed at `shadcn/utils.ts` (their `utils` registry item, verbatim).
  Third-party code: excluded from `eslint`, `prettier` and `tsconfig`. Do not edit it — the next
  fetch overwrites it, and an edit would make the provenance hash lie.
- `provenance.json` — the pin. The shadcn registry is unversioned, so a **content hash over every
  fetched file** is the version. Also records bits-ui, tailwind-variants and the Svelte version that
  compiles **both** sides.

The fixtures, the runners and the DOM census live with the rest of the perf suite, in
`src/lib/test/perf/vs-shadcn/`, because a `.svelte` file used only by tests belongs under
`src/lib/test/` (AGENTS.md, "Tests and stories").

## Running it

```bash
bun run bench:vs-shadcn            # SSR: µs/unit, GC share, bytes/anchors/elements, skeleton parity
bun run bench:vs-shadcn:client     # mount, hydrate, targeted update, update storm, live DOM, heap
bun run bench:vs-shadcn:size       # shipped JS: raw / gzip / brotli
bun run bench:vs-shadcn -- card table          # one or more families
bun run bench:vs-shadcn -- --json              # machine-readable, for a write-up

node scripts/bench-vs-profile.mjs accordion ixir 400     # client CPU profile, warmed
node scripts/bench-vs-profile.mjs accordion --scale      # mount curve, both sides — is it linear?
```

Attribution on the server uses the existing `LAYER=<layer> bun run profile:ssr`.

## Re-pinning the opponent

```bash
bun run bench:vs-shadcn:fetch              # refetch and rewrite provenance.json
node scripts/fetch-shadcn.mjs --verify     # fail if the live registry no longer matches the pin
```

A refetch that changes the hash invalidates every µs figure in the write-up against the new
opponent, and the comparison should be re-run rather than patched.

## Reading the numbers honestly

- **Run on a quiet machine.** Both runners print the 1-minute load average and shout when it is above
  a quarter of the core count. An early run of this harness at load 11-of-16 reported `card` at
  76.45 µs where the same tree gives 13.96 idle, and moved the ixir-vs-shadcn ratio from +107% to
  +164%. Interleaving the sides does not save you from this.
- **Run it three times and compare medians.** The IQR printed beside each SSR figure is the
  resolution; a gap narrower than it is marked `~` and is not a result.
- **Byte-identical output is impossible between two libraries.** Parity is asserted on the tag +
  `role`/`aria-*` **skeleton**; where the two differ the report prints `≠` and the difference is
  itemised in §2 of the write-up. Every byte, anchor and element difference is reported rather than
  normalised away.
- **The retained-heap column is the noisiest thing here**, even with `--enable-precise-memory-info`.
  Order of magnitude only — and the `card` row is currently implausible (see §4 of the write-up).
