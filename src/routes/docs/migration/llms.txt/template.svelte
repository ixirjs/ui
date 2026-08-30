<script lang="ts">
	import { FrontMatter } from '$docs/md/components';
	import { codeBlock, list } from '$docs/md/template';

	let { data } = $props();
	const { frontmatter } = $derived(data);
</script>

<FrontMatter {frontmatter} />

# Migration Guide On 2026-08-27 the Bond/Atom authoring runtime was removed. A component family is
now a plain state class published under `Kernel.context`, and every part renders through
`Kernel.element`. Consumers of the components are unaffected: component names, props, snippet
arguments, element ids, ARIA, `data-*` state and preset keys are unchanged. Only code that authored
its own family against the old seams has to change. ## Removed from `@ixirjs/ui/shared`

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
every concrete Bond class — those are the plain classes now. ## 1. The definition becomes a class

{codeBlock(
	`import { Kernel } from '@ixirjs/ui/shared';

export const TilesContext = Kernel.context<TilesBond>('bond/tiles');

export class TilesBond {
  readonly name = 'tiles';
  readonly props: TilesProps;
  constructor(props: TilesProps) { this.props = props; }
  static create(props: TilesProps) { return new TilesBond(props); }

  get id() { return this.props.id ?? 'tiles'; }
  get rootId() { return Kernel.id(this.id, 'tiles-root'); }
  select(value: string) { this.props.value = value; }
}`,
	'typescript'
)}

`Kernel.context('bond/tiles')` mints the canonical key `@ixirjs/context/bond/tiles` — the same
string `defineBond` generated. ## 2. The root does its own wiring

{codeBlock(
	`const ID = $props.id();
const bondProps = {                    // live getters, never a snapshot
  get id() { return ID; },
  get value() { return value; },
  get disabled() { return disabled; }
};
const build = untrack(() => factory);  // factory is read once, at init, by design
const bond = TilesContext.share(build ? build(bondProps) : TilesBond.create(bondProps));
bond.bindCommit((next, context) => {   // what controlledProp used to own
  value = next;
  onvaluechange?.(next, context);
});
export const getBond = () => bond;

const el = Kernel.element(() => restProps, {
  preset: 'tiles',
  class: 'flex flex-wrap gap-2',
  state: bond,
  attrs: () => ({ id: bond.rootId })
});`,
	'typescript'
)}

## 3. Parts render their own element

{codeBlock(
	`// Before: definePart(TilesBond, 'item', () => props, { as: 'div', class: 'tiles-item' })
// After:
const bond = TilesContext.get();          // getOrThrow(message) when a root is required
const el = Kernel.element(() => props, {
  preset: 'tiles.item',
  class: 'tiles-item',
  state: bond
});

// Template: <div {...el.attrs}>…</div>`,
	'typescript'
)}

A part keeps a dispatch only when it has a reason — real transitions, an `animate` driver, a `base`
renderer, or a polymorphic `as`. It declares that in the spec and binds its leaf once in the script
with `const leaf = Kernel.render(el);`, then renders that identifier. Rendering the inline
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
