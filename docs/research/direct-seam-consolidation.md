# Design: consolidating the direct presentation seam

**Date:** 2026-07-26 · **Status:** historical; superseded by Kernel-only authoring · **Follows:** ADR 0009

The adapter names and paths below record the measured predecessor design; they are no longer live APIs.

## Problem

ADR 0009 removed the intermediate `part.props` packet so `HtmlAtom` can fold the Atom spread at the
renderer seam. The performance result is real. The cost was paid in the authoring surface: every
bonded part now spreads a four-prop protocol.

```svelte
<HtmlAtom
  {...restProps}
  {bond}
  atom={part.atom}
  {preset}
  presetLayer={bond?.presetLayer('title')}
  class={['card-title …', '$preset', klass]}
>
```

Four internal props, one of which repeats the slot string `usePart(Bond, 'title', …)` was already
given. Across `src/lib/components` this produced three coexisting shapes:

| Shape                                                    | Sites |
| -------------------------------------------------------- | ----- |
| `atom=` + `preset=` + `presetLayer={part.presetLayer}`   | 45    |
| `atom=` + `preset=` + `presetLayer={bond.presetLayer()}` | 10    |
| `{...part.props}` (pre-ADR-0009 packet)                  | 11    |

Three shapes for one job is the DX regression. It is also a correctness surface: the ten inline
sites duplicate a slot name that can drift from the one `usePart` holds, and nothing checks them.

## Constraint

Any fix must not reintroduce what ADR 0009 removed:

- no intermediate merged-props object allocated per part,
- no extra `$derived` per part,
- `restProps` forwarded by reference, never copied into a new object inside a `$derived`,
- SSR still skips attachment minting and reactive publication.

## Decision

**Pass the part itself.** `usePart` already owns the Atom, the Bond, the preset key, and the slot
name. Make that the unit that crosses the seam, and keep every field lazy.

```svelte
<HtmlAtom {...restProps} {part} class={['card-title …', '$preset', klass]}>
```

`HtmlAtom` gains one internal prop, `part`, replacing `atom` / `preset` / `presetLayer` / `bond`.
The existing four stay accepted and undocumented for the eleven not-yet-migrated parts and for
roots, which have a Bond and a root Atom but no `usePart` result.

### Why this is not the `part.props` packet again

`part.props` was a `$derived` holding a **merged object**: it materialized the Atom spread, merged
rest props into it, and handed back a new record that the call site immediately spread — two copies
per part, one signal per part.

`part` is the object `usePart` already returns. It allocates nothing new. Its `preset` and
`presetLayer` members are getters (they already are, post-ADR-0009), so a part that renders through
the native path evaluates exactly the fields the renderer reads, at the moment it reads them, inside
the renderer's own tracked boundary. `restProps` still arrives as its own spread and is still
forwarded by reference.

### Shape

```ts
// src/lib/shared/authoring/use-part.svelte.ts — already returns this; only `slot` is new.
export type UsedPart<B, N extends Atom> = {
	readonly bond: B;
	readonly atom: N;
	readonly slot: string;
	readonly preset: PresetKey | undefined;
	readonly presetLayer: PresetLike | undefined;
	readonly props: ReturnType<typeof mergeAtomProps>; // compatibility, still lazy
};
```

```svelte
<!-- html-atom.svelte -->
let { part = undefined, atom: atomInstance = part?.atom, bond = part?.bond, ... } = $props();

const presetKeyFor = () => presetKey ?? part?.preset ?? (atomInstance?.preset as PresetKey);
const presetLayerFor = () => presetLayer ?? part?.presetLayer;
```

Defaulting in the destructure keeps one resolution point and leaves the explicit props winning, so
roots and the eleven legacy parts need no change to keep working.

`presetLayer` reaching `HtmlAtom` through `part` also deletes the ten inline
`bond.presetLayer('<slot>')` calls and the drift they invite: the slot string exists once, in the
`usePart` call.

## Migration

Mechanical, one component at a time, no behavioral change per step:

1. Add `slot` to `UsedPart` and the `part` prop to `HtmlAtom`, defaulting the four existing props
   from it. Nothing else changes; all 66 sites keep working.
2. Rewrite the 45 canonical sites to `{part}`. Net −3 props each.
3. Rewrite the 10 inline-`presetLayer` sites to `{part}`, deleting the duplicated slot string.
4. Migrate the 11 `{...part.props}` sites onto the same shape; they gain the native fast path.
5. Once no product code reads it, mark `UsedPart.props` `@deprecated` — it stays for external
   authors under the API-evolvability contract, and it is already lazy, so an unread getter costs
   nothing.

