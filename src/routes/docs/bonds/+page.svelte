<script lang="ts">
	import { Section, CodeBlock, DocCallout } from '$docs/components';
	import { Button } from '$lib/components/button';

	const bondCode = `import { Bond, bondContextKey } from '@svelte-atoms/core';
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
}`;

	const rootCode = `<script lang="ts">
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
</div>`;

	const atomCode = `<script lang="ts">
  import {
    createAtomInstance,
    elementRef,
    pressable,
    dataState,
    ariaRole
  } from '@svelte-atoms/core';
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
</button>`;

	const registryCode = `const trigger = bond.node('trigger');
trigger?.element?.focus();

const items = bond.nodes('item');
const selected = items.find((node) => node.get(SELECTED)?.value);

// Many registrations are explicit:
createAtomInstance('item', {
  bond: () => TilesBond.required(),
  register: { cardinality: 'many' }
});`;

	const capabilityCode = `import {
  capabilityKey,
  defineBondCapability,
  defineAtomCapability
} from '@svelte-atoms/core';

export const SELECTION = capabilityKey<{ select(value: string): void }>(
  '@acme/tiles/selection'
);

export const selectionCapability = (select: (value: string) => void) =>
  defineBondCapability({
    slot: SELECTION,
    surface: { select },
    roles: {
      item: (bond, value: string) => ({
        attrs: () => ({
          'aria-selected': bond.props.value === value
        }),
        handlers: () => ({
          onclick: () => select(value)
        })
      })
    }
  });

export const selectedDataState = defineAtomCapability({
  behavior: (node, bond) => ({
    attrs: () => ({
      'data-state': bond?.node(node.name) === node ? 'active' : 'idle'
    })
  })
});`;

	const beforeAfterCode = `// Before: the Bond created and cached every part Atom.
class TriggerAtom extends Atom<TilesBond> {
  constructor(bond: TilesBond) {
    super(bond, 'trigger');
  }
}

class TilesBond extends Bond<TilesProps> {
  trigger() {
    return this.node('trigger');
  }
}

// After: the component that renders the part owns its Atom.
const trigger = createAtomInstance('trigger', {
  bond: () => TilesBond.required(),
  factory: (bond) => new TriggerAtom(bond),
  capabilities: [pressable(), ariaRole('button')]
});`;
</script>

<svelte:head>
	<title>Bonds — Svelte Atoms</title>
	<meta
		name="description"
		content="Learn the vNext Bond model: Atom components create Atoms, Bonds coordinate shared state, and capabilities attach reusable behavior."
	/>
</svelte:head>

<div class="border-border/60 mb-14 border-b pb-12">
	<p class="text-primary mb-3 text-sm font-medium uppercase tracking-wide">Bonds</p>
	<h1 class="text-foreground mb-4 text-4xl font-bold tracking-tight">
		Coordination without prop drilling.
	</h1>
	<p class="text-muted-foreground mb-8 max-w-xl text-lg leading-relaxed">
		A Bond owns shared component state, context, registered Atoms, and compound coordination. Atom
		components render the DOM; Atoms hold the runtime element behavior.
	</p>
	<div class="flex flex-wrap gap-3">
		<Button href="/docs/extending" as="a" variant="primary" class="gap-2 px-5">
			Author components
			<svg
				xmlns="http://www.w3.org/2000/svg"
				width="14"
				height="14"
				viewBox="0 0 24 24"
				fill="none"
				stroke="currentColor"
				stroke-width="2"
				stroke-linecap="round"
				stroke-linejoin="round"
				aria-hidden="true"
			>
				<path d="M5 12h14" /><path d="m12 5 7 7-7 7" />
			</svg>
		</Button>
		<Button href="/docs/components/accordion" as="a" variant="outline" class="px-5">
			See a Bond in action
		</Button>
	</div>
</div>

