<script lang="ts">
	import { Input } from '$ixirjs/ui/components/input';
	import { ComboboxBond } from './bond.svelte';
	import type { ComboboxControlProps } from './types';
	import { INPUT, usePart } from '@ixirjs/ui/shared';

	let {
		value = $bindable(),
		class: klass = '',
		preset = undefined,
		...restProps
	}: ComboboxControlProps = $props();

	const part = usePart(ComboboxBond, 'control', () => restProps, {
		preset: () => preset
	});

	// Trigger control is the `value` box (the `'input'` capability's `value` field): shows the
	// selection, setting it commits. Filtering lives in a separate `Combobox.Query` (`query` field).
	const input = $derived(part.bond.surface(INPUT));
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
	{...part.props}
/>
