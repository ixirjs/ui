import { PopupBond } from './bond.svelte';
import type { PopupProfile } from './profiles';
import type { OverlayState, OverlayProps } from '$ixirjs/ui/components/overlay/model.svelte';
import type { ComputePositionReturn, VirtualElement } from '@floating-ui/dom';
import type { DismissPressEvent } from '$ixirjs/ui/components/overlay/behavior.svelte';
import type { PopoverBondProps } from '$ixirjs/ui/components/popover/bond.svelte';
import type { DropdownMenuBondProps } from '$ixirjs/ui/components/dropdown-menu/bond.svelte';
import type { SelectStateProps } from '$ixirjs/ui/components/select/bond.svelte';
import type { ComboboxBondProps } from '$ixirjs/ui/components/combobox/bond.svelte';
import type { TooltipBondProps } from '$ixirjs/ui/components/tooltip/bond.svelte';
import type { ContextMenuBondProps } from '$ixirjs/ui/components/context-menu/bond.svelte';
import type { DatePickerBondProps } from '$ixirjs/ui/components/date-picker/bond.svelte';
import type { PopoverDialogBondProps } from '$ixirjs/ui/components/popover-dialog/bond.svelte';
export interface PopupRuntime {
	readonly profile: Readonly<PopupProfile>;
	dispose(): void;
}
interface PopupOverlay<Props extends OverlayProps> extends OverlayState<Props>, PopupRuntime {
	tracking: boolean | undefined;
}
export interface PositionedPopup<
	Props extends PopoverBondProps = PopoverBondProps
> extends PopupOverlay<Props> {
	position: ComputePositionReturn | undefined;
	computed: Promise<ComputePositionReturn>;
	readonly shouldTrackPosition: boolean;
	readonly reference: Element | VirtualElement | null;
	onclickoutside: ((event: DismissPressEvent, bond: PositionedPopup) => void) | undefined;
	notifyComputed(value: ComputePositionReturn): void;
	onEscape(event: KeyboardEvent): void;
}
type MenuMembers = Pick<
	PopupBond,
	| 'items'
	| 'roving'
	| 'typeahead'
	| 'ariaHasPopup'
	| 'triggerToggles'
	| 'contentRole'
	| 'contentAttrs'
	| 'navigableItems'
	| 'itemText'
	| 'itemDomId'
	| 'registerItem'
	| 'unregisterItem'
	| 'mountItem'
	| 'unmountItem'
	| 'item'
>;
type SelectionMembers = Pick<PopupBond, 'selection' | 'selections' | 'select' | 'unselect'>;
type InputMembers = Pick<
	PopupBond,
	'input' | 'userSelections' | 'allSelections' | 'addSelection' | 'deleteSelection'
>;
type DateMembers = Pick<
	PopupBond,
	| 'formattedValue'
	| 'hasValue'
	| 'isYearsPickerOpen'
	| 'isMonthsPickerOpen'
	| 'formatDate'
	| 'selectDate'
	| 'selectStart'
	| 'selectEnd'
	| 'clear'
	| 'openYearsPicker'
	| 'closeYearsPicker'
	| 'toggleYearsPicker'
	| 'openMonthsPicker'
	| 'closeMonthsPicker'
	| 'toggleMonthsPicker'
>;
export interface PopoverBond extends PositionedPopup<PopoverBondProps> {}
export interface DropdownMenuBond extends PositionedPopup<DropdownMenuBondProps>, MenuMembers {}
export interface SelectBond
	extends PositionedPopup<SelectStateProps>, MenuMembers, SelectionMembers {}
export interface ComboboxBond
	extends PositionedPopup<ComboboxBondProps>, MenuMembers, SelectionMembers, InputMembers {}
export interface TooltipBond extends PositionedPopup<TooltipBondProps> {}
export interface ContextMenuBond extends PositionedPopup<ContextMenuBondProps>, MenuMembers {
	virtualElement: VirtualElement | undefined;
}
export interface DatePickerBond extends PositionedPopup<DatePickerBondProps>, DateMembers {}
export interface PopoverDialogBond extends PopupOverlay<PopoverDialogBondProps> {}

export interface PopupProps {
	popover: PopoverBondProps;
	'dropdown-menu': DropdownMenuBondProps;
	select: SelectStateProps;
	combobox: ComboboxBondProps;
	tooltip: TooltipBondProps;
	'context-menu': ContextMenuBondProps;
	'date-picker': DatePickerBondProps;
	'popover-dialog': PopoverDialogBondProps;
}
export interface PopupBonds {
	popover: PopoverBond;
	'dropdown-menu': DropdownMenuBond;
	select: SelectBond;
	combobox: ComboboxBond;
	tooltip: TooltipBond;
	'context-menu': ContextMenuBond;
	'date-picker': DatePickerBond;
	'popover-dialog': PopoverDialogBond;
}

export function isDropdownMenuBond(bond: unknown): bond is DropdownMenuBond {
	return bond instanceof PopupBond && bond.profile.collection;
}
export function isSelectBond(bond: unknown): bond is SelectBond {
	return bond instanceof PopupBond && bond.profile.selection;
}
export function isComboboxBond(bond: unknown): bond is ComboboxBond {
	return bond instanceof PopupBond && bond.profile.customSelections;
}
export function isDatePickerBond(bond: unknown): bond is DatePickerBond {
	return bond instanceof PopupBond && bond.profile.dates;
}

// Element-local roles retain family names, but Kernel remains their sole runtime implementation.
// These describe authored elements, not the public Svelte component instances or a second renderer.
import type { KernelElement } from '$ixirjs/ui/kernel/kernel.svelte';
export interface PopoverTriggerAtom extends KernelElement {}
export interface DropdownMenuTriggerAtom extends KernelElement {}
export interface SelectTriggerAtom extends KernelElement {}
export interface ComboboxTriggerAtom extends KernelElement {}
export interface TooltipTriggerAtom extends KernelElement {}
export interface ContextMenuTriggerAtom extends KernelElement {}
export interface DatePickerTriggerAtom extends KernelElement {}
export interface PopoverDialogTriggerAtom extends KernelElement {}
export interface PopoverContentAtom extends KernelElement {}
export interface DropdownMenuContentAtom extends KernelElement {}
export interface SelectContentAtom extends KernelElement {}
export interface ComboboxContentAtom extends KernelElement {}
export interface TooltipContentAtom extends KernelElement {}
export interface ContextMenuContentAtom extends KernelElement {}
export interface DatePickerContentAtom extends KernelElement {}
export interface PopoverDialogContentAtom extends KernelElement {}
export interface SelectQueryAtom extends KernelElement {}
export interface ComboboxQueryAtom extends KernelElement {}
