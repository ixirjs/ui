import type { HtmlAtomProps } from '$ixirjs/ui/components/atom/types';

// Button props — extend to override children snippet type in custom implementations.
export interface ButtonProps extends HtmlAtomProps<'button'> {
	type?: 'button' | 'submit' | 'reset';
}
