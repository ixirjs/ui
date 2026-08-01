<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'span', B extends Base = Base">
	import { mergePresetProps, HtmlAtom, type Base } from '$ixirjs/ui/components/atom';
	import type { BreadcrumbSeparatorProps } from './types';

	let {
		class: klass = '',
		as = 'span',
		preset = undefined,
		children = undefined,
		...restProps
	}: BreadcrumbSeparatorProps<E, B> = $props();

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
