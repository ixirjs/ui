import type { TransitionConfig, EasingFunction } from 'svelte/transition';

// Structural shape of the bits of a GSAP Tween we read — avoids a hard dependency on
// the `gsap` ambient namespace (gsap is not a direct dependency of this package).
export interface GsapTweenLike {
	vars: { ease?: EasingFunction | string };
	delay(): number;
	duration(): number;
}

export function toTransitionConfig(tween: GsapTweenLike): TransitionConfig {
	const ease = tween.vars.ease;

	return {
		delay: tween.delay() * 1000,
		duration: tween.duration() * 1000,
		// Only set `easing` when it's a function — omitting it satisfies exactOptionalPropertyTypes.
		...(typeof ease === 'function' ? { easing: ease } : {})
	};
}
