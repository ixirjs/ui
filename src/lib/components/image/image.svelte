<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { toClassValue } from '$ixirjs/ui/utils';
	import type { ImageProps } from './types';

	let {
		class: klass = '',
		src = undefined,
		alt = undefined,
		children = undefined,
		...restProps
	}: ImageProps = $props();

	let hasError = $state(false);

	// The error class rides in the consumer's class slot with its own `$preset` sentinel, so the
	// preset keeps landing between it and the consumer's class.
	const el = Kernel.element(
		() => ({
			...restProps,
			class: [hasError && 'bg-foreground/5', '$preset', toClassValue(klass, { error: hasError })]
		}),
		{
			preset: 'image',
			class: 'flex items-center justify-center overflow-hidden rounded-lg'
		}
	);
</script>

<div {...el.attrs}>
	<img
		class={[hasError && 'hidden size-full object-cover']}
		{src}
		{alt}
		onerror={() => {
			hasError = true;
		}}
	/>

	{@render (hasError ? children : undefined)?.()}
</div>
