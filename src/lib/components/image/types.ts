import type { HtmlAtomProps } from '$ixirjs/ui/components/atom';

export interface ImageProps extends HtmlAtomProps<'div'> {
	src?: string | undefined;
	alt?: string | undefined;
}
