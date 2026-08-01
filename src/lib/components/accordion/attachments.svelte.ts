import { createBondAttachment } from '$ixirjs/ui/components/internal/attachments.svelte';
import { AccordionBond } from './bond.svelte';

export const accordion = createBondAttachment<AccordionBond>(AccordionBond);
