<script lang="ts">
	import { mergePresetProps, HtmlAtom } from '$svelte-atoms/core/components/atom';

	let {
		class: klass = '',
		as = 'span',
		preset = undefined,
		children = undefined,
		...restProps
	} = $props();

	const separatorProps = $derived(mergePresetProps(preset, 'breadcrumb.separator', restProps));
</script>

<HtmlAtom
	{as}
	class={['text-stroke-0/50 border-border px-0', '$preset', klass]}
	data-kind="breadcrumb-separator"
	{...separatorProps}
>
	{#if children}
		{@render children?.()}
	{:else}
		/
	{/if}
</HtmlAtom>
