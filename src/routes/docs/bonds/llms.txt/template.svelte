<script lang="ts">
	import { FrontMatter } from '$docs/md/components';
	import { codeBlock, list } from '$docs/md/template';

	let { data } = $props();
	const { metadata, frontmatter } = $derived(data);
</script>

<FrontMatter {frontmatter} />

# {metadata.pageTitle}

{metadata.pageDescription}

{list([
	'Bond: a plain Svelte 5 state class. No base class, no capability registry, no node registry.',
	'The root builds the Bond from live prop getters and publishes it with Context.share(...).',
	'Every part reads the Bond from context and renders through Kernel.element(() => props, spec).',
	'A plain part spreads el.attrs on a literal tag; a part with motion, a base renderer or a polymorphic tag binds one leaf with Kernel.render(el).',
	'Behaviour models (createDisclosure, createSelection, createRovingFocus, createTypeahead) are ordinary functions from @ixirjs/ui/shared; their ARIA projection is written literally in a part attrs.',
	'defineBond, useRoot, definePart, defineLeaf, createAtomInstance and the Bond/Atom classes were removed on 2026-08-27.'
])}

## Popup family interfaces Popover, DropdownMenu, Select, Combobox, Tooltip, ContextMenu, DatePicker
and PopoverDialog share `PopupBond`. Family Bond names are type-only interfaces. Library roots own
construction and teardown; read state through children snippets or `getBond()` and mutate through
commands. Popup roots/items do not accept `factory`. Standalone owners use `PopupBond.create` and
`dispose`; component-root authors use `PopupBond.mount`. The Card example below remains valid for
independent families. See [Migration](/docs/migration) for the popup API change. ## Write the Bond

{codeBlock(
	`import { Kernel } from '@ixirjs/ui/shared';

export type CardBondProps = { id?: string; disabled?: boolean };

export const CardContext = Kernel.context<CardBond>('bond/card');

export class CardBond {
  readonly name = 'card';
  readonly props: CardBondProps;
  titleId = $state<string | undefined>();

  constructor(props: CardBondProps = {}) { this.props = props; }

  get id() { return this.props.id ?? 'card'; }
  get rootId() { return Kernel.id(this.id, 'card-root'); }
  get isDisabled() { return this.props.disabled ?? false; }

  static create(props: CardBondProps = {}) { return new CardBond(props); }
}`,
	'typescript'
)}

## Build and share it in the root

{codeBlock(
	`const ID = $props.id();
let { disabled = false, factory, children, ...restProps } = $props();

// Live props: getters, so a prop change is seen where the Bond reads it.
const bondProps = {
  get id() { return ID; },
  get disabled() { return disabled; }
};
const build = untrack(() => factory);           // read once, at init, by design
const card = CardContext.share(build ? build(bondProps) : CardBond.create(bondProps));
export const getBond = () => card;

const el = Kernel.element(() => restProps, {
  preset: 'card',
  class: 'card bg-card border-border flex flex-col rounded-lg border',
  state: card,
  attrs: () => ({ id: card.rootId })
});`,
	'typescript'
)}

Controlled props are committed through the Bond. The root calls `bond.bindCommit(...)` with a
function that writes the bindable prop and then fires the semantic callback: the Bond decides, the
root writes, the callback runs after the write, and an equal value does not fire. ## Render a part

{codeBlock(
	`const card = CardContext.get();                  // getOrThrow(message) when a root is required
const id = card ? Kernel.id(card.id, 'card-title') : undefined;
if (card) card.titleId = id;                     // cross-part ARIA, no registry

const el = Kernel.element(() => props, {
  preset: 'card.title',
  class: 'card-title text-lg leading-none font-semibold',
  state: card,
  attrs: () => (id ? { id } : {})
});

// <h3 {...el.attrs}>{@render props.children?.()}</h3>`,
	'typescript'
)}

A part with real transitions, an `animate` driver, a `base` renderer or a polymorphic `as` declares
it in the spec and binds its leaf once in the script — `const leaf = Kernel.render(el);` — then
renders that identifier. Rendering the inline `Kernel.render(el)(…)` call instead costs a snippet
block and a hydration anchor. ## Collections

{codeBlock(
	`// Parent: a mount-ordered Map plus one equality-gated $state for the shared fact.
attachItem(id: string, item: AccordionItemHandle): () => void {
  this.items.set(id, item);
  if (this.#first === null && !item.isDisabled) this.#first = id;
  return () => { this.items.delete(id); };
}

// Child root, at init — document order — released on teardown.
const detach = bond.parent.attachItem(bond.id, bond);
$effect(() => detach);`,
	'typescript'
)}

## Handlers `Kernel.compose(consumerHandler, ownHandler)` runs the consumer's first and skips the
part's when the default was prevented. A part's own handler also returns early on
`event.defaultPrevented`, for a consumer who prevents from their own listener.
