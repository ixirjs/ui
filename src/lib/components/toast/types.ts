import type { Snippet } from 'svelte';
import type { RenderProps, Base, HtmlElementTagName } from '$ixirjs/ui/authoring';
import type { ToastBond, ToastBondProps } from './bond.svelte';
import type { StateChangeCallback } from '$ixirjs/ui/types';

// Snippet props
export interface ToastSnippetProps {
	toast: ToastBond | undefined;
}

export type ToastChildren = Snippet<[ToastSnippetProps]>;

export interface ToastRootProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, ToastChildren> {
	/**
	 * Controls visibility. Bindable.
	 * @default true
	 */
	open?: boolean;
	/**
	 * Disables interaction and prevents the toast from opening.
	 * @default false
	 */
	disabled?: boolean;
	/** Hint for presets to show or hide a close affordance. */
	dismissible?: boolean;
	// Auto-dismiss duration in ms. Set to 0 to disable. Default: 0.
	/**
	 * Auto-dismiss delay in milliseconds. Set to 0 to disable auto-dismiss.
	 * @default 0
	 */
	duration?: number;
	/** Native close event handler for the rendered element. */
	onclose?: ((event: Event) => void) | undefined;
	/** Called after a real open-state transition commits; close reasons are included when available. */
	onopenchange?: StateChangeCallback<boolean, ToastBond> | undefined;
	// Optional factory to construct a custom bond.
	/** Optional factory to supply a custom bond instance. */
	factory?: (props: ToastBondProps) => ToastBond;
}

export interface ToastTitleProps<
	E extends HtmlElementTagName = 'p',
	B extends Base = Base
> extends RenderProps<E, B, ToastChildren> {
	/** Additional click handler. Call ev.preventDefault() to suppress the built-in close behavior. */
	onclick?: ((ev: MouseEvent) => void) | undefined;
}

export interface ToastDescriptionProps<
	E extends HtmlElementTagName = 'p',
	B extends Base = Base
> extends RenderProps<E, B, ToastChildren> {}

export interface ToastCloseProps<
	E extends HtmlElementTagName = 'button',
	B extends Base = Base
> extends RenderProps<E, B, ToastChildren> {
	/** Native click event. */
	onclick?: ((event: MouseEvent) => void) | undefined;
	/** Native keydown event. */
	onkeydown?: ((event: KeyboardEvent) => void) | undefined;
}
