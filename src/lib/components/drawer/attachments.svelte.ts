import { clickout } from '$ixirjs/ui/attachments/clickout.svelte';
import { clickAction } from '$ixirjs/ui/attachments/event.svelte';
import { createBondAttachment } from '$ixirjs/ui/components/internal/attachments.svelte';
import { DISCLOSURE } from '$ixirjs/ui/shared/capability/models/disclosure.svelte';
import { containsTarget } from '$ixirjs/ui/utils/dom.svelte';
import { DrawerBond } from './bond.svelte';

export const drawer = createBondAttachment<DrawerBond>(DrawerBond);

export function toggleDrawer(onclick?: (ev: MouseEvent) => void) {
	const bond = DrawerBond.get();
	return clickAction((event) => {
		bond?.stageOpenChange({ event, reason: 'trigger' });
		(bond?.surface(DISCLOSURE) ?? bond)?.toggle();
	}, onclick);
}

export function openDrawer(onclick?: (ev: MouseEvent) => void) {
	const bond = DrawerBond.get();
	return clickAction((event) => {
		bond?.stageOpenChange({ event, reason: 'trigger' });
		(bond?.surface(DISCLOSURE) ?? bond)?.open();
	}, onclick);
}

export function closeDrawer(onclick?: (ev: MouseEvent) => void) {
	const bond = DrawerBond.get();
	return clickAction((event) => {
		bond?.stageOpenChange({ event, reason: 'close-trigger' });
		(bond?.surface(DISCLOSURE) ?? bond)?.close();
	}, onclick);
}

export function clickoutDrawer(onclickout?: (ev: PointerEvent, bond?: DrawerBond) => void) {
	const bond = DrawerBond.get();

	return clickout(
		(ev: PointerEvent) => {
			if (!bond) return;

			if (!bond.props.open) {
				return;
			}

			if (containsTarget(bond.elements.content, ev.target)) {
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
