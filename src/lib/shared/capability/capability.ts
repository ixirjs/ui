import type { Bond } from '../bond';
import type { BondVirtualElement } from '../bond/types';

// attrs and handlers are folded into spread through shared/bond/merge.ts.
export interface Behavior<
	B extends Bond = Bond,
	E extends Element | BondVirtualElement = Element | BondVirtualElement
> {
	attrs?(bond: B): Record<string, unknown>;
	handlers?(bond: B): Record<string, unknown>;
	onmount?(node: E, bond: B): void | (() => void);
}

export interface AtomHost<E extends Element | BondVirtualElement = Element | BondVirtualElement> {
	readonly id: string;
	readonly name: string;
	readonly kind: string;
	readonly preset: string;
	readonly element: E | undefined;
	hasRole(role: string): boolean;
}

// Atom-hosted behavior runs on the Atom itself. Unlike role projections, it may be installed on
// bondless nodes, so every callback receives the node and an optional bond.
export interface AtomBehavior<
	N = AtomHost,
	B extends Bond = Bond,
	E extends Element | BondVirtualElement = Element | BondVirtualElement
> {
	attrs?(node: N, bond: B | undefined): Record<string, unknown>;
	handlers?(node: N, bond: B | undefined): Record<string, unknown>;
	onmount?(element: E, node: N, bond: B | undefined): void | (() => void);
}

// Phantom type makes the key the registry: capability(key) returns Capability<Surface> without a cast.
declare const SURFACE: unique symbol;
export type CapabilityKey<Surface = unknown> = symbol & { readonly [SURFACE]?: Surface };

export type SurfaceOf<K> = K extends CapabilityKey<infer S> ? S : unknown;

// Unexported keys are unforgeable — the private seam.
export function capabilityKey<Surface = unknown>(description: string): CapabilityKey<Surface> {
	return Symbol(description) as CapabilityKey<Surface>;
}

// Symbol.for survives duplicate library copies and HMR; forgeable by description — the public projection seam.
// Namespace descriptions to avoid global registry collisions.
export function sharedCapabilityKey<Surface = unknown>(
	description: string
): CapabilityKey<Surface> {
	return Symbol.for(description) as CapabilityKey<Surface>;
}

// symbols don't stringify in templates or console output.
export function slotName(slot: symbol): string {
	return slot.description ?? slot.toString();
}

// item/input carry a string ctx; structural roles carry none. Custom roles fall through to optional unknown.
export interface RoleContexts {
	item: string;
	input: string;
	container: void;
	content: void;
	surface: void;
	trigger: void;
	label: void;
	description: void;
	control: void;
}
export type KnownRole = keyof RoleContexts & string;
// Drives .role() enforcement: void → no arg, ctx-bearing → required arg, custom → optional unknown.
export type RoleCtxArgs<R extends string> = R extends KnownRole
	? RoleContexts[R] extends void
		? [ctx?: undefined]
		: [ctx: RoleContexts[R]]
	: [ctx?: unknown];

export type CapabilityLayer = 1 | 2 | 3;

export type CapabilityKind =
	| 'model'
	| 'projection'
	| 'relationship'
	| 'policy'
	| 'effect'
	| 'focused'
	| 'archetype'
	| 'bridge';

export interface CapabilityMetadata {
	// Layer 1 = primitive, Layer 2 = focused composition, Layer 3 = archetype recipe.
	readonly layer?: CapabilityLayer;
	readonly kind?: CapabilityKind;
	// Known role names this capability may project into.
	readonly projects?: readonly string[];
	// Atom roles expected to exist on the bond for the capability to make sense.
	readonly requiresRoles?: readonly string[];
	// Slots or role names this capability intentionally replaces or competes with.
	readonly conflicts?: readonly (symbol | string)[];
	readonly docs?: string;
}

// Bond-hosted capabilities own shared state, coordination, role projection, and whole-bond setup.
// They are the existing Capability runtime shape under an explicit host name.
export interface BondCapability<Surface = unknown> {
	// CapabilityKey phantom drives typed retrieval via bond.state.capability(key) — not through this field.
	readonly slot: symbol;
	// Inert authoring/diagnostic metadata. It does not affect registry, projection, or setup semantics.
	readonly meta?: CapabilityMetadata;
	// Present on stateful models (Disclosure, SelectionModel…); omitted on stateless policies.
	readonly surface?: Surface;
	// DEV validates these slots are registered before this capability projects.
	readonly requires?: readonly symbol[];
	behavior?(role: string, ctx?: unknown): Behavior | undefined;
	// Whole-bond effect run via useCapabilities(); home for document listeners and focus/escape plumbing.
	setup?(bond: Bond): Disposable | (() => void) | void;
	// When a slot is already held, the registry calls compose(prior) instead of replacing — wrap/delegate rather than rewrite. Built by decorateCapability().
	compose?(prior: BondCapability<Surface>): BondCapability<Surface>;
}

// Compatibility name: the pre-vNext public `Capability` is a Bond-hosted capability.
export type Capability<Surface = unknown> = BondCapability<Surface>;

