import type { Snippet } from 'svelte';
import type { TransitionConfig } from 'svelte/transition';
import type { DropdownMenuItemAtom } from './bond.svelte';
import type { ClassValue } from '$ixirjs/ui/utils';
import type { Base, RenderProps, HtmlElementTagName } from '$ixirjs/ui/authoring';
import type { PresetKey } from '$ixirjs/ui/preset';

export interface DropdownMenuItemProps<
	E extends HtmlElementTagName = 'li',
	B extends Base = Base
> extends RenderProps<E, B, Snippet<[{ menuItem: DropdownMenuItemAtom }]>> {
	/** Custom CSS class(es) to apply to the dropdown menu item */
	class?: ClassValue;

	// Item identity key; defaults to a generated id. Declared so it isn't `unknown` via the index sig.
	/**
	 * Stable item identity used by roving focus.
	 * @default generated id
	 */
	id?: string;

	// First registered wins. Default: 'dropdown-menu.item'
	/** Use context-menu.item for a context-menu-specific presentation entry. */
	preset?: PresetKey;

	/** Disables the item. */
	disabled?: boolean;

	/** Native click callback. Call event.preventDefault() to keep the menu open. */
	onclick?: (event: MouseEvent) => void;

	/** Function called when element is mounted */
	onmount?: (this: DropdownMenuItemAtom) => void;

	/** Function called when element is destroyed */
	ondestroy?: (this: DropdownMenuItemAtom) => void;

	/** Animation configuration */
	animate?: (this: DropdownMenuItemAtom) => void | (() => void);

	/** Transition function for entering */
	enter?: (this: DropdownMenuItemAtom) => Partial<TransitionConfig> | void;

	/** Transition function for exiting */
	exit?: (this: DropdownMenuItemAtom) => Partial<TransitionConfig> | void;

	/** Initial state configuration */
	initial?: (this: DropdownMenuItemAtom) => void | (() => void);

	/** Factory function for advanced custom item Atom creation */
	factory?: () => DropdownMenuItemAtom;
}
