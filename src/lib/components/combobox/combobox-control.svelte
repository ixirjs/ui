<script lang="ts">
	import { Input } from '$svelte-atoms/core/components/input';
	import { ComboboxBond } from './bond.svelte';
	import type { ComboboxControlProps } from './types';
	import type { InputModel } from '$svelte-atoms/core/shared';

	const bond = ComboboxBond.get() as ComboboxBond;

	if (!bond) {
		throw new Error('Combobox atom was not found');
	}

	let {
		value = $bindable(),
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: ComboboxControlProps = $props();

	// The trigger control is the `value` box: it shows the selected item's value (the `'input'`
	// capability's `value` field), and setting it commits the selection. Filtering is a separate
	// concern — a content `Combobox.Query` box drives the `query` field — so typing here no
	// longer touches the filter.
	const input = $derived(bond.capability('input')?.surface as InputModel | undefined);

	const atom = bond.control();

	const comboboxProps = $derived({
		preset: preset ?? atom.preset,
		...atom.spread,
		...restProps
	});
</script>

<Input.Control
	bind:value={
		() => input?.get('value') ?? '',
		(v) => {
			input?.set(v, 'value');
			value = v;
		}
	}
	class={['border-border flex-1 py-1', '$preset', klass]}
	{...comboboxProps}
/>
