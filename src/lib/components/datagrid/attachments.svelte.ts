import { createBondAttachment } from '$svelte-atoms/core/components/internal/attachments.svelte';
import { DataGridBond } from './bond.svelte';

export const datagrid = createBondAttachment<DataGridBond>(DataGridBond);
