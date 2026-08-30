import { animate, DURATION, type Easing } from '$ixirjs/ui/authoring';
import { TreeContext } from './bond.svelte';
import { stopMotion } from '$ixirjs/ui/components/element/motion-host';

export type AnimateTreeBodyParams = {
	duration?: number;
	delay?: number;
	ease?: Easing | Easing[];
};

function animateTreeBody(params: AnimateTreeBodyParams = {}) {
	const bond = TreeContext.get();
	return (node: HTMLElement) => {
		const { delay = 0, duration = DURATION.normal / 1000, ease = 'circOut' } = params;
		const isOpen = bond?.isOpen ?? false;

		// Returning the controller lets the host cancel a superseded run instead of leaving another
		// filled WAAPI animation attached to the node on every toggle.
		return animate(
			node,
			{
				height: +isOpen ? 'auto' : 0,
				opacity: +isOpen,
				pointerEvents: isOpen ? '' : 'none'
			},
			{ duration, delay, ease }
		);
	};
}

/**
 * The body's `animate` driver, handed to `Kernel.element`'s `motion`.
 *
 * Mount runs `initial` and stops there — the same shape, and the same reason, as
 * `collapsible/motion.svelte.ts`. Both phases read one disclosure state and resolve to the same
 * keyframe, so a mount-time `update` animated the node from what `initial` had just committed to
 * that identical value. `initial` runs *tracked*, which is what subscribes this attachment to the
 * disclosure state; every later run is the real transition.
 */
export function attachTreeBodyMotion(params: AnimateTreeBodyParams = {}) {
	const initial = animateTreeBody({ ...params, duration: 0 });
	const update = animateTreeBody(params);
	let hasInitialized = false;

	return (node: HTMLElement) => {
		const phase = hasInitialized ? update : initial;
		hasInitialized = true;
		const controller = phase(node);
		return () => stopMotion(controller, node);
	};
}
