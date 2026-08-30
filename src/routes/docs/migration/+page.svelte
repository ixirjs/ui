<script lang="ts">
	import { Section, CodeBlock, DocCallout } from '$docs/components';
	import { Button } from '$lib/components/button';

	const END = '<' + '/script>';

	const removedShared = [
		['defineBond', 'a plain class + Kernel.context<T>(key)'],
		['useRoot', 'build the class, share it, call Kernel.element'],
		['definePart / defineLeaf', 'Kernel.element(() => props, spec)'],
		['createAtomInstance', 'nothing — the part renders its own element'],
		['controlledProp', 'a $bindable prop + bond.bindCommit(...)'],
		['BondHandle / AtomHandle', 'KernelElement'],
		['usePart', 'Kernel.element']
	];

	const removedExperimental = [
		['Bond, Atom, defineAtom', 'a plain state class; parts own their elements'],
		['bindBond, BondBinding', 'Context.share(Bond.create(liveProps))'],
		['Collection', 'a Map on the Bond, written at the child’s init'],
		['prop-cell / definition / spec types', 'an object of getters over the root’s props'],
		['the six popover *Atom classes', 'the popover parts write their own attrs'],
		['capability definition helpers, role & slot keys', 'attrs written literally in each part']
	];

	// Before / after, verified against src/lib/components/card/bond.svelte.ts.
	const bondCode = `// Before — a definition, a base class, an atom map.
class TilesBondBase extends Bond<TilesProps> {
  select(value: string) { this.props.value = value; }
}
export const TilesBond = defineBond({
  name: 'tiles',
  base: TilesBondBase,
  atoms: { root: defineAtom('root'), item: { atom: defineAtom('item'), role: roles.item } }
});

// After — a plain class and one context key.
import { Kernel } from '@ixirjs/ui/shared';

export const TilesContext = Kernel.context<TilesBond>('bond/tiles');

export class TilesBond {
  readonly name = 'tiles';
  readonly props: TilesProps;
  constructor(props: TilesProps) { this.props = props; }
  static create(props: TilesProps) { return new TilesBond(props); }

  get id() { return this.props.id ?? 'tiles'; }
  get rootId() { return Kernel.id(this.id, 'tiles-root'); }
  select(value: string) { this.props.value = value; }
}`;

	// Verified against src/lib/components/card/card-root.svelte and accordion-root.svelte.
	const rootCode = `// Before
const root = useRoot(TilesBond, { value: valueProp }, {
  id: () => ID,
  preset: () => preset,
  class: 'flex flex-wrap gap-2',
  props: () => ({ ...restProps, class: klass })
});
export const getBond = root.getBond;

// After — the root does the four things useRoot did, in the open.
const ID = $props.id();
const bondProps = {                 // live getters, never a snapshot
  get id() { return ID; },
  get value() { return value; },
  get disabled() { return disabled; }
};
const build = untrack(() => factory);
const bond = TilesContext.share(build ? build(bondProps) : TilesBond.create(bondProps));
bond.bindCommit((next, context) => {   // what controlledProp used to own
  value = next;
  onvaluechange?.(next, context);
});
export const getBond = () => bond;

const el = Kernel.element(() => restProps, {
  preset: 'tiles',
  class: 'flex flex-wrap gap-2',
  state: bond,
  attrs: () => ({ id: bond.rootId })
});`;

	// Verified against src/lib/components/card/card-title.svelte.
	const partCode = `<!-- Before -->
<script lang="ts">
  const props: TilesItemProps = $props();
  const el = definePart(TilesBond, 'item', () => props, {
    as: 'div',
    class: 'tiles-item',
    context: 'optional'
  });
${END}
{@render Kernel.render(el)(el, props.children)}

<!-- After -->
<script lang="ts">
  import { Kernel } from '@ixirjs/ui/shared';
  import { TilesContext } from './bond.svelte';

  const props: TilesItemProps = $props();
  const bond = TilesContext.get();          // getOrThrow(message) when required
  const el = Kernel.element(() => props, {
    preset: 'tiles.item',
    class: 'tiles-item',
    state: bond
  });
${END}
<div {...el.attrs}>{@render props.children?.()}</div>`;

	// Verified against src/lib/components/accordion/item/accordion-item-body.svelte.
	const leafCode = `// A part with a REASON to dispatch — real transitions, an \`animate\` driver, a
// \`base\` renderer, or a polymorphic \`as\` — declares it and binds ONE leaf.
const el = Kernel.element(() => restProps, {
  preset: 'accordion.item.body',
  class: 'box-content h-0 opacity-0',
  state: bond,
  motion: () => motion,
  attrs: () => ({ id: bond.bodyId, role: 'region', 'aria-labelledby': bond.headerId })
});
const leaf = Kernel.render(el);        // bound once, in the script

// then, in the template:  {@render leaf(el, children, { accordionItem: bond })}`;

	// Verified against src/lib/components/card/bond.svelte.ts + card-title.svelte and
	// src/lib/components/accordion/bond.svelte.ts + item/accordion-item-root.svelte.
	const registryCode = `// Before — a node registry answered "where is the trigger?".
const trigger = bond.nodeByPart('trigger');
trigger?.element?.focus();
const items = bond.nodesByPart('item');

// After — ids are derived, so the DOM is the registry.
get rootId() { return Kernel.id(this.id, 'card-root'); }
get element() {
  return document.getElementById(this.rootId) ?? undefined;
}

// Cross-part ARIA: the child writes its id into the parent at init.
const id = card ? Kernel.id(card.id, 'card-title') : undefined;
if (card) card.titleId = id;            // the root reads it in its own attrs

// A collection: a mount-ordered Map, released on teardown.
const detach = bond.parent.attachItem(bond.id, bond);
$effect(() => detach);`;

	// Verified against src/lib/components/collapsible/bond.svelte.ts and
	// src/lib/components/accordion/item/accordion-item-header.svelte.
	const capabilityCode = `// Before — a capability projected the ARIA onto whichever atom claimed the role.
this.capability(disclosureCapability({
  open: () => this.props.open,
  setOpen: (next) => (this.props.open = next)
}));

// After — the model is a plain function and a field on the Bond …
import { createDisclosure } from '@ixirjs/ui/shared';

this.disclosure = createDisclosure({
  get: () => this.props.open,
  set: (open) => this.#set(open)
});

// … and the projection is written in the part that renders the element.
attrs: () => ({
  id: bond.headerId,
  type: 'button',
  'aria-expanded': bond.isOpen,
  'aria-controls': bond.bodyId,
  'data-state': bond.isOpen ? 'open' : 'closed',
  onclick: Kernel.compose(onclick, toggle)
})`;
</script>

