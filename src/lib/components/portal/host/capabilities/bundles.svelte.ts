import type { Capability } from '$svelte-atoms/core/shared/bond';
import { disclosureClose } from '$svelte-atoms/core/shared/capability/models/disclosure.svelte';
import type { OverlayKnobs } from '../types';
import { clickTrigger } from '../policies/trigger.svelte';
import { trappedFocus, focusOnOpen } from '../policies/focus.svelte';
import { dismissPolicy } from './dismissible-surface.svelte';

// Individual slots can be overridden via last-wins registration.

export function modalCapabilities(knobs: Pick<OverlayKnobs, 'ariaHasPopup'> = {}): Capability[] {
	return [
		clickTrigger({ ariaHasPopup: knobs.ariaHasPopup ?? 'dialog' }),
		trappedFocus({ restoreFocus: 'previous', captureFocusOnOpen: true }),
		...dismissPolicy({ outsidePress: false }),
		disclosureClose()
	];
}

export function positionedCapabilities(
	knobs: Pick<OverlayKnobs, 'ariaHasPopup'> = {}
): Capability[] {
	return [
		clickTrigger({ ariaHasPopup: knobs.ariaHasPopup ?? 'dialog' }),
		focusOnOpen({ restoreFocus: 'trigger', captureFocusOnOpen: false }),
		...dismissPolicy({ outsidePress: { event: 'click' }, backdropPress: false }),
		disclosureClose()
	];
}
