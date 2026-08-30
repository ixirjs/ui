import { TabsContext, type TabsBond } from '$ixirjs/ui/components/tabs/bond.svelte';
import { TabContext, type TabBond } from './bond.svelte';

export function tab(
	callback: (
		node: HTMLElement,
		{ tab, tabs }: { tab?: TabBond<unknown> | undefined; tabs?: TabsBond<unknown> | undefined }
	) => void | (() => void)
) {
	const tabBond = TabContext.get();
	const tabsBond = TabsContext.get();

	return (node: HTMLElement) => callback(node, { tab: tabBond, tabs: tabsBond });
}
