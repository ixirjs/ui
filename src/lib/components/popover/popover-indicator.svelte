<script lang="ts">
	import { animate as motion } from 'motion';
	import { Icon } from '$svelte-atoms/core/components/icon';
	import IconArrowDown from '$svelte-atoms/core/icons/icon-arrow-down.svelte';
	import { HtmlAtom } from '$svelte-atoms/core/components/atom';
	import { PopoverBond } from './bond.svelte';

	const bond = PopoverBond.get();

	let {
		class: klass = '',
		preset = undefined as string | string[] | undefined,
		children = undefined
	} = $props();

	const atom = bond.atom('indicator');

	const isOpen = $derived(bond?.state.props.open ?? false);

	const presentation = $derived({ preset: preset ?? atom.preset });
</script>

<HtmlAtom
	{bond}
	class={['border-border flex h-5 items-center justify-center', '$preset', klass]}
	{...presentation}
	{...atom.spread}
>
	{#if children}
		{@render children?.({ popover: bond })}
	{:else}
		<Icon
			class="h-full"
			src={IconArrowDown}
			animate={(node) => motion(node, { rotate: 180 * +isOpen }, { duration: 0.2 })}
		/>
	{/if}
</HtmlAtom>
