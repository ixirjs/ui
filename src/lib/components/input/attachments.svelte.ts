import { createBondAttachment } from '$svelte-atoms/core/components/internal/attachments.svelte';
import { InputBond } from './bond.svelte';

export const input = createBondAttachment<InputBond>(InputBond);
