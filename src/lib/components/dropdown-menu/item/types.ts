import type { Snippet } from 'svelte';
import type { DropdownMenuItemAtom } from './bond.svelte';
import type { ClassValue } from '$svelte-atoms/core/utils';
import type { Base, HtmlAtomProps } from '../../atom';
import type { PresetKey } from '$svelte-atoms/core/context/preset.svelte';

export interface DropdownMenuItemProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B> {
	// Custom CSS class(es) to apply to the menu item
	class?: ClassValue;

	// Preset key for styling; first registered wins. Default: 'dropdown-menu.item'
	preset?: PresetKey;

	// Whether the menu item is disabled
	disabled?: boolean;

	// Click event handler
	onclick?: (event: MouseEvent) => void;

	// Mount lifecycle callback
	onmount?: (this: DropdownMenuItemAtom) => void;

	// Destroy lifecycle callback
	ondestroy?: (this: DropdownMenuItemAtom) => void;

	// Animation configuration
	animate?: (this: DropdownMenuItemAtom) => any;

	// Enter animation configuration
	enter?: (this: DropdownMenuItemAtom) => any;

	// Exit animation configuration
	exit?: (this: DropdownMenuItemAtom) => any;

	// Initial state configuration
	initial?: (this: DropdownMenuItemAtom) => any;

	// Factory function to create a custom item atom instance
	factory?: () => DropdownMenuItemAtom;

	// Render prop for children
	children?: Snippet<[{ menuItem: DropdownMenuItemAtom }]>;
}
