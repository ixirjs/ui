<script lang="ts" generics="T extends HtmlElementTagName = 'li', B extends Base = Base">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import {
		mergePresetProps,
		type Base,
		type BasePropsOf,
		type HtmlElementTagName
	} from '$ixirjs/ui/components/atom';
	import { LIST_ITEM_AS, listItemClass } from './item-class';
	import type { ListItemProps } from './types';

	let {
		class: klass = '',
		as = LIST_ITEM_AS as T,
		preset = undefined,
		children = undefined,
		...restProps
	}: ListItemProps<T, B> & BasePropsOf<B> = $props();

	const itemProps = $derived(mergePresetProps(preset, 'list.item', restProps));

	// Element seam instead of a component boundary: identical output, one less boundary. Key
	// order below is the order the previous call had; precedence is object-literal order.
	//
	// The class comes from `listItemClass` so a part that renders an item WITHOUT mounting this
	// component — `Select.Item`, `DropdownMenu.Item` — cannot drift from it. This part contributes no
	// classes of its own beyond the shared base, hence the `undefined`.
	const el = Kernel.element(Kernel.static, () => ({
		as,
		class: listItemClass(undefined, klass),
		...itemProps
	}));
</script>

{@render Kernel.render(el)(el, children)}
