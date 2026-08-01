<script lang="ts" generics="E extends HtmlElementTagName, B extends Base = Base">
	import { clickout } from '$svelte-atoms/core/attachments';
	import { containsTarget } from '$svelte-atoms/core/utils/dom.svelte';
	import type { Base } from '../atom';
	import type { HtmlElementTagName } from '../element';
	import { popoverNode, type PopoverBond, type PopoverContentProps } from '../popover';
	import { closeOverlay } from '../portal/host/policies/overlay-view';
	import { Content } from '../dropdown-menu/atoms';
	import { ContextMenuBond } from './bond.svelte';

	const bond = ContextMenuBond.getOrThrow(
		'<ContextMenu.Content /> must be used within a <ContextMenu.Root />'
	);

	// Context menus size to their own `min-w-*` class, not the trigger: empty `minWidth` floor
	// drops the inherited dropdown default so the class wins. Opt back in per-instance with `minWidth`.
	let { onclickoutside, minWidth = '', ...restProps }: PopoverContentProps<E, B> = $props();

	function onclickoutHandler(ev: PointerEvent, bond: PopoverBond) {
		// Right-click on the trigger should not close the popover.
		if (containsTarget(popoverNode(bond, 'trigger')?.element, ev.target) && ev.button === 2) {
			return;
		}

		closeOverlay(bond);
	}

	function contextMenuOutAttachement(node: HTMLElement) {
		const cleanup = clickout(
			(ev) => {
				if (onclickoutside) {
					onclickoutside(ev, bond as unknown as PopoverBond);
					return;
				}

				onclickoutHandler(ev, bond as unknown as PopoverBond);
			},
			{ type: 'pointerdown' }
		)(node);

		return cleanup;
	}
</script>

<Content
	{@attach contextMenuOutAttachement}
	{minWidth}
	onclickoutside={onclickoutside ?? onclickoutHandler}
	{...restProps}
/>
