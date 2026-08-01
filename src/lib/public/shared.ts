// Stable factory-based authoring interface. Concrete runtime and protocol plumbing are experimental.
export { controlledProp } from '$ixirjs/ui/shared/bond/bind.svelte';
export type { ControlledProp, ControlledPropOptions } from '$ixirjs/ui/shared/bond/bind.svelte';
export { createAtomInstance } from '$ixirjs/ui/shared/bond/use-atom.svelte';
export type { BondHandle, AtomHandle } from '$ixirjs/ui/shared/bond/types';
export type {
	AtomCapabilityEntry,
	CreateAtomInstanceOptions
} from '$ixirjs/ui/shared/bond/use-atom.svelte';

export { defineBond } from '$ixirjs/ui/shared/authoring/define.svelte';
export { usePart } from '$ixirjs/ui/shared/authoring/use-part.svelte';
export type { UsedPart, UsePartOptions } from '$ixirjs/ui/shared/authoring/use-part.svelte';
export { useRoot } from '$ixirjs/ui/shared/authoring/use-root.svelte';
export type { UsedRoot, UseRootOptions } from '$ixirjs/ui/shared/authoring/use-root.svelte';
export type { BondOf, PropsOf } from '$ixirjs/ui/shared/authoring/define.svelte';

// Descriptor interning: surface-less capability factories are called per rendered part, so an
// authored family wants the same sharing the built-in ones get.
export { internCapabilityFactory } from '$ixirjs/ui/shared/capability/intern';
export {
	capabilityKey,
	sharedCapabilityKey,
	defineBondCapability,
	defineAtomCapability,
	roles,
	customRole
} from '$ixirjs/ui/shared/capability/capability';
export type {
	AtomCapability,
	AtomCapabilityConfig,
	BondCapability,
	BondCapabilityConfig,
	CapabilityKey,
	CapabilitySetupResult,
	Role,
	SurfaceOf
} from '$ixirjs/ui/shared/capability/capability';

export {
	createDisclosure,
	disclosureCapability,
	disclosureTrigger,
	disclosureClose,
	disclosureToggle,
	DISCLOSURE
} from '$ixirjs/ui/shared/capability/models/disclosure.svelte';
export type {
	Disclosure,
	DisclosureBacking,
	DisclosureActivationOptions
} from '$ixirjs/ui/shared/capability/models/disclosure.svelte';
export type { DisclosureStateProps } from '$ixirjs/ui/shared/capability/models/disclosure-state.svelte';
export {
	collectionCapability,
	collectionSlot
} from '$ixirjs/ui/shared/capability/models/collection.svelte';
export type {
	CollectionCapability,
	CollectionProjectionOptions
} from '$ixirjs/ui/shared/capability/models/collection.svelte';
export {
	createSelection,
	selectionCapability,
	SELECTION
} from '$ixirjs/ui/shared/capability/models/selection.svelte';
export type {
	SelectionBacking,
	SelectionModel,
	SelectionProjectionOptions
} from '$ixirjs/ui/shared/capability/models/selection.svelte';
export {
	createInput,
	inputCapability,
	INPUT
} from '$ixirjs/ui/shared/capability/models/input.svelte';
export type {
	InputField,
	InputModel,
	InputProjectionOptions
} from '$ixirjs/ui/shared/capability/models/input.svelte';
export {
	createRovingFocus,
	rovingCapability,
	ROVING
} from '$ixirjs/ui/shared/capability/models/roving.svelte';
export type {
	RovingBacking,
	RovingFocus,
	RovingProjectionOptions
} from '$ixirjs/ui/shared/capability/models/roving.svelte';
export {
	triggerContentLink,
	labelledControl,
	tabPanelLink,
	errorMessageLink
} from '$ixirjs/ui/shared/capability/models/relationship.svelte';
export {
	elementRef,
	pressable,
	focusable,
	dataState,
	ariaRole,
	motion
} from '$ixirjs/ui/shared/capability/models/atom.svelte';
export type {
	AtomElement,
	AtomTeardown,
	AtomValue,
	ElementRefCallback,
	ElementRefOptions,
	PressableOptions,
	FocusableOptions,
	DataStateOptions,
	MotionOptions
} from '$ixirjs/ui/shared/capability/models/atom.svelte';

