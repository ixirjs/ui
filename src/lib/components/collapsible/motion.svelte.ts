import { animate, type Easing } from '$ixirjs/ui/shared';
import { CollapsibleBond } from '.';
import { DURATION } from '$ixirjs/ui/shared';
import { stopMotion } from '$ixirjs/ui/components/element/motion-host';

export type AnimateCollapsibleBodyParams = {
	duration?: number;
	delay?: number;
	ease?: Easing | Easing[];
};

function animateCollapsibleBody(params: AnimateCollapsibleBodyParams = {}) {
	const bond = CollapsibleBond.get();
	return (node: HTMLElement) => {
		const { duration = DURATION.fast / 1000, delay = 0, ease } = params;

		const isOpen = bond?.isOpen ?? false;

		// Returning the controller lets whichever host drives this phase cancel a superseded run.
		// Phases here share one duration, so an interrupted run always settles before its successor
		// and cannot overwrite it — what this prevents is stacking a filled WAAPI animation on the
		// element for every toggle.
		return animate(
			node,
			{
				opacity: +isOpen,
				height: isOpen ? 'auto' : 0
			},
			{ duration, delay, ...(ease ? { ease } : {}) }
		);
	};
}

/**
 * Attachment form of the body motion, for parts whose only motion phases are `initial` + `animate`.
 *
 * An attachment reaches the element as a symbol-keyed prop, so this animate-only path needs no
 * HtmlElement motion driver.
 *
 * Mount runs `initial` and stops there. Both phases resolve the same disclosure state and so
 * target the same keyframe — running `update` as well animated the body from the state `initial`
 * had just committed to that identical state, invisibly, for the cost of a second `animate()` and
 * the style read that builds its "from" value. `initial` runs *tracked*, which is what subscribes
 * this attachment's effect to the disclosure state; every later run is the real transition.
 */
export function attachCollapsibleBodyMotion(params: AnimateCollapsibleBodyParams = {}) {
	const initial = animateCollapsibleBody({ ...params, duration: 0 });
	const update = animateCollapsibleBody(params);
	let hasInitialized = false;

	return (node: HTMLElement) => {
		const phase = hasInitialized ? update : initial;
		hasInitialized = true;
		const cleanup = phase(node);
		return () => stopMotion(cleanup, node);
	};
}
