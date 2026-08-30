import type { Snippet } from 'svelte';
import type { PlainPartProps } from '$ixirjs/ui/authoring';

export interface KbdExtendProps {}

export interface ShortcutExtendProps {}

// Both parts ARE their element — no `as`/`base`/motion; see `PlainPartProps`.
export interface KbdProps extends PlainPartProps<'kbd'>, KbdExtendProps {
	/** The key label to render inside the kbd element. */
	children?: Snippet<[]>;
}

export interface ShortcutProps extends PlainPartProps<'span'>, ShortcutExtendProps {
	/** Keys to render in sequence, e.g. `['⌘', 'K']` or `['Ctrl', 'Shift', 'P']`. */
	keys?: string[];
	// Separator between keys (default '+')
	/** Visual separator rendered between keys. */
	separator?: string;
	/** Custom content — when provided, keys and separator are ignored. */
	children?: Snippet<[]>;
}
