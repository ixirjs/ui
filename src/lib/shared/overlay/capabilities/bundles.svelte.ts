import type { Capability } from '../../bond.svelte';
import type { OverlayKnobs } from '../types';
import { clickTrigger } from '../policies/trigger.svelte';
import { trappedFocus, focusOnOpen } from '../policies/focus.svelte';
import { closeOnEscape } from '../policies/escape.svelte';

// Default capability bundles per overlay branch — replaces ModalOverlay/PositionedOverlay's
// defaultTrigger/Focus/Escape/Knobs(). Individual slots can be overridden (last-wins).

// Modal branch (Dialog, Drawer): click trigger, trapped focus, restore to previous.
export function modalCapabilities(knobs: Pick<OverlayKnobs, 'ariaHasPopup'> = {}): Capability[] {
	return [
		clickTrigger({ ariaHasPopup: knobs.ariaHasPopup ?? 'dialog' }),
		trappedFocus({ restoreFocus: 'previous', captureFocusOnOpen: true }),
		closeOnEscape
	];
}

// Positioned branch (Popover, …): click trigger, focus-on-open (no trap), restore to trigger.
export function positionedCapabilities(
	knobs: Pick<OverlayKnobs, 'ariaHasPopup'> = {}
): Capability[] {
	return [
		clickTrigger({ ariaHasPopup: knobs.ariaHasPopup ?? 'dialog' }),
		focusOnOpen({ restoreFocus: 'trigger', captureFocusOnOpen: false }),
		closeOnEscape
	];
}
