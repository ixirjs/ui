import { cubicIn } from 'svelte/easing';
import { scaleFade } from '../element';
import type { EasingFunction } from 'svelte/transition';
import type { TransitionFunction } from '../element';

export type AnimateCheckboxIndicatorParams = {
	// ms
	duration?: number;
	// ms (default: 0)
	delay?: number;
	// default: cubicIn
	easing?: EasingFunction;
};

// Scale + fade transition for the checkbox indicator; instant when prefers-reduced-motion is set.
export function animateCheckboxIndicator(
	params: AnimateCheckboxIndicatorParams = {}
): TransitionFunction<HTMLElement> {
	const { duration = 100, delay = 0, easing = cubicIn } = params;
	return scaleFade({ duration, delay, easing });
}
