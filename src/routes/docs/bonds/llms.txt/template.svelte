<script lang="ts">
	import { FrontMatter } from '$docs/md/components';
	import { codeBlock, list } from '$docs/md/template';

	let { data } = $props();
	const { metadata, frontmatter } = $derived(data);
</script>

<FrontMatter {frontmatter} />

# {metadata.pageTitle}

{metadata.pageDescription}

## Public Model The current Bond authoring model uses four public names:

{list([
	'Atom Component: the Svelte component that renders a part such as Trigger, Content, Item, or Header.',
	'Atom: the runtime object owned by an Atom Component. It captures the element and produces attrs, handlers, attachments, and lifecycle behavior.',
	'Bond: the compound controller that owns shared props, derived values, mutations, context, capabilities, and registered Atoms.',
	'Capability / Particle: a reusable behavior unit installed on a Bond or Atom. Particle is the metaphor; capability is the API.'
])}

## Create A Bond

{codeBlock(
	`import { Bond, bondContextKey } from '@svelte-atoms/core';
import { getContext, setContext } from 'svelte';

export type TilesBondProps = {
  id?: string;
  value?: string;
  disabled?: boolean;
};

export class TilesBond extends Bond<TilesBondProps> {
  static CONTEXT_KEY = bondContextKey('tiles');

  constructor(props: TilesBondProps) {
    super(props, 'tiles');
  }

  get selectedValue() {
    return this.props.value;
  }

  select(value: string) {
    if (!this.props.disabled) this.props.value = value;
  }

  share(): this {
    return setContext(TilesBond.CONTEXT_KEY, this);
  }

  static optional(): TilesBond | undefined {
    return getContext(TilesBond.CONTEXT_KEY);
  }

  static required(): TilesBond {
    const bond = TilesBond.optional();
    if (!bond) throw new Error('Tiles parts must be rendered inside <Tiles.Root>.');
    return bond;
  }
}`,
	'typescript'
)}

## Root Component

{codeBlock(
	`<script lang="ts">
  import { defineProperty, defineState } from '@svelte-atoms/core';
  import { TilesBond, type TilesBondProps } from './bond.svelte';

  let { value = $bindable(), disabled = false, children } = $props();

  const props = defineState<TilesBondProps>([
    defineProperty('value', () => value, (next) => { value = next; }),
    defineProperty('disabled', () => disabled)
  ]);

  const bond = new TilesBond(props).share();

  export function getBond() {
    return bond;
  }
</scr${'ipt'}>

<div data-bond={bond.name}>
  {@render children?.({ bond })}
</div>`,
	'svelte'
)}

## Atom Component Rendered parts create local Atoms and register them with the Bond.

{codeBlock(
	`<script lang="ts">
  import { createAtomInstance, elementRef, pressable, dataState, ariaRole } from '@svelte-atoms/core';
  import { TilesBond } from './bond.svelte';

  let { value, children, ...props } = $props();

  const node = createAtomInstance('item', {
    bond: () => TilesBond.required(),
    register: { cardinality: 'many' },
    capabilities: [
      elementRef(),
      pressable(),
      ariaRole('option'),
      dataState((_, bond) => bond?.selectedValue === value ? 'selected' : 'idle')
    ]
  });

  function select() {
    TilesBond.required().select(value);
  }
</scr${'ipt'}>

<button {...node.spread} {...props} onclick={select}>
	{@render children?.()}
</button>`,
	'svelte'
)} ## Required Vs Optional Bonds Use `required()` for compound parts that cannot work outside their root.
Throw a clear component-specific error. Use `optional()` for parts that can also stand alone; an Atom
can still host local capabilities without a Bond. ## Registry Lookup Use `bond.node()` and `bond.nodes()`
to inspect rendered Atoms.

{codeBlock(
	`const trigger = bond.node('trigger');
trigger?.element?.focus();

const items = bond.nodes('item');

createAtomInstance('item', {
  bond: () => TilesBond.required(),
  register: { cardinality: 'many' }
});`,
	'typescript'
)}

## Capabilities Bond capabilities can be state-focused, coordination-focused, or effectful. Atom
capabilities handle one node's local presentation, DOM behavior, and lifecycle.

{codeBlock(
	`import { capabilityKey, defineBondCapability, defineAtomCapability } from '@svelte-atoms/core';

export const SELECTION = capabilityKey<{ select(value: string): void }>('@acme/tiles/selection');

export const selectionCapability = (select: (value: string) => void) =>
  defineBondCapability({
    slot: SELECTION,
    surface: { select },
    roles: {
      item: (bond, value: string) => ({
        attrs: () => ({ 'aria-selected': bond.props.value === value }),
        handlers: () => ({ onclick: () => select(value) })
      })
    }
  });

export const selectedDataState = defineAtomCapability({
  behavior: (node, bond) => ({
    attrs: () => ({ 'data-state': bond?.node(node.name) === node ? 'active' : 'idle' })
  })
});`,
	'typescript'
)}

## Current public authoring surface New rendered parts should create Atoms with
`createAtomInstance(...)`, register with `bond.register(node)`, and look up rendered nodes through
`bond.node()` / `bond.nodes()`. Generated methods such as `bond.trigger()` remain direct constructor
adapters for older authoring types, but rendered components should own stable node creation and
registration.
