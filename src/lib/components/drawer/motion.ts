import { animate, type Easing } from 'motion';
import { DrawerBond } from '.';
import { untrack } from 'svelte';

export type DrawerSide = 'left' | 'right' | 'top' | 'bottom';

type EasingOption = Easing | Easing[];

type AnimateDrawerContentParams = {
	// seconds
	duration?: number;
	// seconds
	delay?: number;
	easeOpen?: EasingOption;
	easeClose?: EasingOption;
	// overrides easeOpen/easeClose for both directions
	ease?: EasingOption;
	spring?: boolean;
	stiffness?: number;
	damping?: number;
	// disable pointer events during animation
	inert?: boolean;
};

// Drawer content animation: directional slide from edge + opacity fade. Auto-reads side from bond; optional spring physics.
export function animateDrawerContent(params: AnimateDrawerContentParams = {}) {
	const {
		duration = 0.3,
		delay = 0,
		ease,
		easeOpen = [0.16, 1, 0.3, 1], // smooth deceleration
		easeClose = [0.4, 0, 0.6, 1], // quick acceleration out
		spring: useSpring = false,
		stiffness = 280,
		damping = 28,
		inert = true
	} = params;

	const bond = untrack(() => DrawerBond.get());

	// side is set in Drawer.Root
	const side = bond?.state.props.side ?? 'right';

	const position = getSidePosition(side);
	const hidden = getHiddenTransform(side);

	let animated = false;

	return (node: HTMLElement) => {
		const isOpen = bond?.state.props.open ?? false;

		// Apply hidden state before any animation to prevent FOUC.
		if (!animated) {
			node.style.transform = `translate(${hidden.x}, ${hidden.y})`;
			node.style.opacity = '0.3';
			Object.assign(node.style, position);
		}

		if (inert) {
			node.style.pointerEvents = 'none';
		}

		let controller: ReturnType<typeof animate>;

		// Initial mount in closed state: settle without animating.
		if (!animated && !isOpen) {
			controller = animate(
				node,
				{
					x: hidden.x,
					y: hidden.y,
					opacity: 0.3,
					...position
				},
				{
					duration: 0,
					onComplete: () => {
						if (inert) node.style.pointerEvents = 'auto';
					}
				}
			);
			animated = true;
		} else {
			const resolvedEase = ease ?? (isOpen ? easeOpen : easeClose);

			const keyframes = {
				x: isOpen ? '0%' : hidden.x,
				y: isOpen ? '0%' : hidden.y,
				opacity: isOpen ? 1 : 0.3,
				...position
			};

			const animationOptions = useSpring
				? { type: 'spring' as const, stiffness, damping, delay }
				: { duration, ease: resolvedEase, delay };

			controller = animate(node, keyframes, {
				...animationOptions,
				onComplete: () => {
					if (inert) {
						node.style.pointerEvents = isOpen ? 'auto' : 'none';
					}
				}
			});
		}

		return () => {
			controller?.stop();
			if (inert) node.style.pointerEvents = 'auto';
		};
	};
}

// Returns offscreen translate values per side (e.g. left → -100% x).
function getHiddenTransform(side: DrawerSide): { x: string; y: string } {
	switch (side) {
		case 'left':
			return { x: '-100%', y: '0%' };
		case 'right':
			return { x: '100%', y: '0%' };
		case 'top':
			return { x: '0%', y: '-100%' };
		case 'bottom':
			return { x: '0%', y: '100%' };
	}
}

// Returns CSS positioning properties to anchor the panel to its side.
function getSidePosition(
	side: DrawerSide
): Partial<Record<'top' | 'bottom' | 'left' | 'right' | 'height' | 'width', string>> {
	switch (side) {
		case 'left':
			return { top: '0', bottom: '0', left: '0', right: 'unset' };
		case 'right':
			return { top: '0', bottom: '0', right: '0', left: 'unset' };
		case 'top':
			return { top: '0', left: '0', right: '0', bottom: 'unset' };
		case 'bottom':
			return { bottom: '0', left: '0', right: '0', top: 'unset' };
	}
}

type AnimateDrawerRootParams = {
	// seconds
	duration?: number;
	// seconds
	delay?: number;
	ease?: EasingOption;
};

// Fades the drawer backdrop in/out when drawer opens/closes.
export function animateDrawerRoot(params: AnimateDrawerRootParams = {}) {
	const { duration = 0.3, delay = 0, ease = [0.16, 1, 0.3, 1] } = params;

	return (node: HTMLElement) => {
		const bond = DrawerBond.get();
		const isOpen = bond?.state.props.open ?? false;

		animate(node, { opacity: +isOpen }, { duration, ease, delay });
	};
}
