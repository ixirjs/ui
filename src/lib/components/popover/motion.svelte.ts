import { animate, spring } from 'motion';
import { untrack } from 'svelte';
import { PopoverBond } from '.';

export type AnimatePopoverContentParams = {
	// Animation duration in seconds (default: 0.2)
	duration?: number;
	// Delay before animation starts in seconds (default: 0)
	delay?: number;
	// Use spring physics for natural motion (default: false)
	spring?: boolean;
	// Spring stiffness (default: 300)
	stiffness?: number;
	// Spring damping (default: 30)
	damping?: number;
};

// Popover enter/exit animation: vertical scale (0.96→1), directional slide, fade.
// Adapts slide distance to offset and arrow presence; optionally uses spring physics.
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

		const isOpen = bond?.state.props.open ?? false;
		const position = bond?.state.position;

		if (!position) return;

		// Skip animation if open state hasn't changed
		if (isOpen === prevOpen) return;
		prevOpen = isOpen;

		requestAnimationFrame(() => {
			const placement = untrack(() => position.placement);
			const [side, alignment] = placement?.split('-') ?? ['bottom', ''];

			// Get offset and arrow configuration
			const offset = untrack(() => bond?.state.props.offset ?? 0);
			const hasArrow = untrack(() => bond?.state.props.arrow ?? false);

			// Calculate transform origin (anchor point relative to trigger)
			const transformOrigin = getTransformOrigin(side, alignment);

			// Calculate smart directional offset based on offset and arrow
			const slideDistance = getSmartSlideDistance(offset, hasArrow);
			const { x: offsetX, y: offsetY } = getDirectionalOffset(side, slideDistance);

			// Set initial styles
			node.style.transformOrigin = transformOrigin;
			node.style.pointerEvents = 'none';

			// Modern animation values
			const keyframes = {
				scaleY: isOpen ? [0.96, 1] : [1, 0.96],
				translateX: isOpen ? [`${offsetX}px`, '0px'] : ['0px', `${offsetX}px`],
				translateY: isOpen ? [`${offsetY}px`, '0px'] : ['0px', `${offsetY}px`],
				opacity: isOpen ? [0, 1] : [1, 0]
			};

			// Animate with spring or standard easing
			const animation = animate(
				node,
				keyframes,
				useSpring
					? { easing: spring({ stiffness, damping }), delay }
					: { duration, easing: [0.16, 1, 0.3, 1], delay } // Custom cubic-bezier for smooth motion
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

// Slide distance: 4px (flush/no-arrow), 6px (flush+arrow), min(offset/2,8) (gap/no-arrow), 8px (gap+arrow).
function getSmartSlideDistance(offset: number, hasArrow: boolean): number {
	if (offset === 0) {
		// Flush against trigger - use minimal slide
		return hasArrow ? 6 : 4;
	}

	if (hasArrow) {
		// With arrow, use standard 8px slide for consistent arrow reveal
		return 8;
	}

	// No arrow, offset > 0: Use proportional slide (max 8px)
	// This creates a subtle effect that scales with the gap
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
