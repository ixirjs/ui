import type { Snippet } from 'svelte';
import type { HtmlAtomProps } from '$ixirjs/ui/components/atom';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface KbdExtendProps {}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface ShortcutExtendProps {}

export interface KbdProps extends HtmlAtomProps<'kbd'>, KbdExtendProps {
	children?: Snippet<[]>;
}

export interface ShortcutProps extends HtmlAtomProps<'span'>, ShortcutExtendProps {
	// Keys to render in sequence, e.g. ['⌘', 'K'] or ['Ctrl', 'Shift', 'P']
	keys?: string[];
	// Separator between keys (default '+')
	separator?: string;
	children?: Snippet<[]>;
}
