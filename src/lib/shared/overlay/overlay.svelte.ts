import { BondState, BondAtom } from '../bond.svelte';
import type { OverlayStateProps, OverlayView } from './types';

// Base state for any overlay bond. Provides open()/close()/toggle() over props.open
// (with the disabled-gate on open). Overlay behaviour is composed from capabilities,
// not inherited — this state shape is what OverlayView requires.
export class OverlayState<
	Props extends OverlayStateProps = OverlayStateProps
> extends BondState<Props> {
	get isOpen(): boolean {
		return this.props.open ?? false;
	}

	get isDisabled(): boolean {
		return this.props.disabled ?? false;
	}

	open(): void {
		if (this.isDisabled) return;
		this.props.open = true;
	}

	close(): void {
		this.props.open = false;
	}

	toggle(): void {
		if (this.isOpen) this.close();
		else this.open();
	}
}

// Shared trigger atom. Folds the 'trigger' capability via .role('trigger') —
// disclosure ARIA + the gesture behavior come from the registered trigger policy.
export class OverlayTriggerAtom<B extends OverlayView = OverlayView> extends BondAtom<
	B,
	HTMLElement
> {
	constructor(bond: B) {
		super(bond, 'trigger');
		this.role('trigger');
	}
}
