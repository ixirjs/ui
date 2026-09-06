<script lang="ts">
	import { Section, CodeBlock, DocCallout } from '$docs/components';

	const END = '<' + '/script>';

	// Canonical popup authoring: no constructor injection.
	const extendCode = `import { PopupBond, isSelectBond } from '@ixirjs/ui/experimental';
import type { SelectBond } from '@ixirjs/ui/components/select';

// In a component root: live props, canonical state, root-owned disposal.
const bond: SelectBond = PopupBond.mount('select', liveProps);
bond.select(['alpha']);

// Family names are interfaces, not subclass constructors.
if (isSelectBond(contextValue)) contextValue.select(['beta']);`;

	// ── Reuse the parent family's parts ────────────────────────────────────────
	// Shape verified against src/lib/components/popover-dialog/popover-dialog-root.svelte.
	const reuseCode = `// One instance, shared under BOTH keys, so each family's own parts resolve it.
const bond = PopoverDialogContext.share(PopupBond.mount('popover-dialog', bondProps));
DialogContext.share(bond);
PopoverContext.share(bond);
OverlayContext.share(bond);`;

	const reuseMarkup = `<!-- The parts you didn't write still work: they read the context key their
     own family publishes, and your root published your bond under it. -->
<PopoverDialog.Root bind:open>
  <Popover.Trigger>Open</Popover.Trigger>
  <PopoverDialog.Dialog>
    <Dialog.Header>Title</Dialog.Header>
    <Dialog.Body>…</Dialog.Body>
  </PopoverDialog.Dialog>
</PopoverDialog.Root>`;

	// ── Author a brand-new family ──────────────────────────────────────────────
	// Shape verified against src/lib/components/card/bond.svelte.ts + card-root.svelte
	// + card-title.svelte and src/lib/components/accordion/**.
	const bondCode = `import { Kernel } from '@ixirjs/ui/shared';

export type TilesBondProps = {
  id?: string;
  value?: string;
  disabled?: boolean;
};

export const TilesContext = Kernel.context<TilesBond>('bond/tiles');

export class TilesBond {
  readonly name = 'tiles';
  readonly props: TilesBondProps;
  #commit: ((next: string, context: { bond: TilesBond }) => void) | undefined;

  constructor(props: TilesBondProps) { this.props = props; }
  static create(props: TilesBondProps) { return new TilesBond(props); }

  /** The root wires how a new value is written and reported. */
  bindCommit(commit: (next: string, context: { bond: TilesBond }) => void) {
    this.#commit = commit;
  }

  get id() { return this.props.id ?? 'tiles'; }
  get rootId() { return Kernel.id(this.id, 'tiles-root'); }
  get value() { return this.props.value; }
  get isDisabled() { return this.props.disabled ?? false; }

  isSelected(value: string) { return this.props.value === value; }

  select(value: string) {
    if (this.isDisabled || this.props.value === value) return;
    this.#commit?.(value, { bond: this });
  }
}`;

	const rootCode = `<script lang="ts">
  import { untrack } from 'svelte';
  import { Kernel } from '@ixirjs/ui/shared';
  import { TilesBond, TilesContext } from './bond.svelte';

  const ID = $props.id();
  let {
    value = $bindable(undefined),
    disabled = false,
    onvaluechange,
    factory,
    children,
    ...restProps
  } = $props();

  const bondProps = {
    get id() { return ID; },
    get value() { return value; },
    get disabled() { return disabled; }
  };
  const build = untrack(() => factory);
  const bond = TilesContext.share(build ? build(bondProps) : TilesBond.create(bondProps));
  // The Bond decides, the root writes, the callback fires after the write.
  bond.bindCommit((next, context) => {
    value = next;
    onvaluechange?.(next, context);
  });
  export const getBond = () => bond;

  const el = Kernel.element(() => restProps, {
    preset: 'tiles',
    class: 'flex flex-wrap gap-2',
    state: bond,
    attrs: () => ({ id: bond.rootId, role: 'listbox' })
  });
${END}

<div {...el.attrs}>{@render children?.({ tiles: bond })}</div>`;

	const partCode = `<script lang="ts">
  import { Kernel } from '@ixirjs/ui/shared';
  import { TilesContext } from './bond.svelte';

  let { value, children, onclick, ...restProps } = $props();
  const bond = TilesContext.getOrThrow(
    '<Tiles.Item /> must be used within a <Tiles.Root />'
  );

  function click(event: MouseEvent) {
    if (event.defaultPrevented) return;
    bond.select(value);
  }

  // Whatever a capability used to project onto this element is written here.
  const el = Kernel.element(() => restProps, {
    preset: 'tiles.item',
    class: 'cursor-pointer rounded-md px-3 py-2',
    state: bond,
    attrs: () => ({
      id: Kernel.id(bond.id, 'tiles-item-' + value),
      role: 'option',
      'aria-selected': bond.isSelected(value),
      'data-state': bond.isSelected(value) ? 'selected' : 'idle',
      tabindex: bond.isSelected(value) ? 0 : -1,
      onclick: Kernel.compose(onclick, click)
    })
  });
${END}

<div {...el.attrs}>{@render children?.()}</div>`;

	// ── Reuse the behaviour models ─────────────────────────────────────────────
	// Verified against src/lib/components/select/bond.svelte.ts and
	// src/lib/components/collapsible/bond.svelte.ts.
	const modelsCode = `import { createRovingFocus, createSelection } from '@ixirjs/ui/shared';

// "What's committed" — the model owns the set algebra; storage stays yours.
#selection = createSelection<string>({
  get: () => this.props.values ?? [],
  set: (v) => (this.props.values = v),
  mode: () => (this.props.multiple ? 'multiple' : 'single'),
  indexed: true
});

// "Which item is highlighted" — the item list and id→item resolution are injected.
#roving = createRovingFocus({
  ids: () => [...this.items.keys()],
  item: (id) => this.items.get(id)
});`;

	// ── Type your own props (variant, size, …) ─────────────────────────────────
	const augmentInterfaceCode = `// A preset is swappable, so the library cannot know which values yours defines.
// You declare them — and get autocomplete plus a compile error on a bad value.
declare module '@ixirjs/ui/components/button' {
  interface ButtonProps {
    variant?: 'primary' | 'destructive' | 'app-brand';
    size?: 'sm' | 'md' | 'lg';
  }
}

<Button variant="app-brand" />   // ✅
<Button variant="app-brnad" />   // ❌ Type '"app-brnad"' is not assignable`;

	const augmentAliasCode = `// Some families declare their props as a type alias, which TypeScript cannot merge.
// Those expose an \`*ExtendProps\` interface instead — augment that.
declare module '@ixirjs/ui/components/tree' {
  interface TreeRootExtendProps {
    variant?: 'compact' | 'comfortable';
  }
}`;
</script>

