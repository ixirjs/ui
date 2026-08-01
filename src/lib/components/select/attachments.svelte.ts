import { createBondAttachment } from '$svelte-atoms/core/components/internal/attachments.svelte';
import { SelectBond } from './bond.svelte';

export const select = createBondAttachment<SelectBond>(SelectBond);
