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
	composeHandlers,
	mergeAttributeLayer,
	mergeHandlerLayer,
	mergeSpreadProps,
	type AtomAttachment,
	type MergeLayerOptions
} from './merge';
// Capability symbols are NOT re-exported here. `shared/index.ts` already star-exports
// `./capability`, so this barrel's second hand-written copy of 43 of those names guarded nothing
// and had already drifted (it was missing `partCapability`, `AnyCapabilitySurface`,
// `SharedCapabilityKeyId`). Import them from `$ixirjs/ui/shared` or `.../shared/capability`.
