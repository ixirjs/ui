import { createBondAttachment } from '$ixirjs/ui/components/internal/attachments.svelte';
import { DropdownMenuContext, type DropdownMenuBondBase } from './bond.svelte';

export const dropdownMenu = createBondAttachment<DropdownMenuBondBase>(DropdownMenuContext);
