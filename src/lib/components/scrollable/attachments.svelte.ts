import { createBondAttachment } from '$svelte-atoms/core/components/internal/attachments.svelte';
import { ScrollableBond } from './bond.svelte';

export const scrollable = createBondAttachment<ScrollableBond>(ScrollableBond);
