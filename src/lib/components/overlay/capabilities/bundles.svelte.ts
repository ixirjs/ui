import type { Capability } from '$ixirjs/ui/shared/bond';
import {
	bodyScrollLock,
	disclosureClose,
	inertSiblings
} from '$ixirjs/ui/shared/capability/models';
import type { OverlayView, OverlayKnobs } from '$ixirjs/ui/components/overlay/types';
import { clickTrigger } from '$ixirjs/ui/components/overlay/policies/trigger.svelte';
import { trappedFocus, focusOnOpen } from '$ixirjs/ui/components/overlay/policies/focus.svelte';
import { dismissPolicy } from './dismissible-surface.svelte';

// Individual slots can be overridden via last-wins registration.

function modalIsActive(bond: OverlayView): boolean {
	return bond.modal !== false && bond.isOpen && !bond.isDisabled;
}

function modalRoot(bond: OverlayView): HTMLElement | undefined {
	return bond.elements.root as HTMLElement | undefined;
}

export function modalCapabilities(knobs: Pick<OverlayKnobs, 'ariaHasPopup'> = {}): Capability[] {
	return [
		clickTrigger({ ariaHasPopup: knobs.ariaHasPopup ?? 'dialog' }),
		trappedFocus({ restoreFocus: 'previous', captureFocusOnOpen: true }),
		bodyScrollLock({ enabled: (bond) => modalIsActive(bond as OverlayView) }),
		inertSiblings({
			enabled: (bond) => modalIsActive(bond as OverlayView),
			target: (bond) => modalRoot(bond as OverlayView),
			root: (bond) => modalRoot(bond as OverlayView)?.parentElement
		}),
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
