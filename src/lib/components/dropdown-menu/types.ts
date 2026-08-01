import type { HtmlAtomProps, Base } from '$ixirjs/ui/components/atom';
import type { PopoverPresets, PopoverRootProps } from '$ixirjs/ui/components/popover';
import type { PresetLike } from '$ixirjs/ui/preset';
import type { StateChangeCallback } from '$ixirjs/ui/types';
import type { DropdownMenuBond, DropdownMenuBondProps } from './bond.svelte';

/** Per-instance presentation layers for DropdownMenu's bonded parts. */
export interface DropdownMenuPresets extends PopoverPresets {
	item?: PresetLike;
}

export type DropdownMenuRootProps = Omit<
	PopoverRootProps,
	'factory' | 'onopenchange' | 'presets'
> & {
	presets?: DropdownMenuPresets | undefined;
	factory?: ((props: DropdownMenuBondProps) => DropdownMenuBond) | undefined;
	onopenchange?: StateChangeCallback<boolean, DropdownMenuBond> | undefined;
};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DropdownMenuContentProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B> {}
