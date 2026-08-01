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

# Extending & Fusing

Every component is a **bond** — a bag of *atoms* (DOM slots) and *capabilities* (behaviour).
Because a bond is data, the set of bonds is closed under combination: you can extend one, fuse
two, author a new one, and project shared behaviour as a capability — all over the same public
seam. The four moves, smallest to largest:

- **Extend** — inherit a component and override a slot ({inlineCode('defineBond({ extends })')})
- **Fuse** — combine two bonds into a new one ({inlineCode('fuse(...)')})
- **Author** — declare a bond from atoms + capabilities ({inlineCode('defineBond(...)')})
- **Capability** — extract reusable behaviour onto the role seam

## Extend a component

{inlineCode('extends')} is single-parent spec composition — the declarative {inlineCode('class extends')}.
You inherit the parent's atoms, capabilities, and context key, and declare only what differs.
The result is a real subclass: {inlineCode('instanceof')} the parent, same behaviour, rebranded.

{codeBlock(
	`import { defineBond, triggerCapability, ClickTrigger, DropdownMenuBond } from '@svelte-atoms/core';

// A command-palette flavour of dropdown-menu.
export const CommandMenuBond = defineBond({
  extends: DropdownMenuBond,
  name: 'command-menu',
  atoms: { trigger: CommandTriggerAtom },                  // override one slot (last-wins)
  capabilities: () => [
    triggerCapability(ClickTrigger, { ariaHasPopup: 'dialog' })  // re-register a slot (last-wins)
  ],
});
// Pair the value with its instance type (the const isn't generic):
export type CommandMenuBond = InstanceType<typeof CommandMenuBond>;`,
	'typescript'
)}

There is **one mechanism** for both composition and customisation: re-register an atom slot
(via {inlineCode('atoms')}) or a capability slot (via {inlineCode('capabilities')}), and the
later registration wins. No parallel hook system.

## Fuse two components

{inlineCode('fuse')} unions the parts' atoms and concatenates their capabilities, then resolves
each slot last-wins. The result is a first-class bond you can fuse again (the closure property:
bond + bond = bond).

{codeBlock(
	`import { fuse, PopoverBond, DialogBond, PopoverTriggerAtom } from '@svelte-atoms/core';

// PopoverDialog — a Popover trigger that opens Dialog's MODAL content.
export const PopoverDialogBond = fuse({
  name: 'popover-dialog',                    // rebrand: fresh namespace / preset / context key
  parts: [PopoverBond, DialogBond],          // atoms UNION, capabilities CONCAT (last-wins per slot)
  atoms: { trigger: PopoverTriggerAtom },    // curate the union — keep Popover's richer trigger
});
export type PopoverDialogBond = InstanceType<typeof PopoverDialogBond>;`,
	'typescript'
)}

**Reuse the parts' own components.** A fused bond is shared under *each part's* context key, so
the parts' existing atom components resolve it. Your fusion's atom tree is mostly re-exports —
not bespoke wrappers.

{codeBlock(
	`<PopoverDialog.Root bind:open>
  <Popover.Trigger>Open</Popover.Trigger>     <!-- Popover's own trigger -->
  <PopoverDialog.Content>
    <Dialog.Header>Title</Dialog.Header>       <!-- Dialog's own atoms -->
    <Dialog.Body>…</Dialog.Body>
  </PopoverDialog.Content>
</PopoverDialog.Root>`,
	'svelte'
)}

## Author a bond from scratch

{inlineCode('defineBond')} wires a declarative spec — atoms, capabilities, and non-atom methods —
into a real Bond subclass with cached, typed atom factories and a context key. State stays a
class you inject at construction.

{codeBlock(
	`import { defineBond, BondAtom } from '@svelte-atoms/core';

class RootAtom extends BondAtom { constructor(b) { super(b, 'root'); } }
class ItemAtom extends BondAtom {
  constructor(b) { super(b, 'item'); }
  override get attrs() { return { ...super.attrs, role: 'option' }; }
}

export const TilesBond = defineBond({
  name: 'tiles',                       // DOM namespace, preset base, context key
  atoms: { root: RootAtom, item: ItemAtom },   // → bond.root(), bond.item()
  capabilities: (state) => [/* rovingCapability(...), selectionCapability(...) */],
  methods: {                           // non-atom instance methods
    open(this: TilesBond)  { this.state.open(); },
    close(this: TilesBond) { this.state.close(); },
  },
});
export type TilesBond = InstanceType<typeof TilesBond>;
// new TilesBond(new TilesState(props))`,
	'typescript'
)}

## Capabilities

Behaviour lives in capabilities, not base classes — which is exactly why bonds compose. Reach
for a built-in, or write your own.

**Built-in stateful capabilities.** {inlineCode('RovingFocus')} ("which item is highlighted")
and {inlineCode('SelectionModel')} ("what's committed") are two responsibilities a listbox
composes — one each.

{codeBlock(
	`import {
  createRovingFocus, rovingCapability,
  createSelection, selectionCapability,
} from '@svelte-atoms/core';

const roving = createRovingFocus({
  ids:  () => [...items.keys()],
  item: (id) => items.get(id),         // powers roving.activeItem
});
const selection = createSelection({
  get:  () => values,
  set:  (v) => (values = v),
  mode: () => (multiple ? 'multiple' : 'single'),
});

capabilities: () => [
  rovingCapability(roving, { orientation: 'vertical' }),   // → container + item roles
  selectionCapability(selection),                          // → container + item roles
];`,
	'typescript'
)}

**Write your own.** A capability is a {inlineCode('{ slot, surface, behavior(role) }')} triple.
Atoms opt into a projection with {inlineCode('.role(role)')}; {inlineCode('fuse')}/{inlineCode(
	'defineBond'
)} merge and resolve on the slot.

{codeBlock(
	`import type { Capability, Behavior } from '@svelte-atoms/core';

export function busyCapability(isBusy: () => boolean): Capability<{ readonly busy: boolean }> {
  return {
    slot: 'busy',
    surface: { get busy() { return isBusy(); } },
    behavior(role): Behavior | undefined {
      if (role === 'status') return { attrs: () => ({ 'aria-busy': isBusy() }) };
      return undefined;
    },
  };
}
// register:  defineBond({ …, capabilities: () => [busyCapability(() => loading)] })
// project:   class StatusAtom extends BondAtom {
//              constructor(b) { super(b, 'status'); this.role('status'); }
//            }`,
	'typescript'
)}

A **capability** is the noun — it has a {inlineCode('slot')}, lives in the spec, and is what
fusion resolves. A **behaviour** is the verb — the per-role projection an atom folds, with no
identity. Use a capability when two parts must resolve to one (focus, selection, roving); use a
one-off behaviour for an ad-hoc, single-atom decoration via {inlineCode('atom.use(...)')}.

## Extend or compose?

Reach for the smallest move that fits. If you only need to rearrange markup or restyle, **compose
atoms** and use {inlineCode('base')}/{inlineCode('preset')} — no new bond needed. Reach for
{inlineCode('extends')}/{inlineCode('fuse')} only when you need new *behaviour*: a new atom slot,
a different capability, or two components' behaviour in one.
