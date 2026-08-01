import { animate } from '$ixirjs/ui/shared';
import { untrack } from 'svelte';
import { getPopoverPosition, PopoverBond } from './bond.svelte';

export type AnimatePopoverContentParams = {
	// Animation duration in seconds (default: 0.05)
	duration?: number;
	// Delay before animation starts in seconds (default: 0)
	delay?: number;
	// Use spring-like timing for natural motion (default: false)
	spring?: boolean;
	// Spring-like stiffness hint (default: 300)
	stiffness?: number;
	// Spring-like damping hint (default: 30)
	damping?: number;
};

// Popover enter/exit animation: vertical scale (0.96→1), directional slide, fade.
// Adapts slide distance to offset and tail presence; optionally uses spring-like timing.
export function animatePopoverContent(params: AnimatePopoverContentParams = {}) {
	let prevOpen: boolean | undefined;

	const bond = PopoverBond.get();

	return (node: HTMLElement) => {
		const {
			duration = 0.05,
			delay = 0,
			spring: useSpring = false,
			stiffness = 300,
			damping = 30
		} = params;

		const isOpen = bond?.props.open ?? false;
		const position = bond ? getPopoverPosition(bond) : undefined;

		if (!position) return;

		// Skip animation if open state hasn't changed
		if (isOpen === prevOpen) return;
		if (prevOpen === undefined && !isOpen) {
			prevOpen = isOpen;
			return;
		}
		prevOpen = isOpen;

		requestAnimationFrame(() => {
			const placement = untrack(() => position.placement);
			const [side = 'bottom', alignment = ''] = placement?.split('-') ?? ['bottom', ''];

			const offset = untrack(() => bond?.props.offset ?? 0);
			const hasTail = untrack(() => Boolean(bond?.nodeByPart('tail')));

			const transformOrigin = getTransformOrigin(side, alignment);

			const slideDistance = getSmartSlideDistance(offset, hasTail);
			const { x: offsetX, y: offsetY } = getDirectionalOffset(side, slideDistance);

			node.style.transformOrigin = transformOrigin;
			node.style.pointerEvents = 'none';

			const keyframes = {
				scaleY: isOpen ? [0.96, 1] : [1, 0.96],
				translateX: isOpen ? [`${offsetX}px`, '0px'] : ['0px', `${offsetX}px`],
				translateY: isOpen ? [`${offsetY}px`, '0px'] : ['0px', `${offsetY}px`],
				opacity: isOpen ? [0, 1] : [1, 0]
			};

			const animation = animate(
				node,
				keyframes,
				useSpring
					? { type: 'spring' as const, stiffness, damping, delay }
					: { duration, ease: [0.16, 1, 0.3, 1] as const, delay }
			);

			animation.finished.then(() => {
				node.style.pointerEvents = 'auto';
			});
		});
	};
}

// Returns transform-origin anchored to the trigger side for the given placement.
function getTransformOrigin(side: string, alignment: string): string {
	const horizontal = (() => {
		if (side === 'top' || side === 'bottom') {
			if (alignment === 'start') return 'left';
			if (alignment === 'end') return 'right';
			return 'center';
		}
		return side === 'left' ? 'right' : side === 'right' ? 'left' : 'center';
	})();

	const vertical = (() => {
		if (side === 'left' || side === 'right') {
			if (alignment === 'start') return 'top';
			if (alignment === 'end') return 'bottom';
			return 'center';
		}
		return side === 'top' ? 'bottom' : side === 'bottom' ? 'top' : 'center';
	})();

	return `${horizontal} ${vertical}`;
}

// Slide distance: 4px (flush/no-tail), 6px (flush+tail), min(offset/2,8) (gap/no-tail), 8px (gap+tail).
function getSmartSlideDistance(offset: number, hasTail: boolean): number {
	if (offset === 0) {
		return hasTail ? 6 : 4;
	}

	if (hasTail) {
		return 8;
	}

	// No tail, gap > 0: proportional slide that scales with the gap (max 8px).
	return Math.min(offset / 2, 8);
}

// Maps placement side to {x,y} slide vector.
function getDirectionalOffset(side: string, distance: number): { x: number; y: number } {
	switch (side) {
		case 'top':
			return { x: 0, y: distance };
		case 'bottom':
			return { x: 0, y: -distance };
		case 'left':
			return { x: distance, y: 0 };
		case 'right':
			return { x: -distance, y: 0 };
		default:
			return { x: 0, y: -distance };
	}
}
