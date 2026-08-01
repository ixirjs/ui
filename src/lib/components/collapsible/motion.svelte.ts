import { animate } from 'motion';
import { CollapsibleBond } from '.';
import { DURATION } from '$svelte-atoms/core/shared';

export type AnimateCollapsibleBodyParams = {
	duration?: number;
	delay?: number;
	ease?: string;
};

export function animateCollapsibleBody(params: AnimateCollapsibleBodyParams = {}) {
	const bond = CollapsibleBond.get();
	return (node: HTMLElement) => {
		const { duration = DURATION.fast / 1000, delay = 0, ease } = params;

		const isOpen = bond?.state.props.open ?? false;

		animate(
			node,
			{
				opacity: +isOpen,
				height: isOpen ? 'auto' : 0
			},
			{ duration, delay, ease }
		);
	};
}
