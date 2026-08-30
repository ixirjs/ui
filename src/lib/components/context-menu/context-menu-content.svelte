<script lang="ts" generics="E extends HtmlElementTagName = 'ul', B extends Base = Base">
	import { clickout } from '$ixirjs/ui/attachments';
	import { containsTarget } from '$ixirjs/ui/utils/dom.svelte';
	import type { Base, BasePropsOf, HtmlElementTagName } from '$ixirjs/ui/authoring';
	import { Content } from '$ixirjs/ui/components/dropdown-menu/atoms';
	import { ContextMenuContext, type ContextMenuBondBase } from './bond.svelte';
	import type { ContextMenuContentProps } from './types';

	const bond = ContextMenuContext.getOrThrow(
		'<ContextMenu.Content /> must be used within a <ContextMenu.Root />'
	);

	// Context menus size to their own `min-w-*` class, not the trigger: an empty `minWidth` floor
	// drops the inherited dropdown default so the class wins. Opt back in per-instance with `minWidth`.
	let {
		onclickoutside,
		minWidth = '',
		...restProps
	}: ContextMenuContentProps<E, B> & BasePropsOf<B> = $props();

	function onclickoutHandler(ev: PointerEvent, target: ContextMenuBondBase) {
		// Right-click on the trigger should not close the menu.
		if (containsTarget(target.element('trigger'), ev.target) && ev.button === 2) return;

		target.stageOpenChange({ event: ev, reason: 'outside-press' });
		target.close();
	}

	function contextMenuOutAttachement(node: HTMLElement) {
		return clickout(
			(ev) => {
				if (onclickoutside) {
					onclickoutside(ev, bond as never);
					return;
				}
				onclickoutHandler(ev, bond);
			},
			{ type: 'pointerdown' }
		)(node);
	}
</script>

<Content
	{@attach contextMenuOutAttachement}
	{minWidth}
	onclickoutside={onclickoutside ?? (onclickoutHandler as never)}
	{...restProps}
/>
