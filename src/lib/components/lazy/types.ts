import type { Component, Snippet } from 'svelte';
import type { HtmlAtomProps, SnippetProps } from '../atom';

// Lazy snippet props

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface LazySnippetProps extends SnippetProps {}

export type LazyChildren = Snippet<[LazySnippetProps]>;

export interface LazyProps extends HtmlAtomProps<'button', never> {
	promise: Promise<Component>;
	error?: Snippet<[error: unknown]>;
	loading?: Snippet;
}
