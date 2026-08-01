<script
	lang="ts"
	generics="E extends keyof HTMLElementTagNameMap = 'button', B extends Base = Base"
>
	import { mergePresetProps } from '$ixirjs/ui/components/atom';
	import type { Base } from '$ixirjs/ui/components/atom';
	import { usePart } from '$ixirjs/ui/shared';
	import { Trigger } from '$ixirjs/ui/components/popover/atoms';
	import { ContextMenuBond } from './bond.svelte';
	import type { ContextMenuTriggerProps } from './types';
	import type { BondVirtualElement } from '$ixirjs/ui/shared/bond';

	let {
		preset = undefined,
		onclick = undefined,
		oncontextmenu = undefined,
		class: klass = '',
		...restProps
	}: ContextMenuTriggerProps<E, B> = $props();

	// The virtual trigger carries no rendered element of its own; the declared slot supplies its
	// constructor, registration key and role, and this part renders `<Trigger>` instead.
	const virtualTriggerPart = usePart(ContextMenuBond, 'virtual-trigger', () => ({}), {
		message: '<ContextMenu.Trigger /> must be used within a <ContextMenu.Root />'
	});
	const bond = virtualTriggerPart.bond;
	const virtualTriggerAtom = virtualTriggerPart.atom;

	const triggerProps = $derived(mergePresetProps(preset, 'context-menu.trigger', restProps));

	function handleClick(event: MouseEvent) {
		onclick?.(event as Parameters<NonNullable<typeof onclick>>[0]);
		// ContextMenu opens only from the native contextmenu gesture, never from Popover's click trigger.
		if (!event.defaultPrevented) event.preventDefault();
	}

	// Plain `MouseEvent`, cast on forward — same shape as `handleClick` above. Annotating the
	// intersection here pins `currentTarget` to this component's `E`, which no longer matches the
	// element type `Trigger` infers for its own generic now that handlers are typed.
	function handleContextMenu(ev: MouseEvent) {
		oncontextmenu?.(ev as Parameters<NonNullable<typeof oncontextmenu>>[0]);
		if (ev.defaultPrevented) return;
		ev.preventDefault();

		const virtualElement = {
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
				}) as DOMRect,
			contains: () => false
		} as BondVirtualElement;

		virtualTriggerAtom.element = virtualElement;

		bond.stageOpenChange({ event: ev, reason: 'context-menu' });
		bond.open();
	}
</script>

<Trigger
	class={['cursor-context-menu', klass]}
	onclick={handleClick}
	oncontextmenu={handleContextMenu}
	{...triggerProps}
/>
