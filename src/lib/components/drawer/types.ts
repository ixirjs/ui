import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$svelte-atoms/core/components/atom';
import type { Override, Factory } from '$svelte-atoms/core/types';
import type { TransitionFunction } from '$svelte-atoms/core/components/element';
import type { PortalBond } from '$svelte-atoms/core/components/portal';
import type { DrawerBond } from './bond.svelte';

// Declaration-merge into these to add app-specific props per drawer part.
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DrawerExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DrawerContentExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DrawerHeaderExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DrawerBodyExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DrawerFooterExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DrawerTitleExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DrawerDescriptionExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DrawerBackdropExtendProps {}

// Snippet props
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
				enter?: (node: HTMLElement, bond: DrawerBond) => TransitionFunction<HTMLElement>;
				exit?: (node: HTMLElement, bond: DrawerBond) => TransitionFunction<HTMLElement>;
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
