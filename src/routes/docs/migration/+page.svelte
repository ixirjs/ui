<script lang="ts">
	import { Section, CodeBlock, DocCallout } from '$docs/components';
	import { Button } from '$lib/components/button';

	const termsCode = `// Old public wording
BondState owns state.
Bond creates each Atom.
Parts call bond.trigger(), bond.content(), or bond.atom(...).

// Current wording
Bond owns shared state, mutations, context, capabilities, and registered Atoms.
Built-in fixed descendants bind through the internal Kernel; custom runtime parts use createAtomInstance(...).
Parts read rendered Atoms with bond.nodeByPart(...), bond.nodesByPart(...), and bond.nodeByRole(...).`;

	const renderCode = `// Before
import { HtmlAtom, type HtmlAtomProps } from '@ixirjs/ui';
import { usePart } from '@ixirjs/ui/shared';

// After
import type { RenderProps } from '@ixirjs/ui';
import { HtmlElement } from '@ixirjs/ui/components/element';

// Prefer a semantic library component. Use HtmlElement only for a low-level custom element.
<HtmlElement preset="button" as="button">Save</HtmlElement>

// Built-in descendants bind through the internal Kernel. External custom runtime parts use
// createAtomInstance(...) instead of usePart(...).`;

	const stateCode = `// Before: state class as the public authoring surface
class DialogState extends BondState<DialogProps> {
  get isOpen() {
    return this.props.open;
  }

  close() {
    this.props.open = false;
  }
}

// After: the Bond is the public controller
class DialogBond extends Bond<DialogProps> {
  get isOpen() {
    return this.props.open;
  }

  close() {
    this.props.open = false;
  }
}`;

	const atomCode = `// Before: rendered parts asked the Bond to create the Atom
const trigger = bond.trigger();

// After: the rendered part owns its runtime Atom
const trigger = createAtomInstance('trigger', {
  bond: DialogBond.getOrThrow(),
  capabilities: [elementRef(), pressable(), ariaRole('button')]
});

// Use the Atom spread on the element you render
<button {...trigger.spread}>Open</button>`;

	const registryCode = `// Before: generated methods doubled as lookup
const trigger = bond.trigger();
trigger.element?.focus();

// After: lookup reads the registry of rendered Atoms
const trigger = bond.nodeByPart('trigger');
trigger?.element?.focus();

const items = bond.nodesByPart('item');`;

	const capabilityCode = `// Bond capability: shared state, coordination, role projection, or setup
this.capability(disclosureCapability({
  open: () => this.props.open,
  setOpen: (next) => (this.props.open = next)
}));

// Atom capability: one node's local DOM behavior or presentation
const trigger = createAtomInstance('trigger', {
  capabilities: [pressable(), dataState((_, bond) => bond?.isOpen ? 'open' : 'closed')]
});`;
</script>

<svelte:head>
	<title>Migration Guide — IXIR UI</title>
	<meta
		name="description"
		content="Move older IXIR UI code from BondState and Bond-owned atom factories to the current Bond, Atom, and capability model."
	/>
</svelte:head>

<div class="animate-page-in mb-9">
	<p class="text-muted-foreground m-0 mb-2.5 font-mono text-[11px] tracking-[0.05em] uppercase">
		Migration Guide
	</p>
	<h1 class="font-display text-foreground m-0 mb-3 text-[32px] font-bold tracking-[-0.025em]">
		Move to the current model.
	</h1>
	<p class="text-muted-foreground m-0 mb-6 max-w-[640px] text-[17px] leading-[1.65]">
		Use this guide when older code or docs mention BondState, Bond-owned Atoms, generated atom
		factories, or <code class="font-mono text-sm">bond.state</code> as the main public API.
	</p>
	<div class="flex flex-wrap gap-3">
		<Button href="/docs/bonds" as="a" variant="primary">Understand Bonds</Button>
		<Button href="/docs/extending" as="a" variant="outline">Author components</Button>
	</div>
</div>

<Section.Root>
	<Section.Header>
		<Section.Title>New Terms</Section.Title>
		<Section.Subtitle>These are the words current docs and code should use.</Section.Subtitle>
	</Section.Header>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={termsCode} />
	</div>

	<DocCallout variant="info" title="Short version">
		The Bond coordinates. The Atom Component renders. The Atom owns one DOM node. Capabilities add
		reusable behavior.
	</DocCallout>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>Replace Removed Rendering Adapters</Section.Title>
		<Section.Subtitle>
			The rich prop vocabulary is now <code>RenderProps</code>. Prefer semantic components or the
			low-level <code>HtmlElement</code> renderer.
		</Section.Subtitle>
	</Section.Header>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="svelte" code={renderCode} />
	</div>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>Move State Onto The Bond</Section.Title>
		<Section.Subtitle>
			Authoring uses one public controller: the Bond. BondState has been removed; state that used to
			live on it belongs on a Bond subclass, which a definition names as its <code>base</code>.
		</Section.Subtitle>
	</Section.Header>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={stateCode} />
	</div>

	<p class="text-muted-foreground mt-4 text-sm leading-relaxed">
		Keep mutation methods like <code class="font-mono text-xs">open()</code>,
		<code class="font-mono text-xs">close()</code>, <code class="font-mono text-xs">toggle()</code>,
		and <code class="font-mono text-xs">select()</code> on the Bond. Read raw inputs from
		<code class="font-mono text-xs">bond.props</code>, and expose clear getters for derived state.
	</p>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>Create Atoms In Parts</Section.Title>
		<Section.Subtitle>
			The component that renders the element should create the runtime Atom for that element.
		</Section.Subtitle>
	</Section.Header>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="svelte" code={atomCode} />
	</div>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>Use Registry Lookup</Section.Title>
		<Section.Subtitle>
			Use <code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">bond.nodeByPart()</code
			>,
			<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">bond.nodesByPart()</code>,
			and
			<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">bond.nodeByRole()</code>
			to inspect rendered Atoms.
		</Section.Subtitle>
	</Section.Header>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={registryCode} />
	</div>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>Extract Capabilities</Section.Title>
		<Section.Subtitle>
			When behavior repeats or crosses roles, move it into a capability.
		</Section.Subtitle>
	</Section.Header>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={capabilityCode} />
	</div>
</Section.Root>

<Section.Root class="mb-0">
	<div class="border-border rounded-lg border p-5">
		<p class="text-foreground mb-2 text-sm font-semibold">Migration checklist</p>
		<ul class="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
			<li>Replace BondState hosts with a Bond subclass, passed to defineBond as its base.</li>
			<li>Replace HtmlAtomProps with RenderProps.</li>
			<li>Replace HtmlAtom with a semantic component or HtmlElement.</li>
			<li>Replace usePart in custom families with explicit createAtomInstance ownership.</li>
			<li>Move shared getters and mutation methods onto the Bond.</li>
			<li>Create runtime Atoms in rendered Svelte parts with createAtomInstance.</li>
			<li>Use nodeByPart, nodesByPart, and nodeByRole for rendered Atom lookup.</li>
			<li>
				Use canonical component names: Input.Control, Combobox.Control, DataGrid.Row/Column/Cell,
				and DropdownMenu.Content.
			</li>
			<li>Use filterSelectData instead of the removed dropdown/filter aliases.</li>
			<li>Move repeated behavior into Bond or Atom capabilities.</li>
			<li>Remove generated part methods; they are no longer compatibility adapters.</li>
		</ul>
	</div>
</Section.Root>
