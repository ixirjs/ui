<script lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { untrack } from 'svelte';
	import { DropdownMenuItemAtom, type DropdownMenuItemAtomProps } from './bond.svelte';
	import { DropdownMenuBond } from '$ixirjs/ui/components/dropdown-menu/bond.svelte';
	import type { DropdownMenuItemProps } from './types';
	import { LIST_ITEM_AS, listItemClass } from '$ixirjs/ui/components/list/item-class';
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
	// `entry({ bond })`. Handing it the menu bond here would change what such an entry sees. Passing
	// `atom:` below does not reopen that: `atom` and `bond` are separate axes, and `bond` stays unset.
	//
	// The Atom rides the seam as `atom:` rather than being pre-merged into a packet. `mergeAtomProps`
	// + `{...itemAttrs}` allocated three objects and held a `$derived` per item to produce what
	// `buildKernelElement` already does internally via `mergeAtomPresentationProps` — and items are
	// the one shape in the library where per-instance cost multiplies by list length.
	//
	// `onclick` stays LAST. Through the seam it now COMPOSES with the atom's handler rather than
	// replacing it, but the observable behaviour is unchanged: `composeHandlers` runs the consumer's
	// handler first and skips the atom's when the default was prevented, and `handleClick` prevents
	// it before calling `atom.close(ev)` itself. A consumer `onclick` that prevents default still
	// leaves the menu open, exactly as the replacing form did.
	//
	// `preset` keeps `mergeAtomProps`'s `preset ?? atom.preset` fallback explicitly: the seam's own
	// fallback is `seam.preset`, and `Kernel.static` carries none.
	const el = Kernel.element(Kernel.static, () => ({
		as: LIST_ITEM_AS,
		class: listItemClass(
			'border-border last:border-b-0 hover:bg-foreground/5 active:bg-foreground/10 outline-primary cursor-pointer border-b',
			klass
		),
		atom,
		...restProps,
		// After the spread, matching `mergeAtomProps`, which preferred the explicit layer over one
		// arriving through restProps.
		preset: preset ?? atom.preset,
		presetLayer: menu.presetLayer('item') ?? restProps.presetLayer,
		onclick: handleClick
	}));
</script>

{@render Kernel.render(el)(el, children, { menuItem: atom })}
