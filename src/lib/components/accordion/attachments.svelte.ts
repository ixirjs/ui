import { createBondAttachment } from '$svelte-atoms/core/components/internal/attachments.svelte';
import { AccordionBond } from './bond.svelte';

export const accordion = createBondAttachment<AccordionBond>(AccordionBond);
