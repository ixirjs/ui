import { createBondAttachment } from '$svelte-atoms/core/components/internal/attachments.svelte';
import { CollapsibleBond } from './bond.svelte';

export const collapsible = createBondAttachment<CollapsibleBond>(CollapsibleBond);
