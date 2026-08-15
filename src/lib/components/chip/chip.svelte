<script lang="ts">
	import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
	import { mergePresetProps } from '$ixirjs/ui/components/atom';
	import type { ChipProps } from './types';
	import ChipCloseButton from './chip-close.svelte';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		icon = undefined,
		closeButton = undefined,
		ondismiss = undefined,
		...restProps
	}: ChipProps = $props();

	const chipProps = $derived(mergePresetProps(preset, 'chip', restProps));

	// Element seam instead of a component boundary; key order matches the previous call exactly.
	const el = Kernel.element(Kernel.static, () => ({
		as: 'div',
		class: [
			'chip text-foreground bg-foreground/5 border-border hover:bg-foreground/10 active:bg-foreground/15 disabled:bg-muted disabled:text-muted-foreground inline-flex items-center w-fit h-6 gap-1 cursor-pointer rounded-md pl-2 pr-1 py-1 transition-colors duration-100',
			'$preset',
			klass
		],
		...chipProps
	}));
</script>

{@render Kernel.render(el)(el.tag(), el.class(), el.attrs(), chipBody, undefined, el.motion(), el)}

{#snippet chipBody()}
	{@render children?.()}

	{@render (closeButton ?? defaultCloseButton)()}
{/snippet}

{#snippet defaultCloseButton()}
	<ChipCloseButton {icon} onclick={ondismiss} />
{/snippet}
