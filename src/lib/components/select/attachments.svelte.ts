import { createBondAttachment } from '$ixirjs/ui/components/internal/attachments.svelte';
import { SelectBond } from './bond.svelte';

export const select = createBondAttachment<SelectBond>(SelectBond);
