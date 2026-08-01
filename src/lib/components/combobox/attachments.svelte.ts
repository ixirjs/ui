import { createBondAttachment } from '$svelte-atoms/core/components/internal/attachments.svelte';
import { ComboboxBond } from './bond.svelte';

export const combobox = createBondAttachment<ComboboxBond>(ComboboxBond);
