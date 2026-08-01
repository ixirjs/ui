import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$svelte-atoms/core/components/atom';
import type { Factory } from '$svelte-atoms/core/types';
import type { PortalBond, ZIndexInput } from '$svelte-atoms/core/components/portal';
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

// Plain `extends` (not `Override<...>`): an Omit-based Override over HtmlAtomProps' `[key: string]:
// unknown` index signature collapses every un-overridden named prop (children, fallback, …) to
// `unknown`. The transition hooks (initial/enter/exit) are the standard 1-arg element signatures —
// the drawer's animation comes from `fallback`/`animateDrawerRoot`, and they forward to <Teleport>.
export interface SlideoverRootProps<E extends keyof HTMLElementTagNameMap, B extends Base = Base>
	extends HtmlAtomProps<E, B, DrawerChildren>, DrawerExtendProps {
	'z-index'?: ZIndexInput;
	open?: boolean;
	disabled?: boolean;
	side?: 'left' | 'right' | 'top' | 'bottom';
	position?: 'absolute' | 'fixed';
	portal?: string | PortalBond;
	onclose?: ((event: Event, bond: DrawerBond) => void) | undefined;
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
