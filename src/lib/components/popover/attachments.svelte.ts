import { createBondAttachment } from '$svelte-atoms/core/components/internal/attachments.svelte';
import { PopoverBond } from './bond.svelte';
import { clickout as gclickout } from '$svelte-atoms/core/attachments/clickout.svelte';
import { containsTarget } from '$svelte-atoms/core/utils/dom.svelte';

export const popover = createBondAttachment<PopoverBond>(PopoverBond);

export function clickoutPopover(onclickout?: (ev: PointerEvent, atom: PopoverBond) => void) {
	const atom = PopoverBond.get();

	return gclickout((ev: PointerEvent) => {
		if (!atom) return;

		if (containsTarget(atom.elements.trigger, ev.target)) {
			return;
		}

		onclickout?.(ev, atom);
	});
}
