import { clickAction } from '$ixirjs/ui/attachments/event.svelte';
import { createBondAttachment } from '$ixirjs/ui/components/internal/attachments.svelte';
import { DISCLOSURE } from '$ixirjs/ui/shared/capability/models/disclosure.svelte';
import { DialogBond } from './bond.svelte';

export const dialog = createBondAttachment<DialogBond>(DialogBond);

// Attachment: close the dialog on click (unless the handler preventDefaults). Mirrors closeDrawer.
export function closeDialog(onclick?: (ev: MouseEvent) => void) {
	const bond = DialogBond.get();
	return clickAction((event) => {
		bond?.stageOpenChange({ event, reason: 'close-trigger' });
		(bond?.surface(DISCLOSURE) ?? bond)?.close();
	}, onclick);
}
