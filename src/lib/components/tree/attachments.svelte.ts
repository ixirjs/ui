import { createBondAttachment } from '$svelte-atoms/core/components/internal/attachments.svelte';
import { TreeBond } from './bond.svelte';

export const tree = createBondAttachment<TreeBond>(TreeBond);
