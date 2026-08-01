import { createBondAttachment } from '$svelte-atoms/core/components/internal/attachments.svelte';
import { PopoverBond } from '$svelte-atoms/core/components/popover/bond.svelte';

export const tooltip = createBondAttachment<PopoverBond>(PopoverBond);
