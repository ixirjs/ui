<script lang="ts">
	import { animate } from '$ixirjs/ui/shared';
	import { Icon } from '$ixirjs/ui/components/icon';
	import IconArrowDown from '$ixirjs/ui/icons/icon-arrow-down.svelte';
	import { HtmlAtom, mergeAtomProps } from '$ixirjs/ui/components/atom';
	import type { PresetKey } from '$ixirjs/ui/preset';
	import { createAtomInstance, type Atom } from '$ixirjs/ui/shared/bond';
	import { createPopoverAtom, PopoverBond } from './bond.svelte';
	import { overlayIsOpen } from '$ixirjs/ui/components/overlay/policies/overlay-view';

	const bond = PopoverBond.getOrThrow('<Popover.Indicator /> must be used within a <Popover />');

	let {
		class: klass = '',
		preset = undefined as PresetKey | undefined,
		children = undefined
	} = $props();

	const atom = createAtomInstance<Atom<PopoverBond, HTMLElement>, PopoverBond, HTMLElement>(
		'indicator',
		{
			bond,
			factory: (owner) => createPopoverAtom(owner as PopoverBond, 'indicator')
		}
	);

	const isOpen = $derived(overlayIsOpen(bond));

	const indicatorProps = $derived(mergeAtomProps(atom, preset, {}, bond.presetLayer('indicator')));
</script>

<HtmlAtom
	{bond}
	class={['border-border flex h-5 items-center justify-center', '$preset', klass]}
	{...indicatorProps}
>
	{@render (children ?? fallback)({ popover: bond })}
</HtmlAtom>

{#snippet fallback()}
	<Icon
		class="h-full"
		src={IconArrowDown}
		animate={(node) => animate(node, { rotate: 180 * +isOpen }, { duration: 0.2 })}
	/>
{/snippet}
