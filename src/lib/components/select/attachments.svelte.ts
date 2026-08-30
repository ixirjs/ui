import { createBondAttachment } from '$ixirjs/ui/components/internal/attachments.svelte';
import { SelectContext, type SelectBondBase } from './bond.svelte';

export const select = createBondAttachment<SelectBondBase>(SelectContext);
