<script lang="ts" generics="E extends keyof HTMLElementTagNameMap = 'div', B extends Base = Base">
	import { mergePresetProps } from '$svelte-atoms/core/components/atom';
	import type { Base } from '$svelte-atoms/core/components/atom';
	import type { HTMLAttributes } from 'svelte/elements';
	import { Trigger } from '../popover/atoms';
	import { DropdownMenuBond } from '../dropdown-menu/bond.svelte';
	import type { ContextMenuTriggerProps } from './types';
	import type { BondVirtualElement } from '$svelte-atoms/core/shared/bond.svelte';

	type ElementType = HTMLElementTagNameMap[E];

	const bond = DropdownMenuBond.getOrThrow('<ContextMenu.Trigger /> must be used within a <ContextMenu.Root />');

	const dropdownMenuBond = bond;

	const virtualTriggerAtom = dropdownMenuBond.atom('virtual-trigger');

	let {
		preset = undefined,
		onclick = null,
		oncontextmenu = undefined,
		class: klass = '',
		...restProps
	}: HTMLAttributes<ElementType> & ContextMenuTriggerProps<E, B> = $props();

	const triggerProps = $derived(mergePresetProps(preset, 'context-menu.trigger', restProps));

	function handleContextMenu(ev: MouseEvent) {
		ev.preventDefault();

		const event = new MouseEvent('contextmenu', ev) as MouseEvent & {
			currentTarget: MouseEvent & ElementType;
		};
		oncontextmenu?.(event);

		if (event.defaultPrevented) return;

		const virtualElement = {
			getBoundingClientRect: () => ({
				width: 0,
				height: 0,
				x: ev.clientX,
				y: ev.clientY,
				top: ev.clientY,
				left: ev.clientX,
				right: ev.clientX,
				bottom: ev.clientY
			} as DOMRect),
			contains: () => false
		} as BondVirtualElement;

		virtualTriggerAtom.element = virtualElement;

		dropdownMenuBond.state.open();
	}
</script>

<Trigger class={['cursor-context-menu', klass]} onclick={onclick ?? undefined} oncontextmenu={handleContextMenu} {...triggerProps} />
