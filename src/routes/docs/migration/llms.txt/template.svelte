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
New: Atom Components create their own Atoms with createAtomInstance(...).

Old: bond.trigger(), bond.content(), or bond.atom(...) are the main lookup API.
New: bond.node(...) and bond.nodes(...) read rendered registered Atoms.`,
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
  bond: () => DialogBond.required(),
  capabilities: [elementRef(), pressable(), ariaRole('button')]
});`,
	'typescript'
)}

## Use Registry Lookup

{codeBlock(
	`const trigger = bond.node('trigger');
trigger?.element?.focus();

const items = bond.nodes('item');`,
	'typescript'
)}

## Checklist

{list([
	'Replace public BondState wording with Bond.',
	'Move shared getters and mutation methods onto the Bond.',
	'Create runtime Atoms in rendered Svelte parts with createAtomInstance.',
	'Use bond.node and bond.nodes for rendered Atom lookup.',
	'Move repeated behavior into Bond or Atom capabilities.',
	'Keep generated part methods only as compatibility adapters.'
])}
