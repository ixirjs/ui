import type { Snippet } from 'svelte';
import type { PlainPartProps, SnippetProps } from '$ixirjs/ui/authoring';

// Container snippet props

export interface ContainerSnippetProps extends SnippetProps {
	clientWidth: number;
	clientHeight: number;
}

export type ContainerChildren = Snippet<[ContainerSnippetProps]>;

// The container IS its `<div>` — no `as`/`base`/motion; see `PlainPartProps`.
export interface ContainerProps extends PlainPartProps<'div', ContainerChildren> {
	/** Containment axis. `inline-size` queries width only — the common case; `size` queries both axes and requires a fixed block size. */
	type?: 'inline-size' | 'size';
	/** Form field name, submitted with the form. */
	name?: string;
	/** Bound measured content width. Prefer a CSS `@container` rule where one will do; this is for the cases CSS cannot express. */
	clientWidth?: number;
	/** Bound measured content height. */
	clientHeight?: number;
}
