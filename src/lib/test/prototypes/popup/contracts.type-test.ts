import { PopupBond, isComboboxBond, isSelectBond } from './bond.svelte';
import { PopupAtom } from './atom.svelte';
import type {
	ComboboxBond,
	ComboboxItemAtom,
	DropdownMenuBond,
	DropdownMenuItemAtom,
	PopoverBond,
	PopupProps,
	SelectBond,
	SelectItemAtom,
	SelectTriggerAtom,
	ComboboxQueryAtom
} from './types';

/** Compile-only: no casts, generated classes or runtime wrappers at authoring sites. */
export function familyContracts(props: PopupProps) {
	const popover: PopoverBond = PopupBond.create('popover', props);
	const menu: DropdownMenuBond = PopupBond.create('dropdown-menu', props);
	const select: SelectBond = PopupBond.create('select', props);
	const combobox: ComboboxBond = PopupBond.create('combobox', props);
	const menuItem: DropdownMenuItemAtom = menu.item('value');
	const selectItem: SelectItemAtom = select.item('value');
	const comboboxItem: ComboboxItemAtom = combobox.item('value');
	const trigger: SelectTriggerAtom = PopupAtom.trigger(select);
	const query: ComboboxQueryAtom = PopupAtom.query(combobox);

	// @ts-expect-error Plain Popover has no collection.
	popover.item('value');
	// @ts-expect-error A menu action is not a selection.
	menu.selection.clear();
	// @ts-expect-error Only Combobox exposes input.
	select.input.clear();
	// @ts-expect-error A menu item cannot offer selection methods.
	menuItem.select();
	// @ts-expect-error Profile inference also rejects unavailable functionality without annotations.
	PopupBond.create('popover', props).selection.clear();

	if (isSelectBond(popover)) popover.selection.clear();
	if (isComboboxBond(popover)) popover.input.clear();
	return { popover, menu, select, combobox, menuItem, selectItem, comboboxItem, trigger, query };
}
