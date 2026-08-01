<script lang="ts">
	import { mergeAtomProps } from '$svelte-atoms/core/components/atom';
	import { Input } from '$svelte-atoms/core/components/input';
	import { ComboboxBond } from './bond.svelte';
	import type { ComboboxControlProps } from './types';
	import { INPUT } from '$svelte-atoms/core/shared';

	const bond = ComboboxBond.getOrThrow('Combobox atom was not found') as ComboboxBond;

	let {
		value = $bindable(),
		class: klass = '',
		preset = undefined,
		children = undefined,
		...restProps
	}: ComboboxControlProps = $props();

	// Trigger control is the `value` box (the `'input'` capability's `value` field): shows the
	// selection, setting it commits. Filtering lives in a separate `Combobox.Query` (`query` field).
	const input = $derived(bond.capability(INPUT)?.surface);

	const atom = bond.control();

	const comboboxProps = $derived(mergeAtomProps(atom, preset, restProps));
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
