# `shared/bond` — the bond runtime core

The brain of every component. A **bond** owns a component family's logic, shared state,
context, and registered runtime atoms. **Atoms** project per-slot DOM attributes,
handlers, attachments, and lifecycle. [`index.ts`](./index.ts) is the public import surface;
the state, atom, diagnostic, and identity implementations live in focused sibling modules.

See [`CONTEXT.md`](../../../../CONTEXT.md) for the vocabulary and [`docs/adr/`](../../../../docs/adr)
for historical binding decisions.

## Files

| File                                             | What it is                                                                                                            |
| ------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------- |
| [`bond.svelte.ts`](./bond.svelte.ts)             | `Bond` only — the runtime coordinator for state, context, registered Atoms, and capability lookup.                    |
| [`index.ts`](./index.ts)                         | Internal re-export surface for `Bond`, `Atom`, capability types, bond types, and the internal state helper.           |
| [`state.svelte.ts`](./state.svelte.ts)           | Internal `BondState` helper — capability registry, lazy collections, dependency validation, and role projection.      |
| [`atom.svelte.ts`](./atom.svelte.ts)             | `Atom` — DOM identity, atom capabilities, projected behaviors, attachments, and spread composition.                   |
| [`merge.ts`](./merge.ts)                         | Deterministic spread composition: attrs, handlers, attachment ordering, and conflict diagnostics.                     |
| [`use-atom.svelte.ts`](./use-atom.svelte.ts)     | `createAtomInstance` — Svelte lifecycle helper for component-owned atoms and Bond registration.                       |
| [`diagnostics.ts`](./diagnostics.ts)             | Introspection helpers for explaining projected role behavior without growing the core `Bond` implementation.          |
| [`identity.ts`](./identity.ts)                   | Cross-copy bond branding and `instanceof` helper logic.                                                               |
| [`types.ts`](./types.ts)                         | Core type aliases: `BondStateProps`, `BondClass`, `BondElements`, `BondVirtualElement`, and node registration types.  |
| [`context.ts`](./context.ts)                     | `bondContextKey(...segments)` — canonical Svelte-context key (`@svelte-atoms/context/<segments>`).                    |
| [`factory.ts`](./factory.ts)                     | `bondFactory(State, Bond)` — the default-factory SSOT used by most roots.                                             |
| [`bind.svelte.ts`](./bind.svelte.ts)             | `bindBond` / `BondBinding` — wires a bond's reactive prop cells to a component's `$bindable`s (ADR 0002).             |
| [`collection.svelte.ts`](./collection.svelte.ts) | `Collection<T>` — the reactive, ordered children data structure backing `Bond.collection()`.                          |
| [`staged-map.svelte.ts`](./staged-map.svelte.ts) | `StagedMap` — microtask-deferred reactive map (avoids `state_unsafe_mutation` in `$derived`). Internal; not exported. |

## Public surface

Re-exported through the shared public barrel: `Bond`, `Atom`, `createAtomInstance`,
`bondContextKey`, `bindBond`, `BondBinding`, `bondFactory`, `Collection`,
`explainBondRole`, and the [`types.ts`](./types.ts) aliases.

New runtime code should use `Atom` plus `bond.register(node)` / `bond.node(key)` so the
component that renders an atom owns its runtime atom.

Generated part methods such as `bond.root()` and `bond.trigger()` remain direct constructor
adapters for compatibility. Rendered Svelte parts should create stable Atoms with
`createAtomInstance(...)` and read rendered nodes through `bond.node(...)` / `bond.nodes(...)`.

`Atom` also hosts atom-local capabilities: `node.capability(...)`, `node.get(key)`,
`node.require(key)`, and `node.describeCapabilities()`. Use these for local presentation and DOM
behavior such as `elementRef`, `pressable`, `focusable`, `dataState`, `ariaRole`, and `motion`.

## Merge Rules

`merge.ts` owns the runtime spread contract used by `Atom.spread` and `mergeAtomProps(...)`:

- `id` has one generated owner; internal behavior cannot replace it, while explicit user props can.
- `class` values merge; `style` declarations merge by CSS property with the later property winning.
- `data-*`, unsafe `aria-*`, and `role` conflicts warn in dev; safe ARIA token lists such as
  `aria-labelledby` merge by unique token.
- `disabled`, `inert`, and `hidden` are true-wins attributes.
- Event handlers run user/base first, then internal/later handlers only if the event is not
  `defaultPrevented`.
- Attachments mount base first and clean up in reverse order, so element capture mounts before user
  attachments and cleans up last.

## Rules of thumb

- New authoring can put props, derived values, mutation methods, and capability lookup directly on
  `Bond`. The internal state holder remains only to support older component internals.
- Component-owned `Atom`s registered with `bond.register(node)` are the source of truth for
  rendered runtime atoms.
- Never call `createAttachmentKey()` inside `Atom.spread` or any `$derived` — mint keys once
  per atom (see `spread-attachment-key-invariant`).
- Cross-cutting behavior (focus, escape, disclosure) is a **capability**, not a per-root `$effect`.
  Register/read capabilities through `bond`; see [`../capability`](../capability).
- If a Bond can write a root `$bindable` prop, back the bond prop cell with a local writable
  `$derived` (or `$state`) and use the `$bindable` variable only as the parent communication
  conduit. Uncontrolled bindables do not reliably invalidate downstream derived consumers when
  mutated directly from Bond code.
