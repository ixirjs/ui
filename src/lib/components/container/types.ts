import type { Snippet } from 'svelte';
import type { HtmlAtomProps, SnippetProps } from '../atom';

// Container snippet props

export interface ContainerSnippetProps extends SnippetProps {
	clientWidth: number;
	clientHeight: number;
}

export type ContainerChildren = Snippet<[ContainerSnippetProps]>;

export interface ContainerProps extends HtmlAtomProps<'button', never, ContainerChildren> {
	type?: 'inline-size' | 'size';
	name?: string;
	clientWidth?: number;
	clientHeight?: number;
}
