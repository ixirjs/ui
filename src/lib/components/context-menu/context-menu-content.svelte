<script lang="ts" generics="E extends HtmlElementTagName = 'ul', B extends Base = Base">
	import { clickout } from '$ixirjs/ui/attachments';
	import { containsTarget } from '$ixirjs/ui/utils/dom.svelte';
	import type { Base, BasePropsOf } from '$ixirjs/ui/components/atom';
	import type { HtmlElementTagName } from '$ixirjs/ui/components/element';
	import { popoverNode, type PopoverBond } from '$ixirjs/ui/components/popover';
	import { Content } from '$ixirjs/ui/components/dropdown-menu/atoms';
	import { ContextMenuBond } from './bond.svelte';
	import type { ContextMenuContentProps } from './types';

	const bond = ContextMenuBond.getOrThrow(
		'<ContextMenu.Content /> must be used within a <ContextMenu.Root />'
	);

	// Context menus size to their own `min-w-*` class, not the trigger: empty `minWidth` floor
	// drops the inherited dropdown default so the class wins. Opt back in per-instance with `minWidth`.
	let {
		onclickoutside,
		minWidth = '',
		...restProps
	}: ContextMenuContentProps<E, B> & BasePropsOf<B> = $props();

	function onclickoutHandler(ev: PointerEvent, bond: PopoverBond) {
		// Right-click on the trigger should not close the popover.
		if (containsTarget(popoverNode(bond, 'trigger')?.element, ev.target) && ev.button === 2) {
			return;
		}

		bond.stageOpenChange({ event: ev, reason: 'outside-press' });
		bond.close();
	}

	function contextMenuOutAttachement(node: HTMLElement) {
		const cleanup = clickout(
			(ev) => {
				if (onclickoutside) {
					onclickoutside(ev, bond);
					return;
				}

				onclickoutHandler(ev, bond);
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
