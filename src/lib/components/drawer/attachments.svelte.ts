import { clickout } from '$svelte-atoms/core/attachments/clickout.svelte';
import { clickAction } from '$svelte-atoms/core/attachments/event.svelte';
import { containsTarget } from '$svelte-atoms/core/utils/dom.svelte';
import { DrawerBond } from './bond.svelte';

export function drawer(callback: (node: HTMLElement, bond?: DrawerBond) => any) {
	const bond = DrawerBond.get();
	return (node: HTMLElement) => callback(node, bond);
}

export function toggleDrawer(onclick?: (ev: MouseEvent) => void) {
	const bond = DrawerBond.get();
	return clickAction(() => bond?.state.toggle(), onclick);
}

export function openDrawer(onclick?: (ev: MouseEvent) => void) {
	const bond = DrawerBond.get();
	return clickAction(() => bond?.state.open(), onclick);
}

export function closeDrawer(onclick?: (ev: MouseEvent) => void) {
	const bond = DrawerBond.get();
	return clickAction(() => bond?.state.close(), onclick);
}

export function clickoutDrawer(onclickout?: (ev: PointerEvent, bond?: DrawerBond) => void) {
	const bond = DrawerBond.get();

	return clickout(
		(ev: PointerEvent) => {
			if (!bond) return;

			if (!bond.state.props.open) {
				return;
			}

			if (containsTarget(bond.elements.content, ev.target)) {
				return;
			}

			onclickout?.(ev, bond);

			if (ev.defaultPrevented) {
				return;
			}

			bond.state.close();
		},
		{
			capture: true,
			passive: true
		}
	);
}
