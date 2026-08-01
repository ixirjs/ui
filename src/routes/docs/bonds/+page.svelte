<script lang="ts">
	import { Section, CodeBlock, DocCallout } from '$docs/components';
	import { Button } from '$lib/components/button';

	const defineStateCode = `import { type BondStateProps } from '@svelte-atoms/core';

// 1. Describe the props your component exposes
export type MyComponentStateProps = BondStateProps & {
  open: boolean;
  disabled: boolean;
};

// 2. Extend BondState — add computed getters and mutation methods
export class MyComponentState extends BondState<MyComponentStateProps> {
  constructor(props: () => MyComponentStateProps) {
    super(props);
  }

  get isOpen() {
    return this.props.open ?? false;
  }

  open()   { this.props.open = true;             }
  close()  { this.props.open = false;            }
  toggle() { this.props.open = !this.props.open; }
}`;

	const defineBondCode = `import { Bond, BondAtom, BondState } from '@svelte-atoms/core';
import { getContext, setContext } from 'svelte';

// BondAtom subclasses — each one captures one DOM element automatically
export class MyRootAtom extends BondAtom<MyComponentBond> {
  constructor(bond: MyComponentBond) { super(bond, 'root'); }

  override get attrs() {
    return { ...super.attrs, 'aria-disabled': this.bond.state.props.disabled };
  }
}

export class MyTriggerAtom extends BondAtom<MyComponentBond> {
  constructor(bond: MyComponentBond) { super(bond, 'trigger'); }

  override get attrs() {
    return {
      ...super.attrs,
      role: 'button',
      'aria-expanded': this.bond.state.isOpen
    };
  }
  override get handlers() {
    return { onclick: () => this.bond.state.toggle() };
  }
}

// The Bond class wires everything together
export class MyComponentBond extends Bond<
  MyComponentStateProps,
  MyComponentState,
  { root: HTMLElement; trigger: HTMLElement }
> {
  static CONTEXT_KEY = '@your-app/bonds/my-component';

  constructor(state: MyComponentState) {
    super(state, 'my-component');
  }

  // atom() registers a BondAtom — element capture is automatic via attachments
  root()    { return this.atom('root',    () => new MyRootAtom(this));    }
  trigger() { return this.atom('trigger', () => new MyTriggerAtom(this)); }

  share(): this {
    return MyComponentBond.set(this) as this;
  }

  static get(): MyComponentBond | undefined {
    return getContext(MyComponentBond.CONTEXT_KEY);
  }
  static set(bond: MyComponentBond): MyComponentBond {
    return setContext(MyComponentBond.CONTEXT_KEY, bond);
  }
}`;

	const rootComponentCode = `<script lang="ts">
  import { defineState, defineProperty } from '@svelte-atoms/core';
  import { MyComponentBond, MyComponentState } from './bond.svelte';
  import type { MyComponentStateProps } from './bond.svelte';

  let { open = $bindable(false), disabled = false } = $props();

  // Wrap bindable props so BondState sees fine-grained reactive updates
  const bondProps = defineState<MyComponentStateProps>([
    defineProperty('open', () => open, (v) => { open = v; }),
    defineProperty('disabled', () => disabled)
  ]);

  const bond = new MyComponentBond(
    new MyComponentState(bondProps)
  ).share();
<\x2Fscript>

<!-- Spread .spread onto each element — attrs + handlers + attachments -->
<div {...bond.root().spread}>
  <button {...bond.trigger().spread}>
    {bond.state.isOpen ? 'Close' : 'Open'}
  </button>
  {#if bond.state.isOpen}
    <div>Content</div>
  {/if}
</div>`;

	const childComponentCode = `<script lang="ts">
  import { MyComponentBond } from './bond.svelte';

  // Retrieve the bond from Svelte context — no props needed
  const bond = MyComponentBond.get();

  function handleClose() {
    bond?.state.close();
    // Access captured DOM elements if needed
    bond?.element('root')?.focus();
  }
<\x2Fscript>

<button onclick={handleClose}>
  {bond?.state.isOpen ? 'Close' : 'Open'}
</button>`;

	const factoryCode = `let {
  factory = defaultFactory,
  open = $bindable(false),
  disabled = false
} = $props();

const bondProps = defineState<MyComponentStateProps>([
  defineProperty('open', () => open, (v) => { open = v; }),
  defineProperty('disabled', () => disabled)
]);

// factory prop lets callers swap in a custom Bond subclass
const bond = factory(bondProps).share();

function defaultFactory(props: typeof bondProps) {
  return new MyComponentBond(new MyComponentState(props));
}`;

	const reactivePropsCode = `import { defineState, defineProperty } from '@svelte-atoms/core';

let open = $bindable(false);
let disabled = false;

// defineProperty makes each prop a reactive getter/setter cell on the props
// object. BondState reads through those cells — so only the properties actually
// read inside the Bond trigger updates, giving you fine-grained reactivity.
const bondProps = defineState<DialogBondProps>([
  defineProperty('open',     () => open,     (v) => { open = v; }),
  defineProperty('disabled', () => disabled)
]);

const state = new DialogBondState(bondProps);`;

	const bondStateArchCode = `export class TabsBondState extends BondState<TabsBondProps> {
  #items = new SvelteMap<string, TabBond>();

  constructor(props: () => TabsBondProps) {
    super(props);
  }

  // $derived runs inside the class — reacts to this.props.value
  #selectedItem = $derived(
    this.props?.value ? this.#items.get(this.props.value) : undefined
  );

  get selectedItem() { return this.#selectedItem; }

  select(id: string) {
    this.props.value = id;  // Setter on defineProperty triggers $bindable update
  }
}`;

	const contextSharingCode = `// In the Bond class
static get(): TreeBond | undefined {
  return getContext(TreeBond.CONTEXT_KEY);
}
static set(bond: TreeBond): TreeBond {
  return setContext(TreeBond.CONTEXT_KEY, bond);
}
share(): this {
  return TreeBond.set(this) as this;
}

// In the root component
const bond = new TreeBond(state).share();  // puts bond into context

// In any child component — however deep
const parentBond = TreeBond.get();`;

	const getBondCode = `<script lang="ts">
  import MyRoot from './my-root.svelte';
  import type { MyComponentBond } from './bond.svelte';

  let rootRef: MyRoot;

  function handleClick() {
    const bond = rootRef.getBond();
    bond?.state.toggle();
    bond?.element('trigger')?.focus();
  }
<\x2Fscript>

<MyRoot bind:this={rootRef} />
<button onclick={handleClick}>Toggle</button>`;
</script>

