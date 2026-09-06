<script lang="ts">
	import { Section, CodeBlock, DocCallout } from '$docs/components';
	import { Button } from '$lib/components/button';

	const END = '<' + '/script>';

	// src/lib/components/card/bond.svelte.ts
	const bondCode = `import { Kernel } from '@ixirjs/ui/shared';

export type CardBondProps = {
  id?: string;
  disabled?: boolean;
  clickable?: boolean;
};

export const CardContext = Kernel.context<CardBond>('bond/card');

export class CardBond {
  readonly name = 'card';
  readonly props: CardBondProps;
  /** The Title's element id, once one has rendered. */
  titleId = $state<string | undefined>();

  constructor(props: CardBondProps = {}) {
    this.props = props;
  }

  /** The family's identity seed — the root's $props.id(). */
  get id() { return this.props.id ?? 'card'; }
  get rootId() { return Kernel.id(this.id, 'card-root'); }
  get isDisabled() { return this.props.disabled ?? false; }

  static create(props: CardBondProps = {}) { return new CardBond(props); }
}`;

	// src/lib/components/card/card-root.svelte
	const rootCode = `<script lang="ts">
  import { untrack } from 'svelte';
  import { Kernel } from '@ixirjs/ui/shared';
  import { CardBond, CardContext } from './bond.svelte';

  const ID = $props.id();
  let { disabled = false, factory, children, ...restProps } = $props();

  // Live props: the Bond reads through these getters, so a prop change is
  // seen where it is read.
  const bondProps = {
    get id() { return ID; },
    get disabled() { return disabled; }
  };
  // \`factory\` is read once, at init, by design.
  const build = untrack(() => factory);
  const card = CardContext.share(build ? build(bondProps) : CardBond.create(bondProps));
  export const getBond = () => card;

  const el = Kernel.element(() => restProps, {
    preset: 'card',
    class: 'card bg-card border-border flex flex-col rounded-lg border',
    state: card,
    attrs: () => {
      const attrs: Record<string, unknown> = { id: card.rootId };
      if (card.titleId) attrs['aria-labelledby'] = card.titleId;
      if (disabled) attrs['aria-disabled'] = true;
      return attrs;
    }
  });
${END}

<div {...el.attrs}>{@render children?.({ card })}</div>`;

	// src/lib/components/card/card-title.svelte
	const partCode = `<script lang="ts">
  import { Kernel } from '@ixirjs/ui/shared';
  import { CardContext } from './bond.svelte';
  import type { CardTitleProps } from './types';

  const props: CardTitleProps = $props();
  // Optional context: a bare <Card.Title> renders without a root. With one, the
  // part hands the root its id at init — the relationship without a registry.
  const card = CardContext.get();
  const id = card ? Kernel.id(card.id, 'card-title') : undefined;
  if (card) card.titleId = id;

  const el = Kernel.element(() => props, {
    preset: 'card.title',
    class: 'card-title text-lg leading-none font-semibold',
    state: card,
    attrs: () => (id ? { id } : {})
  });
${END}

<h3 {...el.attrs}>{@render props.children?.()}</h3>`;

	// src/lib/components/accordion/item/accordion-item-body.svelte
	const leafCode = `<script lang="ts">
  import { Kernel } from '@ixirjs/ui/shared';
  import { AccordionItemContext } from './bond.svelte';
  import { enterAccordionItemBody, exitAccordionItemBody } from './motion.svelte';

  let { children, ...restProps } = $props();
  const bond = AccordionItemContext.getOrThrow(
    '<AccordionItem.Body /> must be used within an <AccordionItem.Root />'
  );

  const motion = {
    enter: enterAccordionItemBody({ settled: () => bond.parent.settled }),
    exit: exitAccordionItemBody()
  };
  const el = Kernel.element(() => restProps, {
    preset: 'accordion.item.body',
    class: 'box-content h-0 opacity-0',
    state: bond,
    motion: () => motion,
    attrs: () => ({ id: bond.bodyId, role: 'region', 'aria-labelledby': bond.headerId })
  });
  // Bound ONCE in the script: an identifier callee compiles to a direct call —
  // no snippet block, no hydration anchor.
  const leaf = Kernel.render(el);
${END}

{@render (bond.isOpen ? body : undefined)?.()}

{#snippet body()}
  {@render leaf(el, children, { accordionItem: bond })}
{/snippet}`;

	// src/lib/components/accordion/bond.svelte.ts + item/accordion-item-root.svelte
	const collectionCode = `// On the parent: a plain Map, in mount order.
export class AccordionBond {
  readonly items = new Map<string, AccordionItemHandle>();
  /** The fallback tab stop — written only when it changes. */
  #first = $state<string | null>(null);

  attachItem(id: string, item: AccordionItemHandle): () => void {
    this.items.set(id, item);
    if (this.#first === null && !item.isDisabled) this.#first = id;
    return () => {
      this.items.delete(id);
      if (this.#first === id) this.#first = this.#firstEnabled()?.id ?? null;
    };
  }
}

// In the child's root, at init — document order — released on teardown.
const detach = bond.parent.attachItem(bond.id, bond);
$effect(() => detach);`;

	// src/lib/components/dialog/dialog-close.svelte
	const composeCode = `function close(event: Event) {
  bond.stageOpenChange({ event, reason: 'close-button' });
  bond.close();
}
// Gated on \`defaultPrevented\` here, not only through \`Kernel.compose\`: a consumer
// can prevent the default from a listener of their own, with no \`onclick\` prop for
// the seam to compose.
function click(event: MouseEvent) {
  if (event.defaultPrevented) return;
  close(event);
}

attrs: () => ({
  id,
  // Theirs runs first; preventing default keeps the dialog open.
  onclick: Kernel.compose(onclick, click)
})`;

	// src/lib/components/collapsible/bond.svelte.ts and select/bond.svelte.ts
	const modelCode = `import { createDisclosure, createSelection } from '@ixirjs/ui/shared';

// Collapsible — the disclosure model is a field on the plain class.
this.disclosure = createDisclosure({
  get: () => this.props.open,
  set: (open) => this.#set(open)
});

// Select — the selection model owns the set algebra; storage stays yours.
#selection = createSelection<string>({
  get: () => this.props.values ?? [],
  set: (v) => (this.props.values = v),
  mode: () => (this.props.multiple ? 'multiple' : 'single'),
  indexed: true
});

// What a capability used to project onto an element is written literally,
// in the part that renders it:
attrs: () => ({
  'aria-expanded': bond.isOpen,
  'aria-controls': bond.bodyId,
  'data-state': bond.isOpen ? 'open' : 'closed'
})`;
</script>

