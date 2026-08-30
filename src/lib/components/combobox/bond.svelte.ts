/**
 * Combobox's shared object on the redesigned `Kernel` — a plain state class over Select.
 *
 * It inherits selection, roving, typeahead and the clear-then-close Escape from Select, and adds
 * the two independent text stores an editable combobox needs: `query` (the filter box) and `value`
 * (the trigger box, which commits a selection on set).
 */
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import { SvelteMap } from 'svelte/reactivity';
import { generateId } from '$ixirjs/ui/authoring';
import { createInput, type InputModel } from '$ixirjs/ui/capability/models/input.svelte';
import { SelectBondBase, type SelectStateProps } from '$ixirjs/ui/components/select/bond.svelte';
import type { OverlayLike } from '$ixirjs/ui/components/overlay/model.svelte';
import type { ComboboxPresets, ComboboxSelection } from './types';

export type ComboboxBondProps = SelectStateProps & { presets?: ComboboxPresets | undefined };

export const ComboboxContext = Kernel.context<ComboboxBondBase>('bond/combobox');

export class ComboboxBondBase extends SelectBondBase<ComboboxBondProps> {
	#userSelections = new SvelteMap<string, ComboboxSelection>();

	/**
	 * Two independent fields, not a shared mirror: `query` is the filter text and `value` is the
	 * selected item's value. Setting `value` commits the selection.
	 */
	readonly input: InputModel = createInput({
		query: { get: () => this.props.query ?? '', set: (v) => (this.props.query = v) },
		value: {
			get: () => this.props.values?.[0] ?? '',
			set: (v) => this.selection.select(v ? [v] : [])
		}
	});

	constructor(props: ComboboxBondProps, name = 'combobox') {
		super(props, name);
	}

	override select(ids: string[]) {
		super.select(ids);
		// In single mode, reflect the committed value back into the query box so the trigger input
		// shows what was picked (not the stale filter text).
		if (!this.props.multiple) this.props.query = ids[0] ?? '';
	}

	override unselect(ids: string[]) {
		super.unselect(ids);
		if (!this.props.multiple) this.props.query = '';
	}

	addSelection(label: string) {
		const id = generateId('combobox-selection');
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
			createdAt: controller.createdAt,
			controller,
			// Deselect by the item's VALUE — `props.values` holds values, not the item's generated id.
			unselect: () => this.unselect([controller.value])
		}));

		return [...itemSelections, ...this.userSelections].sort(
			(a, b) => a.createdAt.getTime() - b.createdAt.getTime()
		);
	}

	protected override updateLabels(): void {
		const labels = this.allSelections.map((s) => s.label);
		this.props.labels = labels;
		this.props.label = labels[0] ?? '';
	}
}

export class ComboboxBond extends ComboboxBondBase {
	static override create(props: ComboboxBondProps): ComboboxBond;
	static override create(outer?: OverlayLike): ComboboxBond;
	static override create(props?: ComboboxBondProps | OverlayLike): ComboboxBond {
		return new ComboboxBond(props as ComboboxBondProps);
	}
}