<svelte:head>
	<title>Bonds — Svelte Atoms</title>
	<meta
		name="description"
		content="Learn how the Bond pattern powers compound components in Svelte Atoms — BondState, BondAtom, context sharing, and reactive props."
	/>
</svelte:head>

<!-- Hero -->
<div class="border-border/60 mb-14 border-b pb-12">
	<p class="text-primary mb-3 text-sm font-medium uppercase tracking-wide">Bonds</p>
	<h1 class="text-foreground mb-4 text-4xl font-bold tracking-tight">
		State without prop drilling.
	</h1>
	<p class="text-muted-foreground mb-8 max-w-xl text-lg leading-relaxed">
		A Bond is a class-based state container that lives in Svelte context. Root components create
		one; every descendant reads it automatically — no props passed between them.
	</p>
	<div class="flex flex-wrap gap-3">
		<Button href="/docs/philosophy" as="a" variant="primary" class="gap-2 px-5">
			Read the philosophy
			<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
				<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
			</svg>
		</Button>
		<Button href="/docs/components/accordion" as="a" variant="outline" class="px-5">See a Bond in action</Button>
	</div>
</div>

<!-- What Are Bonds -->
<Section.Root>
	<Section.Header>
		<Section.Title>What are Bonds?</Section.Title>
		<Section.Subtitle>
			A two-part architecture: BondState holds reactive data, Bond manages elements and context.
		</Section.Subtitle>
	</Section.Header>

	<div class="space-y-3 text-sm leading-relaxed">
		<p class="text-muted-foreground">
			A Bond is split into two classes. <strong class="text-foreground">BondState</strong> owns the
			reactive props and mutation methods — it's where your component's logic lives.
			<strong class="text-foreground">Bond</strong> owns the DOM element references (via
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">BondAtom</code>
			subclasses), generates element spreads with ARIA and event handlers, and puts itself into
			Svelte context via <code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">.share()</code>.
		</p>
		<p class="text-muted-foreground">
			Child components call
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">Bond.get()</code> to
			retrieve the bond from context and read state, call methods, or access captured DOM elements
			— without any props being threaded between components.
		</p>
	</div>