<svelte:head>
	<title>Bonds — IXIR UI</title>
	<meta
		name="description"
		content="A Bond is a plain state class shared through Kernel.context; every part renders through Kernel.element."
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
		A Bond is a plain Svelte 5 state class that owns a family's shared state. The root publishes it
		under a context key; every part reads it and renders through one seam,
		<code class="font-mono text-sm">Kernel.element</code>.
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
	<Section.Header><Section.Title>One runtime, family interfaces</Section.Title></Section.Header>
	<p class="text-muted-foreground text-sm leading-relaxed">
		Popover, DropdownMenu, Select, Combobox, Tooltip, ContextMenu, DatePicker and PopoverDialog
		share <code>PopupBond</code>. Their names, such as <code>SelectBond</code>, are interfaces,
		imported with <code>import type</code>. Library roots create their state and own teardown;
		children snippets and <code>getBond()</code> expose its commands. No popup <code>factory</code>
		prop or family constructor remains. The Card example below still illustrates independent-family authoring;
		see <a href="/docs/migration">popup migration</a> for the shared runtime.
	</p>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>Core model</Section.Title>
		<Section.Subtitle>Four names describe the whole authoring model.</Section.Subtitle>
	</Section.Header>

	<div class="grid gap-3 sm:grid-cols-2">
		<div class="border-border rounded-lg border p-4">
			<p class="text-foreground mb-1 text-sm font-semibold">Bond</p>
			<p class="text-muted-foreground text-sm">
				A plain state class — props, derived getters, mutation methods, element ids. No base class,
				no registry, no runtime. Published with
				<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">Kernel.context</code>.
			</p>
		</div>
		<div class="border-border rounded-lg border p-4">
			<p class="text-foreground mb-1 text-sm font-semibold">Part</p>
			<p class="text-muted-foreground text-sm">
				The Svelte component that renders one slot — Trigger, Content, Item, Header. It reads the
				Bond from context and calls
				<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">Kernel.element</code>.
			</p>
		</div>
		<div class="border-border rounded-lg border p-4">
			<p class="text-foreground mb-1 text-sm font-semibold">Kernel</p>
			<p class="text-muted-foreground text-sm">
				The one element seam. It resolves presentation (preset → variants → your class), merges
				attributes and handlers, and owns motion and renderer escalation.
			</p>
		</div>
		<div class="border-border rounded-lg border p-4">
			<p class="text-foreground mb-1 text-sm font-semibold">Behaviour model</p>
			<p class="text-muted-foreground text-sm">
				An ordinary function from
				<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">@ixirjs/ui/shared</code>
				— disclosure, selection, roving focus, typeahead — that owns a piece of logic and nothing about
				the DOM.
			</p>
		</div>
	</div>

	<DocCallout variant="warning" title="Renamed in 2026-08">
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">defineBond</code>,
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">useRoot</code>,
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">definePart</code>,
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">createAtomInstance</code>
		and the <code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">Bond</code>/<code
			class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">Atom</code
		>
		base classes were removed, not renamed. See the
		<a class="underline" href="/docs/migration">migration guide</a>.
	</DocCallout>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>Write the Bond</Section.Title>
		<Section.Subtitle>
			A class with a <code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs"
				>props</code
			>
			object of live getters, a
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">static create</code>, and
			one context key.
		</Section.Subtitle>
	</Section.Header>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={bondCode} />
	</div>

	<DocCallout variant="info" title="Ids come from the seed">
		The root seeds the Bond with <code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs"
			>$props.id()</code
		>
		and every element id derives from it through
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">Kernel.id(seed, part)</code>.
		That is SSR-deterministic and survives hydration. A part a consumer may render twice claims its
		id with
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">Kernel.claimId</code>
		instead, which numbers the later ones.
	</DocCallout>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>Use it from parts</Section.Title>
		<Section.Subtitle>
			The root builds and shares the Bond. Every part reads it and renders one element.
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
			<p class="text-foreground mb-2 text-sm font-semibold">Part component</p>
			<div class="overflow-hidden rounded-lg">
				<CodeBlock lang="svelte" code={partCode} />
			</div>
		</div>
	</div>

	<DocCallout variant="info" title="Required or optional context">
		A part that cannot work alone calls
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs"
			>Context.getOrThrow(message)</code
		>
		and gets a clear development error when rendered outside its root. A part that also stands alone calls
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">Context.get()</code>
		and treats <code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">undefined</code>
		as "no root" — as
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">Card.Title</code> does above.
	</DocCallout>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>Two lanes, one seam</Section.Title>
		<Section.Subtitle>
			Spread <code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">el.attrs</code> on a
			literal tag, unless the part has a reason to dispatch.
		</Section.Subtitle>
	</Section.Header>

	<p class="text-muted-foreground mb-4 text-sm leading-relaxed">
		Most parts are a literal tag: <code class="font-mono text-xs">{'<div {...el.attrs}>'}</code>. A
		part with real transitions, an
		<code class="font-mono text-xs">animate</code> driver, a
		<code class="font-mono text-xs">base</code> renderer, or a polymorphic
		<code class="font-mono text-xs">as</code> declares that in the spec, binds its leaf once, and renders
		it by name.
	</p>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="svelte" code={leafCode} />
	</div>

	<DocCallout variant="warning" title="Bind the leaf once">
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs"
			>const leaf = Kernel.render(el)</code
		>
		in the script, then
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs"
			>{'{@render leaf(el, children)}'}</code
		>. An identifier callee compiles to a direct call; the inline
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs"
			>{'{@render Kernel.render(el)(…)}'}</code
		> form is a snippet block with a hydration anchor.
	</DocCallout>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>Relationships and collections</Section.Title>
		<Section.Subtitle>
			Cross-part ARIA is a child writing its id into the parent. A collection is a
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">Map</code>.
		</Section.Subtitle>
	</Section.Header>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={collectionCode} />
	</div>

	<DocCallout variant="warning" title="Keep reactive facts narrow">
		Derive what the children share from membership through one equality-gated
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">$state</code> — the accordion's
		tab-stop fallback above — never a reactive array every child reads. A per-child read of something
		the parent owns turns mount from linear into quadratic.
	</DocCallout>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>Behaviour models</Section.Title>
		<Section.Subtitle>
			Logic is reused as functions; the DOM projection is written where the element is.
		</Section.Subtitle>
	</Section.Header>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={modelCode} />
	</div>
</Section.Root>

<Section.Root class="mb-0">
	<Section.Header>
		<Section.Title>Handlers</Section.Title>
		<Section.Subtitle>
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">Kernel.compose</code> runs
			the consumer's handler first and skips the part's when the default was prevented.
		</Section.Subtitle>
	</Section.Header>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={composeCode} />
	</div>
</Section.Root>
