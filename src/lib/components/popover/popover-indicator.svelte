<script lang="ts">
	import { animate as motion } from 'motion';
	import { Icon } from '$svelte-atoms/core/components/icon';
	import IconArrowDown from '$svelte-atoms/core/icons/icon-arrow-down.svelte';
	import { HtmlAtom } from '$svelte-atoms/core/components/atom';
	import { createAtomInstance, type Atom } from '$svelte-atoms/core/shared/bond';
	import { createPopoverAtom, PopoverBond, PopoverIndicatorAtom } from './bond.svelte';
	import { overlayIsOpen } from '$svelte-atoms/core/components/portal/host/policies/overlay-view';

	const bond = PopoverBond.getOrThrow('<Popover.Indicator /> must be used within a <Popover />');

	let {
		class: klass = '',
		preset = undefined as string | string[] | undefined,
		children = undefined
	} = $props();

	const atom = createAtomInstance<Atom<PopoverBond, HTMLElement>, PopoverBond, HTMLElement>(
		'indicator',
		{
			bond,
			factory: (owner) =>
				createPopoverAtom(
					owner as PopoverBond,
					'indicator',
					(popover) => new PopoverIndicatorAtom(popover)
				)
		}
	);

	const isOpen = $derived(overlayIsOpen(bond));

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
