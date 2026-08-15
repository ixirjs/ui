# The Root renderer slot (removed, 2026-08-12)

Status: **removed.** One truthiness test against a slot that was always populated disabled the
native render seam for every part in every application. Deleting the slot cut a 4-part card by
**23 µs (37%) and 8 hydration anchors** in production shape.

## 1. What it was

`components/root/root.svelte` published a `renderers` object on `RootBond`:

```svelte
const renderers = defineState<Renderers>([
    defineProperty('html', () => HtmlElement),
    defineProperty('svg', () => { /* lazy import, assigns to a $state */ })
]);
```

Two readers consulted it, and **they asked different questions**:

| reader                                       | test                                                                   |
| -------------------------------------------- | ---------------------------------------------------------------------- |
| `components/atom/use-part-element.svelte.ts` | `if (rootBond?.props?.renderers?.html) return false;` — **truthiness** |
| `components/atom/html-atom.svelte`           | `renderTarget.component !== HtmlElement` — **identity**                |

Since `html` was unconditionally `HtmlElement`, the first test was always true inside a `<Root>`. So
every part bailed off the native seam onto `<HtmlAtom>` — which then applied the second test, found
the renderer _was_ `HtmlElement`, and rendered the identical `<div>` anyway.

## 2. What the detour cost, per part

1. A second Svelte component boundary — a child `Renderer` node walked twice at close, once by
   `#collect_content` and again by `#traverse_components`.
2. `richProps()` allocating `{ part: seam, ...props() }`, then `spread_props([...])`.
3. A second `RootBond.get()` context read.
4. A 15-key destructure producing a rest-props proxy.
5. **A second full presentation resolve** — `html-atom.svelte` calls `createPresentation(...)`
   unconditionally, so presentation was computed twice for every rendered part.

## 3. Measured

`src/lib/test/perf/ceiling/`, `bun run bench:ceiling`. Marginal cost per card, `defaultPreset`
installed, arms interleaved, medians of three runs. `card-root` is the card wrapped in `<Root>` —
production shape; `card` is the bare compound every existing fixture measures.

|                         | µs/card   | B/card  | anchors/card |
| ----------------------- | --------- | ------- | ------------ |
| `card`                  | 34.69     | 673     | 22           |
| `card-root`, **before** | 62.93     | 731     | 30           |
| `card-root`, **after**  | **40.93** | **675** | **22**       |

**−23 µs and −8 anchors per card.** The residual `card → card-root` gap falls from +81% to ~+10%,
which is `<Root>`'s genuine cost (its own context and page wrapper) and is fine.

Structural confirmation: `card` and `card-root` rendered byte-identical elements, classes, ids and
text before the change — the entire difference was one extra `<!---->` per part, i.e. exactly one
additional component boundary each.

## 4. Why removing it was safe

Every part of the slot was dead or harmful:

- **`html`** — always the default `HtmlElement`, which both readers already fell back to via
  `?? HtmlElement`. A no-op whose only effect was disabling the fast path.
- **`svg`** — written, and **never read anywhere in the repository**. Its lazy `import()` assigns to a
  `$state` and returns `undefined` on first read regardless, so even a reader would have missed.
- **`mathml`** — typed in `RootStateProps`, never set, never read.

It was never a consumer extension point: `renderers` was a local `defineState` inside `root.svelte`,
absent from `RootProps`. **Per-element renderer selection is the `base` prop**
(`resolveRenderTarget(presentation.base, HtmlElement)`), which is the documented seam and is
untouched — as is `SvgElement`, still exported from `components/element` for direct use or as a
`base`.

Removing it also deleted **one context read per rendered part** in `usePartElement` and another in
`HtmlAtom`, against the 4.7% `get_or_init_context_map` seen in profiles.

## 5. Why it survived this long

**No fixture in the library wraps in `<Root>`.** `ablation.test.svelte`, `preset-ablation`,
`datagrid`/`tree`, `anchor-budget.spec.ts` and `family-ssr-probe` all render bare compounds, so every
recorded SSR number and every anchor budget described a path no application takes. The gap was
visible as an unexplained 2× — the compare app rendered a card at 60.27 µs where `bench:ssr` rendered
identical markup at 30.88 µs — and was noted as unexplained before it was traced here.

`src/lib/test/perf/ceiling/ceiling-ablation.test.svelte` now carries `card-root` and `fast-root` arms
so production shape is measured. Extending `anchor-budget.spec.ts` with a `<Root>`-wrapped budget is
the remaining piece, and is the check that would have caught this as an exact, machine-independent
number.

## 6. Consequences to know

- **Rendered markup changes in `<Root>`-wrapped applications**: 8 fewer hydration anchors per card,
  ~56 fewer bytes. Strictly less DOM mass, so hydration walk, teardown and heap all improve.
- No existing fingerprint moved: `bench:ssr` and `anchor-budget` fixtures are bare, so the gate
  stayed green throughout.
- `RootStateProps.renderers` is removed. `RootBond` ships via the experimental barrel, so this is a
  semver-relevant type removal even though `public-surface.snapshot.json` records symbol names only
  and does not fail on it.
- ADR `0009-native-renderer-and-lazy-runtime-kernel.md` should be amended: the "lazy runtime kernel"
  it names is the lazy `svg` import deleted here as dead code.
