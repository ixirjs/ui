import type { RenderProps } from '$ixirjs/ui/components/atom';

export interface ImageProps extends RenderProps<'div'> {
	/** Image URL, forwarded to the underlying element. */
	src?: string | undefined;
	/** Alternative text. Required for meaningful images; pass `''` for a decorative one. */
	alt?: string | undefined;
}