<Section.Root>
	<Section.Header>
		<Section.Title>Core model</Section.Title>
		<Section.Subtitle>Four names describe the public authoring model.</Section.Subtitle>
	</Section.Header>

	<div class="grid gap-3 sm:grid-cols-2">
		<div class="border-border rounded-lg border p-4">
			<p class="text-foreground mb-1 text-sm font-semibold">Atom Component</p>
			<p class="text-muted-foreground text-sm">
				The Svelte component that renders a part such as Trigger, Content, Item, or Header.
			</p>
		</div>
		<div class="border-border rounded-lg border p-4">
			<p class="text-foreground mb-1 text-sm font-semibold">Atom</p>
			<p class="text-muted-foreground text-sm">
				The runtime object owned by an Atom Component. It captures the element and produces the
				spread attrs, handlers, attachments, and lifecycle behavior.
			</p>
		</div>
		<div class="border-border rounded-lg border p-4">
			<p class="text-foreground mb-1 text-sm font-semibold">Bond</p>
			<p class="text-muted-foreground text-sm">
				The compound controller. It owns shared props, derived values, mutations, context,
				capabilities, and the registry of mounted Atoms.
			</p>
		</div>
		<div class="border-border rounded-lg border p-4">
			<p class="text-foreground mb-1 text-sm font-semibold">Capability / Particle</p>
			<p class="text-muted-foreground text-sm">
				A reusable behavior unit installed on a Bond or an Atom. Particle is the metaphor;
				capability is the API name.
			</p>
		</div>
	</div>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>Create the Bond</Section.Title>
		<Section.Subtitle>
			New components can put props, derived values, and mutation methods directly on the Bond.
		</Section.Subtitle>
	</Section.Header>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={bondCode} />
	</div>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>Use it from parts</Section.Title>
		<Section.Subtitle>
			Root components share the Bond. Part components create and register local Atoms.
		</Section.Subtitle>
	</Section.Header>

	<div class="space-y-6">
		<div>
			<p class="text-foreground mb-2 text-sm font-semibold">Root component</p>
			<div class="overflow-hidden rounded-lg">
				<CodeBlock lang="svelte" code={rootCode} />
			</div>
		</div>
		<div>
			<p class="text-foreground mb-2 text-sm font-semibold">Atom component</p>
			<div class="overflow-hidden rounded-lg">
				<CodeBlock lang="svelte" code={atomCode} />
			</div>
		</div>
	</div>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>Required or optional</Section.Title>
		<Section.Subtitle>
			Use required helpers for compound parts and optional helpers for components that can stand
			alone.
		</Section.Subtitle>
	</Section.Header>

	<div class="grid gap-3 sm:grid-cols-2">
		<DocCallout variant="info" title="Required Bond">
			Parts such as <code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs"
				>Tabs.Tab</code
			>
			or <code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">Dialog.Content</code>
			should call a component-specific
			<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">required()</code> helper and
			throw a clear development error when rendered outside their root.
		</DocCallout>
		<DocCallout variant="info" title="Optional Bond">
			Parts that also work independently should call
			<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">optional()</code> and pass
			the result to
			<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">createAtomInstance</code>.
			The Atom can still use local capabilities without a Bond.
		</DocCallout>
	</div>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>Registry lookup</Section.Title>
		<Section.Subtitle>
			Use <code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">bond.node()</code>
			and <code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">bond.nodes()</code>
			for rendered nodes.
		</Section.Subtitle>
	</Section.Header>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={registryCode} />
	</div>

	<DocCallout variant="info" title="Rendered nodes">
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">createAtomInstance</code>
		creates and registers the node where the DOM is rendered.
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">bond.node(key)</code>
		and
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">bond.nodes(key)</code>
		read that registry.
	</DocCallout>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>Capabilities</Section.Title>
		<Section.Subtitle>
			Capabilities attach reusable behavior to Bond or Atom hosts.
		</Section.Subtitle>
	</Section.Header>

	<div class="space-y-4">
		<div class="grid gap-3 sm:grid-cols-3">
			<div class="border-border rounded-lg border p-4">
				<p class="text-foreground mb-1 text-sm font-semibold">State-focused</p>
				<p class="text-muted-foreground text-sm">
					Own or expose reusable state such as disclosure, selection, validation, progress, or
					collections.
				</p>
			</div>
			<div class="border-border rounded-lg border p-4">
				<p class="text-foreground mb-1 text-sm font-semibold">Coordination-focused</p>
				<p class="text-muted-foreground text-sm">
					Coordinate multiple Atoms with relationships, roving focus, typeahead, labels, or active
					descendant links.
				</p>
			</div>
			<div class="border-border rounded-lg border p-4">
				<p class="text-foreground mb-1 text-sm font-semibold">Effectful</p>
				<p class="text-muted-foreground text-sm">
					Install whole-bond lifecycle work such as focus traps, escape stacks, outside press
					listeners, or observers.
				</p>
			</div>
		</div>
		<div class="overflow-hidden rounded-lg">
			<CodeBlock lang="typescript" code={capabilityCode} />
		</div>
	</div>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>Migration shape</Section.Title>
		<Section.Subtitle>
			The main shift is from Bond-owned atom factories to component-owned Atoms.
		</Section.Subtitle>
	</Section.Header>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={beforeAfterCode} />
	</div>

	<DocCallout variant="info" title="Current authoring names">
		The public shared runtime now centers on
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">Bond</code>,
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">Atom</code>, and
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">createAtomInstance</code>.
		The old state and atom compatibility classes are internal implementation details.
	</DocCallout>
</Section.Root>
