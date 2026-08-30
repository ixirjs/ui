import type { PlainPartProps } from '$ixirjs/ui/authoring';

// The image frame IS its `<div>` — no `as`/`base`/motion; see `PlainPartProps`.
export interface ImageProps extends PlainPartProps<'div'> {
	/** Image URL, forwarded to the underlying element. */
	src?: string | undefined;
	/** Alternative text. Required for meaningful images; pass `''` for a decorative one. */
	alt?: string | undefined;
}
