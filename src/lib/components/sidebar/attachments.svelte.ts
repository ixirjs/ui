import { clickAction } from '$ixirjs/ui/attachments/event.svelte';
import { SidebarContext } from './bond.svelte';

export function toggleSidebar(onclick?: (ev: MouseEvent) => void) {
	const bond = SidebarContext.get();
	return clickAction((event) => {
		bond?.stageOpenChange({ event, reason: 'trigger' });
		bond?.toggle();
	}, onclick);
}
