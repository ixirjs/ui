# `shared/capability`

Reusable behavior for Bonds and Atoms.

- **Bond capabilities** coordinate shared state, roles, relationships, and whole-bond setup.
- **Atom capabilities** add local attrs, handlers, lifecycle, or presentation to one runtime Atom.

## Files

| File                                       | Purpose                                                                |
| ------------------------------------------ | ---------------------------------------------------------------------- |
| [`capability.ts`](./capability.ts)         | Capability types, keys, define helpers, role context.                  |
| [`runtime.svelte.ts`](./runtime.svelte.ts) | Shared dependency, activation, rollback, and teardown runtime.         |
| [`host.ts`](./host.ts)                     | `CapabilityHost` — the one wrapper Bond and Atom both host it through. |
| [`models/`](./models)                      | Built-in capability models and recipes.                                |

## Usage Notes

- Register Bond capabilities in the Bond constructor with `bond.capability(...)`, or use
  `bond.registerCapabilities(recipe)` for a bundle/recipe. Both preserve declaration order and use
  last-wins per slot. The root publishes context explicitly with `binding.bond.share()`;
  `useRoot(...)` activates capabilities and destroys the lifecycle owner with the root component.
  Normal roots do not call `useCapabilities()` or `destroy()` themselves.
- Pass Atom capabilities to `createAtomInstance(..., { capabilities })` or register them with
  `atom.capability(...)`. `createAtomInstance` registers the Atom with its Bond before setup, so setup
  can resolve itself through `bond.nodeByPart(...)` or `bond.nodeByRole(...)`.
- Bond and Atom hosts use the same internal runtime. `requires` is strict: missing slots and cycles
  throw before setup. Setup follows stable topological order; setup failure unwinds transactionally.
  Disposal is LIFO, continues after failures, and reports failures as `AggregateError`.
- Prefer `defineCapability(...)` / `defineAtomCapability(...)` over hand-written literals. Their
  metadata records `host: 'bond'` or `host: 'atom'`; a Bond `effect` is whole-bond setup, while Atom
  setup is initialization-local (use behavior `onmount` for an element-mounted lifecycle hook).
- One rendered part's presentation capability is `partCapability(keyId, part, docs, attach)`, not a
  hand-written key constant plus a `defineAtomCapability` whose `slot` and `meta` restate it. Reach
  for `defineAtomCapability` directly only when the descriptor projects onto more than one part or
  carries a surface. Wrap it in `lazyCapability(...)` when the `attach` closes over nothing.
- To replace behavior you do not own, register a descriptor at the same slot carrying `compose`,
  which receives the prior descriptor and returns its replacement. The `decorate*` helpers that
  used to wrap this were removed: nothing called them.

The public barrel is [`index.ts`](./index.ts).
