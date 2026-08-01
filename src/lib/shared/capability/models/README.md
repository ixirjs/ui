# `shared/capability/models`

Built-in capabilities used by component Bonds and runtime Atoms.

## Groups

| Files                                          | Purpose                                                                  |
| ---------------------------------------------- | ------------------------------------------------------------------------ |
| `atom.svelte.ts`                               | Atom-local primitives: refs, press/focus, data state, ARIA role, motion. |
| `disclosure.svelte.ts`, `selection.svelte.ts`  | Common state models for open/close and selection.                        |
| `collection.svelte.ts`, `roving.svelte.ts`     | Collection registration and roving focus.                                |
| `typeahead.svelte.ts`, `navigation.svelte.ts`  | Keyboard search and navigation policies.                                 |
| `input.svelte.ts`, `validation.svelte.ts`      | Input and validation models.                                             |
| `checked.svelte.ts`, `pressed.svelte.ts`       | Toggle state models.                                                     |
| `range.svelte.ts`, `progress.svelte.ts`        | Numeric range and progress models.                                       |
| `relationship.svelte.ts`, `role-projections.*` | Cross-slot ARIA and generic role projections.                            |
| `bond-effects.svelte.ts`                       | Setup effects for document, observer, modality, and portal behavior.     |
| `interaction-policies.svelte.ts`               | Pointer, gesture, and activation policies.                               |

The public surface is re-exported through [`index.ts`](./index.ts). Rendered filtering is
component-owned: use `filterSelectData` from the `select` subpath to derive a view without
mutating the source collection.

## Boundary with `components/overlay/policies`

`components/overlay/` keeps its own policy layer (escape stack, outside press, backdrop press,
focus). That is deliberate, not a duplicate of `bond-effects/document.svelte.ts`:

- `outsidePressListener` here is the generic primitive — a document listener with configurable
  inside/ignored targets that reports the press and nothing more.
- `outsidePressPolicy` in `overlay/policies/dismiss.svelte.ts` coordinates the overlay stack and
  decides which overlay dismisses, which the generic primitive has no concept of.

`bodyScrollLock` and `inertSiblings` from this directory _are_ consumed by
`overlay/capabilities/bundles.svelte.ts`, so the direction of reuse already runs shared → overlay.
Add new overlay-stack-aware behavior under `overlay/policies`; add stack-agnostic DOM effects here.

## No bundle layer

There is deliberately no "bundle" or "archetype" tier that pre-mixes these into per-widget recipes.
That layer existed and was removed: eight archetypes had two callers between them, and the six
unused ones described families (`tabs`, `tree`, `listbox`, `menu`, `grid`, `datePicker`) whose real
components had each declined the recipe and wired capabilities directly. A Bond composes what it
needs in its own constructor — that list is short, and reading it tells you what the Bond does.