<svelte:head>
	<title>Migration Guide — IXIR UI</title>
	<meta
		name="description"
		content="Move a family authored against defineBond, useRoot, definePart and the Bond/Atom runtime onto the redesigned Kernel."
	/>
</svelte:head>

<div class="animate-page-in mb-9">
	<p class="text-muted-foreground m-0 mb-2.5 font-mono text-[11px] tracking-[0.05em] uppercase">
		Migration Guide
	</p>
	<h1 class="font-display text-foreground m-0 mb-3 text-[32px] font-bold tracking-[-0.025em]">
		Move to the redesigned Kernel.
	</h1>
	<p class="text-muted-foreground m-0 mb-6 max-w-[640px] text-[17px] leading-[1.65]">
		On 2026-08-27 the Bond/Atom authoring runtime was removed. A family is now a plain state class
		published under <code class="font-mono text-sm">Kernel.context</code>, and every part renders
		through <code class="font-mono text-sm">Kernel.element</code>. If you only
		<em>use</em> components, nothing here affects you — component names, props, snippet arguments, element
		ids, ARIA and preset keys are unchanged.
	</p>
	<div class="flex flex-wrap gap-3">
		<Button href="/docs/bonds" as="a" variant="primary">Understand Bonds</Button>
		<Button href="/docs/extending" as="a" variant="outline">Author components</Button>
	</div>
</div>

