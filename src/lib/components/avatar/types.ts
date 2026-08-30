import type { Component } from 'svelte';
import type { PlainPartProps } from '$ixirjs/ui/authoring';

// The avatar IS its `<div>` — no `as`/`base`/motion; see `PlainPartProps`.
export interface AvatarProps extends PlainPartProps<'div'> {
	/** Image URL or a Svelte component to render as the avatar image */
	src?: string | Component;
	/** Alt text for the image. Also used to generate fallback initials when no image is set. */
	alt?: string;
	/** Bindable reference to the underlying DOM element */
	readonly element?: HTMLElement;
}