// Motion primitives used by families that animate their own parts.
export { animate } from '$ixirjs/ui/shared/animation';
export type { Easing } from '$ixirjs/ui/shared/animation';
export { DURATION } from '$ixirjs/ui/constants/motion';

// ─── State models ─────────────────────────────────────────────────────────────
// Same shape as the selection/input/roving models above: a `create*` backing-to-model factory plus
// a `*Capability` projection. Exported so an authored family composes the same primitives the
// built-in components do, rather than re-deriving ARIA and data-attribute conventions per family.
export {
	createChecked,
	checkedCapability,
	CHECKED
} from '$ixirjs/ui/shared/capability/models/checked.svelte';
export type {
	CheckedState,
	CheckedBacking,
	CheckedModel,
	CheckedProjectionOptions
} from '$ixirjs/ui/shared/capability/models/checked.svelte';
export {
	createPressed,
	pressedCapability,
	PRESSED
} from '$ixirjs/ui/shared/capability/models/pressed.svelte';
export type {
	PressedBacking,
	PressedModel,
	PressedProjectionOptions
} from '$ixirjs/ui/shared/capability/models/pressed.svelte';
export {
	createProgressValue,
	progressValueCapability,
	PROGRESS_VALUE
} from '$ixirjs/ui/shared/capability/models/progress.svelte';
export type {
	ProgressValueBacking,
	ProgressValueModel,
	ProgressValueProjectionOptions
} from '$ixirjs/ui/shared/capability/models/progress.svelte';
export {
	createRangeValue,
	rangeValueCapability,
	RANGE_VALUE
} from '$ixirjs/ui/shared/capability/models/range.svelte';
export type {
	RangeValueBacking,
	RangeValueModel,
	RangeValueProjectionOptions
} from '$ixirjs/ui/shared/capability/models/range.svelte';
export { createSort, sortCapability, SORT } from '$ixirjs/ui/shared/capability/models/sort.svelte';
export {
	createPagination,
	paginationCapability,
	PAGINATION
} from '$ixirjs/ui/shared/capability/models/pagination.svelte';
export {
	createLoading,
	loadingCapability,
	LOADING
} from '$ixirjs/ui/shared/capability/models/loading.svelte';
export {
	createViewport,
	viewportCapability,
	VIEWPORT
} from '$ixirjs/ui/shared/capability/models/viewport.svelte';
export type {
	ViewportBacking,
	ViewportModel,
	ViewportSize,
	ViewportScroll,
	ViewportRange
} from '$ixirjs/ui/shared/capability/models/viewport.svelte';
export {
	createGeometry,
	geometryCapability,
	GEOMETRY
} from '$ixirjs/ui/shared/capability/models/geometry.svelte';
export {
	createDateSelection,
	dateSelectionCapability,
	DATE_SELECTION
} from '$ixirjs/ui/shared/capability/models/date-selection.svelte';
export {
	createStatus,
	statusCapability,
	STATUS
} from '$ixirjs/ui/shared/capability/models/status.svelte';
export {
	createValidation,
	validationCapability,
	VALIDATION
} from '$ixirjs/ui/shared/capability/models/validation.svelte';
export {
	createTypeahead,
	typeaheadCapability,
	TYPEAHEAD
} from '$ixirjs/ui/shared/capability/models/typeahead.svelte';
export {
	navigationCapability,
	NAVIGATION
} from '$ixirjs/ui/shared/capability/models/navigation.svelte';

// Role projections: cross-cutting `disabled` / `orientation` / `aria-current` attributes that
// otherwise get hand-written per Atom, which is what the AGENTS.md rule against per-atom ARIA
// exists to prevent.
export {
	disabledProjection,
	orientationProjection,
	currentProjection,
	DISABLED_PROJECTION,
	ORIENTATION_PROJECTION,
	CURRENT_PROJECTION
} from '$ixirjs/ui/shared/capability/models/role-projections.svelte';
