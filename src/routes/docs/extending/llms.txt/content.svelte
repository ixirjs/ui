<script lang="ts">
	import { FrontMatter } from '$docs/md/components';
	import { codeBlock, inlineCode } from '$docs/md/template';
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

# Extending & Fusing Every compound component has a **Bond** that coordinates rendered **Atoms** and
shared **capabilities**. You can extend a Bond, fuse multiple Bonds, author a new Bond, or extract
behavior as a capability. ## Extend A Component

{inlineCode('defineBond({ parts })')} reuses the parent component's Atom registry and capabilities, then
gives the new component its own name and context identity.

{codeBlock(
	`import { defineBond, DropdownMenuBond } from '@svelte-atoms/core';

export const CommandMenuBond = defineBond({
  parts: [DropdownMenuBond],
  name: 'command-menu',
  atoms: {},
});

export type CommandMenuBond = InstanceType<typeof CommandMenuBond>;`,
	'typescript'
)}

## Fuse Components

{inlineCode('fuse')} unions atom registries and concatenates capabilities. Slot collisions resolve last-wins.

{codeBlock(
	`import { fuse, PopoverBond, DialogBond, PopoverTriggerAtom } from '@svelte-atoms/core';

export const PopoverDialogBond = fuse({
  name: 'popover-dialog',
  parts: [PopoverBond, DialogBond],
  atoms: { trigger: PopoverTriggerAtom },
});

export type PopoverDialogBond = InstanceType<typeof PopoverDialogBond>;`,
	'typescript'
)}

Fused bonds are shared under each part's context key, so you can reuse the existing part components.

{codeBlock(
	`<PopoverDialog.Root bind:open>
  <Popover.Trigger>Open</Popover.Trigger>
  <PopoverDialog.Content>
    <Dialog.Header>Title</Dialog.Header>
    <Dialog.Body>Content</Dialog.Body>
  </PopoverDialog.Content>
</PopoverDialog.Root>`,
	'svelte'
)}

## Author From Scratch New authoring puts shared state and mutation methods on the Bond. The Svelte
component that renders a part creates a local Atom with {inlineCode('createAtomInstance')}.

{codeBlock(
	`import {
  Bond,
  Atom,
  createAtomInstance,
  defineAtomCapability,
  bondContextKey
} from '@svelte-atoms/core';
import { getContext, setContext } from 'svelte';

export type TilesBondProps = { id?: string; value?: string };

export class TilesBond extends Bond<TilesBondProps> {
  static CONTEXT_KEY = bondContextKey('tiles');

  constructor(props: TilesBondProps) {
    super(props, 'tiles');
  }

  select(value: string) {
    this.props.value = value;
  }

  static required() {
    const bond = getContext<TilesBond | undefined>(TilesBond.CONTEXT_KEY);
    if (!bond) throw new Error('Tiles parts must be rendered inside <Tiles.Root>.');
    return bond;
  }

  share(): this {
    return setContext(TilesBond.CONTEXT_KEY, this);
  }
}

export class TileItemAtom extends Atom<TilesBond, HTMLButtonElement> {
  constructor(bond: TilesBond | undefined) {
    super(bond, 'item');
  }
}

const optionRole = defineAtomCapability({
  behavior: () => ({ attrs: () => ({ role: 'option' }) })
});

const item = createAtomInstance('item', {
  bond: () => TilesBond.required(),
  register: { cardinality: 'many' },
  factory: (bond) => new TileItemAtom(bond),
  capabilities: [optionRole]
});`,
	'typescript'
)}

## Capabilities Bond capabilities can be state-focused, coordination-focused, or effectful. Atom
capabilities handle one node's local presentation, DOM behavior, and lifecycle.

{codeBlock(
	`import { capabilityKey, defineBondCapability, defineAtomCapability } from '@svelte-atoms/core';

export const BUSY = capabilityKey<{ readonly busy: boolean }>('@acme/cap:busy');

export function busyCapability(isBusy: () => boolean) {
  return defineBondCapability({
    slot: BUSY,
    surface: { get busy() { return isBusy(); } },
    roles: {
      status: () => ({ attrs: () => ({ 'aria-busy': isBusy() }) })
    }
  });
}

export const statusRole = defineAtomCapability({
  behavior: (node) => ({
    attrs: () => ({ role: 'status', 'data-atom': node.name })
  })
});`,
	'typescript'
)}

Use a capability when behavior crosses roles, is shared across component families, needs replacement
or decoration by slot, needs whole-bond setup, bridges parent state into child nodes, or owns ARIA
relationships between sibling nodes. ## Current public authoring surface New docs and new code
should prefer `Bond`, `Atom`, `createAtomInstance`, `defineBondCapability`, `defineAtomCapability`,
and registry lookup through `bond.node()` / `bond.nodes()`. Bond-owned factories and generated part
methods remain compatibility adapters, but the old state and atom classes are internal
implementation details.
