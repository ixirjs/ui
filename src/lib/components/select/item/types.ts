import type { Snippet } from 'svelte';
import type { DropdownMenuItemProps } from '$ixirjs/ui/components/dropdown-menu/item/types';
import type { SelectItemController } from './controller.svelte';
import type { PresetKey } from '$ixirjs/ui/preset';

export interface SelectItemProps<T = unknown> extends Omit<
	DropdownMenuItemProps,
	'factory' | 'children' | 'preset'
> {
	// Preset key for styling; fallback chain, first registered wins. Default: `'select.item'`.
	preset?: PresetKey;

	// The value of the select item.
	value?: string;

	// Custom data associated with the item.
	data?: T;

	// Factory function to create a custom SelectItemController instance.
	factory?: () => SelectItemController<T>;

	// Render prop for children.
	children?: Snippet<[{ selectItem: SelectItemController<T> }]>;
}
