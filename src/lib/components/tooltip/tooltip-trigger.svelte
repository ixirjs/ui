<script lang="ts">
	import { PopoverContext } from '$ixirjs/ui/components/popover/bond.svelte';
	import { Trigger } from '$ixirjs/ui/components/popover/atoms';
	import type { TooltipTriggerProps } from './types';

	const popoverBond = PopoverContext.get();

	let {
		children,
		onpointerenter: enter = undefined,
		onpointerleave: leave = undefined,
		...restProps
	}: TooltipTriggerProps<'button'> = $props();

	// Hover opens on the next frame and leave closes; both report their reason. The consumer's own
	// handlers run first; the Popover trigger's (position tracking on enter) compose after these.
	function onpointerenter(event: PointerEvent) {
		enter?.(event as Parameters<NonNullable<typeof enter>>[0]);
		requestAnimationFrame(() => {
			if (!popoverBond) return;
			popoverBond.stageOpenChange({ event, reason: 'pointer-enter' });
			popoverBond.open();
		});
	}
	function onpointerleave(event: PointerEvent) {
		leave?.(event as Parameters<NonNullable<typeof leave>>[0]);
		if (!popoverBond) return;
		popoverBond.stageOpenChange({ event, reason: 'pointer-leave' });
		popoverBond.close();
	}
</script>

<Trigger {onpointerenter} {onpointerleave} {...restProps}>
	{@render children?.({})}
</Trigger>
