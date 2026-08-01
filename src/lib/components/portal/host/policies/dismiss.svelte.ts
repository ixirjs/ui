import { on } from 'svelte/events';
import {
	definePolicyCapability,
	sharedCapabilityKey,
	type Capability
} from '$svelte-atoms/core/shared/bond';
import { containsTarget, isBrowser } from '$svelte-atoms/core/utils/dom.svelte';
import type { OverlayView } from '../types';
import { isTopOverlay } from './escape-stack.svelte';
import { closeOverlay, overlayIsDisabled, overlayIsOpen } from './overlay-view';

export const OUTSIDE_PRESS = sharedCapabilityKey<OutsidePressSurface>(
	'@svelte-atoms/cap:outside-press'
);
export const BACKDROP_PRESS = sharedCapabilityKey<BackdropPressHandler>(
	'@svelte-atoms/cap:backdrop-press'
);

export type DismissPressEvent = MouseEvent | PointerEvent;
export type DismissRole = 'content' | 'trigger' | 'surface' | 'backdrop';

export type DismissHandlerOptions = {
	enabled?: boolean;
	stack?: boolean;
	roles?: readonly DismissRole[];
	onDismiss?: (ev: DismissPressEvent, bond: OverlayView) => void;
};

export type OutsidePressOptions = DismissHandlerOptions & {
	event?: 'click' | 'pointerdown' | 'mousedown';
	listen?: boolean;
};

export type OutsidePressSurface = {
	configure(options: DismissHandlerOptions): () => void;
	handle(bond: OverlayView, ev: DismissPressEvent, options?: DismissHandlerOptions): void;
};

export type BackdropPressHandler = (
	bond: OverlayView,
	ev: DismissPressEvent,
	options?: DismissHandlerOptions
) => void;

export function outsidePressPolicy(
	options: OutsidePressOptions = {}
): Capability<OutsidePressSurface> {
	let runtime: DismissHandlerOptions = {};

	const surface: OutsidePressSurface = {
		configure(next) {
			runtime = { ...runtime, ...next };
			return () => {
				for (const key of Object.keys(next) as (keyof DismissHandlerOptions)[]) {
					if (Object.is(runtime[key], next[key])) {
						delete runtime[key];
					}
				}
			};
		},
		handle(bond, ev, next = {}) {
			handleOutsidePress(bond, ev, { ...options, ...runtime, ...next });
		}
	};

	return definePolicyCapability<OutsidePressSurface>({
		slot: OUTSIDE_PRESS,
		surface,
		meta: {
			projects: [],
			docs: 'Outside-press dismissal policy with overlay stack coordination.'
		},
		setup: (bond) => {
			if (options.listen === false) return;
			useOutsidePressDismiss(bond as OverlayView, surface, options);
		}
	});
}

export function backdropPressPolicy(
	options: DismissHandlerOptions = {}
): Capability<BackdropPressHandler> {
	const surface: BackdropPressHandler = (bond, ev, next = {}) => {
		handleBackdropPress(bond, ev, { ...options, ...next });
	};

	return definePolicyCapability<BackdropPressHandler>({
		slot: BACKDROP_PRESS,
		surface,
		meta: {
			projects: ['backdrop'],
			docs: 'Backdrop-press dismissal policy with overlay stack coordination.'
		},
		roles: {
			backdrop: () => ({
				handlers: (bond) => ({
					onclick: ((ev: DismissPressEvent) => {
						surface(bond as OverlayView, ev);
					}) as (ev: Event) => void
				})
			})
		}
	});
}

export const outsidePressDismiss = outsidePressPolicy;
export const backdropPressDismiss = backdropPressPolicy;

export function handleOutsidePress(
	bond: OverlayView,
	ev: DismissPressEvent,
	options: DismissHandlerOptions = {}
): void {
	if (isInsideAnyRole(bond, ev.target, options.roles ?? ['content', 'trigger'])) return;
	dismissFromPress(bond, ev, options);
}

export function handleBackdropPress(
	bond: OverlayView,
	ev: DismissPressEvent,
	options: DismissHandlerOptions = {}
): void {
	if (isInsideAnyRole(bond, ev.target, options.roles ?? ['content'])) return;
	dismissFromPress(bond, ev, options);
}

function useOutsidePressDismiss(
	bond: OverlayView,
	surface: OutsidePressSurface,
	options: OutsidePressOptions
): void {
	$effect(() => {
		if (!isBrowser()) return;
		if (options.enabled === false) return;
		if (!overlayIsOpen(bond)) return;

		return on(
			window,
			options.event ?? 'pointerdown',
			(ev) => {
				surface.handle(bond, ev as DismissPressEvent);
			},
			{ capture: true }
		);
	});
}

function dismissFromPress(
	bond: OverlayView,
	ev: DismissPressEvent,
	options: DismissHandlerOptions
): void {
	if (options.enabled === false) return;
	if (ev.defaultPrevented) return;
	if ('button' in ev && ev.button === 2) return;
	if (options.stack !== false && !isTopOverlay(bond)) return;
	if (!overlayIsOpen(bond)) return;
	if (overlayIsDisabled(bond)) return;

	options.onDismiss?.(ev, bond);
	if (ev.defaultPrevented) return;

	closeOverlay(bond);
}

function isInsideAnyRole(
	bond: OverlayView,
	target: EventTarget | null,
	roles: readonly DismissRole[]
): boolean {
	for (const role of roles) {
		if (containsTarget(bond.elements[role], target)) return true;
	}
	return false;
}