<Section.Root>
	<Section.Header>
		<Section.Title>Who this affects</Section.Title>
		<Section.Subtitle>
			Only code that authored its own family against the old seams.
		</Section.Subtitle>
	</Section.Header>

	<div class="grid gap-3 sm:grid-cols-2">
		<div class="border-border rounded-lg border p-4">
			<p class="text-foreground mb-1 text-sm font-semibold">Nothing to do</p>
			<p class="text-muted-foreground text-sm">
				You render library components, style them with presets, augment prop interfaces, or pass
				<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">base</code>/<code
					class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">as</code
				>. The public component contract did not change.
			</p>
		</div>
		<div class="border-border rounded-lg border p-4">
			<p class="text-foreground mb-1 text-sm font-semibold">Rewrite required</p>
			<p class="text-muted-foreground text-sm">
				You imported
				<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">defineBond</code>,
				<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">useRoot</code>,
				<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">definePart</code>,
				<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">createAtomInstance</code
				>,
				<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">Bond</code>,
				<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">Atom</code>, or wrote a
				capability. Those imports no longer resolve.
			</p>
		</div>
	</div>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>What was removed</Section.Title>
		<Section.Subtitle>
			Every deleted export, and the shape that replaces it. Removed, not renamed — there is no
			compatibility shim.
		</Section.Subtitle>
	</Section.Header>

	<div class="space-y-6">
		<div>
			<p class="text-foreground mb-2 text-sm font-semibold">
				Gone from <code class="bg-muted rounded px-1 py-0.5 text-xs">@ixirjs/ui/shared</code>
			</p>
			<div class="border-border overflow-hidden rounded-lg border">
				{#each removedShared as [name, replacement] (name)}
					<div class="border-border grid gap-1 border-b p-3 last:border-b-0 sm:grid-cols-2">
						<code class="text-foreground font-mono text-xs line-through">{name}</code>
						<span class="text-muted-foreground text-xs">{replacement}</span>
					</div>
				{/each}
			</div>
		</div>

		<div>
			<p class="text-foreground mb-2 text-sm font-semibold">
				Gone from <code class="bg-muted rounded px-1 py-0.5 text-xs">@ixirjs/ui/experimental</code>
			</p>
			<div class="border-border overflow-hidden rounded-lg border">
				{#each removedExperimental as [name, replacement] (name)}
					<div class="border-border grid gap-1 border-b p-3 last:border-b-0 sm:grid-cols-2">
						<code class="text-foreground font-mono text-xs line-through">{name}</code>
						<span class="text-muted-foreground text-xs">{replacement}</span>
					</div>
				{/each}
			</div>
		</div>
	</div>

	<DocCallout variant="info" title="What arrived instead">
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">@ixirjs/ui/shared</code> now
		exports
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">Kernel</code> and the
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">ElementSpec</code>/<code
			class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">KernelElement</code
		>
		types, alongside the behaviour models (<code
			class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">createDisclosure</code
		>,
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">createSelection</code>,
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">createRovingFocus</code>,
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">createTypeahead</code>,
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">createInput</code>, …), which
		survived as ordinary functions.
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">@ixirjs/ui/experimental</code
		>
		still exports every concrete Bond class — they are the plain classes now.
	</DocCallout>

	<DocCallout variant="warning" title="Symbol lifecycle keys are gone too">
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">createLifecycleKey</code> and
		the symbol-keyed
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">mount</code>/<code
			class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">destroy</code
		>
		props never survived server
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">rest_props</code>. Use
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">oninit</code>, which fires on
		both platforms and returns a client teardown.
	</DocCallout>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>1 · The definition becomes a class</Section.Title>
		<Section.Subtitle>
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">defineBond</code> declared
			a name, a base and an atom map. Keep the class, drop the rest, and publish it under a context key.
		</Section.Subtitle>
	</Section.Header>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={bondCode} />
	</div>

	<DocCallout variant="info" title="Keep the same context key">
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs"
			>Kernel.context('bond/tiles')</code
		>
		mints the canonical key
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs"
			>@ixirjs/context/bond/tiles</code
		>
		— the same string
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">defineBond</code> generated, so
		existing parts and tests keep resolving.
	</DocCallout>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>2 · The root does its own wiring</Section.Title>
		<Section.Subtitle>
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">useRoot</code> owned four things:
			props assembly, context publication, controlled-prop adoption and the root element. Each is now
			a line.
		</Section.Subtitle>
	</Section.Header>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={rootCode} />
	</div>

	<DocCallout variant="warning" title="Live getters, never a snapshot">
		The Bond must read props <em>where</em> it reads them. Hand it an object of getters over the
		root's own props — spreading them into a plain object once at init freezes the family at its
		mount-time values.
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">factory</code>, by contrast,
		is read once, under
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">untrack</code>, by design.
	</DocCallout>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>3 · Parts render their own element</Section.Title>
		<Section.Subtitle>
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">definePart</code>,
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">defineLeaf</code> and
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">createAtomInstance</code> collapse
			into one call and a literal tag.
		</Section.Subtitle>
	</Section.Header>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="svelte" code={partCode} />
	</div>

	<p class="text-muted-foreground mt-4 mb-4 text-sm leading-relaxed">
		The dispatch is no longer the default. A part keeps it only when it has a reason — real
		transitions, an <code class="font-mono text-xs">animate</code> driver, a
		<code class="font-mono text-xs">base</code> renderer, or a polymorphic
		<code class="font-mono text-xs">as</code> — and then binds its leaf once.
	</p>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={leafCode} />
	</div>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>4 · The registry becomes ids and Maps</Section.Title>
		<Section.Subtitle>
			There is no node registry, so
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">nodeByPart</code>,
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">nodesByPart</code> and
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">nodeByRole</code> are gone.
		</Section.Subtitle>
	</Section.Header>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={registryCode} />
	</div>

	<DocCallout variant="info" title="A repeated part claims its id">
		Ids derive from the family's seed, so two instances of one part would otherwise render the same
		id.
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs"
			>Kernel.claimId(bond, seed, part)</code
		> gives the first instance the canonical id and later ones the lowest free suffix, released on teardown
		— deterministic across SSR and hydration.
	</DocCallout>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>5 · Capabilities become models plus literal attrs</Section.Title>
		<Section.Subtitle>
			The registration protocol — <code
				class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">this.capability(...)</code
			>, slots, roles, projections — was deleted. The logic survived; the projection moved to the
			part.
		</Section.Subtitle>
	</Section.Header>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={capabilityCode} />
	</div>

	<DocCallout variant="warning" title="Gate your own handler on defaultPrevented">
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">Kernel.compose</code> skips
		the part's handler only when the consumer passed one as a
		<em>prop</em>. A consumer who calls
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">preventDefault()</code> from
		their own listener is invisible to the seam, so write
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs"
			>if (event.defaultPrevented) return;</code
		> at the top of the part's handler as well.
	</DocCallout>
</Section.Root>

<Section.Root class="mb-0">
	<div class="border-border rounded-lg border p-5">
		<p class="text-foreground mb-2 text-sm font-semibold">Migration checklist</p>
		<ul class="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
			<li>Turn each definition into a plain state class with a static create and live props.</li>
			<li>Publish it with Kernel.context, keeping the same canonical key.</li>
			<li>
				Derive every element id from the root seed with Kernel.id, or Kernel.claimId if the part
				repeats.
			</li>
			<li>Replace useRoot with: build props, share the Bond, bindCommit, Kernel.element.</li>
			<li>Replace controlledProp with a $bindable prop written from bindCommit.</li>
			<li>Replace definePart, defineLeaf and createAtomInstance with Kernel.element.</li>
			<li>
				Spread el.attrs on a literal tag; keep Kernel.render only for motion, base or a polymorphic
				as.
			</li>
			<li>Bind the leaf once in the script — never render an inline Kernel.render(el)(…) call.</li>
			<li>Replace registry lookups with derived ids, and collections with a mount-ordered Map.</li>
			<li>Write cross-part ARIA as a child writing its id into a $state field on the parent.</li>
			<li>Call the behaviour models directly and write their ARIA in each part's attrs.</li>
			<li>Replace symbol lifecycle keys with oninit.</li>
			<li>
				Compose consumer handlers with Kernel.compose, and still return early on defaultPrevented.
			</li>
		</ul>
	</div>
</Section.Root>
