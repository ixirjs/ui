<script lang="ts" generics="E extends HtmlElementTagName = 'button', B extends Base = Base">
	import type { Base, BasePropsOf, HtmlElementTagName } from '$ixirjs/ui/authoring';
	import { Trigger } from '$ixirjs/ui/components/dropdown-menu/atoms';
	import type { DropdownMenuTriggerProps } from '$ixirjs/ui/components/dropdown-menu/types';
	import { ContextMenuContext } from './bond.svelte';
	import type { ContextMenuTriggerProps } from './types';

	const bond = ContextMenuContext.getOrThrow(
		'<ContextMenu.Trigger /> must be used within a <ContextMenu.Root />'
	);

	let {
		preset = undefined,
		onclick = undefined,
		oncontextmenu = undefined,
		class: klass = '',
		...restProps
	}: ContextMenuTriggerProps<E, B> & BasePropsOf<B> = $props();

	function handleClick(event: MouseEvent) {
		onclick?.(event as Parameters<NonNullable<typeof onclick>>[0]);
		// ContextMenu opens only from the native contextmenu gesture, never from a plain click.
		if (!event.defaultPrevented) event.preventDefault();
	}

	// Plain `MouseEvent`, cast on forward: annotating the intersection here would pin
	// `currentTarget` to this component's `E`, which no longer matches the inner trigger's own.
	function handleContextMenu(ev: MouseEvent) {
		oncontextmenu?.(ev as Parameters<NonNullable<typeof oncontextmenu>>[0]);
		if (ev.defaultPrevented) return;
		ev.preventDefault();

		bond.virtualElement = {
			getBoundingClientRect: () =>
				({
					width: 0,
					height: 0,
					x: ev.clientX,
					y: ev.clientY,
					top: ev.clientY,
					left: ev.clientX,
					right: ev.clientX,
					bottom: ev.clientY
				}) as DOMRect
		};

		bond.stageOpenChange({ event: ev, reason: 'context-menu' });
		bond.open();
	}
</script>

<Trigger
	class={['cursor-context-menu', klass]}
	{preset}
	onclick={handleClick}
	oncontextmenu={handleContextMenu}
	{...restProps as DropdownMenuTriggerProps<E, B>}
/>
