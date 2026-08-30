<script lang="ts">
	import { untrack } from 'svelte';
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { PresetModuleName } from '$ixirjs/ui/preset';
	import { LIST_ITEM_AS, LIST_ITEM_CLASS } from '$ixirjs/ui/components/list/item-class';
	import { DropdownMenuContext } from '$ixirjs/ui/components/dropdown-menu/bond.svelte';
	import { DropdownMenuItemAtom } from './bond.svelte';
	import type { DropdownMenuItemProps } from './types';

	const menu = DropdownMenuContext.getOrThrow(
		'<DropdownMenuItem> must be used within a <DropdownMenu>.'
	);

	const ID = $props.id();
	// `class` and `preset` deliberately stay in restProps: the seam reads the consumer's class from
	// there (pulling it out would drop it from the composed array) and falls back to `spec.preset`.
	let {
		id = ID,
		disabled = undefined,
		as = LIST_ITEM_AS,
		children = undefined,
		...restProps
	}: DropdownMenuItemProps = $props();

	// Live getters, not a `$derived` snapshot: typeahead reads `props.disabled` through this object.
	const item = new DropdownMenuItemAtom(
		{
			get id() {
				return id;
			},
			get disabled() {
				return disabled;
			}
		},
		menu
	);

	// `onmount`/`ondestroy` and the motion props are Kernel-owned and need the motion rune. Declaring
	// it unconditionally would put EVERY item on the motion leaf, so the question is asked once, at
	// init, and only an item that actually declares one pays for it.
	const declaresMotion = untrack(() =>
		Boolean(
			restProps.onmount ??
			restProps.ondestroy ??
			restProps.animate ??
			restProps.enter ??
			restProps.exit ??
			restProps.initial ??
			restProps.motion
		)
	);

	// Registered at init so membership follows document order; released on teardown. The key is the
	// identity the item was mounted with, read once — re-keying an item is not a supported change.
	const release = menu.registerItem(
		untrack(() => id),
		item
	);
	$effect(() => release);

	// Composed by the seam ahead of a consumer's own `onclick`: theirs runs first and this is
	// skipped when they prevented the default, which is what keeps the menu open on demand.
	function onclick(event: MouseEvent) {
		event.preventDefault();
		item.close(event);
	}

	function onkeyup(event: KeyboardEvent) {
		if (disabled) return;
		if (event.key !== 'Enter' && event.key !== ' ') return;
		event.preventDefault();
		item.close(event);
	}

	export function getController() {
		return item;
	}

	const el = Kernel.element(() => restProps, {
		preset: `${menu.name}.item` as PresetModuleName,
		class: LIST_ITEM_CLASS,
		state: menu,
		as: () => as,
		layer: () => menu.props.presets?.item,
		...(declaresMotion ? { motion: () => restProps.motion as never } : {}),
		attrs: () => ({
			class:
				'border-border last:border-b-0 hover:bg-foreground/5 active:bg-foreground/10 outline-primary cursor-pointer border-b',
			id: item.domId,
			role: 'menuitem',
			'aria-disabled': disabled ? true : undefined,
			tabIndex: disabled ? -1 : 0,
			'data-highlighted': menu.roving.activeId === id,
			onclick,
			onkeyup
		})
	});
	// Bound once: an identifier callee in `{@render}` compiles to a direct call — no snippet block,
	// no hydration anchor.
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children, { menuItem: item })}
