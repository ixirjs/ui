import type { Snippet } from 'svelte';
import type { TransitionConfig } from 'svelte/transition';
import type { DropdownMenuItemAtom } from './bond.svelte';
import type { ClassValue } from '$svelte-atoms/core/utils';
import type { Base, HtmlAtomProps } from '../../atom';
import type { PresetKey } from '$svelte-atoms/core/context/preset.svelte';

export interface DropdownMenuItemProps<
	E extends keyof HTMLElementTagNameMap = 'div',
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
