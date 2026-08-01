import { createBondAttachment } from '$svelte-atoms/core/components/internal/attachments.svelte';
import { CardBond } from './bond.svelte';

export const card = createBondAttachment<CardBond>(CardBond);
