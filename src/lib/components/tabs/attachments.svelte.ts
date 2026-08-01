import { createBondAttachment } from '$svelte-atoms/core/components/internal/attachments.svelte';
import { TabsBond } from './bond.svelte';

export const tabs = createBondAttachment<TabsBond>(TabsBond);
