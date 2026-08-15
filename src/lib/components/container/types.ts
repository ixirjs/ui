import type { Snippet } from 'svelte';
import type { RenderProps, SnippetProps } from '$ixirjs/ui/components/atom';

// Container snippet props

export interface ContainerSnippetProps extends SnippetProps {
	clientWidth: number;
	clientHeight: number;
}

export type ContainerChildren = Snippet<[ContainerSnippetProps]>;

export interface ContainerProps extends RenderProps<'div', never, ContainerChildren> {
	/** Containment axis. `inline-size` queries width only — the common case; `size` queries both axes and requires a fixed block size. */
	type?: 'inline-size' | 'size';
	/** Form field name, submitted with the form. */
	name?: string;
	/** Bound measured content width. Prefer a CSS `@container` rule where one will do; this is for the cases CSS cannot express. */
	clientWidth?: number;
	/** Bound measured content height. */
	clientHeight?: number;
}
