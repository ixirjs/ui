import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base, SnippetProps } from '$svelte-atoms/core/components/atom';
import type { PortalBond } from '$svelte-atoms/core/components/portal';
import type { DialogBond, DialogBondProps } from './bond.svelte';

export interface DialogSnippetProps extends SnippetProps {
	dialog: DialogBond;
}

export type DialogChildren = Snippet<[DialogSnippetProps]>;

export interface DialogProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DialogChildren> {
	open?: boolean;
	disabled?: boolean;
	// 'modal' closes on backdrop click (default); 'non-modal' keeps it open.
	type?: 'modal' | 'non-modal' | undefined;
	portal?: string | PortalBond;
	factory?: (props: DialogBondProps) => DialogBond;
	onclick?: (ev: MouseEvent, bond: DialogBond) => void;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DialogContentProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DialogChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DialogHeaderProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DialogChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DialogBodyProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DialogChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DialogFooterProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DialogChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DialogTitleProps<
	E extends keyof HTMLElementTagNameMap = 'h2',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DialogChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DialogDescriptionProps<
	E extends keyof HTMLElementTagNameMap = 'p',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DialogChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface DialogCloseButtonProps<
	E extends keyof HTMLElementTagNameMap = 'button',
	B extends Base = Base
> extends HtmlAtomProps<E, B, DialogChildren> {}
