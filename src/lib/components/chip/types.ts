import type { RenderProps, SnippetProps } from '$ixirjs/ui/components/atom/types';
import type { Snippet } from 'svelte';

export interface ChipSnippetProps extends SnippetProps {}

export type ChipChildren = Snippet<[ChipSnippetProps]>;

export interface ChipProps extends RenderProps<'div', never> {
	// Custom icon rendered inside the default close button.
	/** Custom icon rendered inside the default close button (replaces the default ✕). */
	icon?: Snippet | undefined;
	// Fully replace the close button with a custom snippet.
	/** Fully replace the close button with a custom snippet. When set, `ondismiss`/`icon` no longer apply. */
	closeButton?: Snippet | undefined;
	// Called when the default close button is clicked.
	//
	// `ondismiss`, not `onclose`: the latter collides with the DOM `close` event that
	// `HTMLAttributes` declares, which forced the parameter to widen to `Event` to stay assignable.
	// `dismiss` is the library's own term for this (see the `dismissible-surface` capability and
	// `DismissPressEvent`), it does not shadow a DOM event, and it keeps `MouseEvent` precision.
	/** Called when the default close button is clicked. */
	ondismiss?: ((ev: MouseEvent) => void) | undefined;
}

export interface ChipCloseButtonProps extends RenderProps<'button', never> {
	// Custom icon to render inside the close button.
	/** Custom icon to render inside the close button. */
	icon?: Snippet | undefined;
	/** Click handler for the close button. */
	onclick?: ((ev: MouseEvent) => void) | undefined;
}