// Atom-hosted capabilities own per-atom presentation, local DOM behavior, and node lifecycle.
export interface AtomCapability<
	Surface = unknown,
	N = AtomHost,
	B extends Bond = Bond,
	E extends Element | BondVirtualElement = Element | BondVirtualElement
> {
	readonly slot?: symbol;
	readonly meta?: CapabilityMetadata;
	readonly surface?: Surface;
	readonly requires?: readonly symbol[];
	readonly behavior?: AtomBehavior<N, B, E>;
	setup?(node: N, bond: B | undefined): Disposable | (() => void) | void;
}

// void roles → no ctx; ctx-bearing → typed; custom → unknown. Drives defineCapability's typed dispatch.
export type RoleCtx<R extends string> = R extends KnownRole
	? RoleContexts[R] extends void
		? void
		: RoleContexts[R]
	: unknown;

// Typed role → projection map. ctx is typed per role; no `ctx as T` casts.
export type CapabilityRoleMap = {
	[R in KnownRole]?: (ctx: RoleCtx<R>) => Behavior | undefined;
} & {
	// Custom roles: ctx is unknown. `never` param keeps these assignable alongside the typed known keys.
	[role: string]: (ctx: never) => Behavior | undefined;
};

// Use roles: (typed map, preferred) or behavior: (raw escape hatch for dynamic role sets).
export interface CapabilityConfig<Surface = unknown> {
	slot: symbol;
	meta?: CapabilityMetadata;
	surface?: Surface;
	requires?: readonly symbol[];
	setup?(bond: Bond): Disposable | (() => void) | void;
	compose?(prior: Capability<Surface>): Capability<Surface>;
	// Preferred: typed role → projection map.
	roles?: CapabilityRoleMap;
	// Escape hatch: raw projection, for capabilities whose handled roles are computed at runtime.
	behavior?(role: string, ctx?: unknown): Behavior | undefined;
}

export type BondCapabilityConfig<Surface = unknown> = CapabilityConfig<Surface>;

export interface AtomCapabilityConfig<
	Surface = unknown,
	N = AtomHost,
	B extends Bond = Bond,
	E extends Element | BondVirtualElement = Element | BondVirtualElement
> {
	slot?: symbol;
	meta?: CapabilityMetadata;
	surface?: Surface;
	requires?: readonly symbol[];
	behavior?: AtomBehavior<N, B, E>;
	setup?(node: N, bond: B | undefined): Disposable | (() => void) | void;
}

// Canonical authoring entry point. Folds roles/behavior into the Capability the registry projects.
export function defineCapability<Surface = unknown>(
	config: CapabilityConfig<Surface>
): Capability<Surface> {
	const { slot, meta, surface, requires, setup, compose, roles, behavior } = config;
	const project =
		behavior ?? (roles ? (role: string, ctx?: unknown) => roles[role]?.(ctx as never) : undefined);
	return {
		slot,
		...(meta ? { meta } : {}),
		...(surface !== undefined ? { surface } : {}),
		...(requires ? { requires } : {}),
		...(setup ? { setup } : {}),
		...(compose ? { compose } : {}),
		...(project ? { behavior: project } : {})
	} as Capability<Surface>;
}

export const defineBondCapability: typeof defineCapability = defineCapability;

export function defineAtomCapability<
	Surface = unknown,
	N = AtomHost,
	B extends Bond = Bond,
	E extends Element | BondVirtualElement = Element | BondVirtualElement
>(config: AtomCapabilityConfig<Surface, N, B, E>): AtomCapability<Surface, N, B, E> {
	return {
		...(config.slot ? { slot: config.slot } : {}),
		...(config.meta ? { meta: config.meta } : {}),
		...(config.surface !== undefined ? { surface: config.surface } : {}),
		...(config.requires ? { requires: config.requires } : {}),
		...(config.behavior ? { behavior: config.behavior } : {}),
		...(config.setup ? { setup: config.setup } : {})
	};
}

export type ModelCapabilityConfig<Surface = unknown> = Omit<
	CapabilityConfig<Surface>,
	'behavior' | 'roles' | 'setup' | 'compose' | 'meta'
> & {
	surface: Surface;
	meta?: Omit<CapabilityMetadata, 'kind' | 'layer'>;
};

export type ProjectionCapabilityConfig<Surface = unknown> = Omit<
	CapabilityConfig<Surface>,
	'meta'
> & {
	roles: CapabilityRoleMap;
	meta?: Omit<CapabilityMetadata, 'kind' | 'layer' | 'projects'> & {
		projects?: readonly string[];
	};
};

export type RelationshipCapabilityConfig<Surface = unknown> = Omit<
	CapabilityConfig<Surface>,
	'meta'
> & {
	meta?: Omit<CapabilityMetadata, 'kind' | 'layer' | 'projects' | 'requiresRoles'> & {
		projects?: readonly string[];
		requiresRoles?: readonly string[];
	};
};

export type PolicyCapabilityConfig<Surface = unknown> = Omit<CapabilityConfig<Surface>, 'meta'> & {
	meta?: Omit<CapabilityMetadata, 'kind' | 'layer' | 'projects'> & {
		projects?: readonly string[];
	};
};

