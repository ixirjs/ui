import type { RenderProps } from '$ixirjs/ui/components/atom';
import type { OmitKey } from '$ixirjs/ui/types';

export interface SwatchProps extends OmitKey<RenderProps<'span'>, 'as' | 'base' | 'children'> {
	/** Any valid CSS color string. Empty string or missing value shows the checkerboard only. */
	color?: string | undefined;
}
