import type { AccordionItemBond } from './item/bond.svelte';
import type { Collection } from '$svelte-atoms/core/shared/collection.svelte';
import {
	createSelection,
	type SelectionModel
} from '$svelte-atoms/core/shared/capabilities/selection.svelte';
import { BondState, BondAtom, type BondStateProps } from '$svelte-atoms/core/shared/bond.svelte';
import { defineBond, type BondOf, type ViewOf } from '$svelte-atoms/core/shared';

export type AccordionStateProps = BondStateProps & {
	open: boolean;
	value?: string;
	values: string[];
	multiple?: boolean;
	collapsible?: boolean;
	disabled: boolean;
	readonly rest?: Record<string, unknown>;
};

export type AccordionElements = {
	root: HTMLElement;
	indicator: HTMLElement;
};

// Bond view the accordion atoms type against — breaks the atom↔bond cycle via defineBond (§12.2).
type AccordionBondView = ViewOf<AccordionState>;

export class AccordionRootAtom extends BondAtom<AccordionBondView> {
	constructor(bond: AccordionBondView) {
		super(bond, 'root');
	}

	override get attrs() {
		const props = this.bond.state?.props;
		const isOpen = props?.open ?? false;
		const isDisabled = props?.disabled ?? false;
		const isMultiple = props?.multiple ?? false;

		return {
			...super.attrs,
			'aria-expand': isOpen,
			'aria-disabled': isDisabled,
			'aria-multiselectable': isMultiple
		};
	}
}

// AccordionBond via defineBond (§6): declares the root atom; selection lives on AccordionState.
export const AccordionBond = defineBond<{ root: typeof AccordionRootAtom }, AccordionState>({
	name: 'accordion',
	atoms: { root: AccordionRootAtom }
});

// Instance type of the accordion bond — paired with the const above (value + type).
export type AccordionBond = BondOf<typeof AccordionBond>;

// Narrow parent contract an item child depends on — minimal slice of AccordionState.
// Implemented by AccordionState; keeps the child→parent seam explicit and stub-testable.
export interface IAccordion {
	readonly id: string;
	readonly values: readonly string[];
	readonly isDisabled: boolean;
	open(ids: string[]): void;
	close(ids: string[]): void;
	toggle(id: string): void;
	// Register a child item bond; returns a cleanup that unregisters it.
	attachItem(id: string, item: AccordionItemBond): () => void;
}

export class AccordionState extends BondState<AccordionStateProps> implements IAccordion {
	// Selection capability over props.values (bindable backing); owns set-algebra + single/multiple mode.
	#selection: SelectionModel<string> = createSelection<string>({
		get: () => this.props.values,
		set: (v) => (this.props.values = v),
		mode: () => (this.props.multiple ? 'multiple' : 'single')
	});

	// The selection capability — which item values are open.
	get selection(): SelectionModel<string> {
		return this.#selection;
	}

	// IAccordion.values
	get values(): readonly string[] {
		return this.#selection.values;
	}

	// IAccordion.isDisabled
	get isDisabled(): boolean {
		return this.props.disabled ?? false;
	}

	// Insertion-ordered reactive collection of mounted item bonds.
	get items(): Collection<AccordionItemBond> {
		return this.collection<AccordionItemBond>('item');
	}

	// Mounted item bonds for the currently-open values, in values order.
	get activeItems(): readonly (AccordionItemBond | undefined)[] {
		return this.props.values.map((d) => this.items.get(d));
	}

	// IAccordion.open — delegates to the selection capability.
	open(vals: string[]) {
		this.#selection.select(vals);
	}

	// IAccordion.close — delegates to the selection capability.
	close(vals: string[]) {
		this.#selection.deselect(vals);
	}

	// IAccordion.toggle — delegates to the selection capability.
	toggle(id: string) {
		this.#selection.toggle(id);
	}

	attachItem(id: string, item: AccordionItemBond): () => void {
		return this.items.attach(id, item);
	}
}
