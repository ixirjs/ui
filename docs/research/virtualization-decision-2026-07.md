# Virtualization decision gate

**Date:** 2026-07-10
**Status:** delivered 2026-08-10 — shipped as a rune, not a capability. See "Delivered" below.

## Decision

The existing `virtualWindowCapability` was a fixed-size range calculator. It had no collection-backed visible entries, measurement cache, scroll anchoring, lite-row rendering, active-row retention, or component integration. It is therefore not a virtualization API and must not remain public.

- Remove `virtualWindowCapability` and `VIRTUAL_WINDOW` from the public capability surface.
- Keep `./virtual` blocked in `package.json`.
- The later performance transformation authorizes an additive windowed path for DataGrid;
  the full compositional DataGrid path remains supported.

## Implemented first scope

The first adapter targets DataGrid because the equivalent full-DOM benchmark identified its row
machinery as the dominant scale path. Listbox, Select, and menu integrations remain future adapters
over the same window contract.

- Render **lite rows only**: no per-row Bond or Atom machinery in the virtual path.
- Every item requires a stable, unique key. A changed key is a remove+insert and invalidates that row's cached measurement.
- The active roving item stays rendered even when outside the ordinary overscan window, so `aria-activedescendant` always references a mounted id.
- Variable heights are supported from the start: estimates, `ResizeObserver` measurement, and a key-addressed measurement cache are required.
- Measurement and data changes preserve raw `scrollTop`; they do not apply visual-offset scroll anchoring.

## Delivered 2026-08-10

Shipped as **`createVirtual`, a rune** — `src/lib/runes/virtual.svelte.ts`, exported from
`@ixirjs/ui`. Not the capability this document anticipated, and not a component either. It returns
three spreads and leaves the markup to the caller:

```svelte
const virtual = createVirtual({ count: () => rows.length, getKey: (i) => rows[i].id, height: 400 });

<div {...virtual.viewport()}>
  <div {...virtual.content()}>
    {#each virtual.items as item (item.key)}
      <div {...virtual.item(item)}>{rows[item.index].name}</div>
    {/each}
  </div>
</div>
```

`rowProps(key, index)` landed as `virtual.item(item, style?)`. Lite rows are preserved by
construction: the spread is a plain object, so an item allocates no Bond, no Atom and no context.
`getKey` is required rather than defaulted to the index, because this document already states that
every item needs a stable unique key — the measurement cache is keyed by it, so an index would make
a size follow the position rather than the item the moment the list reorders.

**Why not a capability.** One was written, with role projections for `container`/`content` and a
`followPinned` setup effect, plus an internal `components/virtual/` family to host it. Both were
removed. A capability needs a Bond, a Bond needs a root component, and the root component then owns
the markup — which is exactly what a caller wanting a windowed list inside their own layout cannot
accept. Once DataGrid's windowed body moved to the rune there was no composer left, and ADR 0008
does not publish a model no first-party family uses. What survives is `createVirtualLayout` in
`src/lib/runes/virtual-layout.svelte.ts`, beside the rune that is its only consumer: pure window
arithmetic, no DOM, unit-tested without a browser. It is deliberately not under
`shared/capability/models/` — nothing there is reachable except through a Bond, and this is not.

Adopters:

- **DataGrid**, by composing the rune inside a consumer's own body markup. A `VirtualBody` component
  existed briefly and was dropped: rebuilt on the rune it was one fixed markup shape around a rune
  the caller can activate directly, which is the same objection as the capability. `DataGrid.Root`
  and its Bond are unchanged — a windowed body reads `bond.isSelected(key)` like any other.
- **Select**, via `Select.Root`'s `options` / `optionValue` / `optionLabel`. Those move roving,
  typeahead and selected-label resolution off the mounted item Collection onto the data — the part
  that cannot be done from outside — while the caller windows with the rune. There is deliberately
  no `Select.VirtualContent`. Note the rune's viewport goes _inside_ `Select.Content`: Content is
  floating-ui's positioned element and cannot itself be the scrollport.

Layout: a uniform estimate is answered by arithmetic and allocates no array at any source size — the
path a same-height option list never leaves. Once something measures, offsets are a prefix sum
rebuilt lazily **from the lowest dirty index only**, with measurement bumps coalesced to one revision
per turn.

Pinning and scrolling are kept separate, because they answer different questions. `pinned` keeps the
item _rendered_, which is all `aria-activedescendant` requires and all this document asked for.
`follow` additionally moves the viewport by the minimum needed. Select turns it on — arrowing past
the edge of a window has to scroll — and DataGrid does not, since its active row is consumer-driven.
The viewport does not scroll to a _selected_ option when a listbox opens: the follower tracks the
roving highlight, which is null until the keyboard is used.

