import { createBondAttachment } from '$svelte-atoms/core/components/internal/attachments.svelte';
import { StepperBond } from './bond.svelte';

export const stepper = createBondAttachment<StepperBond>(StepperBond);
