import type { PlainPartProps, SnippetProps } from '$ixirjs/ui/authoring';
import type { Snippet } from 'svelte';

// Badge snippet props

export interface BadgeSnippetProps extends SnippetProps {
	// no context exposed to children yet; placeholder for extension
}

export type BadgeChildren = Snippet<[BadgeSnippetProps]>;

// Badge props

// Badge renders `children?.()` with no argument, so children is a plain Snippet.
// BadgeChildren/BadgeSnippetProps remain exported for consumers that want the typed shape.
// The badge IS its `<span>` — no `as`/`base`/motion; see `PlainPartProps`.
export interface BadgeProps extends PlainPartProps<'span'> {}
