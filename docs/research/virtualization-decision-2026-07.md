# Virtualization decision gate

**Date:** 2026-07-10
**Status:** superseded by the authorized performance transformation; first DataGrid adapter implemented.

## Decision

The existing `virtualWindowCapability` was a fixed-size range calculator. It had no collection-backed visible entries, measurement cache, scroll anchoring, lite-row rendering, active-row retention, or component integration. It is therefore not a virtualization API and must not remain public.

- Remove `virtualWindowCapability` and `VIRTUAL_WINDOW` from the public capability surface.
- Keep `./virtual` blocked in `package.json`.
- The later performance transformation authorizes an additive `DataGrid.VirtualBody` replacement;
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
