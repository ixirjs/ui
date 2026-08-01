import { clickAction } from '$svelte-atoms/core/attachments/event.svelte';
import { SidebarBond } from './bond.svelte';

export function slideover(callback: (node: HTMLElement, bond?: SidebarBond) => any) {
	const bond = SidebarBond.get();
	return (node: HTMLElement) => callback(node, bond);
}

export function toggleSidebar(onclick?: (ev: MouseEvent) => any) {
	const bond = SidebarBond.get();
	return clickAction(() => bond?.state.toggle(), onclick);
}
