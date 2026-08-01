import type { Capability } from '../../bond.svelte';
import type { OverlayView, OverlayKnobs } from '../types';
import { focus, focusTrap as tabTrap } from '$svelte-atoms/core/utils/dom.svelte';

// Configuration surface of a focus policy — read by useFocusRestore.
export type FocusPolicySurface = {
	readonly restoreFocus?: OverlayKnobs['restoreFocus'];
	readonly captureFocusOnOpen?: boolean;
};

function focusFirstOnOpen(bond: OverlayView, node: HTMLElement): void {
	if (!bond.state.isOpen) return;
	queueMicrotask(() => focus(node));
}

// Trapped focus — Tab cycles within content; moves focus to first focusable child on open. Default for modal overlays.
export function trappedFocus(opts: FocusPolicySurface = {}): Capability<FocusPolicySurface> {
	return {
		slot: 'focus',
		surface: opts,
		behavior(role) {
			if (role === 'surface') {
				return {
					handlers: () => ({
						onkeydown: ((ev: Event) => tabTrap(ev as KeyboardEvent)) as (ev: Event) => void
					})
				};
			}
			if (role === 'content') {
				return {
					onmount: (node, bond) => focusFirstOnOpen(bond as OverlayView, node as HTMLElement)
				};
			}
			return undefined;
		}
	};
}

// Focus-on-open — moves focus to first focusable child on open; Tab not trapped. Default for positioned overlays.
export function focusOnOpen(opts: FocusPolicySurface = {}): Capability<FocusPolicySurface> {
	return {
		slot: 'focus',
		surface: opts,
		behavior(role) {
			if (role === 'content') {
				return {
					onmount: (node, bond) => focusFirstOnOpen(bond as OverlayView, node as HTMLElement)
				};
			}
			return undefined;
		}
	};
}

// No focus management — tooltips and other non-interactive overlays.
export const noFocus: Capability<FocusPolicySurface> = {
	slot: 'focus',
	surface: {},
	behavior: () => undefined
};
