import { DURATION } from '$ixirjs/ui/shared';
import { animate, type Easing } from '$ixirjs/ui/shared';

export type EnterAccordionItemBodyParams = {
	duration?: number;
	delay?: number;
	ease?: Easing | Easing[];
};

export function enterAccordionItemBody(params: EnterAccordionItemBodyParams = {}) {
	return (node: HTMLElement) => {
		const { duration = DURATION.normal / 1000, delay = 0, ease = 'linear' } = params;

		animate(
			node,
			{
				opacity: [0, 1],
				height: 'auto'
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
