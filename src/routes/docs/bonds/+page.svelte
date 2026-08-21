<script lang="ts">
	import { Section, CodeBlock, DocCallout } from '$docs/components';
	import { Button } from '$lib/components/button';

	const bondCode = `import { Bond, defineAtom } from '@ixirjs/ui/experimental';
import { defineBond, roles } from '@ixirjs/ui/shared';

export type TilesBondProps = { id?: string; value?: string; disabled?: boolean };

class TilesBondBase extends Bond<TilesBondProps> {
  get selectedValue() { return this.props.value; }
  select(value: string) {
    if (!this.props.disabled) this.props.value = value;
  }
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
});`;

	const rootCode = `<script lang="ts">
  import { bindBond } from '@ixirjs/ui/experimental';
  import { TilesBond } from './bond.svelte';

  let { value = $bindable(), disabled = false, children } = $props();
  const binding = bindBond(
    (props) => new TilesBond(props),
    {
      value: [() => value, (next) => { value = next; }],
      disabled: () => disabled
    }
  );
  const bond = binding.bond.share(); // shared, activated, and destroyed by bindBond
</scr${'ipt'}>

<div data-bond={bond.name}>{@render children?.({ bond })}</div>`;

	const atomCode = `<script lang="ts">
  import {
    createAtomInstance,
    elementRef,
    pressable,
    dataState,
    ariaRole
  } from '@ixirjs/ui/shared';
  import { TilesBond } from './bond.svelte';

  let { value, children, ...props } = $props();

  const node = createAtomInstance('item', {
    bond: TilesBond.getOrThrow(),
    register: { cardinality: 'many' },
    capabilities: [
      elementRef(),
      pressable(),
      ariaRole('option'),
      dataState((_, bond) => bond?.selectedValue === value ? 'selected' : 'idle')
    ]
  });

  function select() {
    TilesBond.getOrThrow().select(value);
  }
</scr${'ipt'}>

<button {...node.spread} {...props} onclick={select}>
  {@render children?.()}
</button>`;

	const registryCode = `const trigger = bond.nodeByPart('trigger');
trigger?.element?.focus();

const items = bond.nodesByPart('item');
const selected = items.find((node) => node.get(SELECTED)?.value);

// Many registrations are explicit:
createAtomInstance('item', {
  bond: TilesBond.getOrThrow(),
  register: { cardinality: 'many' }
});`;

	const capabilityCode = `import {
  capabilityKey,
  customRole,
  defineBondCapability,
  defineAtomCapability
} from '@ixirjs/ui/shared';

const item = customRole<'item', string>({ owner: '@acme/tiles', name: 'item' });

export const SELECTION = capabilityKey<{ select(value: string): void }>(
  '@acme/tiles/selection'
);

export const selectionCapability = (select: (value: string) => void) =>
  defineBondCapability({
    slot: SELECTION,
    surface: { select },
    roles: {
      [item]: (value) => ({
        attrs: (bond) => ({ 'aria-selected': bond.props.value === value }),
        handlers: () => ({ onclick: () => select(value) })
      })
    }
  });

export const selectedDataState = defineAtomCapability({
  attach: {
    attrs: (node, bond) => ({
      'data-state': bond?.nodeByPart(node.name) === node ? 'active' : 'idle'
    })
  }
});`;

	const beforeAfterCode = `// Before: the Bond created and cached every part Atom.
class TriggerAtom extends Atom<TilesBond> {
  constructor(bond: TilesBond) {
    super(bond, 'trigger');
  }
}

class TilesBond extends Bond<TilesProps> {
  trigger() {
    return this.nodeByPart('trigger');
  }
}

// After: the component that renders the part owns its Atom.
const trigger = createAtomInstance('trigger', {
  bond: TilesBond.getOrThrow(),
  factory: (bond) => new TriggerAtom(bond),
  capabilities: [pressable(), ariaRole('button')]
});`;
</script>

<svelte:head>
	<title>Bonds — IXIR UI</title>
	<meta
		name="description"
		content="Learn the vNext Bond model: Atom components create Atoms, Bonds coordinate shared state, and capabilities attach reusable behavior."
	/>
</svelte:head>

<div class="animate-page-in mb-9">
	<p class="text-muted-foreground m-0 mb-2.5 font-mono text-[11px] tracking-[0.05em] uppercase">
		Bonds
	</p>
	<h1 class="font-display text-foreground m-0 mb-3 text-[32px] font-bold tracking-[-0.025em]">
		Coordination without prop drilling.
	</h1>
	<p class="text-muted-foreground m-0 mb-6 max-w-[640px] text-[17px] leading-[1.65]">
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
			Use <code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs"
				>bond.nodeByPart()</code
			>,
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">bond.nodesByPart()</code
			>, or
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">bond.nodeByRole()</code>
			for rendered nodes.
		</Section.Subtitle>
	</Section.Header>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={registryCode} />
	</div>

	<DocCallout variant="info" title="Rendered nodes">
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">createAtomInstance</code>
		creates and registers the node where the DOM is rendered.
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">bond.nodeByPart(key)</code>
		and
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">bond.nodesByPart(key)</code>
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

	<DocCallout variant="info" title="Stable and experimental authoring">
		The stable
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">shared</code> entry centers
		on factories such as
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">defineBond</code> and
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">createAtomInstance</code>.
		Concrete
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">Bond</code> and
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">Atom</code> classes are
		expert escape hatches from
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">experimental</code>.
	</DocCallout>
</Section.Root>
