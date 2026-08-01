import { isBrowser } from '$svelte-atoms/core/utils/dom.svelte';

// Reactive rune tracking a CSS media query. Returns { current: boolean }.
// Single source of truth for matchMedia-based runes (color scheme, reduced motion, …).
// SSR-safe: `current` is false until the browser effect runs (with an eager read when available).
export function mediaQuery(query: string) {
	let matches = $state<boolean>(false);

	// Eager synchronous read so `current` is correct before the first effect flush.
	if (isBrowser()) {
		try {
			matches = window.matchMedia(query).matches;
		} catch {
			// matchMedia unavailable (e.g. some test envs) — fall back to false.
		}
	}

	$effect(() => {
		if (!isBrowser()) return;

		const media = window.matchMedia(query);
		const handleChange = (ev: MediaQueryListEvent) => {
			matches = ev.matches;
		};

		media.addEventListener('change', handleChange);
		matches = media.matches;

		return () => {
			media.removeEventListener('change', handleChange);
		};
	});

	return {
		get current() {
			return matches;
		}
	};
}