<svelte:head>
	<title>Extending & Authoring — IXIR UI</title>
	<meta
		name="description"
		content="Extend a component family, reuse its parts, and author a new one with a plain state class and Kernel.element."
	/>
</svelte:head>

<div class="animate-page-in mb-9">
	<p class="text-muted-foreground m-0 mb-2.5 font-mono text-[11px] tracking-[0.05em] uppercase">
		Guide · how-to
	</p>
	<h1 class="font-display text-foreground m-0 mb-3 text-[32px] font-bold tracking-[-0.025em]">
		Extending &amp; authoring.
	</h1>
	<p class="text-muted-foreground m-0 mb-6 max-w-[640px] text-[17px] leading-[1.65]">
		A component family combines shared state with one Svelte component per part. Popup families
		share <code>PopupBond</code>; authoring a new family uses a state class and
		<code>Kernel.element</code> calls.
	</p>
</div>

<Section.Root>
	<Section.Header>
		<Section.Title>Three moves</Section.Title>
		<Section.Subtitle>Reach for the smallest one that fits.</Section.Subtitle>
	</Section.Header>

	<ul class="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
		<li>
			<strong>Compose</strong> — rearrange the parts, restyle with
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">preset</code>/<code
				class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">base</code
			>. No new class needed.
		</li>
		<li>
			<strong>Compose behavior</strong> — combine capabilities with a canonical popup profile; popup roots
			do not accept custom factories.
		</li>
		<li>
			<strong>Author</strong> — a new plain state class, one context key, one part component per slot.
		</li>
	</ul>

	<DocCallout variant="info" title="One seam">
		Every part in the library renders through
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">Kernel.element</code>,
		exported from
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">@ixirjs/ui/shared</code>.
		Concrete Bond classes, used as extension bases, come from
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">@ixirjs/ui/experimental</code
		>
		and may change before 1.0.
	</DocCallout>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>Compose popup behavior</Section.Title>
		<Section.Subtitle>
			Select a profile and supply live props. Family names describe interfaces; one runtime owns the
			behavior.
		</Section.Subtitle>
	</Section.Header>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={extendCode} />
	</div>

	<DocCallout variant="info" title="Canonical popup families">
		Popover, DropdownMenu, Select, Combobox, Tooltip, ContextMenu, DatePicker and PopoverDialog use
		one <code>PopupBond</code> implementation and one collection-item runtime. Their legacy constructors
		and custom factory props are removed; use props, presets and capabilities.
	</DocCallout>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>Reuse the parts you didn't write</Section.Title>
		<Section.Subtitle>
			A part resolves its family's context key. Share one instance under several keys and both
			families' parts bind to it.
		</Section.Subtitle>
	</Section.Header>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={reuseCode} />
	</div>

	<div>
		<p class="text-foreground mt-6 mb-3 text-sm">
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">PopoverDialog</code> is exactly
			this: one class extending the dialog's Bond, shared under the popover's, the dialog's and the overlay's
			keys. Its part tree is mostly re-exports.
		</p>
		<div class="overflow-hidden rounded-lg">
			<CodeBlock lang="svelte" code={reuseMarkup} />
		</div>
	</div>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>Author a family from scratch</Section.Title>
		<Section.Subtitle>
			Three files: the Bond, the root that builds and shares it, and one component per part.
		</Section.Subtitle>
	</Section.Header>

	<div class="space-y-6">
		<div>
			<p class="text-foreground mb-2 text-sm font-semibold">bond.svelte.ts</p>
			<div class="overflow-hidden rounded-lg">
				<CodeBlock lang="typescript" code={bondCode} />
			</div>
		</div>
		<div>
			<p class="text-foreground mb-2 text-sm font-semibold">tiles-root.svelte</p>
			<div class="overflow-hidden rounded-lg">
				<CodeBlock lang="svelte" code={rootCode} />
			</div>
		</div>
		<div>
			<p class="text-foreground mb-2 text-sm font-semibold">tiles-item.svelte</p>
			<div class="overflow-hidden rounded-lg">
				<CodeBlock lang="svelte" code={partCode} />
			</div>
		</div>
	</div>

	<DocCallout variant="warning" title="ARIA is written where the element is">
		There is no role protocol projecting attributes onto your part. Whatever the element needs —
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">role</code>,
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">aria-selected</code>,
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">data-state</code>, the tab
		stop — goes in that part's
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">attrs</code> thunk, which is read
		inside the Kernel's tracked boundary so state reads stay reactive.
	</DocCallout>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>Reuse the behaviour models</Section.Title>
		<Section.Subtitle>
			Selection, disclosure, roving focus, typeahead, validation, pagination — ordinary functions
			from
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">@ixirjs/ui/shared</code>.
		</Section.Subtitle>
	</Section.Header>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={modelsCode} />
	</div>

	<DocCallout variant="info" title="Models own logic, not the DOM">
		A model is a field on your Bond; it owns the algebra and nothing about rendering. The attributes
		its state implies are yours to write in the part that renders the element.
	</DocCallout>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>Type your own props</Section.Title>
		<Section.Subtitle>
			Preset-driven props like
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">variant</code> and
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">size</code> are yours to declare.
			Because a preset is swappable, only your application knows which values it defines — so the library
			ships the seam, not the union.
		</Section.Subtitle>
	</Section.Header>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={augmentInterfaceCode} />
	</div>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={augmentAliasCode} />
	</div>

	<DocCallout variant="warning" title="Declare the values you use">
		Until you augment, a variant is accepted but unchecked. A misspelt <em>value</em> —
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">variant="destrucive"</code> — silently
		renders with no variant classes at all. Declaring the union turns that into a compile error.
	</DocCallout>
</Section.Root>

<Section.Root class="mb-0">
	<Section.Header>
		<Section.Title>Coming from the old authoring API?</Section.Title>
		<Section.Subtitle>
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">defineBond</code>,
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">useRoot</code>,
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">definePart</code> and the
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">Bond</code>/<code
				class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">Atom</code
			> classes were removed on 2026-08-27.
		</Section.Subtitle>
	</Section.Header>

	<DocCallout variant="warning" title="Read the migration guide">
		The <a class="underline" href="/docs/migration">migration guide</a> lists every removed export and
		the shape that replaces it.
	</DocCallout>
</Section.Root>
