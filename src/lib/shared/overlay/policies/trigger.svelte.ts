import type { Capability } from '../../bond.svelte';
import { getElementId } from '$svelte-atoms/core/utils/dom.svelte';
import type { OverlayView, OverlayKnobs } from '../types';

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
	return {
		'aria-expanded': o.state.isOpen,
		'aria-disabled': o.state.isDisabled,
		'aria-haspopup': ariaHasPopup,
		'aria-controls': contentId,
		tabindex: o.state.isDisabled ? -1 : 0
	};
}

// Click trigger — click + Enter/Space toggles the overlay; projects ARIA attrs + gesture handlers onto `'trigger'`.
export function clickTrigger(opts: TriggerOptions = {}): Capability {
	const ariaHasPopup = opts.ariaHasPopup ?? 'dialog';
	return {
		slot: 'trigger',
		behavior(role) {
			if (role !== 'trigger') return undefined;
			return {
				attrs: (bond) => triggerAttrs(bond as OverlayView, ariaHasPopup),
				handlers: (bond) => {
					const o = bond as OverlayView;
					return {
						onclick: ((ev: MouseEvent) => {
							if (ev.button === 2) return;
							if (ev.defaultPrevented) return;
							o.state.toggle();
						}) as (ev: Event) => void,
						onkeydown: ((ev: KeyboardEvent) => {
							if (ev.key === 'Enter' || ev.key === ' ') {
								ev.preventDefault();
								o.state.toggle();
							}
						}) as (ev: Event) => void
					};
				}
			};
		}
	};
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
	return {
		slot: 'trigger',
		behavior(role) {
			if (role !== 'trigger') return undefined;
			return {
				attrs: (bond) => triggerAttrs(bond as OverlayView),
				handlers: (bond) => {
					const o = bond as OverlayView;
					return {
						onpointerenter: () => {
							clear();
							openT = setTimeout(() => o.state.open(), openDelay);
						},
						onpointerleave: () => {
							clear();
							closeT = setTimeout(() => o.state.close(), closeDelay);
						},
						onfocusin: () => {
							clear();
							o.state.open();
						},
						onfocusout: () => {
							clear();
							o.state.close();
						}
					};
				},
				onmount: () => clear
			};
		}
	};
}

// Context-menu trigger — opens on right-click (contextmenu event).
export function contextMenuTrigger(opts: TriggerOptions = {}): Capability {
	const ariaHasPopup = opts.ariaHasPopup ?? 'dialog';
	return {
		slot: 'trigger',
		behavior(role) {
			if (role !== 'trigger') return undefined;
			return {
				attrs: (bond) => triggerAttrs(bond as OverlayView, ariaHasPopup),
				handlers: (bond) => {
					const o = bond as OverlayView;
					return {
						oncontextmenu: ((ev: MouseEvent) => {
							ev.preventDefault();
							o.state.open();
						}) as (ev: Event) => void
					};
				}
			};
		}
	};
}

// Manual trigger — ARIA attrs only, no gesture. Use when the consumer drives open/close programmatically.
export function manualTrigger(opts: TriggerOptions = {}): Capability {
	const ariaHasPopup = opts.ariaHasPopup ?? 'dialog';
	return {
		slot: 'trigger',
		behavior(role) {
			if (role !== 'trigger') return undefined;
			return {
				attrs: (bond) => triggerAttrs(bond as OverlayView, ariaHasPopup)
			};
		}
	};
}