Exemplars in `AGENTS.md` (Button for static, Collapsible for bonded) update at step 2 so new parts
are copied from the single shape.

## The other four fixes — landed ahead of this design

These were defects in the same staged work, not consequences of this design, so they landed first:

1. **`__resolvedPresentation` over-application.** `html-atom.svelte` compared
   `renderTarget.component === RendererComponent`, a tautology for `kind === 'component'`, so every
   custom `base` component received an `HtmlElement`-private prop and could spread it onto the DOM.
   The renderer slot is now a named `defaultRenderer` derived, and only the component filling it is
   told presentation is resolved. Covered by `custom-renderer.svelte.spec.ts`.
2. **Atom id reactivity.** `#resolvedId` was snapshotted in the constructor, but `Bond.id` reads
   `this.props?.id`, which `datagrid-column.svelte` wires to a consumer prop. `hasDynamicId` now
   separates the two by descriptor: `bindBond`'s `$props.id()` seed is **non-enumerable** and stays
   a construction-time constant, while a spec-declared `id` cell is an **enumerable** accessor and
   recomputes on read. One boolean per Atom, no signal. Covered by `atom-identity.svelte.spec.ts`.
3. **`es-toolkit`** moved to `devDependencies`; it had fallen out of both lists while three
   docs/story/route files still imported it.
4. **`resolveEntry`'s `Object.isFrozen` bypass** skipped `stabilizePresetRecord` for any frozen
   record — including one a factory freezes fresh on every call, which is exactly the case that
   needs stabilizing. The bypass moved into `stabilizePresetRecord` as a `prev === fresh` identity
   check, which answers the real question (is this object already stable?) instead of a proxy for it.

## DataGrid.VirtualBody

Out of scope for this design and, as written, not ready to be public. Two issues:

- `layout` maps over **all** items and re-runs on every `measurementRevision` bump, which
  `observeRow` fires once per row as rows mount — O(total) allocation per mounted row against the
  decision gate's stated `O(visible + overscan + retained active)`.
- It bypasses the library's own architecture entirely: raw `<div role="grid">`, inline style
  strings, a hardcoded `480` viewport fallback, no preset, no Atom, no `usePart`.

Recommendation: keep it unexported until the layout is incrementalized (a prefix-sum array updated
in place, invalidated from the changed index forward) and it renders through the same presentation
seam as every other part. `docs/research/virtualization-decision-2026-07.md` already says a generic
exported component is not part of the first contract; `atoms.ts` currently exports one.

**Resolved 2026-08-10.** Both defects were closed on the way to the rune. The component itself was
then **dropped**: with the layout and the spreads owned by `createVirtual`, `VirtualBody` was a
fixed markup shape wrapped around a rune a caller can activate directly, and a windowed grid whose
markup is not the caller's is the thing this whole decision refused. Virtualization is opt-in at the
call site; DataGrid ships no windowed body.

- The layout moved into `src/lib/runes/virtual-layout.svelte.ts`. A uniform estimate with
  nothing measured is answered by arithmetic and allocates no array at any source size — the path a
  same-height option list never leaves. Once something measures, offsets are a prefix-sum array
  rebuilt lazily **from the lowest dirty index only**, and measurement bumps still coalesce to one
  revision per turn, so a window of rows mounting costs one bounded pass rather than one full pass
  per row. `virtual.svelte.spec.ts` pins the from-dirty-index rebuild by counting estimator reads.
- The scrolling, measuring and positioning moved into the `createVirtual` rune, where
  `position`/`overflow` are structural style rather than a utility class and a caller's own `style`
  is merged rather than overwritten. The `480` fallback is gone — the viewport is measured, and a
  numeric `height` seeds the server-rendered window.

Two latent bugs in the observer capabilities surfaced on the way and were fixed where they lived,
even though the final design no longer uses them — they were real, and the next consumer would have
hit both:

- All three observer capabilities did `observed = [...observed, element]` — reading and writing the
  same `$state` from inside a mount or attachment effect, which self-invalidates to the depth limit.
  Untracked, the same way and for the same reason `Collection.set` already is.
- `resizeObserverCapability` probed the optional `GEOMETRY` slot through `bond.surface` on **every**
  resize of every observed element, which DEV-warns on an empty slot. Resolved once at setup via the
  quiet `bond.capabilities` check instead.

The anchor ratchet gained the matching invariant: `createVirtual` must emit an identical anchor
count for 1k and 10k sources.

## Consequences

The authoring surface returns to one shape per part category — static parts use
`mergePresetProps`, bonded parts pass `{part}` — with no allocation, no signal, and no copy
reintroduced. The four-prop protocol survives as an internal escape hatch for roots, which is the
only place it was ever needed.
