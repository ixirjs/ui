<script lang="ts">
	import { mergeAtomProps } from '$svelte-atoms/core/components/atom';
	import { Input } from '$svelte-atoms/core/components/input';
	import { ComboboxBond, ComboboxControlAtom } from './bond.svelte';
	import type { ComboboxControlProps } from './types';
	import { INPUT } from '$svelte-atoms/core/shared';
	import { createAtomInstance } from '$svelte-atoms/core/shared/bond';

	const bond = ComboboxBond.getOrThrow(
		'ComboboxControl must be used within a Combobox'
	) as ComboboxBond;

	let {
		value = $bindable(),
		class: klass = '',
		preset = undefined,
		...restProps
	}: ComboboxControlProps = $props();

	// Trigger control is the `value` box (the `'input'` capability's `value` field): shows the
	// selection, setting it commits. Filtering lives in a separate `Combobox.Query` (`query` field).
	const input = $derived(bond.surface(INPUT));

	const atom = createAtomInstance<ComboboxControlAtom, ComboboxBond, HTMLInputElement>('control', {
		bond,
		factory: (owner) => new ComboboxControlAtom(owner as ComboboxBond)
	});

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
