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
};

export type AccordionElements = {
	root: HTMLElement;
	indicator: HTMLElement;
};

// Breaks the atom↔bond cycle via defineBond (§12.2).
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

// Selection lives on AccordionState (§6).
export const AccordionBond = defineBond<{ root: typeof AccordionRootAtom }, AccordionState>({
	name: 'accordion',
	atoms: { root: AccordionRootAtom }
});

export type AccordionBond = BondOf<typeof AccordionBond>;

// Narrow parent contract an item child depends on; keeps the child→parent seam stub-testable.
export interface IAccordion {
	readonly id: string;
	readonly values: readonly string[];
	readonly isDisabled: boolean;
	open(ids: string[]): void;
	close(ids: string[]): void;
	toggle(id: string): void;
	// Returns a cleanup that unregisters the item.
	attachItem(id: string, item: AccordionItemBond): () => void;
}

export class AccordionState extends BondState<AccordionStateProps> implements IAccordion {
	// Owns set-algebra + single/multiple mode over the bindable props.values backing.
	#selection: SelectionModel<string> = createSelection<string>({
		get: () => this.props.values,
		set: (v) => (this.props.values = v),
		mode: () => (this.props.multiple ? 'multiple' : 'single')
	});

	get selection(): SelectionModel<string> {
		return this.#selection;
	}

	get values(): readonly string[] {
		return this.#selection.values;
	}

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

	open(vals: string[]) {
		this.#selection.select(vals);
	}

	close(vals: string[]) {
		this.#selection.deselect(vals);
	}

	toggle(id: string) {
		this.#selection.toggle(id);
	}

	attachItem(id: string, item: AccordionItemBond): () => void {
		return this.items.attach(id, item);
	}
}
