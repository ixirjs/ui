<script lang="ts">
	import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
	import { Icon } from '$ixirjs/ui/components/icon';
	import type { ChipCloseButtonProps } from './types';
	import CloseIcon from '$ixirjs/ui/icons/icon-close.svelte';

	let { icon = undefined, onclick = undefined, ...restProps }: ChipCloseButtonProps = $props();

	const el = Kernel.element(() => restProps, {
		preset: 'chip.close',
		class:
			'bg-foreground/0 hover:bg-foreground/5 active:bg-foreground/10 inline-flex aspect-square h-full cursor-pointer items-center justify-center rounded-xs p-0.5',
		attrs: () => ({ type: 'button', onclick })
	});
</script>

<button {...el.attrs}>{@render (icon ?? defaultIcon)()}</button>

{#snippet defaultIcon()}
	<Icon src={CloseIcon} class="h-full" />
{/snippet}
