<script lang="ts">
	import { FrontMatter } from '$docs/md/components';
	import { codeBlock } from '$docs/md/template';
	import type { Frontmatter } from '$docs/md/frontmatter';

	const frontmatter: Frontmatter = {
		id: 'extending',
		title: 'Extending & Authoring',
		category: 'architecture',
		depth: 'detailed',
		prerequisites: ['bonds'],
		related: ['composition', 'crafting', 'migration']
	};
</script>

<FrontMatter {frontmatter} />

# Extending & Authoring Popup families share one `PopupBond` implementation. Their family names are
interfaces, not subclasses, and popup roots/items do not accept custom factories. Use live props,
presets and capabilities. Standalone owners use `PopupBond.create` and dispose their state;
component roots use `PopupBond.mount` for root-owned teardown.

{codeBlock(
	`import { PopupBond, isSelectBond } from '@ixirjs/ui/experimental';
import type { SelectBond } from '@ixirjs/ui/components/select';

// In a component root: live props, canonical state, root-owned disposal.
const bond: SelectBond = PopupBond.mount('select', liveProps);
bond.select(['alpha']);

// Family names are interfaces, not subclass constructors.
if (isSelectBond(contextValue)) contextValue.select(['beta']);`,
	'typescript'
)}

## Reuse parts you did not write A part resolves the context key its own family publishes. Share one
instance under several keys and both families' parts bind to it — which is all `PopoverDialog` is.

{codeBlock(
	`const bond = PopoverDialogContext.share(PopupBond.mount('popover-dialog', bondProps));
DialogContext.share(bond);
PopoverContext.share(bond);
OverlayContext.share(bond);`,
	'typescript'
)}

## Author a family

{codeBlock(
	`import { Kernel } from '@ixirjs/ui/shared';

export type TilesBondProps = { id?: string; value?: string; disabled?: boolean };

export const TilesContext = Kernel.context<TilesBond>('bond/tiles');

export class TilesBond {
  readonly name = 'tiles';
  readonly props: TilesBondProps;
  #commit: ((next: string, context: { bond: TilesBond }) => void) | undefined;

  constructor(props: TilesBondProps) { this.props = props; }
  static create(props: TilesBondProps) { return new TilesBond(props); }

  bindCommit(commit: (next: string, context: { bond: TilesBond }) => void) {
    this.#commit = commit;
  }

  get id() { return this.props.id ?? 'tiles'; }
  get rootId() { return Kernel.id(this.id, 'tiles-root'); }
  get isDisabled() { return this.props.disabled ?? false; }
  isSelected(value: string) { return this.props.value === value; }

  select(value: string) {
    if (this.isDisabled || this.props.value === value) return;
    this.#commit?.(value, { bond: this });
  }
}`,
	'typescript'
)}

The root builds live prop getters, shares the Bond, wires the commit, and renders one element:

{codeBlock(
	`const ID = $props.id();
const bondProps = {
  get id() { return ID; },
  get value() { return value; },
  get disabled() { return disabled; }
};
const build = untrack(() => factory);
const bond = TilesContext.share(build ? build(bondProps) : TilesBond.create(bondProps));
bond.bindCommit((next, context) => {
  value = next;
  onvaluechange?.(next, context);
});
export const getBond = () => bond;

const el = Kernel.element(() => restProps, {
  preset: 'tiles',
  class: 'flex flex-wrap gap-2',
  state: bond,
  attrs: () => ({ id: bond.rootId, role: 'listbox' })
});`,
	'typescript'
)}

Each part reads the Bond and writes its own ARIA — there is no role protocol projecting attributes
onto it:

{codeBlock(
	`const bond = TilesContext.getOrThrow('<Tiles.Item /> must be used within a <Tiles.Root />');

function click(event: MouseEvent) {
  if (event.defaultPrevented) return;
  bond.select(value);
}

const el = Kernel.element(() => restProps, {
  preset: 'tiles.item',
  class: 'cursor-pointer rounded-md px-3 py-2',
  state: bond,
  attrs: () => ({
    id: Kernel.id(bond.id, 'tiles-item-' + value),
    role: 'option',
    'aria-selected': bond.isSelected(value),
    'data-state': bond.isSelected(value) ? 'selected' : 'idle',
    tabindex: bond.isSelected(value) ? 0 : -1,
    onclick: Kernel.compose(onclick, click)
  })
});`,
	'typescript'
)}

## Reuse the behaviour models

{codeBlock(
	`import { createRovingFocus, createSelection } from '@ixirjs/ui/shared';

// "What's committed" — the model owns the set algebra; storage stays yours.
#selection = createSelection<string>({
  get: () => this.props.values ?? [],
  set: (v) => (this.props.values = v),
  mode: () => (this.props.multiple ? 'multiple' : 'single'),
  indexed: true
});

// "Which item is highlighted" — the id list and id-to-item resolution are injected.
#roving = createRovingFocus({
  ids: () => [...this.items.keys()],
  item: (id) => this.items.get(id)
});`,
	'typescript'
)}

A model is a field on the Bond. It owns the logic and nothing about the DOM; the attributes its
state implies are written in the part that renders the element. ## Type your own props Preset-driven
props (`variant`, `size`, …) are declared by the consumer, not the library: a preset is swappable,
so only the application knows which values it defines. Two routes — augment the props interface
directly, or, when a family declares its props as a type alias (which TypeScript cannot merge),
augment its `*ExtendProps` interface. Until you declare them, a misspelt value renders with no
variant classes and raises no error.

{codeBlock(
	`declare module '@ixirjs/ui/components/button' {
  interface ButtonProps {
    variant?: 'primary' | 'destructive' | 'app-brand';
  }
}

// Type-alias families expose a seam instead.
declare module '@ixirjs/ui/components/tree' {
  interface TreeRootExtendProps {
    variant?: 'compact' | 'comfortable';
  }
}`,
	'typescript'
)}

## Removed authoring APIs `defineBond`, `useRoot`, `definePart`, `defineLeaf`, `createAtomInstance`,
`bindBond`, `controlledProp`, `defineAtom`, the `Bond` and `Atom` classes, `Collection`, the
capability definition helpers and the role/slot keys were removed on 2026-08-27. See the migration
guide for the replacement of each.
