// Public surface of the bond runtime core.
export { Bond } from './bond.svelte';
export { BondState } from './state.svelte';
export { Atom, defineAtom } from './atom.svelte';
export type { DefineAtomSetup, AtomOptions } from './atom.svelte';
export { bondContextKey } from './context';
export type {
	BondClass,
	BondElements,
	BondStateProps,
	BondVirtualElement,
	NodeCardinality,
	NodeRegistrationOptions,
	NodeRegistration
} from './types';
export { bindBond, BondBinding, type BondBindingOptions } from './bind.svelte';
export { bondFactory } from './factory';
export {
	createAtomInstance,
	type AtomCapabilityEntry,
	type CreateAtomInstanceOptions
} from './use-atom.svelte';
export { Collection } from './collection.svelte';
export { explainBondRole } from './diagnostics';
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
	defineModelCapability,
	defineProjectionCapability,
	defineRelationshipCapability,
	definePolicyCapability,
	defineEffectCapability,
	defineFocusedCapability,
	defineArchetypeCapabilities,
	decorateCapability,
	type AtomBehavior,
	type AtomCapability,
	type AtomCapabilityConfig,
	type AtomCapabilityInfo,
	type AtomHost,
	type Behavior,
	type BondCapability,
	type BondCapabilityConfig,
	type CapabilityKey,
	type SurfaceOf,
	type RoleContexts,
	type KnownRole,
	type RoleCtxArgs,
	type Capability,
	type RoleCtx,
	type CapabilityRoleMap,
	type CapabilityConfig,
	type CapabilityLayer,
	type CapabilityKind,
	type CapabilityMetadata,
	type ModelCapabilityConfig,
	type ProjectionCapabilityConfig,
	type RelationshipCapabilityConfig,
	type PolicyCapabilityConfig,
	type EffectCapabilityConfig,
	type FocusedCapabilityConfig,
	type ArchetypeCapabilities,
	type CapabilityInfo,
	type RoleProjectionInfo,
	type CapabilityDecoration
} from '../capability/capability';
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
} from '../capability/models/atom.svelte';
