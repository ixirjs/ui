import { PopoverBond } from './bond.svelte';
import { clickout as gclickout } from '$svelte-atoms/core/attachments/clickout.svelte';
import { containsTarget } from '$svelte-atoms/core/utils/dom.svelte';

export function popover(callback: (node: HTMLElement, bond?: PopoverBond) => any) {
	const bond = PopoverBond.get();
	return (node: HTMLElement) => callback(node, bond);
}

export function clickoutPopover(onclickout?: (ev: PointerEvent, atom: PopoverBond) => any) {
	const atom = PopoverBond.get();

	return gclickout((ev: PointerEvent) => {
		if (!atom) return;

		if (containsTarget(atom.elements.trigger, ev.target)) {
			return;
		}

		onclickout?.(ev, atom);
	});
}
