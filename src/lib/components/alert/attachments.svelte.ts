import { createBondAttachment } from '$svelte-atoms/core/components/internal/attachments.svelte';
import { AlertBond } from './bond.svelte';

export const alert = createBondAttachment<AlertBond>(AlertBond);
