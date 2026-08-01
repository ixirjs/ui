<script lang="ts">
	import { FrontMatter } from '$docs/md/components';
	import { codeBlock } from '$docs/md/template';
	import type { Frontmatter } from '$docs/md/frontmatter';

	const frontmatter: Frontmatter = {
		id: 'extending',
		title: 'Extending & Fusing',
		category: 'architecture',
		depth: 'detailed',
		prerequisites: ['bonds', 'atoms'],
		related: ['composition', 'crafting']
	};
</script>

<FrontMatter {frontmatter} />

# Extending & Fusing The stable factory-based authoring interface lives at `@ixirjs/ui/shared`.
Concrete component Bond definitions used as composition operands are expert APIs from
`@ixirjs/ui/experimental`. ## Extend a definition

{codeBlock(
	`import { DropdownMenuBond } from '@ixirjs/ui/experimental';
import { defineBond } from '@ixirjs/ui/shared';

export const CommandMenuBond = defineBond({
  name: 'command-menu',
  parts: [DropdownMenuBond],
  atoms: {}
});`,
	'typescript'
)}

## Fuse definitions

{codeBlock(
	`import { DialogBond, PopoverBond } from '@ixirjs/ui/experimental';
import { defineBond } from '@ixirjs/ui/shared';

export const PopoverDialogBond = defineBond({
  name: 'popover-dialog',
  parts: [PopoverBond, DialogBond],
  atoms: {}
});`,
	'typescript'
)}

Composition metadata is private. The definition value is the composition operand; no public `.spec`
record is available. ## Author from scratch

{codeBlock(
	`import { Bond, defineAtom } from '@ixirjs/ui/experimental';
import {
  bindBond,
  createAtomInstance,
  defineBond,
  roles
} from '@ixirjs/ui/shared';

class TilesBondBase extends Bond<{ id?: string; value?: string }> {
  select(value: string) { this.props.value = value; }
}

const RootAtom = defineAtom('root');
const ItemAtom = defineAtom('item');

export const TilesBond = defineBond({
  name: 'tiles',
  base: TilesBondBase,
  atoms: {
    root: RootAtom,
    item: { atom: ItemAtom, role: roles.item }
  }
});

// Root component owns context publication; bindBond owns activation and teardown.
const binding = bindBond((props) => new TilesBond(props), {
  value: [() => value, (next) => { value = next; }]
});
const bond = binding.bond.share();

// Item component: creation and registration are explicit.
const item = createAtomInstance('item', {
  bond: TilesBond.getOrThrow(),
  register: { cardinality: 'many' },
  factory: (owner) => new ItemAtom(owner!)
});`,
	'typescript'
)}

## Custom capabilities and roles

{codeBlock(
	`import {
  capabilityKey,
  customRole,
  defineAtomCapability,
  defineBondCapability
} from '@ixirjs/ui/shared';

const BUSY = capabilityKey<{ readonly busy: boolean }>('@acme/cap:busy');
const status = customRole<'status', void>({ owner: '@acme/widgets', name: 'status' });

const busyCapability = (isBusy: () => boolean) => defineBondCapability({
  slot: BUSY,
  surface: { get busy() { return isBusy(); } },
  roles: {
    [status]: () => ({ attrs: () => ({ 'aria-busy': isBusy() }) })
  }
});

const statusPresentation = defineAtomCapability({
  attach: {
    attrs: (node) => ({ role: 'status', 'data-atom': node.name })
  }
});`,
	'typescript'
)}

Generated `bond.root()`-style methods are removed. Render with `createAtomInstance`; query mounted
parts with `nodeByPart`, `nodesByPart`, and `nodeByRole`. ## Type your own props Preset-driven props
(`variant`, `size`, …) are declared by the consumer, not the library: a preset is swappable, so only
the application knows which values it defines. Two routes — augment the props interface directly,
or, when a family declares its props as a type alias (which TypeScript cannot merge), augment its
`*ExtendProps` interface. Until you declare them, a misspelt value renders with no variant classes
and raises no error.

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
