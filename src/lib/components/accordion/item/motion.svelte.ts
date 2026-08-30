import { DURATION } from '$ixirjs/ui/authoring';
import { animate, type Easing } from '$ixirjs/ui/authoring';

export type EnterAccordionItemBodyParams = {
	duration?: number;
	delay?: number;
	ease?: Easing | Easing[];
	/**
	 * Whether the owning Bond has finished mounting — `() => bond.isSettled`. While it has not, the
	 * body was open at mount and the enter resolves instantly: final styles applied, no measurement,
	 * no WAAPI animation. A panel the user opens later animates as before.
	 */
	settled?: () => boolean;
};

export function enterAccordionItemBody(params: EnterAccordionItemBodyParams = {}) {
	return (node: HTMLElement) => {
		const instant = params.settled !== undefined && !params.settled();
		const { duration: animated = DURATION.normal / 1000, delay = 0, ease = 'linear' } = params;
		const duration = instant ? 0 : animated;

		// Both keyframes named, so `animate` never asks the DOM for the from-value: a single `'auto'`
		// makes it read `getComputedStyle().height` first, a second forced style flush per body on top
		// of the `auto` measurement, and every OPEN body plays this on a client mount. The base class
		// is `h-0`, so the from-value is known. perf-vs-shadcn-2026-08.md §15.
		animate(
			node,
			{
				opacity: [0, 1],
				height: [0, 'auto']
			},
			{
				duration,
				delay,
				ease
			}
		);

		return { duration: duration * 1000, delay: delay * 1000 };
	};
}

export type ExitAccordionItemBodyParams = EnterAccordionItemBodyParams;

export function exitAccordionItemBody(params: ExitAccordionItemBodyParams = {}) {
	return (node: HTMLElement) => {
		const { duration = DURATION.normal / 1000, delay = 0.1, ease = 'linear' } = params;

		animate(
			node,
			{
				opacity: [1, 0],
				height: 0
			},
			{
				duration,
				delay,
				ease
			}
		);

		return { duration: duration * 1000, delay: delay * 1000 };
	};
}
