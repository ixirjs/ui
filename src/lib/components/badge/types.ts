import type { HtmlAtomProps, SnippetProps } from '$svelte-atoms/core/components/atom';
import type { Snippet } from 'svelte';

// Badge snippet props

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface BadgeSnippetProps extends SnippetProps {
	// no context exposed to children yet; placeholder for extension
}

export type BadgeChildren = Snippet<[BadgeSnippetProps]>;

// Badge props

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
// Badge renders `children?.()` with no argument, so children is a plain Snippet.
// BadgeChildren/BadgeSnippetProps remain exported for consumers that want the typed shape.
export interface BadgeProps extends HtmlAtomProps<'span', never> {}
