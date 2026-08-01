import type * as Experimental from '@ixirjs/ui/experimental';
import type * as Shared from '@ixirjs/ui/shared';

export type StableAuthoringTypesArePublic = [
	Shared.BondHandle,
	Shared.AtomHandle,
	Shared.AtomCapabilityEntry,
	Shared.CreateAtomInstanceOptions,
	Shared.BondOf<Experimental.DefinedBondClass<Experimental.BondSpec>>,
	Shared.PropsOf<Experimental.BondSpec>,
	Shared.UsedPart<Experimental.Bond, Experimental.Atom>,
	Shared.UsePartOptions,
	Shared.AtomCapability,
	Shared.AtomCapabilityConfig,
	Shared.BondCapability,
	Shared.BondCapabilityConfig,
	Shared.CapabilityKey,
	Shared.CapabilitySetupResult,
	Shared.Role,
	Shared.SurfaceOf<Shared.CapabilityKey<unknown>>,
	Shared.Disclosure,
	Shared.DisclosureBacking,
	Shared.DisclosureActivationOptions,
	Shared.CollectionCapability<unknown>,
	Shared.CollectionProjectionOptions,
	Shared.SelectionBacking<unknown>,
	Shared.SelectionModel<unknown>,
	Shared.SelectionProjectionOptions,
	Shared.RovingBacking,
	Shared.RovingFocus,
	Shared.RovingProjectionOptions,
	Shared.AtomElement,
	Shared.AtomTeardown,
	Shared.AtomValue<unknown>,
	Shared.ElementRefCallback,
	Shared.ElementRefOptions,
	Shared.PressableOptions,
	Shared.FocusableOptions,
	Shared.DataStateOptions,
	Shared.MotionOptions
];

export type ExperimentalRuntimeTypesArePublic = [
	Experimental.Bond,
	Experimental.Atom,
	Experimental.Collection<unknown>,
	Experimental.BondBinding,
	Experimental.AtomOptions,
	Experimental.DefineAtomOptions,
	Experimental.DefinedAtomClass,
	Experimental.DefineAtomSetup<Experimental.Atom, Experimental.Bond | undefined>,
	Experimental.BondStateProps,
	Experimental.BondVirtualElement,
	Experimental.NodeCardinality,
	Experimental.NodeRegistrationOptions,
	Experimental.BondFactory<Experimental.Bond>,
	Experimental.BondBindingOptions,
	Experimental.CellConfig,
	Experimental.PropCell<unknown>,
	Experimental.PropsSpec<Record<string, unknown>>
];

export type ExperimentalDefinitionAndProtocolTypesArePublic = [
	Experimental.AtomConstructor,
	Experimental.AtomSpec,
	Experimental.AtomsOf<Experimental.BondSpec>,
	Experimental.BondBaseClass,
	Experimental.BondSpec,
	Experimental.DefinedBond<Experimental.BondSpec>,
	Experimental.DefinedBondClass<Experimental.BondSpec>,
	Experimental.FusablePart,
	Experimental.MethodsOf<Experimental.BondSpec>,
	Experimental.PartsOf<Experimental.BondSpec>,
	Experimental.SpecOf<Experimental.DefinedBondClass<Experimental.BondSpec>>,
	Experimental.AtomsOfPart<Experimental.DefinedBondClass<Experimental.BondSpec>>,
	Experimental.MergeAtoms<[]>,
	Experimental.AtomBehavior,
	Experimental.AtomHost,
	Experimental.Behavior,
	Experimental.RoleCtx<Shared.Role>,
	Experimental.RoleCtxArgs<Shared.Role>,
	Experimental.SharedCapabilityKeyOptions
];