export type EffectCapabilityConfig<Surface = unknown> = Omit<CapabilityConfig<Surface>, 'meta'> & {
	setup: NonNullable<CapabilityConfig<Surface>['setup']>;
	meta?: Omit<CapabilityMetadata, 'kind' | 'layer'>;
};

export interface FocusedCapabilityConfig {
	slot: symbol;
	capabilities: readonly Capability[];
	meta?: Omit<CapabilityMetadata, 'kind' | 'layer'>;
}

export type ArchetypeCapabilities = readonly Capability[] & {
	readonly meta: CapabilityMetadata;
};

function mergeMeta(
	base: CapabilityMetadata,
	meta: CapabilityMetadata | undefined
): CapabilityMetadata {
	return meta ? { ...base, ...meta } : base;
}

export function defineModelCapability<Surface = unknown>(
	config: ModelCapabilityConfig<Surface>
): Capability<Surface> {
	return defineCapability({
		...config,
		meta: mergeMeta({ layer: 1, kind: 'model' }, config.meta)
	});
}

export function defineProjectionCapability<Surface = unknown>(
	config: ProjectionCapabilityConfig<Surface>
): Capability<Surface> {
	return defineCapability({
		...config,
		meta: mergeMeta(
			{ layer: 1, kind: 'projection', projects: Object.keys(config.roles) },
			config.meta
		)
	});
}

export function defineRelationshipCapability<Surface = unknown>(
	config: RelationshipCapabilityConfig<Surface>
): Capability<Surface> {
	return defineCapability({
		...config,
		meta: mergeMeta({ layer: 1, kind: 'relationship' }, config.meta)
	});
}

export function definePolicyCapability<Surface = unknown>(
	config: PolicyCapabilityConfig<Surface>
): Capability<Surface> {
	return defineCapability({
		...config,
		meta: mergeMeta({ layer: 1, kind: 'policy' }, config.meta)
	});
}

export function defineEffectCapability<Surface = unknown>(
	config: EffectCapabilityConfig<Surface>
): Capability<Surface> {
	return defineCapability({
		...config,
		meta: mergeMeta({ layer: 1, kind: 'effect' }, config.meta)
	});
}

export function defineFocusedCapability(
	config: FocusedCapabilityConfig
): Capability<readonly Capability[]> {
	return defineCapability({
		slot: config.slot,
		surface: config.capabilities,
		meta: mergeMeta({ layer: 2, kind: 'focused' }, config.meta)
	});
}

export function defineArchetypeCapabilities(
	capabilities: readonly Capability[],
	meta?: Omit<CapabilityMetadata, 'kind' | 'layer'>
): ArchetypeCapabilities {
	return Object.assign([...capabilities], {
		meta: mergeMeta({ layer: 3, kind: 'archetype' }, meta)
	}) as ArchetypeCapabilities;
}

export interface CapabilityInfo {
	slot: symbol;
	// The slot key's description, for human-readable display (symbols don't stringify in templates).
	description: string | undefined;
	meta?: CapabilityMetadata;
	hasSurface: boolean;
	requires: readonly symbol[];
	hasSetup: boolean;
}

export interface AtomCapabilityInfo {
	slot: symbol | undefined;
	description: string | undefined;
	meta?: CapabilityMetadata;
	hasSurface: boolean;
	requires: readonly symbol[];
	hasBehavior: boolean;
	hasSetup: boolean;
}

// Per-role projection snapshot from one capability; produced by explainBondRole().
export interface RoleProjectionInfo {
	slot: symbol;
	description: string | undefined;
	meta?: CapabilityMetadata;
	attrs?: Record<string, unknown>;
	handlers?: Record<string, unknown>;
	hasOnmount: boolean;
}

// Facets to override when decorating a slot. Omit a field to delegate it to the prior holder.
export interface CapabilityDecoration<S> {
	// base is the prior holder's Behavior for this role, undefined if it doesn't handle it.
	behavior?(role: string, ctx: unknown, base: Behavior | undefined): Behavior | undefined;
	surface?(base: S | undefined): S;
	setup?(base: Capability<S>['setup']): Capability<S>['setup'];
}

// Wrap a slot's current holder, delegating unmodified facets — register AFTER the base or compose fires on nothing.
export function decorateCapability<S>(
	slot: CapabilityKey<S>,
	decoration: CapabilityDecoration<S>
): Capability<S> {
	return {
		slot,
		compose(prior) {
			const surface = decoration.surface ? decoration.surface(prior.surface) : prior.surface;
			const setup = decoration.setup ? decoration.setup(prior.setup) : prior.setup;
			return {
				slot,
				behavior: (role, ctx) => {
					const base = prior.behavior?.(role, ctx);
					return decoration.behavior ? decoration.behavior(role, ctx, base) : base;
				},
				// Conditional spreads: under exactOptionalPropertyTypes, absent key != explicit undefined.
				...(prior.meta ? { meta: prior.meta } : {}),
				...(surface !== undefined ? { surface } : {}),
				...(prior.requires ? { requires: prior.requires } : {}),
				...(setup ? { setup } : {})
			};
		}
	};
}
