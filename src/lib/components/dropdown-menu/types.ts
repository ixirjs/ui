import type { RenderProps, Base, HtmlElementTagName } from '$ixirjs/ui/components/atom';
import type { OmitKey } from '$ixirjs/ui/types';
import type { PopoverPresets, PopoverRootProps } from '$ixirjs/ui/components/popover';
import type { PresetLike } from '$ixirjs/ui/preset';
import type { StateChangeCallback } from '$ixirjs/ui/types';
import type { DropdownMenuBond, DropdownMenuBondProps } from './bond.svelte';

/** Per-instance presentation layers for DropdownMenu's bonded parts. */
export interface DropdownMenuPresets extends PopoverPresets {
	item?: PresetLike;
}

export type DropdownMenuRootProps = OmitKey<
	PopoverRootProps,
	'factory' | 'onopenchange' | 'presets'
> & {
	/** Per-instance presentation overrides for this family’s compound slots. */
	presets?: DropdownMenuPresets | undefined;
	/** Replaces the Bond constructor, so a family can be extended or fused. */
	factory?: ((props: DropdownMenuBondProps) => DropdownMenuBond) | undefined;
	/** Semantic callback; runs after the open state commits, not when the trigger is clicked. */
	onopenchange?: StateChangeCallback<boolean, DropdownMenuBond> | undefined;
};

export interface DropdownMenuContentProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B> {}
