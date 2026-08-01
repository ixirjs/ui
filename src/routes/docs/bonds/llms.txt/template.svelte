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
	'Bond owns family state, domain methods, capabilities, context, and rendered-part registration.',
	'Atom owns one rendered part and exposes its observable spread.',
	'Definitions are inferred from one defineBond spec; runtime composition metadata is private.',
	'bindBond is the root lifecycle owner.',
	'createAtomInstance is the rendered-part ownership seam.'
])}

## Define a Bond

{codeBlock(
	`import { Bond, defineAtom } from '@ixirjs/ui/experimental';
import { defineBond, roles } from '@ixirjs/ui/shared';

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
});`,
	'typescript'
)}

## Bind the root

{codeBlock(
	`import { bindBond } from '@ixirjs/ui/shared';

const binding = bindBond(
  (props) => new TilesBond(props),
  { value: [() => value, (next) => { value = next; }] }
);
const bond = binding.bond.share();`,
	'typescript'
)}

`binding.bond.share()` publishes context. `bindBond` validates and activates the complete capability
graph, then disposes the Bond when the root is destroyed. Manual `useCapabilities()` wiring is not
part of normal authoring. ## Render an Atom

{codeBlock(
	`import {
  createAtomInstance,
  dataState,
  pressable
} from '@ixirjs/ui/shared';

const bond = TilesBond.getOrThrow();
const item = createAtomInstance('item', {
  bond,
  register: { cardinality: 'many' },
  factory: (owner) => new ItemAtom(owner!),
  capabilities: [
    pressable({ onPress: () => bond.select(value) }),
    dataState(() => bond.selectedValue === value ? 'selected' : 'idle')
  ]
});`,
	'typescript'
)}

## Query rendered parts

{codeBlock(
	`const trigger = bond.nodeByPart('trigger');
const items = bond.nodesByPart('item');
const content = bond.nodeByRole(roles.content);`,
	'typescript'
)}

Part lookup, role lookup, and repeated-part lookup are separate. Registrations staged during render
are synchronously visible; reactive invalidation is committed in a microtask. ## Removed methods
`bond.root()` and similar generated methods are removed. Rendered parts create registered Atoms with
`createAtomInstance`, and mounted parts are found with explicit query methods.
