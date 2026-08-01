import type { Snippet } from 'svelte';
import type { HtmlAtomProps, Base } from '$ixirjs/ui/components/atom';
import type { ToastBond, ToastBondProps } from './bond.svelte';
import type { StateChangeCallback } from '$ixirjs/ui/types';

// Snippet props
export interface ToastSnippetProps {
	toast: ToastBond | undefined;
}

export type ToastChildren = Snippet<[ToastSnippetProps]>;

export interface ToastRootProps<
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, ToastChildren> {
	open?: boolean;
	disabled?: boolean;
	dismissible?: boolean;
	// Auto-dismiss duration in ms. Set to 0 to disable. Default: 0.
	duration?: number;
	/** Native close event handler for the rendered element. */
	onclose?: ((event: Event) => void) | undefined;
	onopenchange?: StateChangeCallback<boolean, ToastBond> | undefined;
	// Optional factory to construct a custom bond.
	factory?: (props: ToastBondProps) => ToastBond;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ToastTitleProps<
	E extends keyof HTMLElementTagNameMap = 'p',
	B extends Base = Base
> extends HtmlAtomProps<E, B, ToastChildren> {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ToastDescriptionProps<
	E extends keyof HTMLElementTagNameMap = 'p',
	B extends Base = Base
> extends HtmlAtomProps<E, B, ToastChildren> {}

export interface ToastCloseProps<
	E extends keyof HTMLElementTagNameMap = 'button',
	B extends Base = Base
> extends HtmlAtomProps<E, B, ToastChildren> {
	onclick?: ((event: MouseEvent) => void) | undefined;
	onkeydown?: ((event: KeyboardEvent) => void) | undefined;
}
