import type { SelectBond } from '../bond.svelte';
import { SelectItemController } from './controller.svelte';

export function selectItem(
	callback: (node: HTMLElement, item?: SelectItemController, select?: SelectBond) => any
) {
	const item = SelectItemController.get();
	const bond = item?.selectBond;

	return (node: HTMLElement) => callback(node, item, bond);
}
