import {
	defineCapability,
	sharedCapabilityKey,
	type Capability
} from '$ixirjs/ui/shared/capability';
import type { OverlayView, OverlayKnobs } from '$ixirjs/ui/components/overlay/types';
import { focus, focusTrap as tabTrap } from '$ixirjs/ui/utils/dom.svelte';
import { useFocusRestore } from './focus-restore.svelte';
import { overlayIsModal, overlayIsOpen, overlayNode } from './overlay-view';

export const FOCUS = sharedCapabilityKey<FocusPolicySurface>('@ixirjs/cap:focus');

export type FocusPolicySurface = {
	readonly restoreFocus?: OverlayKnobs['restoreFocus'];
	readonly captureFocusOnOpen?: boolean;
};

function focusFirstOnOpen(bond: OverlayView, node: HTMLElement): void {
	if (!overlayIsOpen(bond)) return;
	queueMicrotask(() => {
		if (overlayIsOpen(bond)) focus(node);
	});
}

// Content can remain mounted while an overlay is closed. Watch the open edge at the
// whole-bond seam so opening later focuses the existing content as well as newly mounted content.
function useFocusOnOpen(bond: OverlayView): void {
	let wasOpen = overlayIsOpen(bond);

	$effect(() => {
		const isOpen = overlayIsOpen(bond);
		if (isOpen && !wasOpen) {
			const content = overlayNode(bond, 'content')?.element;
			if (content instanceof HTMLElement) focusFirstOnOpen(bond, content);
		}
		wasOpen = isOpen;
	});
}

// trapTab is the only axis; both variants focus the first child on open.
function focusPolicy(opts: FocusPolicySurface, trapTab: boolean): Capability<FocusPolicySurface> {
	return defineCapability<FocusPolicySurface>({
		slot: FOCUS,
		surface: opts,
		meta: {
			projects: trapTab ? ['content', 'surface'] : ['content'],
			docs: 'Focus management policy with focus-restore setup and optional Tab trapping.'
		},
		setup: (bond) => {
			const overlay = bond as OverlayView;
			useFocusRestore(overlay);
			useFocusOnOpen(overlay);
		},
		roles: {
			content: () => ({
				onmount: (node, bond) => focusFirstOnOpen(bond as OverlayView, node as HTMLElement)
			}),
			// Tab is cycled within content only for the trapped variant; otherwise surface projects nothing.
			surface: () =>
				trapTab
					? {
							handlers: (bond) => ({
								onkeydown: ((ev: Event) => {
									if (overlayIsModal(bond as OverlayView)) tabTrap(ev as KeyboardEvent);
								}) as (ev: Event) => void
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
export const noFocus: Capability<FocusPolicySurface> = defineCapability<FocusPolicySurface>({
	slot: FOCUS,
	surface: {},
	meta: {
		docs: 'Explicit no-op focus policy for non-interactive overlays.'
	}
});
