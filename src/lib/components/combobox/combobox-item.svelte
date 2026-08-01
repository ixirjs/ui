<script lang="ts">
	import { ComboboxBond } from './bond.svelte';
	import { Item } from '$svelte-atoms/core/components/select/atoms';

	const bond = ComboboxBond.get() as ComboboxBond;

	if (!bond) {
		throw new Error('Combobox atom was not found');
	}

	let {
		class: klass = '',
		preset = undefined as string | string[] | undefined,
		value = '',
		children = undefined,
		...restProps
	} = $props();

	const atom = bond.item();

	const presentation = $derived({ preset: preset ?? atom.preset });

	// `Select.Item`'s own handler runs this first, then bails if we've `preventDefault`ed — so we
	// own the commit here. Toggle (so multi-select can deselect; single-select replaces), then
	// close only when single-select. Updates `props.values`, which drives `allSelections` → chips.
	function onItemClick(ev: MouseEvent) {
		ev.preventDefault();
		const selected = bond.state.props.values?.includes(value) ?? false;
		if (selected) bond.state.unselect([value]);
		else bond.state.select([value]);
		if (!bond.state.props.multiple) bond.state.close();
	}
</script>

<Item
	{bond}
	{value}
	class={['border-border', '$preset', klass].filter(Boolean).join(' ')}
	{...presentation}
	{...restProps}
	onclick={onItemClick}
>
	{@render children?.({ combobox: bond })}
</Item>
