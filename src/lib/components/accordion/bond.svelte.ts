import type { Collection } from '$svelte-atoms/core/shared/bond/collection.svelte';
import {
	createSelection,
	type SelectionModel
} from '$svelte-atoms/core/shared/capability/models/selection.svelte';
import { Bond, defineAtom, type BondStateProps } from '$svelte-atoms/core/shared/bond';
import { defineBond, type BondOf } from '$svelte-atoms/core/shared';
import {
	defineAtomCapability,
	sharedCapabilityKey,
	type AtomHost
} from '$svelte-atoms/core/shared/capability';

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type AccordionBondProps = BondStateProps & {
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

export type AccordionItemHandle = {
	readonly id: string;
};

// -----------------------------------------------------------------------------
// Capability slots and shared helpers
// -----------------------------------------------------------------------------

const ACCORDION_ROOT = sharedCapabilityKey<void>('@svelte-atoms/accordion:root');

// Narrow parent contract an item child depends on; keeps the child→parent seam stub-testable.

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export interface IAccordion {
	readonly id: string;
	readonly values: readonly string[];
	readonly isDisabled: boolean;
	readonly multiple: boolean;
	readonly collapsible: boolean;
	open(ids: string[]): void;
	close(ids: string[]): void;
	toggle(id: string): void;
	// Returns a cleanup that unregisters the item.
	attachItem(id: string, item: AccordionItemHandle): () => void;
}

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

export class AccordionBondBase extends Bond<AccordionBondProps> implements IAccordion {
	// Owns set-algebra + single/multiple mode over the bindable props.values backing.
	#selection: SelectionModel<string> = createSelection<string>({
		get: () => this.props.values,
		set: (v) => (this.props.values = v),
		mode: () => (this.props.multiple ? 'multiple' : 'single')
	});

	constructor(props: AccordionBondProps, name = 'accordion') {
		super(props, name);
		// Eagerly create owned collections outside derived reads; collection() registers a capability.
		void this.items;
	}

	get selection(): SelectionModel<string> {
		return this.#selection;
	}

	get values(): readonly string[] {
		return this.#selection.values;
	}

	get isDisabled(): boolean {
		return this.props.disabled ?? false;
	}

	get multiple(): boolean {
		return this.props.multiple ?? false;
	}

	get collapsible(): boolean {
		return this.props.collapsible ?? false;
	}

	// Insertion-ordered reactive collection of mounted item bonds.
	get items(): Collection<AccordionItemHandle> {
		return this.collection<AccordionItemHandle>('item');
	}

	// Mounted item bonds for the currently-open values, in values order.
	get activeItems(): readonly (AccordionItemHandle | undefined)[] {
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

	attachItem(id: string, item: AccordionItemHandle): () => void {
		return this.items.set(id, item);
	}
}

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export const AccordionRootAtom = defineAtom<AccordionBondBase>('root', (atom) => {
	atom.capability(accordionRootPresentation());
});
export type AccordionRootAtom = InstanceType<typeof AccordionRootAtom>;

// -----------------------------------------------------------------------------
// Atom capabilities
// -----------------------------------------------------------------------------

function accordionRootPresentation() {
	return defineAtomCapability<void, AtomHost, AccordionBondBase>({
		slot: ACCORDION_ROOT,
		meta: {
			layer: 1,
			kind: 'projection',
			projects: ['root'],
			docs: 'Accordion root open, disabled, and selection-mode projection.'
		},
		behavior: {
			attrs: (_node, bond) => {
				const props = bond?.props;

				return {
					'aria-expand': props?.open ?? false,
					'aria-disabled': props?.disabled ?? false,
					'aria-multiselectable': props?.multiple ?? false
				};
			}
		}
	});
}

// Selection and item coordination live on the Bond instance.

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

const AccordionBondImpl = defineBond<
	{ root: typeof AccordionRootAtom },
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	typeof AccordionBondBase
>({
	name: 'accordion',
	base: AccordionBondBase,
	atoms: { root: AccordionRootAtom }
});

export type AccordionBond = BondOf<typeof AccordionBondImpl>;

interface AccordionBondConstructor {
	new (props: AccordionBondProps): AccordionBond;
	readonly CONTEXT_KEY: string;
	readonly spec: (typeof AccordionBondImpl)['spec'];
	get(): AccordionBond | undefined;
	getOrThrow(message?: string): AccordionBond;
	set(bond: AccordionBond): AccordionBond;
	create(props: AccordionBondProps): AccordionBond;
}

export const AccordionBond = AccordionBondImpl as unknown as AccordionBondConstructor;
