import { type PopoverDomElements } from '$svelte-atoms/core/components/popover/bond.svelte';
import {
	DropdownBond,
	DropdownBondState,
	type DropdownStateProps
} from '$svelte-atoms/core/components/dropdown/bond.svelte';
import { BondAtom } from '$svelte-atoms/core/shared/bond.svelte';
import {
	defineBond,
	createInput,
	inputCapability,
	type ViewOf,
	type BondOf
} from '$svelte-atoms/core/shared';
import { SvelteMap } from 'svelte/reactivity';
import { nanoid } from 'nanoid';
import type { ComboboxSelection } from './types';

// Inherits query/ClearThenClose from Select. Combobox overrides the 'input' capability so
// query (filter box) and value (trigger box) are independent stores, not a shared mirror.
export type ComboboxBondProps = DropdownStateProps;

export type ComboboxBondElements = PopoverDomElements & {
	control: HTMLInputElement;
};

// State first (a class) — self-contained, extends the select/dropdown state. Selection, roving,
// and the `ClearThenClose` escape are inherited from Select.
export class ComboboxBondState extends DropdownBondState<ComboboxBondProps> {
	#userSelections = new SvelteMap<string, ComboboxSelection>();

	constructor(props: ComboboxBondProps) {
		super(props);
		// Override Select's filter-only input with two independent fields:
		// query → filter text; value → selected item's value (commits selection on set).
		this.capability(
			inputCapability(
				createInput({
					query: { get: () => this.props.query ?? '', set: (v) => (this.props.query = v) },
					value: {
						get: () => this.props.values?.[0] ?? '',
						set: (v) => this.selection.select(v ? [v] : [])
					}
				}),
				{ itemDomId: (id) => this.itemDomId(id) }
			)
		);
	}

	addSelection(label: string) {
		const id = nanoid();
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const createdAt = new Date();
		this.#userSelections.set(id, {
			id,
			label,
			createdAt,
			unselect: () => this.deleteSelection(id)
		});

		this.updateLabels();
	}

	deleteSelection(id: string) {
		this.#userSelections.delete(id);
		this.updateLabels();
	}

	get userSelections() {
		return Array.from(this.#userSelections.values());
	}

	get allSelections() {
		const itemSelections = this.selections.map((controller) => ({
			id: controller.id,
			label: controller.label,
			createdAt: controller.createdAt, // default date for items from the list
			controller,
			// Deselect by the item's VALUE — `props.values` holds values, not the atom's
			// `id` (a nanoid); passing `id` matched nothing, so dismiss was a no-op.
			unselect: () => this.unselect([controller.value])
		}));

		return [...itemSelections, ...this.userSelections].sort(
			(a, b) => a.createdAt.getTime() - b.createdAt.getTime()
		);
	}

	protected updateLabels(): void {
		const labels = this.allSelections.map((s) => s.label);
		this.props.labels = labels;
		this.props.label = labels[0] ?? '';
	}
}

// Narrow bond view used by ComboboxControlAtom to avoid the atom↔bond cycle.
type ComboboxBondView = ViewOf<ComboboxBondState>;

class ComboboxControlAtom extends BondAtom<ComboboxBondView, HTMLInputElement> {
	constructor(bond: ComboboxBondView) {
		super(bond, 'control');
		// Play the 'input' capability's 'value' role (combobox aria-*, oninput→value).
		// Combobox-specific handlers below chain on top via composeHandlers.
		this.role('input', 'value');
	}

	override get handlers() {
		const bond = this.bond;
		const isMultiselect = bond.state.props.multiple ?? false;
		return {
			// Typing replaces the current single selection (the capability's oninput, which
			// writes `query`, runs alongside this — both fire).
			oninput: () => {
				if (!isMultiselect) {
					bond.state.props.values = [];
				}
			},
			onkeydown: (ev: KeyboardEvent) => {
				if (bond.state.isDisabled) return;

				if (ev.key === 'Enter' && isMultiselect) {
					const currentTarget = ev.currentTarget as HTMLInputElement;
					const value = currentTarget.value.trim();
					if (value !== '') {
						bond.state.addSelection(value);
					}
				}
			}
		};
	}
}

// ComboboxBond — flat composition over DropdownBond, adds an editable control atom.
// 'input' capability, ClearThenClose escape, and trigger are all inherited from Select.
export const ComboboxBond = defineBond<
	{ control: typeof ComboboxControlAtom },
	ComboboxBondState
>({
	parts: [DropdownBond],
	name: 'combobox',
	atoms: {
		control: ComboboxControlAtom
	}
});

// Instance type — paired with the const above (value + type).
export type ComboboxBond = BondOf<typeof ComboboxBond>;
