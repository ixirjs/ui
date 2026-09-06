<script lang="ts">
	import { FrontMatter } from '$docs/md/components';
	import { codeBlock, list } from '$docs/md/template';
	import bondCode from '../examples/tiles.svelte.ts?raw';
	import rootCode from '../examples/tiles-root.svelte?raw';
	import partCode from '../examples/tiles-trigger.svelte?raw';

	let { data } = $props();
	const { frontmatter } = $derived(data);
</script>

<FrontMatter {frontmatter} />

# Migration Guide ## Future upgrades: additive-first The current API baseline is protected by an
additive-first policy with no scheduled removals. Preserve existing imports, aliases, bindings,
callbacks, presets and supported factories. Deprecation does not require an immediate rewrite. The
historical migrations below describe changes before that baseline, not a verified release-by-release
migration map. Unknown version boundaries must not be treated as automatic migration instructions.
## Historical authoring migration On 2026-08-27 the Bond/Atom authoring runtime was removed. A
component family is now a plain state class published under `Kernel.context`, and every part renders
through `Kernel.element`. Normal component markup, bindings and presets remain supported. Popup
constructor values and `factory` props are removed, so those callers must migrate too. ## Canonical
popup state Popover, DropdownMenu, Select, Combobox, Tooltip, ContextMenu, DatePicker and
PopoverDialog share one runtime and one collection-item implementation. Family Bond names are
interfaces, not constructors. Root/item `factory` props and `mountFactory` are removed. Use bindable
props, snippets, presets and capability composition rather than subclass injection. Children
snippets and `getBond()` expose root-owned state; never manually dispose it. Other families retain
their factory APIs.

{codeBlock(
	`import { PopupBond, isSelectBond } from '@ixirjs/ui/experimental';
import type { SelectBond } from '@ixirjs/ui/components/select';

// Standalone state only: do not pass this object to a library Root.
const state: SelectBond = PopupBond.create('select', liveProps);
state.select(['alpha']); // selection commands take arrays
state.dispose();        // standalone owner releases its resources

// Component children/getBond() already return root-owned interfaces.
if (isSelectBond(contextValue)) contextValue.unselect(['alpha']);
// Custom component roots use PopupBond.mount('select', liveProps) at init.`,
	'typescript'
)}

## Removed from `@ixirjs/ui/shared`

{list([
	'defineBond — a plain class plus Kernel.context<T>(key).',
	'useRoot — build the class, share it under the context key, call Kernel.element.',
	'definePart and defineLeaf — Kernel.element(() => props, spec).',
	'createAtomInstance — nothing; the part renders its own element.',
	'controlledProp — a $bindable prop written from bond.bindCommit(...).',
	'BondHandle and AtomHandle — KernelElement.',
	'usePart — Kernel.element.'
])}

## Removed from `@ixirjs/ui/experimental`

{list([
	'Bond, Atom, defineAtom — a plain state class; parts own their elements.',
	'bindBond and BondBinding — Context.share(Bond.create(liveProps)).',
	'Collection — a Map on the Bond, written at the child init and released on teardown.',
	'The prop-cell, definition and spec types — an object of getters over the root props.',
	'The six popover *Atom classes — the popover parts write their own attrs.',
	'The capability definition helpers, role keys and slot keys — attrs written literally in each part.',
	'Symbol lifecycle keys (createLifecycleKey, mount, destroy) — oninit, which fires on both platforms.'
])}

`@ixirjs/ui/shared` gained `Kernel`, `ElementSpec` and `KernelElement`, and still exports the
behaviour models (`createDisclosure`, `createSelection`, `createRovingFocus`, `createTypeahead`,
`createInput`, `createValidation`, …) as ordinary functions. `@ixirjs/ui/experimental` still exports
the canonical `PopupBond` runtime and type-only popup family names. Other families retain their
concrete classes. The following state, root and trigger sources are the live example on the human
documentation page and are checked against the packed package. ## 1. The definition becomes a class

{codeBlock(bondCode, 'typescript')}

`Kernel.context('bond/tiles')` mints the canonical key `@ixirjs/context/bond/tiles` — the same
string `defineBond` generated. ## 2. The root does its own wiring

{codeBlock(rootCode, 'svelte')}

## 3. Parts render their own element

{codeBlock(partCode, 'svelte')}

A part keeps a dispatch only when it has a reason — real enter/exit transitions, a `base` renderer,
or a polymorphic `as`. It declares that in the spec and binds its leaf once in the script with
`const leaf = Kernel.render(el);`, then renders that identifier. Rendering the inline
`Kernel.render(el)(…)` call instead costs a snippet block and a hydration anchor. ## 4. The registry
becomes ids and Maps

{codeBlock(
	`// Gone: bond.nodeByPart, bond.nodesByPart, bond.nodeByRole.

// Ids are derived, so the DOM is the registry.
get rootId() { return Kernel.id(this.id, 'card-root'); }
get element() { return document.getElementById(this.rootId) ?? undefined; }

// Cross-part ARIA: the child writes its id into the parent at init.
const id = card ? Kernel.id(card.id, 'card-title') : undefined;
if (card) card.titleId = id;

// A collection: a mount-ordered Map, released on teardown.
const detach = bond.parent.attachItem(bond.id, bond);
$effect(() => detach);`,
	'typescript'
)}

A part a consumer may render twice takes `Kernel.claimId(bond, seed, part)` instead of `Kernel.id`:
the first instance keeps the canonical id, later ones take the lowest free suffix, and the slot is
released on teardown. ## 5. Capabilities become models plus literal attrs

{codeBlock(
	`import { createDisclosure } from '@ixirjs/ui/shared';

// The model is a field on the Bond …
this.disclosure = createDisclosure({
  get: () => this.props.open,
  set: (open) => this.#set(open)
});

// … and what the capability used to project is written in the part.
attrs: () => ({
  id: bond.headerId,
  type: 'button',
  'aria-expanded': bond.isOpen,
  'aria-controls': bond.bodyId,
  'data-state': bond.isOpen ? 'open' : 'closed',
  onclick: Kernel.compose(onclick, toggle)
})`,
	'typescript'
)}

`Kernel.compose(consumer, own)` runs the consumer handler first and skips the part's when the
default was prevented. It cannot see a consumer who prevents from their own `addEventListener`, so a
part's handler also returns early on `event.defaultPrevented`. ## Checklist

{list([
	'Turn each definition into a plain state class with a static create and live prop getters.',
	'Publish it with Kernel.context, keeping the same canonical key.',
	'Derive element ids with Kernel.id, or Kernel.claimId for a part that repeats.',
	'Replace useRoot with: build props, share the Bond, bindCommit, Kernel.element.',
	'Replace controlledProp with a $bindable prop written from bindCommit.',
	'Replace definePart, defineLeaf and createAtomInstance with Kernel.element.',
	'Spread el.attrs on a literal tag; keep Kernel.render only for motion, base or a polymorphic as.',
	'Bind the leaf once in the script rather than rendering an inline Kernel.render call.',
	'Replace registry lookups with derived ids and collections with a mount-ordered Map.',
	'Write cross-part ARIA as a child writing its id into a $state field on the parent.',
	'Call the behaviour models directly and write their ARIA in each part attrs.',
	'Replace symbol lifecycle keys with oninit.',
	'Compose consumer handlers with Kernel.compose, and still return early on defaultPrevented.'
])}
