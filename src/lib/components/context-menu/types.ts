import type { HtmlAtomProps, Base } from '$ixirjs/ui/components/atom';
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
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ContextMenuRootExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ContextMenuContentExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ContextMenuTailExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ContextMenuDividerExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ContextMenuGroupExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ContextMenuItemExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ContextMenuTitleExtendProps {}

/** Per-instance presentation layers for ContextMenu's fused menu parts. */
export type ContextMenuPresets = DropdownMenuPresets;

export type ContextMenuRootProps = Omit<PopoverRootProps, 'factory' | 'onopenchange' | 'presets'> &
	ContextMenuRootExtendProps & {
		presets?: ContextMenuPresets | undefined;
		factory?: ((props: ContextMenuBondProps) => ContextMenuBond) | undefined;
		onopenchange?: StateChangeCallback<boolean, ContextMenuBond> | undefined;
	};

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ContextMenuTriggerProps<
	E extends keyof HTMLElementTagNameMap = 'button',
	B extends Base = Base
> extends HtmlAtomProps<E, B> {}

export type ContextMenuContentProps<
	E extends keyof HTMLElementTagNameMap = 'ul',
	B extends Base = Base
> = PopoverContentProps<E, B> & ContextMenuContentExtendProps;

export type ContextMenuTailProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> = PopoverTailProps<E, B> & ContextMenuTailExtendProps;

export type ContextMenuDividerProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> = DividerProps<E, B> & ContextMenuDividerExtendProps;

export type ContextMenuGroupProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> = ListGroupProps<E, B> & ContextMenuGroupExtendProps;

export type ContextMenuIndicatorProps = Pick<
	PopoverIndicatorProps,
	'class' | 'preset' | 'children'
>;

export type ContextMenuItemProps<
	E extends keyof HTMLElementTagNameMap = 'li',
	B extends Base = Base
> = DropdownMenuItemProps<E, B> & ContextMenuItemExtendProps;

export type ContextMenuTitleProps<
	E extends keyof HTMLElementTagNameMap = 'h3',
	B extends Base = Base
> = ListTitleProps<E, B> & ContextMenuTitleExtendProps;
