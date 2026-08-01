import { animate, type Easing } from 'motion';
import { TreeBond } from './bond.svelte';

export type AnimateTreeBodyParams = {
	duration?: number;
	delay?: number;
	ease?: Easing | Easing[];
};

export function animateTreeBody(params: AnimateTreeBodyParams = {}) {
	const bond = TreeBond.get();
	return (node: HTMLElement) => {
		const { delay = 0, duration = 0.1, ease } = params;
		const isOpen = bond?.state.props.open ?? false;

		animate(
			node,
			{
				height: +isOpen ? 'auto' : 0,
				opacity: +isOpen,
				pointerEvents: isOpen ? '' : 'none'
			},
			{ duration, delay, ...(ease ? { ease } : {}) }
		);
	};
}
