import { mediaQuery } from './media-query.svelte';

export type ColorScheme = 'light' | 'dark';

// Rune that tracks the OS color scheme. Returns { current: ColorScheme }.
export function colorScheme() {
	const dark = mediaQuery('(prefers-color-scheme: dark)');

	return {
		get current(): ColorScheme {
			return dark.current ? 'dark' : 'light';
		}
	};
}
