import type { HtmlAtomProps } from '$ixirjs/ui/components/atom';

export interface SwatchProps extends Omit<HtmlAtomProps<'span'>, 'as' | 'base' | 'children'> {
	color?: string | undefined;
}
