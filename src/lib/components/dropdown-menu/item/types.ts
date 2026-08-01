import type { Snippet } from 'svelte';
import type { TransitionConfig } from 'svelte/transition';
import type { DropdownMenuItemAtom } from './bond.svelte';
import type { ClassValue } from '$ixirjs/ui/utils';
import type { Base, HtmlAtomProps } from '$ixirjs/ui/components/atom';
import type { PresetKey } from '$ixirjs/ui/preset';

export interface DropdownMenuItemProps<
	E extends keyof HTMLElementTagNameMap = 'li',
	B extends Base = Base
> extends HtmlAtomProps<E, B, Snippet<[{ menuItem: DropdownMenuItemAtom }]>> {
	class?: ClassValue;

	// Item identity key; defaults to a generated id. Declared so it isn't `unknown` via the index sig.
	id?: string;

	// First registered wins. Default: 'dropdown-menu.item'
	preset?: PresetKey;

	disabled?: boolean;

	onclick?: (event: MouseEvent) => void;

	onmount?: (this: DropdownMenuItemAtom) => void;

	ondestroy?: (this: DropdownMenuItemAtom) => void;

	animate?: (this: DropdownMenuItemAtom) => void | (() => void);

	enter?: (this: DropdownMenuItemAtom) => Partial<TransitionConfig> | void;

	exit?: (this: DropdownMenuItemAtom) => Partial<TransitionConfig> | void;

	initial?: (this: DropdownMenuItemAtom) => void | (() => void);

	factory?: () => DropdownMenuItemAtom;
}
