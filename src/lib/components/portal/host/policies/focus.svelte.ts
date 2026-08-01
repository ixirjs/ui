import {
	definePolicyCapability,
	sharedCapabilityKey,
	type Capability
} from '$svelte-atoms/core/shared/bond';
import type { OverlayView, OverlayKnobs } from '../types';
import { focus, focusTrap as tabTrap } from '$svelte-atoms/core/utils/dom.svelte';
import { useFocusRestore } from './focus-restore.svelte';
import { overlayIsOpen } from './overlay-view';

export const FOCUS = sharedCapabilityKey<FocusPolicySurface>('@svelte-atoms/cap:focus');

export type FocusPolicySurface = {
	readonly restoreFocus?: OverlayKnobs['restoreFocus'];
	readonly captureFocusOnOpen?: boolean;
};

function focusFirstOnOpen(bond: OverlayView, node: HTMLElement): void {
	if (!overlayIsOpen(bond)) return;
	queueMicrotask(() => focus(node));
}

// trapTab is the only axis; both variants focus the first child on open.
function focusPolicy(opts: FocusPolicySurface, trapTab: boolean): Capability<FocusPolicySurface> {
	return definePolicyCapability<FocusPolicySurface>({
		slot: FOCUS,
		surface: opts,
		meta: {
			projects: trapTab ? ['content', 'surface'] : ['content'],
			docs: 'Focus management policy with focus-restore setup and optional Tab trapping.'
		},
		setup: (bond) => useFocusRestore(bond as OverlayView),
		roles: {
			content: () => ({
				onmount: (node, bond) => focusFirstOnOpen(bond as OverlayView, node as HTMLElement)
			}),
			// Tab is cycled within content only for the trapped variant; otherwise surface projects nothing.
			surface: () =>
				trapTab
					? {
							handlers: () => ({
								onkeydown: ((ev: Event) => tabTrap(ev as KeyboardEvent)) as (ev: Event) => void
							})
						}
					: undefined
		}
	});
}

// Default for modal overlays.
export function trappedFocus(opts: FocusPolicySurface = {}): Capability<FocusPolicySurface> {
	return focusPolicy(opts, true);
}

// Default for positioned overlays.
export function focusOnOpen(opts: FocusPolicySurface = {}): Capability<FocusPolicySurface> {
	return focusPolicy(opts, false);
}

// No focus management — tooltips and other non-interactive overlays. Surface-only (no projection).
export const noFocus: Capability<FocusPolicySurface> = definePolicyCapability<FocusPolicySurface>({
	slot: FOCUS,
	surface: {},
	meta: {
		docs: 'Explicit no-op focus policy for non-interactive overlays.'
	}
});
