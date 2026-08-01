<script lang="ts">
	import { mergePresetProps, HtmlAtom } from '$svelte-atoms/core/components/atom';
	import type { ChipProps } from './types';
	import ChipCloseButton from './chip-close-button.svelte';

	let {
		class: klass = '',
		preset = undefined,
		children = undefined,
		icon = undefined,
		closeButton = undefined,
		onclose = undefined,
		...restProps
	}: ChipProps = $props();

	const chipProps = $derived(mergePresetProps(preset, 'chip', restProps));
</script>

<HtmlAtom
	as="div"
	class={[
		'chip text-foreground bg-foreground/5 border-border hover:bg-foreground/10 active:bg-foreground/15 disabled:bg-muted disabled:text-muted-foreground w-fit cursor-pointer rounded-md px-3 py-1 transition-colors duration-100',
		'$preset',
		klass
	]}
	{...chipProps}
>
	{@render children?.()}

	{#if closeButton}
		{@render closeButton?.()}
	{:else}
		<ChipCloseButton {icon} onclick={onclose} />
	{/if}
</HtmlAtom>
