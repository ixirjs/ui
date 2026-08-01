// Public surface of the bond runtime core.
export { Bond } from './bond.svelte';
export { Atom, defineAtom } from './atom.svelte';
export type {
	DefineAtomSetup,
	DefineAtomOptions,
	DefinedAtomClass,
	AtomOptions
} from './atom.svelte';
export { bondContextKey } from './context';
export { generateId } from './identity';
export type {
	BondClass,
	BondHandle,
	AtomHandle,
	BondElements,
	BondPresetLayers,
	BondStateProps,
	BondVirtualElement,
	NodeCardinality,
	NodeRegistrationOptions,
	NodeRegistration
} from './types';
export {
	bindBond,
	BondBinding,
	controlledProp,
	type BondBindingOptions,
	type ControlledPropOptions,
	type ControlledPropContext,
	type ControlledProp,
	type PropCell,
	type PropsSpec
} from './bind.svelte';
export {
	createAtomInstance,
	type AtomCapabilityEntry,
	type CreateAtomInstanceOptions
} from './use-atom.svelte';
export { Collection } from './collection.svelte';
export {
	composeAttachments,
	composeHandlers,
	mergeAttributeLayer,
	mergeHandlerLayer,
	mergeSpreadProps,
	type AtomAttachment,
	type MergeLayerOptions
} from './merge';
export {
	capabilityKey,
	sharedCapabilityKey,
	defineCapability,
	defineBondCapability,
	defineAtomCapability,
	defineProjectionCapability,
	type AtomBehavior,
	type AtomCapability,
	type AtomCapabilityConfig,
	type AtomHost,
	type Behavior,
	type BondCapability,
	type BondCapabilityConfig,
	type CapabilityKey,
	type SurfaceOf,
	type RoleCtxArgs,
	type Capability,
	type CapabilityEnvelope,
	type CapabilitySetupResult,
	type RoleCtx,
	type CapabilityRoleMap,
	type CapabilityConfig,
	type CapabilityMetadata,
	type ProjectionCapabilityConfig
} from '$ixirjs/ui/shared/capability/capability';
export {
	elementRef,
	pressable,
	focusable,
	dataState,
	ariaRole,
	motion,
	ELEMENT_REF,
	PRESSABLE,
	FOCUSABLE,
	DATA_STATE,
	ARIA_ROLE,
	MOTION,
	type AtomElement,
	type AtomTeardown,
	type AtomValue,
	type ElementRefCallback,
	type ElementRefOptions,
	type PressableOptions,
	type FocusableOptions,
	type DataStateOptions,
	type MotionOptions
} from '$ixirjs/ui/shared/capability/models/atom.svelte';
