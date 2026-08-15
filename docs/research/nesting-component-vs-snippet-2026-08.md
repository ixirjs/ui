# Nested components vs nested module snippets (2026-08-11)

Status: **historical measurement, now embodied by Kernel's direct snippet dispatch.** Retired
adapter names below describe the measured predecessor. The harness lives at
`src/lib/test/perf/nesting/` and is report-only — it writes no baseline, gates nothing, and is not
wired into `bun run test`. Run it with `bun run bench:nesting` and `bun run bench:nesting:client`.

Companion to `hydration-anchor-diet-2026-08.md`, which priced these two seams in _anchors_. This
prices them in time, allocation and live heap, on both the server and the client.

## 1. Question

`components/atom/part-element.svelte` is a module snippet used deliberately **instead of** a
component boundary — "a function call into the caller's renderer — no component boundary, no props
proxy, no context scope". Removing the `HtmlAtom` boundary took Card from 45 µs to 29 µs per card.
That was one measurement, on one component, on the server only.

The general question was never measured: **at nesting depth D with props flowing down, what does a
component boundary cost against a `{@render}` of a cross-file module snippet?** And the client side
was never measured at all — the anchor investigation argued comments hurt hydration, teardown and
heap, but `compare/bench/src/client.mjs` counts only elements, so the claim stood on inference.

## 2. Method

One unit is a chain of `depth` nested levels ending in a leaf. Each level renders one `<div>`, a
label `<span>`, and its body, and carries four facts: `depth`, `label`, `tint` (rendered by every
level) and `deep` (drilled through every level, rendered only by the leaf).

Every figure is a **slope**, over two axes, so fixed setup cancels:

- **per level** — the depth slope at the high unit count: `(t[800,8] − t[800,2]) / (6 × 800)`
- **per unit** — the unit slope at full depth: `(t[800,8] − t[100,8]) / 700`

Endpoints are floored across rounds first, then subtracted; arms interleave at the innermost loop so
drift hits all four equally. SSR reads `.body` inside the timed region (it is a lazy getter); CSR
calls `flushSync()` inside it (the same trap, client-side).

### Four arms, because two conflated two decisions

The first version of this benchmark had two arms — a component taking explicit props, and a snippet
taking one object — and produced a **7× snippet win on SSR** and a **2.4× snippet loss on CSR
targeted updates**. Both were artefacts. The arms differed in _two_ ways at once, and the second one
turned out to matter more than the seam:

|                    | explicit fields | one object packet  |
| ------------------ | --------------- | ------------------ |
| component boundary | `component`     | `component-spread` |
| module snippet     | `snippet`       | `snippet-packet`   |

Read a **column** for the seam's cost; read a **row** for the calling convention's cost. Reading the
diagonal is what produced both wrong answers.

All four arms are asserted to render byte-identical HTML before any timing runs; the harness exits
non-zero otherwise.

Medians of three runs on an AMD Ryzen 9 PRO 8945HS ×16, node v24.13.1, Svelte 5.56.8, chromium via
playwright. Single-run numbers on this machine drift ~11%, so anything under ~10% below is noise.

## 3. Result 1 — the seams are structurally identical

This is the finding that constrains every other one, and it is negative:

| axis                      | component | component-spread | snippet | snippet-packet |
| ------------------------- | --------- | ---------------- | ------- | -------------- |
| SSR bytes / unit          | 828       | 828              | 828     | 828            |
| SSR comment bytes / unit  | 224       | 224              | 224     | 224            |
| SSR anchors / unit        | 27        | 27               | 27      | 27             |
| SSR anchors / **level**   | 3         | 3                | 3       | 3              |
| live elements / unit      | 17        | 17               | 17      | 17             |
| live **comments** / unit  | 18        | 18               | 18      | 18             |
| live comments / **level** | 2         | 2                | 2       | 2              |

The output is identical down to the byte, comments included. A component boundary emits **no
anchors** — which `hydration-anchor-diet-2026-08.md` already states ("boundaries are free") — and
the **+2 that table charges for children through a boundary is paid by both seams**, because a
snippet's body is dispatched through the same optional-callee render tag. Per level both pay
`{#if}` +2 and one body dispatch +1.

