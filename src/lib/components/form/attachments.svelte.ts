import { createBondAttachment } from '$svelte-atoms/core/components/internal/attachments.svelte';
import { FormBond } from './bond.svelte';

export const form = createBondAttachment<FormBond>(FormBond);
