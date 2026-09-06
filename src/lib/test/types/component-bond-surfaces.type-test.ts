import type * as Experimental from '@ixirjs/ui/experimental';

export type ExperimentalComponentBondTypesArePublic = [
	Experimental.AccordionBond,
	Experimental.AlertBond,
	Experimental.CalendarBond,
	Experimental.CardBond,
	Experimental.CollapsibleBond,
	Experimental.ComboboxBond,
	Experimental.ContextMenuBond,
	Experimental.DataGridBond,
	Experimental.DatePickerBond,
	Experimental.DialogBond,
	Experimental.DrawerBond,
	Experimental.DropdownMenuBond,
	Experimental.FieldBond,
	Experimental.FormBond,
	Experimental.InputBond,
	Experimental.PopoverBond,
	Experimental.PopoverDialogBond,
	Experimental.PortalBond,
	Experimental.RootBond,
	Experimental.ScrollableBond,
	Experimental.SelectBond,
	Experimental.SidebarBond,
	Experimental.StackBond,
	Experimental.StepBond,
	Experimental.StepperBond,
	Experimental.TabBond,
	Experimental.TabsBond,
	Experimental.ToastBond,
	Experimental.TooltipBond,
	Experimental.TreeBond
];

// @ts-expect-error Concrete component Bonds are experimental-only.
export type StableAccordionBond = import('@ixirjs/ui/components/accordion').AccordionBond;
// @ts-expect-error Concrete component Bonds are experimental-only.
export type StableAlertBond = import('@ixirjs/ui/components/alert').AlertBond;
// @ts-expect-error Concrete component Bonds are experimental-only.
export type StableCalendarBond = import('@ixirjs/ui/components/calendar').CalendarBond;
// @ts-expect-error Concrete component Bonds are experimental-only.
export type StableCardBond = import('@ixirjs/ui/components/card').CardBond;
// @ts-expect-error Concrete component Bonds are experimental-only.
export type StableCollapsibleBond = import('@ixirjs/ui/components/collapsible').CollapsibleBond;
// Popup family names expose interfaces, not concrete constructors.
export type StableComboboxBond = import('@ixirjs/ui/components/combobox').ComboboxBond;
// Popup family names expose interfaces, not concrete constructors.
export type StableContextMenuBond = import('@ixirjs/ui/components/context-menu').ContextMenuBond;
// @ts-expect-error Concrete component Bonds are experimental-only.
export type StableDataGridBond = import('@ixirjs/ui/components/datagrid').DataGridBond;
// Popup family names expose interfaces, not concrete constructors.
export type StableDatePickerBond = import('@ixirjs/ui/components/date-picker').DatePickerBond;
// @ts-expect-error Concrete component Bonds are experimental-only.
export type StableDialogBond = import('@ixirjs/ui/components/dialog').DialogBond;
// @ts-expect-error Concrete component Bonds are experimental-only.
export type StableDrawerBond = import('@ixirjs/ui/components/drawer').DrawerBond;
// Popup family names expose interfaces, not concrete constructors.
export type StableDropdownMenuBond = import('@ixirjs/ui/components/dropdown-menu').DropdownMenuBond;
// @ts-expect-error Concrete component Bonds are experimental-only.
export type StableFieldBond = import('@ixirjs/ui/components/form').FieldBond;
// @ts-expect-error Concrete component Bonds are experimental-only.
export type StableFormBond = import('@ixirjs/ui/components/form').FormBond;
// @ts-expect-error Concrete component Bonds are experimental-only.
export type StableInputBond = import('@ixirjs/ui/components/input').InputBond;
// Popup family names expose interfaces, not concrete constructors.
export type StablePopoverBond = import('@ixirjs/ui/components/popover').PopoverBond;
export type StablePopoverDialogBond =
	import('@ixirjs/ui/components/popover-dialog').PopoverDialogBond;
