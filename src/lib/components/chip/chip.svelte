<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import type { ChipProps } from './types';
	import ChipCloseButton from './chip-close.svelte';

	let {
		icon = undefined,
		closeButton = undefined,
		ondismiss = undefined,
		children = undefined,
		...restProps
	}: ChipProps = $props();

	const el = Kernel.element(() => restProps, {
		preset: 'chip',
		class:
			'chip text-foreground bg-foreground/5 border-border hover:bg-foreground/10 active:bg-foreground/15 disabled:bg-muted disabled:text-muted-foreground inline-flex items-center w-fit h-6 gap-1 cursor-pointer rounded-md pl-2 pr-1 py-1 transition-colors duration-100'
	});
</script>

<div {...el.attrs}>
	{@render children?.()}

	{@render (closeButton ?? defaultCloseButton)()}
</div>

{#snippet defaultCloseButton()}
	<ChipCloseButton {icon} onclick={ondismiss} />
{/snippet}
