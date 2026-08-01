import type { Component, Snippet } from 'svelte';
import type { SnippetProps } from '$ixirjs/ui/components/atom';

// Lazy snippet props

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LazySnippetProps extends SnippetProps {}

export type LazyChildren = Snippet;

// Svelte component prop interfaces do not require a string index signature.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type LazyComponentProps = Record<string, any>;

export interface LazyOwnProps<Props extends LazyComponentProps> {
	promise: Promise<Component<Props>>;
	error?: Snippet<[error: unknown]>;
	loading?: Snippet;
}

export type LazyProps<Props extends LazyComponentProps = Record<string, unknown>> = Omit<
	Props,
	keyof LazyOwnProps<Props>
> &
	LazyOwnProps<Props>;
