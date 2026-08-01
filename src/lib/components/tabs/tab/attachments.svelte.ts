import { TabsBond } from '../bond.svelte';
import { TabBond } from './bond.svelte';

export function tab(
	callback: (
		node: HTMLElement,
		{ tab, tabs }: { tab?: TabBond<unknown> | undefined; tabs?: TabsBond<unknown> | undefined }
	) => void | (() => void)
) {
	const tabBond = TabBond.get();
	const tabsBond = TabsBond.get();

	return (node: HTMLElement) => callback(node, { tab: tabBond, tabs: tabsBond });
}
