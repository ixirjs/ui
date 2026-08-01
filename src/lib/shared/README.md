# `shared` — the bond layer

The engine every component is built on, organized into three layers. Each is its own module with
its own barrel and README; [`index.ts`](./index.ts) composes them into one stable public surface.

```
shared/
  index.ts        public barrel — composes the three layers below
  motion.ts       DURATION token
  bond/           the runtime core: Bond / Atom registry (+ compatibility, bind, factory, collection)
  capability/     cross-cutting behavior registered onto Bond or Atom hosts
    models/        the concrete capabilities (disclosure, selection, roving, …)
  authoring/      the declarative DSL that generates bond families (defineBond, fuse)
```

## Layering

The dependency direction is one-way — **authoring → capability → bond** — so the graph stays a DAG:

- [`bond/`](./bond) depends on nothing above it (it only reaches _down_ to the collection
  capability it backs).
- [`capability/`](./capability) builds on `bond`.
- [`authoring/`](./authoring) builds on both and is imported by neither.

## Importing

Consumers import from the package barrel (`$svelte-atoms/core/shared` → [`index.ts`](./index.ts)),
which re-exports the full surface. Each layer also has its own barrel
([`bond`](./bond/index.ts), [`capability`](./capability/index.ts),
[`authoring`](./authoring/index.ts)) if you want to import from a single concern.

**Internal** cross-module imports use concrete files when they need implementation details and a
layer barrel when they need that layer's public surface. `bond/bond.svelte.ts` exports only the
`Bond` class; `bond/index.ts` owns the public bond re-export surface.

See [`CONTEXT.md`](../../../CONTEXT.md) for vocabulary and [`docs/adr/`](../../../docs/adr) for the
binding decisions.
