import { clickAction } from '$svelte-atoms/core/attachments/event.svelte';
import { SidebarBond } from './bond.svelte';

export function slideover(
	callback: (node: HTMLElement, bond?: SidebarBond) => void | (() => void)
) {
	const bond = SidebarBond.get();
	return (node: HTMLElement) => callback(node, bond);
}

export function toggleSidebar(onclick?: (ev: MouseEvent) => void) {
	const bond = SidebarBond.get();
	return clickAction(() => bond?.toggle(), onclick);
}