</Section.Root>

<!-- Key Features -->
<Section.Root>
	<Section.Header>
		<Section.Title>Key features</Section.Title>
		<Section.Subtitle>What Bonds give you that plain stores and prop-drilling don't.</Section.Subtitle>
	</Section.Header>

	<div class="grid gap-3 sm:grid-cols-2">
		<div class="border-border flex items-start gap-3 rounded-lg border p-4">
			<div class="bg-primary/10 text-primary mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
				<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M7 3v18M17 3v18M3 7h18M3 17h18"/>
				</svg>
			</div>
			<div>
				<p class="text-foreground mb-0.5 text-sm font-semibold">Separation of concerns</p>
				<p class="text-muted-foreground text-xs leading-relaxed">BondState owns logic; Bond owns DOM. Neither knows about Svelte component lifecycle.</p>
			</div>
		</div>

		<div class="border-border flex items-start gap-3 rounded-lg border p-4">
			<div class="bg-primary/10 text-primary mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
				<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/>
					<path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/>
				</svg>
			</div>
			<div>
				<p class="text-foreground mb-0.5 text-sm font-semibold">Automatic element capture</p>
				<p class="text-muted-foreground text-xs leading-relaxed">BondAtom attachments track DOM nodes the moment they mount — no manual ref management needed.</p>
			</div>
		</div>

		<div class="border-border flex items-start gap-3 rounded-lg border p-4">
			<div class="bg-primary/10 text-primary mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
				<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/>
				</svg>
			</div>
			<div>
				<p class="text-foreground mb-0.5 text-sm font-semibold">Full type safety</p>
				<p class="text-muted-foreground text-xs leading-relaxed">Generic typing from props → state → elements → spread. Your IDE knows every method at authoring time.</p>
			</div>
		</div>

		<div class="border-border flex items-start gap-3 rounded-lg border p-4">
			<div class="bg-primary/10 text-primary mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
				<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
				</svg>
			</div>
			<div>
				<p class="text-foreground mb-0.5 text-sm font-semibold">Fine-grained reactivity</p>
				<p class="text-muted-foreground text-xs leading-relaxed">Props are passed as a function — only the properties actually read inside the Bond trigger updates.</p>
			</div>
		</div>

		<div class="border-border flex items-start gap-3 rounded-lg border p-4">
			<div class="bg-primary/10 text-primary mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
				<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
				</svg>
			</div>
			<div>
				<p class="text-foreground mb-0.5 text-sm font-semibold">Context integration</p>
				<p class="text-muted-foreground text-xs leading-relaxed">Built-in <code class="font-mono text-xs">.share()</code>, <code class="font-mono text-xs">.get()</code>, <code class="font-mono text-xs">.set()</code> — share state across any component tree depth.</p>
			</div>
		</div>

		<div class="border-border flex items-start gap-3 rounded-lg border p-4">
			<div class="bg-primary/10 text-primary mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
				<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>
				</svg>
			</div>
			<div>
				<p class="text-foreground mb-0.5 text-sm font-semibold">Customisable via factory</p>
				<p class="text-muted-foreground text-xs leading-relaxed">Components accept a <code class="font-mono text-xs">factory</code> prop so callers can swap in Bond subclasses for testing or extension.</p>
			</div>
		</div>
	</div>
</Section.Root>

