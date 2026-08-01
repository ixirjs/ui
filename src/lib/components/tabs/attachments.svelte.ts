import { createBondAttachment } from '$ixirjs/ui/components/internal/attachments.svelte';
import { TabsBond } from './bond.svelte';

export const tabs = createBondAttachment<TabsBond>(TabsBond);