Shared-model changes the Select adopter required, each small and back-compatible:

- `roving`: memoised the active-index lookup. `ids().indexOf(id)` ran once per rendered item per
  spread; fine at twenty ids, not at ten thousand. The cache is keyed on the id list _and confirmed
  against it_ — a `$state` array is reactive and mutable in place, so identity alone would hand back
  a stale index after a push or a reorder.
- `typeahead`: the source widened from a concrete `Collection<T>` to a structural `TypeaheadSource`,
  and the roving parameter narrowed to `TypeaheadTarget` (`activeId` + `goto`) so the searched items
  and the highlighted items no longer have to be the same type — under virtualization they are not.
  `requires` gained an explicit `collectionKind` option, because a delegating source must not be
  touched during construction; passing a `Collection` directly still declares its dependency from the
  collection's own `kind`, exactly as before. A `text` override returning `undefined` falls through to
  the default resolution — load-bearing, since DropdownMenu now always supplies `text`.

**Not carried over:** a disabled option in a data-backed Select is not skipped while typing. Its
entry has no Atom to inspect and the data mode declares no disabled predicate. It still cannot be
selected. The Collection-backed path is unaffected.

**The bare `null` on stderr**, chased down and fixed. It was never a rejection: it was a window
`error` event carrying _"ResizeObserver loop completed with undelivered notifications"_, whose
`error` property the spec defines as `null` — which is why a naive trap only ever showed `null`. The
browser raises it when an observer callback causes a resize it cannot deliver in the same cycle, and
that is exactly what measuring a virtual list does: a measurement lands inside a delivery, the
coalesced revision ran on a **microtask** — before the frame ended — and the re-layout it caused
resized observed elements again inside the same round. The bump now defers to
`requestAnimationFrame`, which closes the cycle first, and falls back to a microtask off the browser
where there are neither frames nor observers. This matters beyond test noise: a window `error` event
is what a consumer's error reporting captures, so every virtual list on the page would have filed one.

Found on the way and fixed separately, because it is a real hazard even though it was not the cause:
`compute()` in `components/popover/strategies/floating.svelte` is async and **neither** call site
consumes its promise — `autoUpdate` discards its callback's return, and the one-shot path calls it
bare — so any rejection went straight to the unhandled-rejection handler. The awaited
`computePosition` is now guarded: a torn-down element mid-measurement is the expected race and stays
silent, anything else warns in DEV.

Acceptance gates 1 and 2 are met by `runes/virtual-layout.svelte.spec.ts` (layout arithmetic),
`runes/virtual.svelte.spec.ts` (rendered windowing, measurement, retention, following, imperative
scroll), and `select-virtual.svelte.spec.ts` (roving, typeahead, ARIA and label resolution over 5000
data-backed options).

**Gate 3 is partly met.** Its bounded-render property — `O(visible + overscan + retained active)`,
never `O(total)` — is proved exactly and machine-independently by the anchor-budget invariant that 1k
and 10k sources emit an identical, non-zero anchor count. Its **µs** mount/scroll/selection
benchmark is not added.

**Gate 4 is not met, and was previously recorded here as met.** SSR output is covered; hydration is
not. There is no hydration test anywhere in this repository, so nothing exercises the transition a
virtual list makes most interesting: the server renders a window from the _seeded_ numeric height,
the client then measures the real viewport and may compute a different one. Closing it needs an
end-to-end page, since a component is compiled for either SSR or the DOM in a given vitest project
and the browser project cannot render server output.

Related, and the reason the gap survived: **no route or story renders `createVirtual`.** The
published virtualization surface has never been exercised outside its tests. A demo page would close
both at once — and now doubles as the documentation for activating it, since there is no component
to point at.

## Future API boundary

The replacement is a capability surface over the collection/window lifecycle. It provides window/range and measurement operations plus a supported `rowProps(key, index)` API for custom consumers. `rowProps` supplies semantic attributes and pooled handlers from parent selection/roving state without allocating a row Bond or Atom.

A generic exported component is not part of the first contract. Built-in listbox/Select/menu parts may consume the same surface.

## Performance and acceptance gates

Before any implementation merges, it must provide:

1. Functional coverage for range calculation, scrolling, resize/measurement, active-item retention, keyboard/typeahead, and selection.
2. Rendered listbox/Select/menu coverage for ARIA and lifecycle behavior.
3. 1k and 10k mount, scroll, and selection-update benchmarks proving rendered DOM and live row machinery are `O(visible + overscan + retained active)`, never `O(total items)`.
4. SSR and hydration smoke coverage.

The non-virtual path remains out of scope for this decision; no implementation may regress it incidentally.
