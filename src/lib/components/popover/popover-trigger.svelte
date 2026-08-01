<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, mergeAtomProps, type Base } from '$svelte-atoms/core/components/atom';
	import { PopoverBond } from './bond.svelte';
	import type { PopoverTriggerProps } from './types';

	const bond = PopoverBond.getOrThrow('<PopoverTrigger /> must be used within a <Popover />');

	let {
		class: klass = '',
		as = 'button' as E,
		preset = undefined,
		children = undefined,
		onpointerenter = undefined,
		...restProps
	}: PopoverTriggerProps<E, B> = $props();

	const atom = bond.atom('trigger');

	const triggerProps = $derived(mergeAtomProps(atom, preset, restProps));

	function handlePointerEnter(event: PointerEvent) {
		onpointerenter?.(event);
		if(event.defaultPrevented) return;

		bond.state.tracking = true;
	}
</script>

<HtmlAtom
	{as}
	{bond}
	class={['border-border flex w-fit cursor-pointer rounded-md p-2', '$preset', klass]}
	type={as === 'button' ? 'button' : undefined}
	onpointerenter={handlePointerEnter}
	{...triggerProps}
>
	{@render children?.({ popover: bond })}
</HtmlAtom>
