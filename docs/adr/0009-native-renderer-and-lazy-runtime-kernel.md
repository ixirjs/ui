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

- `Kernel` is the sole internal rendering interface. It compiles immutable part plans, binds lazy
  runtime nodes, resolves the full presentation contract, and returns the exact compiled snippet a
  caller dispatches once.
- All first-party components and the family scaffold author directly through Kernel. Superseded
  rendering and descendant-binding adapters are removed rather than maintained in parallel. The
  common rich prop vocabulary is exported as `RenderProps`; Kernel itself remains internal.
- Literal first-party leaves remain compiled snippets (`div`, `h3`) while arbitrary tags, custom
  components/snippets, motion, and renderer lifecycle use Kernel's dynamic and rich leaves.
  `HtmlElement` remains the low-level DOM/motion leaf, not a competing authoring interface.
- Presentation resolvers remain pure and are evaluated as one tracked snapshot. Atom presentation
  folds at the Kernel seam without materializing an intermediate `part.props` packet.
- Atom capability, role, behavior, identity, and attachment machinery is lazy where its contract
  permits. Public `Atom.spread` remains unchanged; SSR presentation omits DOM-only attachments.
- Eager node indexes allocate only when used. Lazy semantic descriptors share one short ordered
  list and one browser-wide batched microtask publishes reactive membership revisions; SSR performs
  no reactive publication.
- Capability ordering has constant zero/one-member paths.
- Virtualization is additive and consumer-activated (`createVirtual`); the full compositional
  DataGrid mode remains available and benchmarked.

## Consequences

The common path has fewer Svelte modules, signals, props copies, Maps, symbols, and microtasks.
Optional capabilities still pay their necessary cost. Removing the former public adapters is an
intentional pre-1.0 breaking change: applications use semantic components or `HtmlElement`, and
external authored families use the lower-level experimental/runtime seams. The native and rich
paths require differential tests so renderer selection cannot alter presentation, lifecycle, or
hydration.

## Verification

- Atom, presentation, render-target, lifecycle, registry, Card, and DataGrid suites.
- SSR fidelity digests.
- Comparative Card SSR and full-DOM DataGrid SSR/hydration/heap/interaction gates.
- 10k-item bounded SSR coverage for `createVirtual`.
