# Growth-shape benchmark

Answers one question per family: **does mounting n children cost O(n), or worse?**

## Why this exists as a separate harness

`bench:ssr` measures a _slope_ between two instance counts. A slope cannot tell linear apart from
quadratic — it just reports a bigger number, and a ±15% budget absorbs a lot of "bigger". Two real
O(n²) defects (`docs/research/perf-vs-shadcn-2026-08.md` §7) lived in the library for months without
moving a single existing gate.

**And they were unreachable from SSR at all.** Children register with their parent from an atom's
`onmount`, which never fires on the server, so a server render sees an _empty_ collection and the
per-child O(n) read is O(1). Measured directly: the pre-fix tree renders at k = 0.60 on the server
and k = 2.51 in a browser. Any gate for this class has to mount in a real client.

## What it measures

`t ∝ n^k`, fitted over four mount sizes. `k ≈ 1` is linear; `k ≈ 2` is quadratic.

The exponent is the point, not the milliseconds. Unlike a µs budget it is **machine-independent** —
a slow or busy machine scales every point together and leaves the exponent alone — so this gate can
run anywhere, which `ssr-baseline.json` explicitly cannot (it needs `--no-gate` off its recording
machine).

## The fixture rule: one owner, n children

Every fixture here mounts **one parent Bond with n registered children**. This is not a style
preference — it is the entire reason the defect class hid:
`src/lib/test/perf/tree-ablation.test.svelte` renders n _independent_ `Tree.Root`s, each its own
keyboard owner with an empty child collection, so the per-tree cost never multiplies and the
quadratic is structurally unreachable. A fixture that does not concentrate n children under one
owner cannot catch this, however many nodes it renders.

## Running

```
bun run bench:growth              # all families, gate against growth-baseline.json
bun run bench:growth -- tree      # one family
bun run bench:growth -- --update  # accept current exponents as the new baseline
```
