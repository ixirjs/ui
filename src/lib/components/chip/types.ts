import type { HtmlAtomProps, SnippetProps } from '$svelte-atoms/core/components/atom/types';
import type { Snippet } from 'svelte';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ChipSnippetProps extends SnippetProps {}

export type ChipChildren = Snippet<[ChipSnippetProps]>;

export interface ChipProps extends HtmlAtomProps<'div', never> {
	// Custom icon rendered inside the default close button.
	icon?: Snippet | undefined;
	// Fully replace the close button with a custom snippet.
	closeButton?: Snippet | undefined;
	// Called when the default close button is clicked.
	onclose?: ((ev: MouseEvent) => void) | undefined;
}

export interface ChipCloseButtonProps extends HtmlAtomProps<'button', never> {
	// Custom icon to render inside the close button.
	icon?: Snippet | undefined;
	onclick?: ((ev: MouseEvent) => void) | undefined;
}
