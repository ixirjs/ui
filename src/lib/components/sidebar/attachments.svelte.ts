import { clickAction } from '$ixirjs/ui/attachments/event.svelte';
import { DISCLOSURE } from '$ixirjs/ui/shared/capability/models/disclosure.svelte';
import { SidebarBond } from './bond.svelte';

export function toggleSidebar(onclick?: (ev: MouseEvent) => void) {
	const bond = SidebarBond.get();
	return clickAction((event) => {
		bond?.stageOpenChange({ event, reason: 'trigger' });
		(bond?.surface(DISCLOSURE) ?? bond)?.toggle();
	}, onclick);
}