// @ts-expect-error Concrete component Bonds are experimental-only.
export type StablePortalBond = import('@ixirjs/ui/components/portal').PortalBond;
// @ts-expect-error Concrete component Bonds are experimental-only.
export type StableRootBond = import('@ixirjs/ui/components/root').RootBond;
// @ts-expect-error Concrete component Bonds are experimental-only.
export type StableScrollableBond = import('@ixirjs/ui/components/scrollable').ScrollableBond;
// Popup family names expose interfaces, not concrete constructors.
export type StableSelectBond = import('@ixirjs/ui/components/select').SelectBond;
// @ts-expect-error Concrete component Bonds are experimental-only.
export type StableSidebarBond = import('@ixirjs/ui/components/sidebar').SidebarBond;
// @ts-expect-error Concrete component Bonds are experimental-only.
export type StableStackBond = import('@ixirjs/ui/components/stack').StackBond;
// @ts-expect-error Concrete component Bonds are experimental-only.
export type StableStepBond = import('@ixirjs/ui/components/stepper').StepBond;
// @ts-expect-error Concrete component Bonds are experimental-only.
export type StableStepperBond = import('@ixirjs/ui/components/stepper').StepperBond;
// @ts-expect-error Concrete component Bonds are experimental-only.
export type StableTabBond = import('@ixirjs/ui/components/tabs').TabBond;
// @ts-expect-error Concrete component Bonds are experimental-only.
export type StableTabsBond = import('@ixirjs/ui/components/tabs').TabsBond;
// @ts-expect-error Concrete component Bonds are experimental-only.
export type StableToastBond = import('@ixirjs/ui/components/toast').ToastBond;
// Popup family names expose interfaces, not concrete constructors.
export type StableTooltipBond = import('@ixirjs/ui/components/tooltip').TooltipBond;
// @ts-expect-error Concrete component Bonds are experimental-only.
export type StableTreeBond = import('@ixirjs/ui/components/tree').TreeBond;

// Canonical authoring is inferred through the published experimental seam; family interfaces
// do not accidentally publish another runtime constructor.
export function canonicalPopupAuthoring(
	props: Experimental.PopupProps['select'],
	contextBond: Experimental.SelectBond
) {
	const bond: StableSelectBond = ExperimentalRuntime.PopupBond.create('select', props);
	if (ExperimentalRuntime.isSelectBond(contextBond)) void contextBond.profile.selection;
	return bond;
}
import * as ExperimentalRuntime from '@ixirjs/ui/experimental';

// @ts-expect-error Family component facades expose the name as a type only.
export type NoStableConstructor = typeof import('@ixirjs/ui/components/select').SelectBond;

// Popup names remain interfaces but none can be constructed through the public expert entry.
type RemovedPopupConstructors =
	| 'PopoverBond'
	| 'DropdownMenuBond'
	| 'SelectBond'
	| 'ComboboxBond'
	| 'TooltipBond'
	| 'ContextMenuBond'
	| 'DatePickerBond'
	| 'PopoverDialogBond'
	| 'mountFactory';
type AssertRemoved<T extends true> = T;
export type NoPopupConstructors = AssertRemoved<
	Extract<RemovedPopupConstructors, keyof typeof ExperimentalRuntime> extends never ? true : false
>;
type PopupRootProps = import('@ixirjs/ui/components/popover').PopoverRootProps &
	import('@ixirjs/ui/components/dropdown-menu').DropdownMenuRootProps &
	import('@ixirjs/ui/components/select').SelectRootProps<string> &
	import('@ixirjs/ui/components/combobox').ComboboxRootProps &
	import('@ixirjs/ui/components/tooltip').TooltipRootProps &
	import('@ixirjs/ui/components/context-menu').ContextMenuRootProps &
	import('@ixirjs/ui/components/date-picker').DatePickerRootProps &
	import('@ixirjs/ui/components/popover-dialog').PopoverDialogRootProps;
export type NoPopupFactories = AssertRemoved<'factory' extends keyof PopupRootProps ? false : true>;
