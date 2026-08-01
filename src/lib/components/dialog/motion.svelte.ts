import { DURATION } from '$svelte-atoms/core/shared';
import { animate, easeInOut } from 'motion';
import { DialogBond } from './bond.svelte';

type AnimateDialogContentParams = {
	duration?: number;
	delay?: number;
	ease?: string;
};

export function animateDialogContent(params: AnimateDialogContentParams = {}) {
	const { duration = DURATION.fast / 1000, delay = 0, ease = easeInOut } = params;

	let mounted = false;

	return (node: HTMLElement) => {
		// Read bond inside the callback so it works outside component init
		const bond = DialogBond.get();

		const isOpen = bond?.state.props.open ?? false;

		if (isOpen) {
			const rootElement = bond?.elements.root;
			if (rootElement instanceof HTMLDialogElement) {
				rootElement.show();
			}
		}

		const triggerElement = bond?.elements.trigger;

		if (triggerElement) {
			node.style.transform = '';

			const triggerRect = triggerElement.getBoundingClientRect();
			const nodeRect = node.getBoundingClientRect();

			const scaleX = triggerRect.width / nodeRect.width;
			const scaleY = triggerRect.height / nodeRect.height;

			const x = triggerRect.x - nodeRect.x;
			const y = triggerRect.y - nodeRect.y;

			const transformOriginX = triggerRect.x < nodeRect.x + nodeRect.width / 2 ? 'left' : 'right';

			node.style.transformOrigin = `${transformOriginX} top`;

			animate(
				node,
				{
					scaleX: isOpen ? [scaleX, 1] : [1, scaleX],
					scaleY: isOpen ? [scaleY, 1] : [1, scaleY],
					translateX: isOpen ? [`${x}px`, '0px'] : ['0px', `${x}px`],
					translateY: isOpen ? [`${y}px`, '0px'] : ['0px', `${y}px`],
					opacity: +isOpen
				},
				{
					duration: duration * +mounted,
					easing: ease,
					delay
				}
			);

			mounted = true;
		} else {
			animate(
				node,
				{ scale: 0.9 + 0.1 * +isOpen, opacity: +isOpen },
				{
					duration,
					easing: ease,
					delay
				}
			);
		}
	};
}
