import { MediaQuery } from 'svelte/reactivity';

export type ColorScheme = 'light' | 'dark';

// Rune that tracks the OS color scheme. Returns { current: ColorScheme }.
export function colorScheme() {
	const dark = new MediaQuery('prefers-color-scheme: dark');

	return {
		get current(): ColorScheme {
			return dark.current ? 'dark' : 'light';
		}
	};
}
