import { clickAction } from '$svelte-atoms/core/attachments/event.svelte';
import { createBondAttachment } from '$svelte-atoms/core/components/internal/attachments.svelte';
import { DISCLOSURE } from '$svelte-atoms/core/shared/capability/models/disclosure.svelte';
import { DialogBond } from './bond.svelte';

export const dialog = createBondAttachment<DialogBond>(DialogBond);

// Attachment: close the dialog on click (unless the handler preventDefaults). Mirrors closeDrawer.
export function closeDialog(onclick?: (ev: MouseEvent) => void) {
	const bond = DialogBond.get();
	return clickAction(() => (bond?.surface(DISCLOSURE) ?? bond)?.close(), onclick);
}
