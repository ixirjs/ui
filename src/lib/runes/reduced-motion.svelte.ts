import { mediaQuery } from './media-query.svelte';

// Rune that tracks prefers-reduced-motion. Returns { current: boolean }.
export function reducedMotion() {
	return mediaQuery('(prefers-reduced-motion: reduce)');
}
