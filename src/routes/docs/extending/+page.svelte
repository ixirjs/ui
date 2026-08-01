<script lang="ts">
	import { Section, CodeBlock, DocCallout } from '$docs/components';

	// ── Extend an existing component ───────────────────────────────────────────
	const extendCode = `import { defineBond, DropdownMenuBond } from '@svelte-atoms/core';

// A command-palette flavour of dropdown-menu.
// parts: reuses the parent Bond's atoms, capabilities, and behavior.
// name: gives the new component its own namespace, preset path, and context key.
export const CommandMenuBond = defineBond({
  parts: [DropdownMenuBond],
  name: 'command-menu',
  atoms: {}
});

export type CommandMenuBond = InstanceType<typeof CommandMenuBond>;`;

	// ── Fuse two components into one ───────────────────────────────────────────
	const fuseCode = `import { fuse, PopoverBond, DialogBond, PopoverTriggerAtom } from '@svelte-atoms/core';

// PopoverDialog — a Popover trigger that opens Dialog's MODAL content.
// \`fuse\` is the closure property of the composition model: bond + bond = bond.
export const PopoverDialogBond = fuse({
  name: 'popover-dialog',                    // rebrand: fresh namespace / preset / context key
  parts: [PopoverBond, DialogBond],          // atoms UNION, capabilities CONCAT (last-wins per slot)
  atoms: { trigger: PopoverTriggerAtom },    // curate the union — keep Popover's richer trigger
});
export type PopoverDialogBond = InstanceType<typeof PopoverDialogBond>;`;

	// ── Reuse the parts' own atom components ───────────────────────────────────
	const reuseCode = `<!-- A fused bond is shared under EACH part's context key, so the parts' own
     atom components resolve it. You don't re-implement Trigger/Body/… — you
     reuse \`Popover.*\` and \`Dialog.*\` directly. -->
<PopoverDialog.Root bind:open>
  <Popover.Trigger>Open</Popover.Trigger>     <!-- Popover's own trigger -->
  <PopoverDialog.Content>
    <Dialog.Header>Title</Dialog.Header>       <!-- Dialog's own atoms -->
    <Dialog.Body>…</Dialog.Body>
  </PopoverDialog.Content>
</PopoverDialog.Root>`;

	// ── Author a brand-new bond ────────────────────────────────────────────────
	const defineBondCode = `import {
  Bond,
  Atom,
  createAtomInstance,
  defineAtomCapability,
  bondContextKey
} from '@svelte-atoms/core';
import { getContext, setContext } from 'svelte';

export type TilesBondProps = { id?: string; value?: string };

export class TilesBond extends Bond<TilesBondProps> {
  static CONTEXT_KEY = bondContextKey('tiles');

  constructor(props: TilesBondProps) {
    super(props, 'tiles');
  }

  select(value: string) {
    this.props.value = value;
  }

  static required() {
    const bond = getContext<TilesBond | undefined>(TilesBond.CONTEXT_KEY);
    if (!bond) throw new Error('Tiles parts must be rendered inside <Tiles.Root>.');
    return bond;
  }

  share(): this {
    return setContext(TilesBond.CONTEXT_KEY, this);
  }
}

export class TileItemAtom extends Atom<TilesBond, HTMLButtonElement> {
  constructor(bond: TilesBond | undefined) {
    super(bond, 'item');
  }
}

const optionRole = defineAtomCapability({
  behavior: () => ({ attrs: () => ({ role: 'option' }) })
});

// In Tile.Item.svelte:
const item = createAtomInstance('item', {
  bond: () => TilesBond.required(),
  register: { cardinality: 'many' },
  factory: (bond) => new TileItemAtom(bond),
  capabilities: [optionRole]
});`;

	// ── Use the built-in stateful capabilities ─────────────────────────────────
	const builtinsCode = `import {
  createRovingFocus, rovingCapability,
  createSelection, selectionCapability,
} from '@svelte-atoms/core';

// "Which item is highlighted" (keyboard nav) — owns its own active index;
// the item list + id→item resolution are injected.
const roving = createRovingFocus({
  ids:  () => [...items.keys()],
  item: (id) => items.get(id),         // powers roving.activeItem
});

// "What's committed" — storage is bound to your state; the model owns set-algebra.
const selection = createSelection({
  get:  () => values,
  set:  (v) => (values = v),
  mode: () => (multiple ? 'multiple' : 'single'),
});

// Register both on the bond; they project onto the roles their atoms claim:
capabilities: () => [
  rovingCapability(roving, { orientation: 'vertical' }),   // → container + item roles
  selectionCapability(selection),                          // → container + item roles
];`;

	// ── Write your own capability ──────────────────────────────────────────────
	const capabilityCode = `import {
  capabilityKey,
  defineBondCapability,
  defineAtomCapability
} from '@svelte-atoms/core';

export const BUSY = capabilityKey<{ readonly busy: boolean }>('@acme/cap:busy');

// Bond capability: shared state, cross-node coordination, or whole-bond effects.
export function busyCapability(isBusy: () => boolean) {
  return defineBondCapability({
    slot: BUSY,
    surface: { get busy() { return isBusy(); } },
    roles: {
      status: () => ({ attrs: () => ({ 'aria-busy': isBusy() }) })
    }
  });
}

// Atom capability: one node's local presentation, DOM behavior, or lifecycle.
export const statusRole = defineAtomCapability({
  behavior: (node) => ({
    attrs: () => ({ role: 'status', 'data-atom': node.name })
  })
});

// register on a Bond:     this.capability(busyCapability(() => this.props.loading))
// register on an Atom: createAtomInstance('status', { capabilities: [statusRole] })`;
</script>

