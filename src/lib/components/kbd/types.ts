import type { Snippet } from 'svelte';
import type { RenderProps } from '$ixirjs/ui/components/atom';

export interface KbdExtendProps {}

export interface ShortcutExtendProps {}

export interface KbdProps extends RenderProps<'kbd'>, KbdExtendProps {
	/** The key label to render inside the kbd element. */
	children?: Snippet<[]>;
}

export interface ShortcutProps extends RenderProps<'span'>, ShortcutExtendProps {
	/** Keys to render in sequence, e.g. `['⌘', 'K']` or `['Ctrl', 'Shift', 'P']`. */
	keys?: string[];
	// Separator between keys (default '+')
	/** Visual separator rendered between keys. */
	separator?: string;
	/** Custom content — when provided, keys and separator are ignored. */
	children?: Snippet<[]>;
}
