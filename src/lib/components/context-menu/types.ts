import type { RenderProps, Base, HtmlElementTagName } from '$ixirjs/ui/authoring';
import type { OmitKey } from '$ixirjs/ui/types';
import type {
	PopoverContentProps,
	PopoverIndicatorProps,
	PopoverRootProps,
	PopoverTailProps
} from '$ixirjs/ui/components/popover';
import type { DropdownMenuPresets } from '$ixirjs/ui/components/dropdown-menu';
import type { DropdownMenuItemProps } from '$ixirjs/ui/components/dropdown-menu/item/types';
import type { DividerProps } from '$ixirjs/ui/components/divider';
import type { ListGroupProps, ListTitleProps } from '$ixirjs/ui/components/list';
import type { StateChangeCallback } from '$ixirjs/ui/types';
import type { ContextMenuBond, ContextMenuBondProps } from './bond.svelte';

// Extension points: merge custom props into context-menu parts by augmenting these interfaces.
// Each part's props alias another family's type, so these seams are the only way to extend
// ContextMenu alone without also widening Popover, List, or DropdownMenu.
export interface ContextMenuRootExtendProps {}

export interface ContextMenuContentExtendProps {}

export interface ContextMenuTailExtendProps {}

export interface ContextMenuDividerExtendProps {}

export interface ContextMenuGroupExtendProps {}

export interface ContextMenuItemExtendProps {}

export interface ContextMenuTitleExtendProps {}

/** Per-instance presentation layers for ContextMenu's fused menu parts. */
export type ContextMenuPresets = DropdownMenuPresets;

export type ContextMenuRootProps = OmitKey<
	PopoverRootProps,
	'factory' | 'onopenchange' | 'presets'
> &
	ContextMenuRootExtendProps & {
		/** Per-instance presentation overrides for this family’s compound slots. */
		presets?: ContextMenuPresets | undefined;
		/** Advanced factory for a custom context-menu bond. */
		factory?: ((props: ContextMenuBondProps) => ContextMenuBond) | undefined;
		/** Runs after an open-state transition commits. */
		onopenchange?: StateChangeCallback<boolean, ContextMenuBond> | undefined;
	};

export interface ContextMenuTriggerProps<
	E extends HtmlElementTagName = 'button',
	B extends Base = Base
> extends RenderProps<E, B> {
	/** Native callback run before opening. Call event.preventDefault() to cancel opening. */
	oncontextmenu?: ((event: MouseEvent) => void) | undefined;
}

export type ContextMenuContentProps<
	E extends HtmlElementTagName = 'ul',
	B extends Base = Base
> = PopoverContentProps<E, B> & ContextMenuContentExtendProps;

export type ContextMenuTailProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> = PopoverTailProps<E, B> & ContextMenuTailExtendProps;

export type ContextMenuDividerProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> = DividerProps<E, B> & ContextMenuDividerExtendProps;

export type ContextMenuGroupProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> = ListGroupProps<E, B> & ContextMenuGroupExtendProps;

export type ContextMenuIndicatorProps = Pick<
	PopoverIndicatorProps,
	'class' | 'preset' | 'children'
>;

export type ContextMenuItemProps<
	E extends HtmlElementTagName = 'li',
	B extends Base = Base
> = DropdownMenuItemProps<E, B> & ContextMenuItemExtendProps;

export type ContextMenuTitleProps<
	E extends HtmlElementTagName = 'h3',
	B extends Base = Base
> = ListTitleProps<E, B> & ContextMenuTitleExtendProps;