<svelte:head>
	<title>Extending & Fusing — Svelte Atoms</title>
	<meta
		name="description"
		content="Extend, fuse, and author components with defineBond, fuse, and capabilities."
	/>
</svelte:head>

<Section.Root>
	<Section.Header>
		<Section.Title>Extending &amp; Fusing</Section.Title>
		<Section.Subtitle>
			Every compound component has a <strong>Bond</strong> that coordinates rendered
			<strong>Atoms</strong> and shared <strong>capabilities</strong>. Because a bond spec is data,
			the set of bonds is closed under combination: you can extend one, fuse two, author a new one,
			and project shared behavior as a capability over the same public seam.
		</Section.Subtitle>
	</Section.Header>

	<div class="space-y-3">
		<p class="text-muted-foreground text-sm">The four moves, smallest to largest:</p>
		<ul class="text-muted-foreground list-disc space-y-1 pl-5 text-sm">
			<li>
				<strong>Extend</strong> — reuse a component family and override only what differs (<code
					class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs"
					>defineBond({'{ parts }'})</code
				>)
			</li>
			<li>
				<strong>Fuse</strong> — combine two bonds into a new one (<code
					class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">fuse(...)</code
				>)
			</li>
			<li>
				<strong>Author</strong> — declare a bond from atoms + capabilities (<code
					class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">defineBond(...)</code
				>)
			</li>
			<li><strong>Capability</strong> — extract reusable behavior onto the role seam</li>
		</ul>
	</div>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>Extend a component</Section.Title>
		<Section.Subtitle>
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">parts</code> reuses a parent
			component family. You inherit the parent's atoms and capabilities, get a fresh name and context
			key, and declare only what differs.
		</Section.Subtitle>
	</Section.Header>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={extendCode} />
	</div>

	<DocCallout variant="info" title="Override by re-registering — last-wins">
		There is one mechanism for both composition and customisation: re-register an atom slot (via
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">atoms</code>) or a capability
		slot (via
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">capabilities</code>), and the
		later registration wins. No parallel hook system.
	</DocCallout>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>Fuse two components</Section.Title>
		<Section.Subtitle>
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">fuse</code> unions the parts'
			Atoms and concatenates their capabilities, then resolves each slot last-wins. The result is a first-class
			bond you can fuse again.
		</Section.Subtitle>
	</Section.Header>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={fuseCode} />
	</div>

	<div>
		<p class="text-foreground mt-6 mb-1 text-sm font-semibold">Reuse the parts' own components</p>
		<p class="text-muted-foreground mb-3 text-sm">
			A fused bond is shared under <em>each part's</em> context key, so the parts' existing atom components
			resolve it. Your fusion's atom tree is mostly re-exports — not bespoke wrappers.
		</p>
		<div class="overflow-hidden rounded-lg">
			<CodeBlock lang="svelte" code={reuseCode} />
		</div>
	</div>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>Author a bond from scratch</Section.Title>
		<Section.Subtitle>
			New authoring puts shared state and mutation methods on the
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">Bond</code>, while
			rendered parts create local
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">Atom</code>
			instances with
			<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">createAtomInstance</code
			>.
		</Section.Subtitle>
	</Section.Header>

	<div class="overflow-hidden rounded-lg">
		<CodeBlock lang="typescript" code={defineBondCode} />
	</div>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>Capabilities</Section.Title>
		<Section.Subtitle>
			Behaviour lives in capabilities, not base classes. Bond capabilities can be state-focused,
			coordination-focused, or effectful; Atom capabilities handle local DOM behavior.
		</Section.Subtitle>
	</Section.Header>

	<div class="space-y-6">
		<div>
			<p class="text-foreground mb-1 text-sm font-semibold">Built-in stateful capabilities</p>
			<p class="text-muted-foreground mb-3 text-sm">
				<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">RovingFocus</code>
				("which item is highlighted") and
				<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">SelectionModel</code> ("what's
				committed") are two responsibilities a listbox composes — one each.
			</p>
			<div class="overflow-hidden rounded-lg">
				<CodeBlock lang="typescript" code={builtinsCode} />
			</div>
		</div>

		<div>
			<p class="text-foreground mb-1 text-sm font-semibold">Write your own</p>
			<p class="text-muted-foreground mb-3 text-sm">
				A capability is a <code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs"
					>{'{ slot, surface, roles/behavior, setup }'}</code
				>
				unit. Atoms opt into Bond role projections with
				<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs">.role(role)</code>;
				local Atom capabilities are passed to
				<code class="bg-muted text-foreground rounded px-1.5 py-0.5 text-xs"
					>createAtomInstance</code
				>.
			</p>
			<div class="overflow-hidden rounded-lg">
				<CodeBlock lang="typescript" code={capabilityCode} />
			</div>
		</div>
	</div>

	<DocCallout variant="info" title="Capability or behavior?">
		A <strong>capability</strong> is the noun — it has a
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">slot</code>, lives in the
		spec, and is what fusion resolves. A <strong>behavior</strong> is the verb — a projection an
		Atom folds into its spread, with no identity. Use a capability when two parts must resolve to
		one (focus, selection, roving); use a one-off behavior for an ad-hoc, single-node decoration via
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">node.behavior(...)</code>.
	</DocCallout>
</Section.Root>

<Section.Root>
	<Section.Header>
		<Section.Title>Extend or compose?</Section.Title>
		<Section.Subtitle>Reach for the smallest move that fits.</Section.Subtitle>
	</Section.Header>

	<DocCallout variant="warning" title="Prefer composition first">
		If you only need to rearrange markup or restyle, <strong>compose atoms</strong> and use
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">base</code>/<code
			class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">preset</code
		>
		— no new bond needed. Reach for
		<code class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">parts</code>/<code
			class="bg-muted text-foreground rounded px-1 py-0.5 text-xs">fuse</code
		>
		only when you need new
		<em>behavior</em> (a new Atom slot, a different capability, or two components' behavior in one).
	</DocCallout>
</Section.Root>
