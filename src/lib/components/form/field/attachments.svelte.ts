import { createBondAttachment } from '$svelte-atoms/core/components/internal/attachments.svelte';
import { FieldBond } from './bond.svelte';

export const field = createBondAttachment<FieldBond>(FieldBond);
