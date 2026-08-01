<script lang="ts">
	import { mergePresetProps, HtmlAtom } from '$svelte-atoms/core/components/atom';
	import { Icon } from '$svelte-atoms/core/components/icon';
	import type { ChipCloseButtonProps } from './types';
	import CloseIcon from '../../icons/icon-close.svelte';

	let {
		class: klass = '',
		preset = undefined,
		icon = undefined,
		onclick = undefined,
		...restProps
	}: ChipCloseButtonProps = $props();

	const chipCloseButtonProps = $derived(mergePresetProps(preset, 'chip.close-button', restProps));
</script>

<HtmlAtom
	as="button"
	class={[
		'bg-foreground/0 hover:bg-foreground/5 active:bg-foreground/10 inline-flex aspect-square h-full cursor-pointer items-center justify-center rounded-xs p-0.5',
		'$preset',
		klass
	]}
	type="button"
	{onclick}
	{...chipCloseButtonProps}
>
	{#if icon}
		{@render icon?.()}
	{:else}
		<Icon src={CloseIcon} class="h-full" />
	{/if}
</HtmlAtom>
