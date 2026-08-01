import type { EasingFunction } from 'svelte/transition';
import { prefersReducedMotion } from '$ixirjs/ui/utils/dom.svelte';
import type { TransitionFunction } from './types';

export type ScaleFadeParams = {
	// ms
	duration?: number;
	// ms
	delay?: number;
	easing?: EasingFunction;
};

// Scale + fade transition (scales and fades with `t`); instant when prefers-reduced-motion is set.
// Single source of truth for the scale/opacity indicator transitions (checkbox, radio, …).
export function scaleFade(params: ScaleFadeParams = {}): TransitionFunction<HTMLElement> {
	const { duration = 200, delay = 0, easing } = params;
	return () => {
		if (prefersReducedMotion()) {
			return { duration: 0, delay: 0, css: () => '' };
		}

		return {
			duration,
			delay,
			...(easing ? { easing } : {}),
			css: (t: number) => `transform: scale(${t}); opacity: ${t};`
		};
	};
}
