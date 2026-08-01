import {
	definePolicyCapability,
	sharedCapabilityKey,
	type Capability
} from '$svelte-atoms/core/shared/bond';
import { getElementId } from '$svelte-atoms/core/utils/dom.svelte';
import type { OverlayView, OverlayKnobs } from '../types';
import {
	closeOverlay,
	openOverlay,
	overlayIsDisabled,
	overlayIsOpen,
	toggleOverlay
} from './overlay-view';

// Public slot key for trigger gesture policies (click/hover/contextmenu/manual share the slot, last-wins).
export const TRIGGER = sharedCapabilityKey('@svelte-atoms/cap:trigger');

export type HoverTriggerOptions = {
	// Delay before opening on pointer-enter, ms. Default 200.
	openDelay?: number;
	// Delay before closing on pointer-leave, ms. Default 150.
	closeDelay?: number;
};

type TriggerOptions = {
	ariaHasPopup?: OverlayKnobs['ariaHasPopup'];
};

// ARIA disclosure attrs shared by all trigger policies.
function triggerAttrs(o: OverlayView, ariaHasPopup: OverlayKnobs['ariaHasPopup'] = 'dialog') {
	const contentId = getElementId(o.id, `${o.namespace}-content`);
	const isDisabled = overlayIsDisabled(o);
	return {
		'aria-expanded': overlayIsOpen(o),
		'aria-disabled': isDisabled,
		'aria-haspopup': ariaHasPopup,
		'aria-controls': contentId,
		tabindex: isDisabled ? -1 : 0
	};
}

// Click trigger — click + Enter/Space toggles the overlay; projects ARIA attrs + gesture handlers onto `'trigger'`.
export function clickTrigger(opts: TriggerOptions = {}): Capability {
	const ariaHasPopup = opts.ariaHasPopup ?? 'dialog';
	return definePolicyCapability({
		slot: TRIGGER,
		meta: {
			projects: ['trigger'],
			docs: 'Click and keyboard activation policy for overlay triggers.'
		},
		roles: {
			trigger: () => ({
				attrs: (bond) => triggerAttrs(bond as OverlayView, ariaHasPopup),
				handlers: (bond) => {
					const o = bond as OverlayView;
					return {
						onclick: ((ev: MouseEvent) => {
							if (ev.button === 2) return;
							if (ev.defaultPrevented) return;
							toggleOverlay(o);
						}) as (ev: Event) => void,
						onkeydown: ((ev: KeyboardEvent) => {
							if (ev.key === 'Enter' || ev.key === ' ') {
								ev.preventDefault();
								toggleOverlay(o);
							}
						}) as (ev: Event) => void
					};
				}
			})
		}
	});
}

// Hover trigger — open on pointer-enter/focusin (with delay), close on pointer-leave/focusout. Timer state is closure-local.
export function hoverTrigger(opts: HoverTriggerOptions = {}): Capability {
	const { openDelay = 200, closeDelay = 150 } = opts;
	let openT: ReturnType<typeof setTimeout> | undefined;
	let closeT: ReturnType<typeof setTimeout> | undefined;
	const clear = () => {
		clearTimeout(openT);
		clearTimeout(closeT);
		openT = undefined;
		closeT = undefined;
	};
	return definePolicyCapability({
		slot: TRIGGER,
		meta: {
			projects: ['trigger'],
			docs: 'Hover and focus activation policy for overlay triggers.'
		},
		roles: {
			trigger: () => ({
				attrs: (bond) => triggerAttrs(bond as OverlayView),
				handlers: (bond) => {
					const o = bond as OverlayView;
					return {
						onpointerenter: () => {
							clear();
							openT = setTimeout(() => openOverlay(o), openDelay);
						},
						onpointerleave: () => {
							clear();
							closeT = setTimeout(() => closeOverlay(o), closeDelay);
						},
						onfocusin: () => {
							clear();
							openOverlay(o);
						},
						onfocusout: () => {
							clear();
							closeOverlay(o);
						}
					};
				},
				onmount: () => clear
			})
		}
	});
}

// Context-menu trigger — opens on right-click (contextmenu event).
export function contextMenuTrigger(opts: TriggerOptions = {}): Capability {
	const ariaHasPopup = opts.ariaHasPopup ?? 'dialog';
	return definePolicyCapability({
		slot: TRIGGER,
		meta: {
			projects: ['trigger'],
			docs: 'Context-menu activation policy for overlay triggers.'
		},
		roles: {
			trigger: () => ({
				attrs: (bond) => triggerAttrs(bond as OverlayView, ariaHasPopup),
				handlers: (bond) => {
					const o = bond as OverlayView;
					return {
						oncontextmenu: ((ev: MouseEvent) => {
							ev.preventDefault();
							openOverlay(o);
						}) as (ev: Event) => void
					};
				}
			})
		}
	});
}

// Manual trigger — ARIA attrs only, no gesture. Use when the consumer drives open/close programmatically.
export function manualTrigger(opts: TriggerOptions = {}): Capability {
	const ariaHasPopup = opts.ariaHasPopup ?? 'dialog';
	return definePolicyCapability({
		slot: TRIGGER,
		meta: {
			projects: ['trigger'],
			docs: 'ARIA-only overlay trigger policy for externally controlled overlays.'
		},
		roles: {
			trigger: () => ({
				attrs: (bond) => triggerAttrs(bond as OverlayView, ariaHasPopup)
			})
		}
	});
}
