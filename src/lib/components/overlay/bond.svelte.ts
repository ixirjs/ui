import { setContext } from 'svelte';
import { Bond, BondState, BondAtom, bondContextKey } from '$svelte-atoms/core/shared/bond.svelte';
import type { OverlayStateProps, OverlayView } from './types';

// Standalone state for OverlayPortal: isOpen delegates to the outer host so nested popovers are gated.
class OverlayPortalState extends BondState {
	#isOpen: () => boolean;
	constructor(isOpen: () => boolean) {
		super({});
		this.#isOpen = isOpen;
	}
	get isOpen(): boolean {
		return this.#isOpen();
	}
}

// Bond base for any overlay that can host nested popovers. Concrete bonds (Dialog, Drawer,
// Sidebar) extend and share themselves; OverlayPortal creates standalone instances via
// create() so the portal's context key shadows the outer host inside its subtree.
export class OverlayBond extends Bond {
	static override CONTEXT_KEY = bondContextKey('popover-owner');

	// Standalone OverlayBond whose isOpen delegates to the outer host. Call inside OverlayPortal before sharing.
	static create(outer?: OverlayBond): OverlayBond {
		return new OverlayBond(new OverlayPortalState(() => outer?.isOpen ?? true));
	}

	get positionStrategy(): 'fixed' | 'absolute' {
		return 'absolute';
	}

	get isOpen(): boolean {
		return (this.state as unknown as { isOpen: boolean }).isOpen ?? false;
	}

	override share(): this {
		super.share();
		setContext(OverlayBond.CONTEXT_KEY, this);
		return this;
	}
}

// Base overlay state: open()/close()/toggle() over props.open (open gated by disabled).
// Behaviour is composed from capabilities; this is the state shape OverlayView requires.
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

// Shared trigger atom. .role('trigger') folds in disclosure ARIA + gesture from the trigger policy.
export class OverlayTriggerAtom<B extends OverlayView = OverlayView> extends BondAtom<
	B,
	HTMLElement
> {
	constructor(bond: B) {
		super(bond, 'trigger');
		this.role('trigger');
	}
}
