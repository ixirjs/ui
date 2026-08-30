import type { Component, Snippet } from 'svelte';
import type { SnippetProps } from '$ixirjs/ui/authoring';

// Lazy snippet props

export interface LazySnippetProps extends SnippetProps {}

export type LazyChildren = Snippet;

// Svelte component prop interfaces do not require a string index signature.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LazyComponentProps = Record<string, any>;

export interface LazyOwnProps<Props extends LazyComponentProps> {
	/** Resolves to the component to render — typically a bare `import()`. */
	promise: Promise<Component<Props>>;
	/** Rendered when the import rejects. Give it `role="alert"`; a failed import is a real failure. */
	error?: Snippet<[error: unknown]>;
	/** Rendered while the import is in flight. Give it `role="status"` and reserve the final layout. */
	loading?: Snippet;
}

export type LazyProps<Props extends LazyComponentProps = Record<string, unknown>> = Omit<
	Props,
	keyof LazyOwnProps<Props>
> &
	LazyOwnProps<Props>;
