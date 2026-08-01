# ADR 0009: Native renderer and lazy runtime kernel

## Status

Accepted and implemented

## Date

2026-07-25

## Context

Equivalent-work benchmarks showed that pure class/preset resolution was already fast, while each
rendered part repeatedly materialized props through the part component, `HtmlAtom`, and
`HtmlElement`. Full-DOM DataGrid hydration retained roughly 224 KiB per row and Card SSR cost about
9.7 times the comparison implementation. CPU profiles spread cost across Svelte module traversal,
props spreads, Atom construction, symbol copying, and garbage collection rather than one resolver.

## Decision

- `HtmlAtom` renders the ordinary native element directly. Custom components/snippets, motion, and
  renderer lifecycle hooks retain the rich `HtmlElement` adapter.
- Presentation resolvers remain pure but are evaluated as one tracked snapshot.
- Internal callers may pass an Atom directly so its presentation spread is folded at the renderer
  seam instead of materializing an intermediate `part.props` packet.
- Atom capability, role, behavior, identity, and attachment machinery is lazy where its contract
  permits. Public `Atom.spread` remains unchanged; SSR presentation omits DOM-only attachments.
- The node registry uses immediate plain indexes plus one browser-wide batched microtask to publish
  reactive membership revisions. SSR performs no reactive publication.
- Capability ordering has constant zero/one-member paths.
- `DataGrid.VirtualBody` is additive; the full compositional mode remains available and benchmarked.

## Consequences

The common path has fewer Svelte modules, signals, props copies, Maps, symbols, and microtasks.
Optional capabilities still pay their necessary cost. The native and rich paths require
differential tests so renderer selection cannot alter presentation, lifecycle, or hydration.

## Verification

- Atom, presentation, render-target, lifecycle, registry, Card, and DataGrid suites.
- SSR fidelity digests.
- Comparative Card SSR and full-DOM DataGrid SSR/hydration/heap/interaction gates.
- 10k-item bounded SSR coverage for `DataGrid.VirtualBody`.
