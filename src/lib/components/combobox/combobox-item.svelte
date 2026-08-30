<script
	lang="ts"
	generics="T = unknown, E extends HtmlElementTagName = 'li', B extends Base = Base"
>
	import type { Base, BasePropsOf, HtmlElementTagName } from '$ixirjs/ui/authoring';
	import { Item } from '$ixirjs/ui/components/select/atoms';
	import type { SelectItemProps } from '$ixirjs/ui/components/select/item/types';
	import { ComboboxContext } from './bond.svelte';
	import type { ComboboxItemProps } from './types';

	const bond = ComboboxContext.getOrThrow('ComboboxItem must be used within a Combobox');

	let {
		class: klass = '',
		preset = undefined,
		value = '',
		children = undefined,
		...restProps
	}: ComboboxItemProps<T, E, B> & BasePropsOf<B> = $props();

	// `Select.Item`'s own handler is composed after this one and bails once we've preventDefaulted,
	// so the commit is owned here. Toggle (so multi-select can deselect; single-select replaces),
	// then close only in single-select. Updates `props.values`, which drives `allSelections` → chips.
	function onItemClick(ev: MouseEvent) {
		ev.preventDefault();
		const selected = bond.props.values?.includes(value) ?? false;
		if (selected) bond.unselect([value]);
		else bond.select([value]);
		if (!bond.props.multiple) bond.close();
	}
</script>

<Item
	{value}
	preset={preset ?? 'combobox.item'}
	class={['border-border', '$preset', klass].filter(Boolean).join(' ')}
	{...restProps as SelectItemProps<T>}
	onclick={onItemClick}
>
	{@render children?.({ combobox: bond })}
</Item>
