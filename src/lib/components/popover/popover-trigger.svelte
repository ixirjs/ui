<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { HtmlAtom, mergeAtomProps, type Base } from '$ixirjs/ui/components/atom';
	import { createAtomInstance, type Atom } from '$ixirjs/ui/shared/bond';
	import { createPopoverAtom, PopoverBond, setPopoverTracking } from './bond.svelte';
	import type { PopoverTriggerProps } from './types';

	const bond = PopoverBond.getOrThrow('<PopoverTrigger /> must be used within a <Popover />');

	let {
		class: klass = '',
		as = 'button' as E,
		preset = undefined,
		children = undefined,
		onclick = undefined,
		onkeydown = undefined,
		onpointerenter = undefined,
		...restProps
	}: PopoverTriggerProps<E, B> = $props();

	const atom = createAtomInstance<Atom<PopoverBond, HTMLElement>, PopoverBond, HTMLElement>(
		'trigger',
		{
			bond,
			factory: (owner) => createPopoverAtom(owner as PopoverBond, 'trigger')
		}
	);

	const triggerProps = $derived(
		mergeAtomProps(atom, preset, restProps, bond.presetLayer('trigger'))
	);

	function handleClick(event: MouseEvent) {
		onclick?.(event);
		if (event.defaultPrevented || event.button === 2) return;

		bond.stageOpenChange({ event, reason: 'trigger' });
		(triggerProps.onclick as ((event: MouseEvent) => void) | undefined)?.(event);
	}

	function handleKeydown(event: KeyboardEvent) {
		onkeydown?.(event);
		if (event.defaultPrevented) return;

		if (event.key === 'Enter' || event.key === ' ') {
			bond.stageOpenChange({ event, reason: 'trigger' });
		}
		(triggerProps.onkeydown as ((event: KeyboardEvent) => void) | undefined)?.(event);
	}

	function handlePointerEnter(event: PointerEvent) {
		onpointerenter?.(event);
		if (event.defaultPrevented) return;

		setPopoverTracking(bond, true);
	}
</script>

<HtmlAtom
	{as}
	{bond}
	class={['flex w-fit cursor-pointer rounded-md p-2', '$preset', klass]}
	type={as === 'button' ? 'button' : undefined}
	{...triggerProps}
	onclick={handleClick}
	onkeydown={handleKeydown}
	onpointerenter={handlePointerEnter}
>
	{@render children?.({ popover: bond })}
</HtmlAtom>
