import type { Snippet } from 'svelte';
import type { OmitKey } from '$ixirjs/ui/types';
import type { DropdownMenuItemProps } from '$ixirjs/ui/components/dropdown-menu/item/types';
import type { SelectItemController } from './controller.svelte';
import type { PresetKey } from '$ixirjs/ui/preset';

export interface SelectItemProps<T = unknown> extends OmitKey<
	DropdownMenuItemProps,
	'children' | 'preset'
> {
	// Preset key for styling; fallback chain, first registered wins. Default: `'select.item'`.
	/** Preset key for styling */
	preset?: PresetKey;

	// The value of the select item.
	/** The value of the select item */
	value?: string;

	// Custom data associated with the item.
	/** Custom data associated with the item */
	data?: T;

	// Render prop for children.
	/** Render prop for children */
	children?: Snippet<[{ selectItem: SelectItemController<T> }]>;
}
