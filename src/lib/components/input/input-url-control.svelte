<script lang="ts">
	import { useControl } from './shared';
	import SegmentedField from './segmented-field.svelte';
	import { parseUrlSegments, type UrlSegmentKind } from './segments';
	import type { InputUrlControlProps } from './types';

	let {
		class: klass = '',
		value = $bindable(''),
		placeholder = '',
		disabled = false,
		readonly = false,
		preset: presetKey = 'input.url',
		onchange = undefined,
		oninput = undefined,
		onvaluechange = undefined,
		...restProps
	}: InputUrlControlProps = $props();

	// No `class` here: `klass` goes to <SegmentedField>, which folds it against the bond itself.
	const control = useControl({
		preset: () => presetKey,
		restProps: () => restProps
	});

	const segments = $derived(parseUrlSegments(value));

	const kindStyle: Record<UrlSegmentKind, string> = {
		protocol: 'color: var(--input-hl-muted, var(--foreground))',
		host: 'color: var(--input-hl-primary, var(--foreground)); font-weight: 500',
		port: 'color: var(--input-hl-warning, var(--foreground))',
		pathname: 'color: var(--input-hl-secondary, var(--foreground))',
		search: 'color: var(--input-hl-info, var(--foreground))',
		hash: 'color: var(--input-hl-accent, var(--foreground))',
		plain: 'color: var(--input-hl-muted, var(--foreground))'
	};
</script>

<!--
  Two layers: transparent-text <input> on top (caret, selection, native editing)
  over a coloured overlay <span>. Shared markup/scroll-sync lives in <SegmentedField>.
-->
<SegmentedField
	type="text"
	inputmode="url"
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
