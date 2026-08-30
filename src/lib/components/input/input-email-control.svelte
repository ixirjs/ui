<script lang="ts">
	import { useControl } from './shared';
	import SegmentedField from './segmented-field.svelte';
	import { parseEmailSegments, type EmailSegmentKind } from './segments';
	import type { InputEmailControlProps } from './types';

	let {
		class: klass = '',
		value = $bindable(''),
		placeholder = 'you@example.com',
		disabled = false,
		readonly = false,
		preset: presetKey = 'input.email',
		onchange = undefined,
		oninput = undefined,
		onvaluechange = undefined,
		...restProps
	}: InputEmailControlProps = $props();

	// No `class` here: `klass` goes to <SegmentedField>, which folds it against the bond itself.
	const control = useControl({
		preset: () => presetKey,
		restProps: () => restProps,
		type: () => 'email'
	});

	const segments = $derived(parseEmailSegments(value));

	const kindStyle: Record<EmailSegmentKind, string> = {
		local: 'color: var(--input-hl-primary, var(--foreground)); font-weight: 500',
		at: 'color: var(--input-hl-muted, var(--foreground))',
		domain: 'color: var(--input-hl-secondary, var(--foreground))',
		tld: 'color: var(--input-hl-accent, var(--foreground))',
		plain: 'color: var(--foreground)'
	};
</script>

<SegmentedField
	type="email"
	bind:value
	{segments}
	{kindStyle}
	{placeholder}
	{disabled}
	{readonly}
	class={klass}
	{control}
	{onchange}
	{oninput}
	{onvaluechange}
/>
