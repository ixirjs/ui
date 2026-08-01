import type { Snippet } from 'svelte';
import type { DropdownMenuItemAtom } from './bond.svelte';
import type { ClassValue } from '$svelte-atoms/core/utils';
import type { Base, HtmlAtomProps } from '../../atom';
import type { PresetKey } from '$svelte-atoms/core/context/preset.svelte';

export interface DropdownMenuItemProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B> {
	class?: ClassValue;

	// First registered wins. Default: 'dropdown-menu.item'
	preset?: PresetKey;

	disabled?: boolean;

	onclick?: (event: MouseEvent) => void;

	onmount?: (this: DropdownMenuItemAtom) => void;

	ondestroy?: (this: DropdownMenuItemAtom) => void;

	animate?: (this: DropdownMenuItemAtom) => any;

	enter?: (this: DropdownMenuItemAtom) => any;

	exit?: (this: DropdownMenuItemAtom) => any;

	initial?: (this: DropdownMenuItemAtom) => any;

	factory?: () => DropdownMenuItemAtom;

	children?: Snippet<[{ menuItem: DropdownMenuItemAtom }]>;
}
