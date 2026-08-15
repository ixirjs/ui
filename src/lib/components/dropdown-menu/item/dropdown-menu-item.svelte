<script lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { untrack } from 'svelte';
	import { DropdownMenuItemAtom, type DropdownMenuItemAtomProps } from './bond.svelte';
	import { DropdownMenuBond } from '$ixirjs/ui/components/dropdown-menu/bond.svelte';
	import type { DropdownMenuItemProps } from './types';
	import { LIST_ITEM_AS, listItemClass } from '$ixirjs/ui/components/list/item-class';
	import { mergeAtomProps } from '$ixirjs/ui/components/atom';
	import { createAtomInstance } from '$ixirjs/ui/shared/bond';

	const menu = DropdownMenuBond.getOrThrow(
		'<DropdownMenuItem> must be used within a <DropdownMenu>.'
	);

	const ID = $props.id();
	let {
		class: klass = '',
		id = ID,
		preset = undefined,
		disabled = undefined,
		children = undefined,
		onclick = undefined,
		...restProps
	}: DropdownMenuItemProps = $props();

	const itemProps = $derived<DropdownMenuItemAtomProps>({
		id,
		disabled
	});

	const atom = createAtomInstance<DropdownMenuItemAtom<typeof menu>, typeof menu, HTMLElement>(
		untrack(() => `item-${id}`),
		{
			bond: menu,
			required: true,
			register: { key: 'item', cardinality: 'many' },
			factory: () => new DropdownMenuItemAtom<typeof menu>(itemProps, menu)
		}
	);

	// Atom spread (attrs + handlers + element attachment + roving projection) plus custom props.
	const itemAttrs = $derived(mergeAtomProps(atom, preset, restProps, menu.presetLayer('item')));

	// Register the item into the bond so roving focus / keyboard navigation can see
	// it. Stable (outside the reactive `spread`), so it never feeds the mount loop.
	$effect.pre(() => {
		const itemId = id;
		menu.registerItem(itemId, atom);

		return () => {
			menu.unregisterItem(itemId);
		};
	});

	function handleClick(ev: MouseEvent) {
		onclick?.(ev);

		if (ev.defaultPrevented) {
			return;
		}

		ev.preventDefault();

		atom.close(ev);
	}

	export function getController() {
		return atom;
	}

	// Renders the item element itself instead of mounting `<List.Item>` to do it. That wrapper cost a
	// second component boundary AND a `spread_props` proxy per item — 1.237 vs 0.334 µs per level on
	// SSR and 18.89 vs 3.43 µs on a targeted client update, measured in
	// docs/research/nesting-component-vs-snippet-2026-08.md — and items are the one shape in the
	// library where a wrapper multiplies by list length.
	//
	// `Kernel.static`, not a seam carrying `menu`: `List.Item` used the static seam, so the
	// bond was never visible to preset resolution, and a function-form preset entry is called as
	// `entry({ bond })`. Handing it the menu bond here would change what such an entry sees. The
	// atom merge already happened above in `mergeAtomProps`, exactly as it did before.
	//
	// `onclick` stays LAST, as it was when written after the spread on `<List.Item>`: it deliberately
	// REPLACES the atom's handler rather than composing with it, and `handleClick` routes to
	// `atom.close(ev)` itself.
	const el = Kernel.element(Kernel.static, () => ({
		as: LIST_ITEM_AS,
		class: listItemClass(
			'border-border last:border-b-0 hover:bg-foreground/5 active:bg-foreground/10 outline-primary cursor-pointer border-b',
			klass
		),
		...itemAttrs,
		onclick: handleClick
	}));
</script>

{@render Kernel.render(el)(
	el.tag(),
	el.class(),
	el.attrs(),
	children,
	{ menuItem: atom },
	el.motion(),
	el
)}
