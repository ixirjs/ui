<script
	lang="ts"
	generics="T = unknown, E extends keyof HTMLElementTagNameMap = 'li', B extends Base = Base"
>
	import { ComboboxBond } from './bond.svelte';
	import { Item } from '$ixirjs/ui/components/select/atoms';
	import { mergePresetProps, type Base } from '$ixirjs/ui/components/atom';
	import { closeOverlay } from '$ixirjs/ui/components/overlay/policies/overlay-view';
	import type { ComboboxItemProps } from './types';

	const bond = ComboboxBond.getOrThrow(
		'ComboboxItem must be used within a Combobox'
	) as ComboboxBond;

	let {
		class: klass = '',
		preset = undefined,
		value = '',
		children = undefined,
		...restProps
	}: ComboboxItemProps<T, E, B> = $props();

	const presentation = $derived(mergePresetProps(preset, 'combobox.item', restProps));

	// `Select.Item`'s own handler runs this first, then bails if we've `preventDefault`ed — so we
	// own the commit here. Toggle (so multi-select can deselect; single-select replaces), then
	// close only when single-select. Updates `props.values`, which drives `allSelections` → chips.
	function onItemClick(ev: MouseEvent) {
		ev.preventDefault();
		const selected = bond.props.values?.includes(value) ?? false;
		if (selected) bond.unselect([value]);
		else bond.select([value]);
		if (!bond.props.multiple) closeOverlay(bond);
	}
</script>

<Item
	{bond}
	{value}
	class={['border-border', '$preset', klass].filter(Boolean).join(' ')}
	{...presentation}
	onclick={onItemClick}
>
	{@render children?.({ combobox: bond })}
</Item>
