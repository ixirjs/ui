import { cubicOut, cubicIn } from 'svelte/easing';
import { scaleFade } from '../element';
import type { EasingFunction } from 'svelte/transition';
import type { TransitionFunction } from '../element';

export type AnimateRadioIndicatorParams = {
	// ms (default: 200 in, 150 out)
	duration?: number;
	// ms (default: 0)
	delay?: number;
	// default: cubicOut in, cubicIn out
	easing?: EasingFunction;
};

// Scale+fade-in for the radio indicator; instant if reduced-motion.
export function animateRadioIndicatorIn(
	params: AnimateRadioIndicatorParams = {}
): TransitionFunction<HTMLElement> {
	const { duration = 200, delay = 0, easing = cubicOut } = params;
	return scaleFade({ duration, delay, easing });
}

// Scale+fade-out for the radio indicator; instant if reduced-motion.
export function animateRadioIndicatorOut(
	params: AnimateRadioIndicatorParams = {}
): TransitionFunction<HTMLElement> {
	const { duration = 150, delay = 0, easing = cubicIn } = params;
	return scaleFade({ duration, delay, easing });
}
