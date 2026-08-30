import { clickout } from '$ixirjs/ui/attachments/clickout.svelte';
import { clickAction } from '$ixirjs/ui/attachments/event.svelte';
import { createBondAttachment } from '$ixirjs/ui/components/internal/attachments.svelte';
import { containsTarget } from '$ixirjs/ui/utils/dom.svelte';
import { DrawerBond, DrawerContext } from './bond.svelte';

export const drawer = createBondAttachment<DrawerBond>(DrawerBond);

export function toggleDrawer(onclick?: (ev: MouseEvent) => void) {
	const bond = DrawerContext.get();
	return clickAction((event) => {
		bond?.stageOpenChange({ event, reason: 'trigger' });
		bond?.toggle();
	}, onclick);
}

export function openDrawer(onclick?: (ev: MouseEvent) => void) {
	const bond = DrawerContext.get();
	return clickAction((event) => {
		bond?.stageOpenChange({ event, reason: 'trigger' });
		bond?.open();
	}, onclick);
}

export function closeDrawer(onclick?: (ev: MouseEvent) => void) {
	const bond = DrawerContext.get();
	return clickAction((event) => {
		bond?.stageOpenChange({ event, reason: 'close-trigger' });
		bond?.close();
	}, onclick);
}

export function clickoutDrawer(onclickout?: (ev: PointerEvent, bond?: DrawerBond) => void) {
	const bond = DrawerContext.get();

	return clickout(
		(ev: PointerEvent) => {
			if (!bond) return;

			if (!bond.props.open) {
				return;
			}

			if (containsTarget(bond.element('content'), ev.target)) {
				return;
			}

			onclickout?.(ev, bond);

			if (ev.defaultPrevented) {
				return;
			}

			bond.stageOpenChange({ event: ev, reason: 'outside-press' });
			bond.close();
		},
		{
			capture: true,
			passive: true
		}
	);
}
