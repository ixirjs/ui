import { createBondAttachment } from '$ixirjs/ui/components/internal/attachments.svelte';
import { TabsBond, TabsContext } from './bond.svelte';

export const tabs = createBondAttachment<TabsBond>(TabsContext);
