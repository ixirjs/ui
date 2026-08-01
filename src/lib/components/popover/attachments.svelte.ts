import { createBondAttachment } from '$ixirjs/ui/components/internal/attachments.svelte';
import { PopoverBond } from './bond.svelte';
import { clickout as gclickout } from '$ixirjs/ui/attachments/clickout.svelte';
import { containsTarget } from '$ixirjs/ui/utils/dom.svelte';

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
