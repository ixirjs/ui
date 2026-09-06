# Canonical popup runtime

Popover, DropdownMenu, Select, Combobox, Tooltip, ContextMenu, DatePicker and PopoverDialog use
one `PopupBond` implementation. Menu and selection items use one `CollectionItemAtom`.
**Legacy family/item constructors and popup `factory` props are removed.** Family Bond names
remain interfaces, including their experimental and component-subpath type exports.

## Ownership

- `profiles.ts`: immutable capability/policy selection, not per-family setup functions.
- `bond.svelte.ts`: live props, shared capabilities, collections and commands.
- `date.svelte.ts`: date/range and sub-picker policy.
- `item.ts`: element-local identity, metadata and predicates; commands delegate to the Bond.
- `types.ts`: family interfaces and profile discovery, with no legacy-class dependencies.

Roots call `PopupBond.mount(family, liveProps)` during component init; it owns disposal. Standalone
owners call `PopupBond.create` and dispose their state themselves. Both infer the family interface.
Parts still use the existing Kernel, contexts, presets, portals, positioning, focus and motion.
Tooltip owns a fixed hover-profile root, rather than injecting a constructor into Popover.Root.

```ts
import { PopupBond, isSelectBond } from '@ixirjs/ui/experimental';
import type { SelectBond } from '@ixirjs/ui/components/select';

const select: SelectBond = PopupBond.create('select', liveProps);
select.select(['alpha']);
select.dispose();

if (isSelectBond(contextValue)) contextValue.select(['beta']);
```

Use `menuItem` / `selectItem` for checked, payload-inferred item interfaces. Use `instanceof PopupBond`
and profile discovery, not family `instanceof` checks or property existence: unsupported methods
exist internally on the shared class, while family views hide them and unsupported getters throw.
For component composition use props, snippets and presets, not subclassing or constructor injection.

## Contracts and verification

Family interfaces expose structural contracts. `OverlayState` is shared with the independently
implemented modal/host families; their unrelated constructors and factory APIs are unchanged.
Cross-family context casts remain only where the fused modal borrows a subset of another family's
parts, not as a legacy factory bridge.

`defaults.svelte.spec.ts` verifies every published popup root, canonical item identity and teardown.
The existing family suites preserve callback, label/query, keyboard and overlay behavior. The
historical prototype directory retains model, interaction, motion and SSR tests, not a legacy
runtime. Its frozen `ssr-reference.json` was captured from the last paired production build before
constructor removal. Exact HTML/head assertions and hydration with recovery disabled continue to
check that reference. Redundant legacy replays were removed, not the original behavioral suites.

Run `bun run check`, `bunx vitest run`, and the benchmark commands in
`src/lib/test/prototypes/popup/replacement/README.md`. The unchanged growth baseline gates the shared
menu and selection collection paths. Timing reports now measure only the canonical implementation;
there is no live legacy comparison or universal speed, bundle-size or retained-heap claim.

Disposal clears registrations/typeahead and prevents late disclosure commits. Inherited Tooltip
hover-cancellation and disabled menu-click concerns are not behavior changes in this removal pass.