So on the anchor axis, which is the axis the library optimised hardest, **there is nothing to
choose between these two seams.** The `part-element` win was never an anchor win at the boundary; it
was `<svelte:element>` and the wrapper snippet hop, both of which that file addressed separately.

## 4. Result 2 — SSR: the seam is worth ~28%, the convention is worth ~165%

µs per nesting level per unit, plus the work-normalised GC figure:

| arm              | µs/level | vs base   | µs/unit@8 | gc%   | gc ns/unit |
| ---------------- | -------- | --------- | --------- | ----- | ---------- |
| component        | 0.466    | —         | 3.567     | 68.7% | 5612       |
| component-spread | 1.237    | **+165%** | 10.178    | 37.8% | 5978       |
| snippet          | 0.334    | **−28%**  | 2.831     | 69.0% | 4991       |
| snippet-packet   | 0.340    | −27%      | 2.972     | 66.8% | 5141       |

Reading the columns: the snippet seam is **~28% cheaper per level** with explicit fields, and ~72%
cheaper against `component-spread`. Reading the rows: `{...data}` into a component costs **+165%**,
while the same object as a single snippet argument costs **nothing measurable** (+2%, inside noise).
That asymmetry is the point — `spread_props` allocates a proxy per component; an object literal
handed to a snippet is just an object literal.

The allocation axis agrees but weakly: the snippet arm collects ~11% less per unit. Note `gc%` is
_not_ comparable across arms — it is each arm's own share, and node's GC entries can overlap on
background threads, so 60–70% means "allocation-bound", not a precise fraction. `component-spread`
shows the _lowest_ share only because it is slow enough to dilute it.

## 5. Result 3 — CSR: the seam wins on mount and heap, the convention decides updates

| arm              | mount µs/level | hydrate µs/level | targeted µs/unit  | broad µs/unit | heap B/unit   |
| ---------------- | -------------- | ---------------- | ----------------- | ------------- | ------------- |
| component        | 11.3           | 5.42             | 3.43              | 13.11         | 26,580        |
| component-spread | 9.25 (−18%)    | 4.96             | 18.89 (**+451%**) | 19.50 (+49%)  | 24,650 (−7%)  |
| snippet          | 8.46 (−25%)    | 5.67             | 0.82 (**−76%**)   | 15.93 (+22%)  | 22,150 (−17%) |
| snippet-packet   | 10.0 (−11%)    | 5.65             | 10.61 (+209%)     | 18.93 (+44%)  | 24,225 (−9%)  |

Four things worth naming:

**Mount favours the snippet by ~25% per level**, and the ordering held across all four runs.

**Hydration is flat.** 4.96–5.67 µs per level, no arm outside noise. That is exactly what Result 1
predicts: hydration walks anchors, the anchors are identical, so the seam cannot move it. It also
means the anchor investigation's premise is sound _and_ that this particular choice is not a lever
on it.

**The targeted update is the widest gap in the whole study — and it is the convention, not the
seam.** Changing a value that only the leaf renders costs 0.82 µs/unit through positional snippet
arguments and 3.43 µs through component props, but **18.89 µs** when spread into a component and
10.61 µs as a snippet packet. A packet makes every field invalidate together, so a change to one
field re-runs the readers of all four at every level. Both seams are ruined by it; the component
seam is ruined worse.

**The broad update inverts the ranking.** When every level must re-render, explicit component props
win (13.11 vs 15.93). Fine-grained per-prop signals pay off exactly when the change is broad, which
is the one leg where the boundary earns its cost back.

**Live heap tracks the seam**: the snippet arm retains 17% less per unit (2438 B/level against
2991), for identical DOM. That is the props proxy, the context scope and the per-boundary
bookkeeping, and it is the most stable number in the CSR set — ±0.2% across runs.

## 6. Cost model

Extending the table in `hydration-anchor-diet-2026-08.md` with the axes it did not cover. Per
nesting level, per unit, on this hardware:

