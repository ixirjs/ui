<script lang="ts">
	import { mergePresetProps } from '$ixirjs/ui/components/atom';
	import { toClassValue } from '$ixirjs/ui/utils';
	import { HtmlAtom } from '$ixirjs/ui/components/atom';
	import type { ImageProps } from './types';

	let {
		class: klass = '',
		src = undefined,
		alt = undefined,
		children = undefined,
		preset = undefined,
		...restProps
	}: ImageProps = $props();

	let hasError = $state(false);

	const imageProps = $derived(mergePresetProps(preset, 'image', restProps));
</script>

<HtmlAtom
	as="div"
	class={[
		'flex items-center justify-center overflow-hidden rounded-lg',
		hasError && 'bg-foreground/5',
		'$preset',
		toClassValue(klass, { error: hasError })
	]}
	{...imageProps}
>
	<img
		class={[hasError && 'hidden size-full object-cover']}
		{src}
		{alt}
		onerror={() => {
			hasError = true;
		}}
	/>

	{#if hasError}
		{@render children?.()}
	{/if}
</HtmlAtom>
