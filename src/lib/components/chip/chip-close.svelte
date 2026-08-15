<script lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { mergePresetProps } from '$ixirjs/ui/components/atom';
	import { Icon } from '$ixirjs/ui/components/icon';
	import type { ChipCloseButtonProps } from './types';
	import CloseIcon from '$ixirjs/ui/icons/icon-close.svelte';

	let {
		class: klass = '',
		preset = undefined,
		icon = undefined,
		onclick = undefined,
		...restProps
	}: ChipCloseButtonProps = $props();

	const chipCloseButtonProps = $derived(mergePresetProps(preset, 'chip.close', restProps));

	// Element seam instead of a component boundary: identical output, one less boundary. Key
	// order below is the order the previous call had; precedence is object-literal order.
	const el = Kernel.element(Kernel.static, () => ({
		as: 'button',
		class: [
			'bg-foreground/0 hover:bg-foreground/5 active:bg-foreground/10 inline-flex aspect-square h-full cursor-pointer items-center justify-center rounded-xs p-0.5',
			'$preset',
			klass
		],
		type: 'button',
		onclick,
		...chipCloseButtonProps
	}));
</script>

{@render Kernel.render(el)(
	el.tag(),
	el.class(),
	el.attrs(),
	icon ?? defaultIcon,
	undefined,
	el.motion(),
	el
)}

{#snippet defaultIcon()}
	<Icon src={CloseIcon} class="h-full" />
{/snippet}