<!-- Creating a Bond -->
<Section.Root>
	<Section.Header>
		<Section.Title>Creating a Bond</Section.Title>
		<Section.Subtitle>
			Four pieces: props type, BondState class, BondAtom subclasses, and Bond class.
		</Section.Subtitle>
	</Section.Header>

	<div class="space-y-6">
		<div>
			<p class="text-foreground mb-3 text-sm font-semibold">1 — Define state props and BondState</p>
			<div class="overflow-hidden rounded-lg">
				<CodeBlock lang="typescript" code={defineStateCode} />
			</div>
		</div>

		<div>
			<p class="text-foreground mb-1 text-sm font-semibold">2 — Create BondAtom subclasses and Bond</p>
			<p class="text-muted-foreground mb-3 text-sm">
				Each <code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">BondAtom</code>
				subclass represents one DOM element. Override <code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">attrs</code>
				for ARIA/data attributes and <code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">handlers</code>
				for events. Element capture is automatic — <code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">BondAtom.attachments</code>
				wires up the element reference when the node mounts.
			</p>
			<div class="overflow-hidden rounded-lg">
				<CodeBlock lang="typescript" code={defineBondCode} />
			</div>
		</div>
	</div>
</Section.Root>

<!-- Using in Components -->
<Section.Root>
	<Section.Header>
		<Section.Title>Using Bonds in components</Section.Title>
		<Section.Subtitle>
			Root components create and share the Bond; children retrieve it from context.
		</Section.Subtitle>
	</Section.Header>

	<div class="space-y-6">
		<div>
			<p class="text-foreground mb-1 text-sm font-semibold">Root component</p>
			<p class="text-muted-foreground mb-3 text-sm">
				Call <code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">.share()</code>
				to place the Bond in Svelte context, then spread
				<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">.spread</code>
				on each element — it contains attrs, event handlers, and the attachment that captures the DOM node.
			</p>
			<div class="overflow-hidden rounded-lg">
				<CodeBlock lang="svelte" code={rootComponentCode} />
			</div>
		</div>

		<div>
			<p class="text-foreground mb-1 text-sm font-semibold">Child component</p>
			<p class="text-muted-foreground mb-3 text-sm">
				Children call the static <code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">.get()</code>
				to retrieve the Bond. Use <code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">bond.element('key')</code>
				to access captured DOM elements.
			</p>
			<div class="overflow-hidden rounded-lg">
				<CodeBlock lang="svelte" code={childComponentCode} />
			</div>
		</div>

		<div>
			<p class="text-foreground mb-1 text-sm font-semibold">Factory prop</p>
			<p class="text-muted-foreground mb-3 text-sm">
				Expose a <code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">factory</code>
				prop so callers can inject a custom Bond subclass — useful for testing or extending behavior.
			</p>
			<div class="overflow-hidden rounded-lg">
				<CodeBlock lang="typescript" code={factoryCode} />
			</div>
		</div>

		<div>
			<p class="text-foreground mb-1 text-sm font-semibold">Accessing from a parent</p>
			<p class="text-muted-foreground mb-3 text-sm">
				Export a <code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">getBond()</code>
				function from the root component so parent components can imperatively read or mutate bond state.
			</p>
			<div class="overflow-hidden rounded-lg">
				<CodeBlock lang="svelte" code={getBondCode} />
			</div>
		</div>
	</div>
</Section.Root>

