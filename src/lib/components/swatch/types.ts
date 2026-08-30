import type { PlainPartProps } from '$ixirjs/ui/authoring';
import type { OmitKey } from '$ixirjs/ui/types';

export interface SwatchProps extends OmitKey<PlainPartProps<'span'>, 'children'> {
	/** Any valid CSS color string. Empty string or missing value shows the checkerboard only. */
	color?: string | undefined;
}