| construct                           | anchors | SSR µs | mount µs | live heap B | targeted update |
| ----------------------------------- | ------- | ------ | -------- | ----------- | --------------- |
| module snippet, positional args     | 0       | 0.334  | 8.46     | 2438        | 0.82 µs/unit    |
| component boundary, explicit props  | 0       | 0.466  | 11.3     | 2991        | 3.43 µs/unit    |
| module snippet, one object argument | 0       | 0.340  | 10.0     | 2698        | 10.61 µs/unit   |
| component boundary, `{...spread}`   | 0       | 1.237  | 9.25     | 2753        | 18.89 µs/unit   |

(Anchors per level are 3 for all four; the 0 above is the _marginal_ cost of the seam over the
shared `{#if}` + body dispatch that every arm pays.)

## 7. Recommendation

1. **Prefer a cross-file module snippet to a component boundary for a presentational level with no
   lifecycle of its own.** It is ~28% cheaper on SSR, ~25% cheaper to mount, retains 17% less heap,
   and produces byte-identical output. This is what `part-element.svelte` already does; the result
   generalises it, and the margin is real but moderate — it is not the 7× the two-arm version of
   this benchmark reported.
2. **Pass values separately whenever the receiver reads them individually and they change
   independently.** This is the larger effect by far, and it is two distinct mechanisms that happen
   to point the same way:
   - **Granularity, on the client.** Four arguments are four reactive cells; one object is one cell,
     so touching any field re-runs the readers of all of them at every level. On the targeted-update
     leg that is **5.5×** for a component (`{...spread}`, 3.43 → 18.89 µs/unit) and **13×** for a
     snippet (object argument, 0.82 → 10.61). Bigger than the seam by an order of magnitude.
   - **Proxy allocation, on the server.** `spread_props` costs the component seam **+165%** per
     level. The snippet seam pays nothing for the same object (0.334 → 0.340, inside noise) — there
     is no proxy, it is a plain object literal.

   So `{...spread}` is penalised on both halves; a snippet packet only on the client. Neither is a
   reason to reach for the other seam — declare parameters one by one on whichever seam you picked.
   This is the same fact `usePartElement`'s "one object is the contract" note records for a
   different reason, and it is worth knowing that the reason has a per-update price attached.

3. **Do not choose between these seams for hydration or DOM-mass reasons.** They are identical on
   both, and hydration time is flat between them. If DOM mass is the problem, the levers are the
   ones the anchor investigation named (`<svelte:element>`, `{#if}` blocks, wrapper snippet hops),
   not the boundary.
4. **A boundary is not a loss when updates are broad.** Explicit component props beat positional
   snippet args by ~18% when every level re-renders. A level whose props all change together has no
   performance reason to become a snippet.

## 8. Reproducing

```bash
bun run bench:nesting          # SSR: µs/level, µs/unit, gc, bytes, anchors
bun run bench:nesting:client   # CSR: mount, hydrate, updates, node census, heap
```

Run each **three times and compare medians** — a single run on this machine drifts ~11%, wider than
several of the effects above. `BENCH_DEBUG=1` on the client run prints the raw per-point numbers
behind every slope.

Two measurement traps this harness hit, both worth knowing before trusting a number from it:

- **`performance.memory` returns a snapshot, not a live view.** Holding the object and reading
  `usedJSHeapSize` off it twice returns the same value, which made the heap leg report a flat zero
  for every arm. Re-read the getter each sample.
- **Collect before a timed region, never inside it.** This fixture is allocation-bound (60–70% of
  SSR wall time is GC), and at eight renders per sample nearly every sample contained a collection —
  the floor was a floor over noise, and the `component` arm swung 0.42–0.99 µs/level across three
  runs of unchanged code. Draining first, with shorter and more numerous samples, took that to
  0.45–0.55. On the client the same drain must be **once per round**, not per leg: a major
  collection against a live 20 MB tree costs seconds, and 256 of them pushed one pass past fifteen
  minutes.