<!-- Architecture Deep Dive -->
<Section.Root>
	<Section.Header>
		<Section.Title>Architecture deep dive</Section.Title>
		<Section.Subtitle>BondState props, reactive derived values, and context sharing.</Section.Subtitle>
	</Section.Header>

	<div class="space-y-6">
		<div>
			<p class="text-foreground mb-1 text-sm font-semibold">BondState — props and logic</p>
			<p class="text-muted-foreground mb-3 text-sm">
				<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">this.props</code>
				calls the function passed to the constructor, returning the live reactive object built by
				<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">defineState</code>.
				Use <code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">$derived</code>
				as a class field for computed values — Svelte 5 Runes work inside class bodies.
			</p>
			<div class="overflow-hidden rounded-lg">
				<CodeBlock lang="typescript" code={bondStateArchCode} />
			</div>
		</div>

		<div>
			<p class="text-foreground mb-1 text-sm font-semibold">Reactive props with defineState</p>
			<p class="text-muted-foreground mb-3 text-sm">
				<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">defineProperty</code>
				creates a reactive getter/setter pair on the props object. When BondState accesses
				<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">this.props.open</code>,
				it runs the getter — and only that getter triggers updates, giving fine-grained reactivity.
			</p>
			<div class="overflow-hidden rounded-lg">
				<CodeBlock lang="typescript" code={reactivePropsCode} />
			</div>
		</div>

		<div>
			<p class="text-foreground mb-1 text-sm font-semibold">Context sharing</p>
			<p class="text-muted-foreground mb-3 text-sm">
				<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">.share()</code>
				wraps <code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">setContext</code>.
				The static
				<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">.get()</code>
				wraps <code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">getContext</code>.
				Every Bond subclass defines its own unique context key.
			</p>
			<div class="overflow-hidden rounded-lg">
				<CodeBlock lang="typescript" code={contextSharingCode} />
			</div>
		</div>
	</div>
</Section.Root>

<!-- When to Use Bonds -->
<Section.Root>
	<Section.Header>
		<Section.Title>When to use Bonds</Section.Title>
		<Section.Subtitle>Bonds are powerful but not always the right tool.</Section.Subtitle>
	</Section.Header>

	<div class="grid gap-3 sm:grid-cols-2">
		<div class="border-border rounded-lg border p-4">
			<p class="text-foreground mb-1 text-sm font-semibold">Compound components</p>
			<p class="text-muted-foreground text-xs leading-relaxed">Multiple sibling parts (trigger, content, item) that must share state — the primary use case for Bonds.</p>
		</div>
		<div class="border-border rounded-lg border p-4">
			<p class="text-foreground mb-1 text-sm font-semibold">DOM coordination</p>
			<p class="text-muted-foreground text-xs leading-relaxed">When parts need to measure, focus, or position relative to each other — BondAtom element refs make this clean.</p>
		</div>
		<div class="border-border rounded-lg border p-4">
			<p class="text-foreground mb-1 text-sm font-semibold">Reusable logic</p>
			<p class="text-muted-foreground text-xs leading-relaxed">Extract component behavior into a plain class — easy to unit-test without mounting a component.</p>
		</div>
		<div class="border-border rounded-lg border p-4">
			<p class="text-foreground mb-1 text-sm font-semibold">Extensibility</p>
			<p class="text-muted-foreground text-xs leading-relaxed">Subclass a Bond to override ARIA attrs or add behavior without forking the original component.</p>
		</div>
	</div>

	<div class="mt-4">
		<DocCallout variant="warning" title="When not to use Bonds">
			For a single piece of state inside one component, a plain
			<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">$state</code> variable is
			simpler and clearer. Don't reach for the Bond pattern until you have multiple coordinating parts.
		</DocCallout>
	</div>
</Section.Root>

