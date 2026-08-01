import { createBondAttachment } from '$svelte-atoms/core/components/internal/attachments.svelte';
import { ToastBond } from './bond.svelte';

// Attachment: provides the nearest ToastBond to a node callback.
export const toast = createBondAttachment<ToastBond>(ToastBond);
