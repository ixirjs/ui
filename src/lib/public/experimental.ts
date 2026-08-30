// Experimental expert interface. These concrete runtime and protocol exports may change pre-1.0.
//
// The Bond/Atom runtime (`Bond`, `Atom`, `defineAtom`, `bindBond`, `Collection`, the prop-cell
// types) was removed on 2026-08-27 with the rest of the old authoring model: a family's shared
// object is a plain state class published under `Kernel.context`, and every part authors through
// `Kernel.element`. The concrete Bond classes below are those plain classes. ADR 0008.

// Concrete component Bond constructors and their same-name instance types.
export { AccordionBond } from '$ixirjs/ui/components/accordion/bond.svelte';
export { AlertBond } from '$ixirjs/ui/components/alert/bond.svelte';
export { CalendarBond } from '$ixirjs/ui/components/calendar/bond.svelte';
export { CardBond } from '$ixirjs/ui/components/card/bond.svelte';
export { CollapsibleBond } from '$ixirjs/ui/components/collapsible/bond.svelte';
export { ComboboxBond } from '$ixirjs/ui/components/combobox/bond.svelte';
export { ContextMenuBond } from '$ixirjs/ui/components/context-menu/bond.svelte';
export { DataGridBond } from '$ixirjs/ui/components/datagrid/bond.svelte';
export { DatePickerBond } from '$ixirjs/ui/components/date-picker/bond.svelte';
export { DialogBond } from '$ixirjs/ui/components/dialog/bond.svelte';
export { DrawerBond } from '$ixirjs/ui/components/drawer/bond.svelte';
export { DropdownMenuBond } from '$ixirjs/ui/components/dropdown-menu/bond.svelte';
export { FieldBond } from '$ixirjs/ui/components/form/field/bond.svelte';
export { FormBond } from '$ixirjs/ui/components/form/bond.svelte';
export { InputBond } from '$ixirjs/ui/components/input/bond.svelte';
export { PopoverBond } from '$ixirjs/ui/components/popover/bond.svelte';
export { PopoverDialogBond } from '$ixirjs/ui/components/popover-dialog/bond.svelte';
export { PortalBond } from '$ixirjs/ui/components/portal/instance/bond.svelte';
export { RadioGroupBond } from '$ixirjs/ui/components/radio/bond.svelte';
export { RootBond } from '$ixirjs/ui/components/root/bond.svelte';
export { ScrollableBond } from '$ixirjs/ui/components/scrollable/bond.svelte';
export { SelectBond } from '$ixirjs/ui/components/select/bond.svelte';
export { SidebarBond } from '$ixirjs/ui/components/sidebar/bond.svelte';
export { StackBond } from '$ixirjs/ui/components/stack/bond.svelte';
export { StepBond } from '$ixirjs/ui/components/stepper/step/bond.svelte';
export { StepperBond } from '$ixirjs/ui/components/stepper/bond.svelte';
export { TabBond } from '$ixirjs/ui/components/tabs/tab/bond.svelte';
export { TabsBond } from '$ixirjs/ui/components/tabs/bond.svelte';
export { ToastBond } from '$ixirjs/ui/components/toast/bond.svelte';
export { TooltipBond } from '$ixirjs/ui/components/tooltip/bond.svelte';
export { TreeBond } from '$ixirjs/ui/components/tree/bond.svelte';

// ─── Interaction policy helpers ───────────────────────────────────────────────
// Pointer-gesture arithmetic the Scrollable parts drive directly. The policy *capabilities* that
// used to wrap these (thumbDrag/trackPress/resizeHandle/swipe/longPress/reorderDrag) went with the
// Bond/Atom runtime on 2026-08-27, as did the whole-bond DOM effects (the observer, drag-measure,
// pointer-modality and document capabilities) — a family writes those as its own attachment now.
export {
	capturePointer,
	dragDetail,
	isDisabled,
	releasePointer,
	shouldSkipPolicy,
	trackPressDetail
} from '$ixirjs/ui/capability/models/interaction-policies/shared';
export type {
	DragAxis,
	DragPolicyDetail,
	PolicyAction,
	PolicyGuard,
	PolicyOwner,
	SwipeDirection,
	TrackPressDetail
} from '$ixirjs/ui/capability/models/interaction-policies/shared';
