import { popover } from '$svelte-atoms/core/components/popover/attachments.svelte';
import { PopoverBond } from '$svelte-atoms/core/components/popover/bond.svelte';

export function dropdownMenu(
	callback: (node: HTMLElement, bond?: PopoverBond) => void | (() => void)
) {
	return popover(callback);
}
