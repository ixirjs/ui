<script lang="ts">
	import { FrontMatter } from '$docs/md/components';
	import { codeBlock, list } from '$docs/md/template';

	let { data } = $props();
	const { frontmatter } = $derived(data);
</script>

<FrontMatter {frontmatter} />

# Migration Guide Use this guide when older code or docs mention BondState, Bond-owned Atoms,
generated atom factories, or `bond.state` as the main public API. ## Current Terms

{list([
	'Bond: the public controller for shared state, derived values, mutation methods, context, capabilities, and registered Atoms.',
	'Atom Component: the Svelte component that renders a part.',
	'Atom: the runtime object owned by an Atom Component. It owns one DOM node, spread props, lifecycle, and local capabilities.',
	'Capability: reusable behavior installed on a Bond or Atom.'
])}

## Replace Old Wording

{codeBlock(
	`Old: BondState owns public state.
New: Bond owns public shared state and mutations.

Old: Bond creates each Atom for rendered parts.
New: Built-in fixed descendants bind through the internal Kernel; custom runtime parts use createAtomInstance(...).

Old: bond.trigger(), bond.content(), or bond.atom(...) are the main lookup API.
New: bond.nodeByPart(...), bond.nodesByPart(...), and bond.nodeByRole(...) read rendered registered Atoms.`,
	'text'
)}

## Replace Removed Rendering Adapters

{codeBlock(
	`Old: HtmlAtom and HtmlAtomProps.
New: semantic components or HtmlElement, with RenderProps for shared rich prop typing.

Old: usePart in externally authored families.
New: explicit createAtomInstance ownership. Built-in descendants use the internal Kernel.`,
	'text'
)}

## Move State Onto The Bond

{codeBlock(
	`class DialogBond extends Bond<DialogProps> {
  get isOpen() {
    return this.props.open;
  }

  close() {
    this.props.open = false;
  }
}`,
	'typescript'
)}

## Create Atoms In Rendered Parts

{codeBlock(
	`const trigger = createAtomInstance('trigger', {
  bond: DialogBond.getOrThrow(),
  capabilities: [elementRef(), pressable(), ariaRole('button')]
});`,
	'typescript'
)}

## Use Registry Lookup

{codeBlock(
	`const trigger = bond.nodeByPart('trigger');
trigger?.element?.focus();

const items = bond.nodesByPart('item');`,
	'typescript'
)}

## Checklist

{list([
	'Replace HtmlAtomProps with RenderProps.',
	'Replace HtmlAtom with a semantic component or HtmlElement.',
	'Replace usePart with explicit createAtomInstance ownership.',
	'Replace BondState hosts with a Bond subclass, passed to defineBond as its base.',
	'Move shared getters and mutation methods onto the Bond.',
	'Create runtime Atoms in rendered Svelte parts with createAtomInstance.',
	'Use nodeByPart, nodesByPart, and nodeByRole for rendered Atom lookup.',
	'Use canonical component names: Input.Control, Combobox.Control, DataGrid.Row/Column/Cell, and DropdownMenu.Content.',
	'Use filterSelectData instead of the removed dropdown/filter aliases.',
	'Move repeated behavior into Bond or Atom capabilities.',
	'Remove generated part methods; they are no longer compatibility adapters.'
])}