<!-- Best Practices -->
<Section.Root>
	<Section.Header>
		<Section.Title>Best practices</Section.Title>
		<Section.Subtitle>Guidelines for working effectively with Bonds.</Section.Subtitle>
	</Section.Header>

	<div class="border-border divide-border divide-y rounded-lg border">
		<div class="flex items-start gap-3 px-5 py-4">
			<span class="text-primary mt-0.5 shrink-0 font-mono text-xs leading-5 font-bold">01</span>
			<div>
				<p class="text-foreground mb-0.5 text-sm font-semibold">Wrap props with defineState</p>
				<p class="text-muted-foreground text-sm">Pass a function to BondState — not a plain object. <code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">defineProperty</code> bridges <code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">$bindable</code> props into the Bond without losing reactivity.</p>
			</div>
		</div>
		<div class="flex items-start gap-3 px-5 py-4">
			<span class="text-primary mt-0.5 shrink-0 font-mono text-xs leading-5 font-bold">02</span>
			<div>
				<p class="text-foreground mb-0.5 text-sm font-semibold">Spread <code class="font-mono text-xs">.spread</code> on elements</p>
				<p class="text-muted-foreground text-sm">Always use <code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">{`{...bond.root().spread}`}</code> — it includes attrs, handlers, and the attachment that captures the element reference.</p>
			</div>
		</div>
		<div class="flex items-start gap-3 px-5 py-4">
			<span class="text-primary mt-0.5 shrink-0 font-mono text-xs leading-5 font-bold">03</span>
			<div>
				<p class="text-foreground mb-0.5 text-sm font-semibold">Use unique CONTEXT_KEY values</p>
				<p class="text-muted-foreground text-sm">Prefix with your package or app name: <code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">'@my-app/bond/accordion'</code>. When subclassing an existing Bond, keep the parent key to preserve context compatibility.</p>
			</div>
		</div>
		<div class="flex items-start gap-3 px-5 py-4">
			<span class="text-primary mt-0.5 shrink-0 font-mono text-xs leading-5 font-bold">04</span>
			<div>
				<p class="text-foreground mb-0.5 text-sm font-semibold">Export getBond()</p>
				<p class="text-muted-foreground text-sm">Export a <code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">getBond()</code> function from root components so parents can access the bond imperatively when needed.</p>
			</div>
		</div>
		<div class="flex items-start gap-3 px-5 py-4">
			<span class="text-primary mt-0.5 shrink-0 font-mono text-xs leading-5 font-bold">05</span>
			<div>
				<p class="text-foreground mb-0.5 text-sm font-semibold">Name your Bond in the constructor</p>
				<p class="text-muted-foreground text-sm">Pass a <code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">name</code> string to <code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">super(state, 'my-component')</code> — it becomes the <code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">data-bond</code> attribute used for debugging and CSS selectors.</p>
			</div>
		</div>
	</div>
</Section.Root>

<!-- Learn More -->
<Section.Root class="mb-0">
	<Section.Header>
		<Section.Title>Learn more</Section.Title>
		<Section.Subtitle>See Bonds in action or understand the architecture behind them.</Section.Subtitle>
	</Section.Header>

	<!-- eslint-disable svelte/no-navigation-without-resolve -->
	<div class="grid gap-3 sm:grid-cols-2">
		<a href="/docs/philosophy" class="group border-border hover:border-primary/40 hover:bg-muted/30 flex items-center gap-4 rounded-lg border p-4 transition-all">
			<div class="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/>
				</svg>
			</div>
			<div class="min-w-0 flex-1">
				<p class="text-foreground mb-0.5 text-sm font-semibold">Philosophy</p>
				<p class="text-muted-foreground text-xs">Understand the design principles behind the Bond pattern.</p>
			</div>
			<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground/50 group-hover:text-primary shrink-0 -translate-x-1 transition-all group-hover:translate-x-0" aria-hidden="true">
				<path d="m9 18 6-6-6-6"/>
			</svg>
		</a>
		<a href="/docs/components/accordion" class="group border-border hover:border-primary/40 hover:bg-muted/30 flex items-center gap-4 rounded-lg border p-4 transition-all">
			<div class="bg-primary/10 text-primary flex h-9 w-9 shrink-0 items-center justify-center rounded-lg">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
					<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/>
					<rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>
				</svg>
			</div>
			<div class="min-w-0 flex-1">
				<p class="text-foreground mb-0.5 text-sm font-semibold">Accordion component</p>
				<p class="text-muted-foreground text-xs">See a real Bond implementation with full source.</p>
			</div>
			<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-muted-foreground/50 group-hover:text-primary shrink-0 -translate-x-1 transition-all group-hover:translate-x-0" aria-hidden="true">
				<path d="m9 18 6-6-6-6"/>
			</svg>
		</a>
	</div>
	<!-- eslint-enable svelte/no-navigation-without-resolve -->
</Section.Root>
