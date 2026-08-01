import { type PopoverDomElements } from '$svelte-atoms/core/components/popover/bond.svelte';
import {
	SelectBond as DropdownBond,
	SelectBondBase as DropdownBondBase,
	type SelectStateProps as DropdownStateProps
} from '$svelte-atoms/core/components/select/bond.svelte';
import { defineAtom } from '$svelte-atoms/core/shared/bond';
import {
	defineBond,
	type BondOf,
	createInput,
	inputCapability,
	defineAtomCapability,
	sharedCapabilityKey,
	type BondSpec,
	type AtomHost
} from '$svelte-atoms/core/shared';
import { SvelteMap } from 'svelte/reactivity';
import { nanoid } from 'nanoid';
import type { ComboboxSelection } from './types';

// Inherits query/ClearThenClose from Select. Combobox overrides the 'input' capability so
// query (filter box) and value (trigger box) are independent stores, not a shared mirror.

// -----------------------------------------------------------------------------
// Public types
// -----------------------------------------------------------------------------

export type ComboboxBondProps = DropdownStateProps;

export type ComboboxBondElements = PopoverDomElements & {
	control: HTMLInputElement;
};

// Selection, roving, and the `ClearThenClose` escape are inherited from Select.

// -----------------------------------------------------------------------------
// Bond implementation
// -----------------------------------------------------------------------------

export class ComboboxBondBase extends DropdownBondBase<ComboboxBondProps> {
	#userSelections = new SvelteMap<string, ComboboxSelection>();

	constructor(props: ComboboxBondProps, name = 'combobox') {
		super(props, name);
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
				{
					itemDomId: (id) => this.itemDomId(id),
					expanded: () => this.isOpen,
					disabled: () => this.isDisabled
				}
			)
		);
	}

	override select(ids: string[]) {
		super.select(ids);
		// In single mode, reflect the committed value back into the query box so the
		// trigger input shows what was picked (not the stale filter text).
		if (!this.props.multiple) {
			this.props.query = ids[0] ?? '';
		}
	}

	override unselect(ids: string[]) {
		super.unselect(ids);
		if (!this.props.multiple) {
			this.props.query = '';
		}
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

// -----------------------------------------------------------------------------
// Internal types
// -----------------------------------------------------------------------------

type ComboboxBondView = ComboboxBondBase;

// -----------------------------------------------------------------------------
// Capability slots and shared helpers
// -----------------------------------------------------------------------------

const COMBOBOX_CONTROL = sharedCapabilityKey<void>('@svelte-atoms/combobox:control');

// -----------------------------------------------------------------------------
// Atom definitions
// -----------------------------------------------------------------------------

export const ComboboxControlAtom = defineAtom<ComboboxBondView, HTMLInputElement>(
	'control',
	(atom) => {
		// Play the 'input' capability's 'value' role (combobox aria-*, oninput→value).
		// Combobox-specific handlers below chain on top via composeHandlers.
		atom.role('input', 'value');
		atom.capability(comboboxControlPresentation());
	}
);
export type ComboboxControlAtom = InstanceType<typeof ComboboxControlAtom>;

// -----------------------------------------------------------------------------
// Atom capabilities
// -----------------------------------------------------------------------------

function comboboxControlPresentation() {
	return defineAtomCapability<void, AtomHost, ComboboxBondView>({
		slot: COMBOBOX_CONTROL,
		meta: {
			layer: 1,
			kind: 'policy',
			projects: ['control'],
			docs: 'Combobox control single-selection clearing and multi-selection entry policy.'
		},
		behavior: {
			handlers: (_node, bond) => {
				const isMultiselect = bond?.props.multiple ?? false;
				return {
					// Typing replaces the current single selection; the input capability also writes value.
					oninput: () => {
						if (!bond || isMultiselect) return;
						bond.props.values = [];
					},
					onkeydown: (ev: KeyboardEvent) => {
						if (!bond || bond.isDisabled) return;

						if (ev.key === 'Enter' && isMultiselect) {
							const currentTarget = ev.currentTarget as HTMLInputElement;
							const value = currentTarget.value.trim();
							if (value !== '') {
								bond.addSelection(value);
							}
						}
					}
				};
			}
		}
	});
}

// -----------------------------------------------------------------------------
// Bond spec and constructor facade
// -----------------------------------------------------------------------------

const comboboxSpec = {
	parts: [DropdownBond],
	name: 'combobox',
	base: ComboboxBondBase,
	atoms: {
		control: ComboboxControlAtom
	}
} satisfies BondSpec<{ control: typeof ComboboxControlAtom }, typeof ComboboxBondBase>;

// ComboboxBond — flat composition over DropdownBond, adds an editable control atom.
// 'input' capability, ClearThenClose escape, and trigger are all inherited from Select.
const ComboboxBondImpl = defineBond<
	{ control: typeof ComboboxControlAtom },
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	any,
	typeof ComboboxBondBase
>(comboboxSpec);

// Instance type — paired with the const above (value + type).
export type ComboboxBond = BondOf<typeof ComboboxBondImpl>;

interface ComboboxBondConstructor {
	new (props: ComboboxBondProps): ComboboxBond;
	readonly CONTEXT_KEY: string;
	readonly CONTEXT_KEYS?: readonly string[];
	readonly spec: (typeof ComboboxBondImpl)['spec'];
	get(): ComboboxBond | undefined;
	getOrThrow(message?: string): ComboboxBond;
	set(bond: ComboboxBond): ComboboxBond;
	create(props: ComboboxBondProps): ComboboxBond;
}

export const ComboboxBond = ComboboxBondImpl as unknown as ComboboxBondConstructor;
