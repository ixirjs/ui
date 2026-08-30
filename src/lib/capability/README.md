# `capability`

The behaviour models — the reusable state a family composes, and nothing else.

A family imports them from `$ixirjs/ui/capability` directly. It is a peer layer of
[`authoring/`](../authoring), not something routed through it: **`authoring` is how a part is
built, `capability` is how it behaves.**

## What this layer is, after 2026-08-27

Every model is a plain `create*` factory. A family calls it as an ordinary function in its
`bond.svelte.ts` state class and writes the ARIA and `data-*` projections literally in each part's
`attrs`:

```ts
// components/tree/bond.svelte.ts
readonly disclosure = createDisclosure({ get: () => this.props.open, set: (v) => …});
readonly roving = createRovingFocus({ ids: () => [...this.nodes.keys()] });
```

```svelte
<!-- the projection the capability used to install, written where it renders -->
attrs: () => ({ 'aria-expanded': bond.disclosure.isOpen, 'data-state': … })
```

The **capability protocol** — `defineBondCapability` / `defineAtomCapability`, `capabilityKey`,
`sharedCapabilityKey`, `roles`, `CapabilityHost`, the activation/rollback runtime, descriptor
interning, and every per-model `*Capability` projection and `SLOT` key — was deleted with the
Bond/Atom runtime it existed to serve. Nothing registers behaviour onto a shared object any more;
it is state, not registration.

The models therefore know nothing about `Bond`. Where a helper genuinely needs the owner
(`shouldSkipPolicy`) it is typed structurally, as `PolicyOwner`.

## Files

| File                  | Purpose                                                                |
| --------------------- | ---------------------------------------------------------------------- |
| [`models/`](./models) | One file per model: the `create*` factory, its backing seam and types. |

## Usage Notes

- Construct a model in the state class's field initializer; the backing seam (`get`/`set`) closes
  over the class's own `$state`, so two-way binding is preserved without the model owning storage.
- A model never touches the DOM or a registry. Feeding it the mount-ordered `Map` a family
  registers children into is a structural fit (`TypeaheadSource`, `RovingBacking`), not a coupling.
