# `capability/models`

One file per behaviour model: a `create*` factory, the backing seam it reads state through, and its
types. A family constructs them in its state class and projects their state into `attrs` itself.

## Files

| File                             | Purpose                                                               |
| -------------------------------- | --------------------------------------------------------------------- |
| `selection.svelte.ts`            | `createSelection` — the committed-set algebra, single or multiple.    |
| `disclosure.svelte.ts`           | `createDisclosure` — direct boolean open/close/toggle operations.     |
| `roving.svelte.ts`               | `createRovingFocus` — one highlight over an injected ordered id list. |
| `typeahead.svelte.ts`            | `createTypeahead` — buffered printable-key search over that list.     |
| `input.svelte.ts`                | `createInput` — named text fields over consumer-supplied stores.      |
| `validation.svelte.ts`           | `createValidation` — sync/async errors with out-of-order settling.    |
| `status.svelte.ts`               | `createStatus` — a scoped set of named boolean states.                |
| `sort.svelte.ts`                 | `createSort` — one sorted field cycling asc → desc → unsorted.        |
| `pagination.svelte.ts`           | `createPagination` — page boundaries derived from a coerced backing.  |
| `geometry.svelte.ts`             | `createGeometry` — a named-rect store for measured elements.          |
| `interaction-policies/shared.ts` | Pointer-gesture arithmetic the Scrollable parts drive directly.       |

## Notes

- **A backing is accessors, never a snapshot.** `get`/`set` close over the state class's own
  `$state`, so the model stays reactive and the consumer's `bind:` still works.
- **A model owns no storage and touches no DOM.** That is what let the projections move out to the
  parts when the capability runtime was deleted (2026-08-27) without changing any model's logic.
- `createSelection`'s membership index only answers while it still describes the exact array `get()`
  returned; `selection.svelte.spec.ts` pins both halves of that guard, because being wrong there is
  a stale `aria-selected`, not a slow one.

Bulk selection uses temporary membership Sets for default equality, without caching the backing.
Existing duplicates and order survive; custom comparators retain their directional scans. Disclosure
forwards repeated writes and preserves backing access order; notification equality belongs to the owner.
