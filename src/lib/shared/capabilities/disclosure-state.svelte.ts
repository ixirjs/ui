import { BondState, type BondStateProps } from '../bond.svelte';
import type { Disclosure } from './disclosure.svelte';

// Props shared by every disclosure-backed bond state (pairs with DisclosureState): open/disabled plus
// the passthrough `rest` slot. Component prop types intersect this with their own extra fields.
export type DisclosureStateProps = BondStateProps & {
	open: boolean;
	disabled: boolean;
	readonly rest?: Record<string, unknown>;
};

// Shared base for bond states whose open/closed lifecycle is backed by a Disclosure model.
// Subclasses supply the `disclosure` field (typically `createDisclosure({ get/set props.open })`);
// this base owns the canonical isOpen/open/close/toggle forwarding so each disclosure-backed state
// declares the delegation once (single source of truth). Subclasses may override a method to layer
// extra logic — e.g. Toast guards open/toggle with `props.disabled`.
export abstract class DisclosureState<P extends BondStateProps = BondStateProps> extends BondState<P> {
	abstract readonly disclosure: Disclosure;

	get isOpen(): boolean {
		return this.disclosure.isOpen;
	}

	open(): void {
		this.disclosure.open();
	}

	close(): void {
		this.disclosure.close();
	}

	toggle(): void {
		this.disclosure.toggle();
	}
}
