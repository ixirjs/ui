// Experimental expert interface. These concrete runtime and protocol exports may change pre-1.0.
export { Bond } from '$ixirjs/ui/shared/bond/bond.svelte';
export { Atom, defineAtom } from '$ixirjs/ui/shared/bond/atom.svelte';
export { Collection } from '$ixirjs/ui/shared/bond/collection.svelte';
export { bindBond, BondBinding } from '$ixirjs/ui/shared/bond/bind.svelte';
export { bondContextKey } from '$ixirjs/ui/shared/bond/context';
export type {
	AtomOptions,
	DefineAtomOptions,
	DefinedAtomClass,
	DefineAtomSetup
} from '$ixirjs/ui/shared/bond/atom.svelte';
export type {
	BondStateProps,
	BondVirtualElement,
	NodeCardinality,
	NodeRegistrationOptions
} from '$ixirjs/ui/shared/bond/types';
export type {
	BondFactory,
	BondBindingOptions,
	CellConfig,
	PropCell,
	PropsSpec
} from '$ixirjs/ui/shared/bond/bind.svelte';

export type {
	AtomConstructor,
	AtomSpec,
	AtomsOf,
	BondBaseClass,
	BondSpec,
	DefinedBond,
	DefinedBondClass,
	FusablePart,
	PartsOf,
	SpecOf
} from '$ixirjs/ui/shared/authoring/define.svelte';
export type { AtomsOfPart, MergeAtoms } from '$ixirjs/ui/shared/authoring/define.svelte';

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
export {
	PopoverBond,
	PopoverContentAtom,
	PopoverIndicatorAtom,
	PopoverOverlayAtom,
	PopoverTailAtom,
	PopoverTriggerAtom,
	PopoverVirtualTriggerAtom
} from '$ixirjs/ui/components/popover/bond.svelte';
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

export { CAPABILITY_PROTOCOL_VERSION } from '$ixirjs/ui/shared/capability/capability';
export type {
	AtomBehavior,
	AtomHost,
	Behavior,
	RoleCtx,
	RoleCtxArgs,
	SharedCapabilityKeyOptions
} from '$ixirjs/ui/shared/capability/capability';

// ─── Interaction policies and bond effects ────────────────────────────────────
// Pointer/gesture/activation policies and whole-bond DOM effects. Experimental rather than stable:
// Scrollable is the first component to drive the pointer policies, and that pass already changed
// their signature (a role's projection ctx is forwarded, so paired thumbs share one slot). The
// gesture, activation and observer families have not had that pass yet.
export {
	thumbDragPolicy,
	trackPressPolicy,
	resizeHandlePolicy,
	THUMB_DRAG_POLICY,
	TRACK_PRESS_POLICY,
	RESIZE_HANDLE_POLICY
} from '$ixirjs/ui/shared/capability/models/interaction-policies/pointer.svelte';
export type {
	ThumbDragPolicyOptions,
	TrackPressPolicyOptions,
	ResizeHandlePolicyOptions,
	DragPolicyHandler
} from '$ixirjs/ui/shared/capability/models/interaction-policies/pointer.svelte';
export {
	swipePolicy,
	longPressPolicy,
	reorderDragPolicy,
	SWIPE_POLICY,
	LONG_PRESS_POLICY,
	REORDER_DRAG_POLICY
} from '$ixirjs/ui/shared/capability/models/interaction-policies/gestures.svelte';
export type {
	DragAxis,
	DragPolicyDetail,
	PolicyGuard,
	SwipeDirection,
	TrackPressDetail
} from '$ixirjs/ui/shared/capability/models/interaction-policies/shared';
export {
	resizeObserverCapability,
	intersectionObserverCapability,
	mutationObserverCapability,
	RESIZE_OBSERVER,
	INTERSECTION_OBSERVER,
	MUTATION_OBSERVER
} from '$ixirjs/ui/shared/capability/models/bond-effects/observers.svelte';
export {
	documentDragCapability,
	DOCUMENT_DRAG
} from '$ixirjs/ui/shared/capability/models/bond-effects/measurement.svelte';
export {
	pointerModalityCapability,
	POINTER_MODALITY
} from '$ixirjs/ui/shared/capability/models/bond-effects/environment.svelte';
export {
	outsidePressListener,
	OUTSIDE_PRESS_LISTENER,
	BODY_SCROLL_LOCK,
	INERT_SIBLINGS
} from '$ixirjs/ui/shared/capability/models/bond-effects/document.svelte';
