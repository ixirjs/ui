import { createBondAttachment } from '$svelte-atoms/core/components/internal/attachments.svelte';
import { StepBond } from './bond.svelte';

export const step = createBondAttachment<StepBond>(StepBond);
