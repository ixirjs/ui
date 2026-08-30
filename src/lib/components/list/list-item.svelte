<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { LIST_ITEM_AS, LIST_ITEM_CLASS } from './item-class';
	import type { ListItemProps } from './types';

	let {
		as = LIST_ITEM_AS,
		base = undefined,
		children = undefined,
		...restProps
	}: ListItemProps = $props();

	// The base class comes from `item-class` so a part that renders an item WITHOUT mounting this
	// component — `Select.Item`, `DropdownMenu.Item` — cannot drift from it. Polymorphic by contract
	// (`ListItemProps<E, B>`), so it dispatches: `as` and `base` stay honoured.
	const el = Kernel.element(() => restProps, {
		preset: 'list.item',
		class: LIST_ITEM_CLASS,
		as: () => as,
		base: () => base
	});
	const leaf = Kernel.render(el);
</script>

{@render leaf(el, children)}
