import type { RenderProps } from '$ixirjs/ui/authoring';

// Button props — extend to override children snippet type in custom implementations.
export interface ButtonProps extends RenderProps<'button'> {
	/** Button type attribute for form submission behavior */
	type?: 'button' | 'submit' | 'reset';
}
