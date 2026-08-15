<script lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { mergePresetProps } from '$ixirjs/ui/components/atom';
	import { toClassValue } from '$ixirjs/ui/utils';
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

	// Element seam instead of a component boundary. The inline children move into a local
	// snippet because the seam takes a body rather than markup — Svelte compiled them to a
	// `children` snippet for the component call anyway, so the shape is unchanged.
	const el = Kernel.element(Kernel.static, () => ({
		as: 'div',
		class: [
			'flex items-center justify-center overflow-hidden rounded-lg',
			hasError && 'bg-foreground/5',
			'$preset',
			toClassValue(klass, { error: hasError })
		],
		...imageProps
	}));
</script>

{@render Kernel.render(el)(el.tag(), el.class(), el.attrs(), imageBody, undefined, el.motion(), el)}

{#snippet imageBody()}
	<img
		class={[hasError && 'hidden size-full object-cover']}
		{src}
		{alt}
		onerror={() => {
			hasError = true;
		}}
	/>

	{@render (hasError ? children : undefined)?.()}
{/snippet}