// @ts-expect-error Concrete runtime classes are experimental-only.
export type StableDoesNotExposeBond = Shared.Bond;
// @ts-expect-error Concrete runtime classes are experimental-only.
export type StableDoesNotExposeAtom = Shared.Atom;
// @ts-expect-error Concrete state classes are experimental-only.
export type StableDoesNotExposeBondState = Shared.BondState;
// @ts-expect-error Concrete collections are experimental-only.
export type StableDoesNotExposeCollection = Shared.Collection<unknown>;
// @ts-expect-error Lifecycle administration is experimental-only.
export type StableDoesNotExposeBondBinding = Shared.BondBinding;
// @ts-expect-error Concrete Atom options are experimental-only.
export type StableDoesNotExposeAtomOptions = Shared.AtomOptions;
// @ts-expect-error Concrete Atom options are experimental-only.
export type StableDoesNotExposeDefineAtomOptions = Shared.DefineAtomOptions;
// @ts-expect-error Concrete Atom classes are experimental-only.
export type StableDoesNotExposeDefinedAtomClass = Shared.DefinedAtomClass;
// @ts-expect-error Concrete Atom setup is experimental-only.
export type StableDoesNotExposeDefineAtomSetup = Shared.DefineAtomSetup<never, never>;
// @ts-expect-error Concrete state props are experimental-only.
export type StableDoesNotExposeBondStateProps = Shared.BondStateProps;
// @ts-expect-error Concrete virtual elements are experimental-only.
export type StableDoesNotExposeBondVirtualElement = Shared.BondVirtualElement;
// @ts-expect-error Registry cardinality is experimental-only.
export type StableDoesNotExposeNodeCardinality = Shared.NodeCardinality;
// @ts-expect-error Registry options are experimental-only.
export type StableDoesNotExposeNodeRegistrationOptions = Shared.NodeRegistrationOptions;
// @ts-expect-error Concrete factories are experimental-only.
export type StableDoesNotExposeBondFactory = Shared.BondFactory<never>;
// @ts-expect-error Lifecycle administration is experimental-only.
export type StableDoesNotExposeBondBindingOptions = Shared.BondBindingOptions;
// @ts-expect-error Concrete cell configuration is experimental-only.
export type StableDoesNotExposeCellConfig = Shared.CellConfig;
// @ts-expect-error Concrete prop cells are experimental-only.
export type StableDoesNotExposePropCell = Shared.PropCell<unknown>;
// @ts-expect-error Concrete prop specs are experimental-only.
export type StableDoesNotExposePropsSpec = Shared.PropsSpec<Record<string, unknown>>;
// @ts-expect-error Raw definition records are experimental-only.
export type StableDoesNotExposeAtomConstructor = Shared.AtomConstructor;
// @ts-expect-error Raw definition records are experimental-only.
export type StableDoesNotExposeAtomSpec = Shared.AtomSpec;
// @ts-expect-error Raw definition records are experimental-only.
export type StableDoesNotExposeAtomsOf = Shared.AtomsOf<never>;
// @ts-expect-error Raw definition records are experimental-only.
export type StableDoesNotExposeBondBaseClass = Shared.BondBaseClass;
// @ts-expect-error Raw definition records are experimental-only.
export type StableDoesNotExposeBondSpec = Shared.BondSpec;
// @ts-expect-error Raw definition records are experimental-only.
export type StableDoesNotExposeDefinedBond = Shared.DefinedBond<never>;
// @ts-expect-error Raw definition records are experimental-only.
export type StableDoesNotExposeDefinedBondClass = Shared.DefinedBondClass<never>;
// @ts-expect-error Raw definition records are experimental-only.
export type StableDoesNotExposeFusablePart = Shared.FusablePart;
// @ts-expect-error Raw definition records are experimental-only.
export type StableDoesNotExposeMethodsOf = Shared.MethodsOf<never>;
// @ts-expect-error Raw definition records are experimental-only.
export type StableDoesNotExposePartsOf = Shared.PartsOf<never>;
// @ts-expect-error Raw definition records are experimental-only.
export type StableDoesNotExposeSpecOf = Shared.SpecOf<never>;
// @ts-expect-error Raw definition records are experimental-only.
export type StableDoesNotExposeStateOf = Shared.StateOf<never>;
// @ts-expect-error Raw definition records are experimental-only.
export type StableDoesNotExposeViewOf = Shared.ViewOf<never>;
// @ts-expect-error Raw composition records are experimental-only.
export type StableDoesNotExposeAtomsOfPart = Shared.AtomsOfPart<never>;
// @ts-expect-error Raw composition records are experimental-only.
export type StableDoesNotExposeMergeAtoms = Shared.MergeAtoms<[]>;
// @ts-expect-error Registries are not part of stable authoring.
export type StableDoesNotExposeCapabilityRegistry = Shared.CapabilityRegistry;
// @ts-expect-error Protocol records are experimental-only.
export type StableDoesNotExposeAtomBehavior = Shared.AtomBehavior;
// @ts-expect-error Protocol records are experimental-only.
export type StableDoesNotExposeAtomHost = Shared.AtomHost;
// @ts-expect-error Protocol records are experimental-only.
export type StableDoesNotExposeBehavior = Shared.Behavior;
// @ts-expect-error Protocol diagnostics are experimental-only.
export type StableDoesNotExposeRoleContext = Shared.RoleCtx<Shared.Role>;
// @ts-expect-error Protocol diagnostics are experimental-only.
export type StableDoesNotExposeRoleContextArgs = Shared.RoleCtxArgs<Shared.Role>;
// @ts-expect-error Protocol diagnostics are experimental-only.
export type StableDoesNotExposeSharedKeyDeclarations = Shared.SharedCapabilityKeyDeclaration;
// @ts-expect-error Protocol diagnostics are experimental-only.
export type StableDoesNotExposeSharedKeyOptions = Shared.SharedCapabilityKeyOptions;
// @ts-expect-error defineAtom is an experimental concrete factory.
export type StableDoesNotExposeDefineAtom = typeof Shared.defineAtom;
