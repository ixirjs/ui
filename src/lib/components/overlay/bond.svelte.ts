import { setContext } from 'svelte';
import { Bond, bondContextKey, defineAtom, type BondStateProps } from '$ixirjs/ui/shared/bond';
import {
	createDisclosure,
	disclosureCapability,
	type Disclosure
} from '$ixirjs/ui/shared/capability/models/disclosure.svelte';
import type { OverlayView } from './types';

// Bond base for any overlay that can host nested popovers. Concrete bonds (Dialog, Drawer,
// Sidebar) extend and share themselves; OverlayPortal creates standalone instances via
// create() so the portal's context key shadows the outer host inside its subtree.

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type OverlayReadableProps = BondStateProps & {
	open?: boolean;
	disabled?: boolean;
	modal?: boolean;
};

// -----------------------------------------------------------------------------
// Bond state
// -----------------------------------------------------------------------------

export class OverlayBond<
	Props extends OverlayReadableProps = OverlayReadableProps
> extends Bond<Props> {
	static override CONTEXT_KEY = bondContextKey('popover-owner');

	readonly disclosure: Disclosure = createDisclosure({
		get: () => this.isOpen,
		set: (open) => (open ? this.open() : this.close())
	});

	// Standalone OverlayBond whose isOpen delegates to the outer host. Call inside OverlayPortal before sharing.
	static create(outer?: OverlayBond): OverlayBond<OverlayReadableProps> {
		const props = {};
		Object.defineProperty(props, 'open', {
			get: () => outer?.isOpen ?? true,
			set: () => undefined,
			enumerable: true,
			configurable: true
		});
		return new OverlayBond<OverlayReadableProps>(props as OverlayReadableProps);
	}

	constructor(stateOrProps: Props, name = 'overlay') {
		super(stateOrProps as Props, name);
		this.capability(disclosureCapability(this.disclosure));
	}

	get isOpen(): boolean {
		return (this.props as OverlayReadableProps).open ?? false;
	}

	get isDisabled(): boolean {
		return (this.props as OverlayReadableProps).disabled ?? false;
	}

	get modal(): boolean {
		return (this.props as OverlayReadableProps).modal ?? true;
	}

	open(): void {
		if (this.isDisabled) return;
		(this.props as OverlayReadableProps).open = true;
	}

	close(): void {
		(this.props as OverlayReadableProps).open = false;
	}

	toggle(): void {
		if (this.isOpen) this.close();
		else this.open();
	}

	override share(): this {
		super.share();
		setContext(OverlayBond.CONTEXT_KEY, this);
		return this;
	}
}

// .role('trigger') folds in disclosure ARIA + gesture from the trigger policy.

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export const OverlayTriggerAtom = defineAtom<OverlayView, HTMLElement>('trigger', (atom) => {
	atom.role('trigger');
});
export type OverlayTriggerAtom = InstanceType<typeof OverlayTriggerAtom>;
