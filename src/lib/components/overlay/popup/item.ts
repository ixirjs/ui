import { generateId } from '$ixirjs/ui/authoring';
import type { DropdownMenuBondBase } from '$ixirjs/ui/components/dropdown-menu/bond.svelte';
import type { SelectBondBase } from '$ixirjs/ui/components/select/bond.svelte';
import type { DropdownMenuItemAtomProps } from '$ixirjs/ui/components/dropdown-menu/item/bond.svelte';
import type { SelectItemAtomProps } from '$ixirjs/ui/components/select/item/bond.svelte';

type ItemMembers =
	| 'id'
	| 'props'
	| 'bond'
	| 'createdAt'
	| 'preset'
	| 'domId'
	| 'element'
	| 'isHighlighted'
	| 'close';
export interface DropdownMenuItemAtom extends Pick<
	CollectionItemAtom<DropdownMenuItemAtomProps>,
	ItemMembers
> {}
export interface ContextMenuItemAtom extends DropdownMenuItemAtom {}
export interface SelectItemAtom<D = unknown> extends Pick<
	CollectionItemAtom<SelectItemAtomProps<D>, SelectionOwner>,
	ItemMembers | 'value' | 'data' | 'label' | 'isSelected' | 'select' | 'unselect' | 'toggle'
> {}
export interface ComboboxItemAtom<D = unknown> extends SelectItemAtom<D> {}

type ItemProps = {
	id?: string;
	value?: string;
	disabled?: boolean | undefined;
	label?: string;
	data?: unknown;
};
type Owner = Pick<DropdownMenuBondBase, keyof DropdownMenuBondBase>;
type SelectionOwner = Pick<SelectBondBase, keyof SelectBondBase>;

/** Canonical element-local handle. Shared state and commands stay on the owner. */
export class CollectionItemAtom<P extends ItemProps = ItemProps, B extends Owner = Owner> {
	readonly id: string;
	readonly props: P;
	readonly bond: B;
	readonly selection: boolean;
	readonly #selected: SelectionOwner | undefined;
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	readonly createdAt = new Date();

	constructor(props: P, bond: B, selection?: SelectionOwner) {
		this.props = props;
		this.bond = bond;
		this.selection = selection !== undefined;
		this.#selected = selection;
		this.id = props.id ?? generateId();
	}
	get preset() {
		return `${this.bond.name}.item`;
	}
	get value(): string {
		return this.props.value!;
	}
	get data(): P['data'] {
		return this.props.data;
	}
	get domId() {
		return `${this.selection ? 'select' : 'menu'}-item-${this.id}`;
	}
	get element(): HTMLElement | null {
		return typeof document === 'undefined' ? null : document.getElementById(this.domId);
	}
	get label() {
		// Typeahead probes runtime properties. An empty label preserves the menu's own
		// props/whole-element fallback instead of accidentally adopting Select's [data-label].
		if (!this.selection) return '';
		const element = this.element;
		const labelled = (element?.querySelector('[data-label]') ?? element) as HTMLElement | null;
		return labelled?.innerText ?? this.props.label ?? '';
	}
	get isHighlighted() {
		return this.bond.roving.activeId === (this.selection ? this.value : this.id);
	}
	get isSelected() {
		return this.#selectOwner().selection.isSelected(this.value);
	}
	select() {
		this.#selectOwner().select([this.value]);
	}
	unselect() {
		this.#selectOwner().unselect([this.value]);
	}
	toggle() {
		if (this.isSelected) this.unselect();
		else this.select();
	}
	close(event?: Event) {
		if (!this.selection)
			this.bond.stageOpenChange({ ...(event ? { event } : {}), reason: 'item-select' });
		this.bond.close();
	}
	#selectOwner() {
		if (!this.#selected) throw new Error('No selection capability');
		return this.#selected;
	}
}

/** Checked view factories: payloads stay generic and no assertion hides a missing member. */
export const menuItem = (props: DropdownMenuItemAtomProps, bond: Owner): DropdownMenuItemAtom =>
	new CollectionItemAtom(props, bond);
export const selectItem = <D>(
	props: SelectItemAtomProps<D>,
	bond: SelectionOwner
): SelectItemAtom<D> => new CollectionItemAtom(props, bond, bond);
