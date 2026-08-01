// Rune that tracks prefers-reduced-motion. Returns { current: boolean }.
export function reducedMotion() {
	let prefersReduced = $state<boolean>(false);

	$effect(() => {
		if (typeof window === 'undefined') return;

		const handleChange = (ev: MediaQueryListEvent) => {
			prefersReduced = ev.matches;
		};

		const media = window.matchMedia('(prefers-reduced-motion: reduce)');
		media.addEventListener('change', handleChange);

		prefersReduced = media.matches;

		return () => {
			media.removeEventListener('change', handleChange);
		};
	});

	return {
		get current() {
			return prefersReduced;
		}
	};
}
