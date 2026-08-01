import type { SelectBond } from '$ixirjs/ui/components/select/bond.svelte';
import { SelectItemController } from './controller.svelte';

export function selectItem(
	callback: (
		node: HTMLElement,
		item?: SelectItemController,
		select?: SelectBond
	) => void | (() => void)
) {
	const item = SelectItemController.get();
	const bond = item?.selectBond;

	return (node: HTMLElement) => callback(node, item, bond);
}
