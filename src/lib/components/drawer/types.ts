import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$svelte-atoms/core/components/atom';
import type { Override, Factory } from '$svelte-atoms/core/types';
import type { TransitionFunction } from '$svelte-atoms/core/components/element';
import type { PortalBond } from '$svelte-atoms/core/components/portal';
import type { DrawerBond } from './bond.svelte';

// Extend to add custom drawer root properties in your application.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DrawerExtendProps {}

// Extend to add custom drawer content properties in your application.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DrawerContentExtendProps {}

// Extend to add custom drawer header properties in your application.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DrawerHeaderExtendProps {}

// Extend to add custom drawer body properties in your application.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DrawerBodyExtendProps {}

// Extend to add custom drawer footer properties in your application.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DrawerFooterExtendProps {}

// Extend to add custom drawer title properties in your application.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DrawerTitleExtendProps {}

// Extend to add custom drawer description properties in your application.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DrawerDescriptionExtendProps {}

// Extend to add custom drawer backdrop properties in your application.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DrawerBackdropExtendProps {}

// ============================================================================
// Drawer Snippet Props (Extensible)
// ============================================================================

export interface DrawerSnippetProps extends SnippetProps {
	drawer: DrawerBond;
}

export type DrawerChildren = Snippet<[DrawerSnippetProps]>;

export interface SlideoverRootProps<E extends keyof HTMLElementTagNameMap, B extends Base = Base>
	extends
		Override<
			HtmlAtomProps<E, B, DrawerChildren>,
			{
				initial?: (node: HTMLElement, bond: DrawerBond) => void;
				enter?: (node: HTMLElement, bond: DrawerBond) => TransitionFunction<'dialog'>;
				exit?: (node: HTMLElement, bond: DrawerBond) => TransitionFunction<'dialog'>;
			}
		>,
		DrawerExtendProps {
	'z-index'?: number;
	open?: boolean;
	disabled?: boolean;
	side?: 'left' | 'right' | 'top' | 'bottom';
	portal?: string | PortalBond;
	onclose?: (event: Event, bond: DrawerBond) => void;
	factory?: Factory<DrawerBond>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SlideoverContentProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DrawerChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SlideoverHeaderProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DrawerChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DrawerBodyProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DrawerChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SlideoverFooterProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DrawerChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SlideoverTitleProps<
	E extends keyof HTMLElementTagNameMap = 'h2',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DrawerChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SlideoverDescriptionProps<
	E extends keyof HTMLElementTagNameMap = 'p',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DrawerChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface SlideoverBackdropProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DrawerChildren> {}
