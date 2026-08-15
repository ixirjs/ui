import type { Bond } from '$ixirjs/ui/shared/bond';
import type { BondVirtualElement } from '$ixirjs/ui/shared/bond/types';

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

export interface AtomBehavior<
	N = AtomHost,
	B extends Bond = Bond,
	E extends Element | BondVirtualElement = Element | BondVirtualElement
> {
	attrs?(node: N, bond: B | undefined): Record<string, unknown>;
	handlers?(node: N, bond: B | undefined): Record<string, unknown>;
	onmount?(element: E, node: N, bond: B | undefined): void | (() => void);
}

/** Protocol carried by shared keys. Bump only for incompatible runtime changes. */
export const CAPABILITY_PROTOCOL_VERSION = 1;

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- erased surface for heterogeneous registries
export type AnyCapabilitySurface = any;

declare const SURFACE: unique symbol;
// The input and output positions make Surface invariant under strictFunctionTypes.
export type CapabilityKey<Surface = AnyCapabilitySurface> = symbol & {
	readonly [SURFACE]: (surface: Surface) => Surface;
};
export type SurfaceOf<K> = K extends CapabilityKey<infer S> ? S : never;

export interface SharedCapabilityKeyOptions {
	/** Package or organisation namespace, for example `@ixirjs` or `@acme/widgets`. */
	owner: string;
	/** Owner-local protocol name, for example `cap:disclosure`. */
	name: string;
	version: number;
}

interface SharedCapabilityKeyDeclaration extends SharedCapabilityKeyOptions {
	readonly symbol: symbol;
}

const sharedKeyDeclarations = sharedRegistry();

function sharedRegistry(): Map<symbol, SharedCapabilityKeyDeclaration> {
	const registrySlot = Symbol.for('@ixirjs/capability/shared-key-registry');
	const root = globalThis as typeof globalThis & {
		[registrySlot]?: Map<symbol, SharedCapabilityKeyDeclaration>;
	};
	return (root[registrySlot] ??= new Map());
}

/** Creates an unshared, local key. Local descriptions are diagnostic-only. */
export function capabilityKey<Surface = unknown>(description: string): CapabilityKey<Surface> {
	return Symbol(description) as CapabilityKey<Surface>;
}

/**
 * The `"@owner:name"` shorthand — the key's own identity string, since `sharedCapabilityKey` builds
 * its symbol from exactly that. Implies `version: 1`; declaring an incompatible protocol means
 * bumping the version, which is the point at which the object form is worth writing out.
 */
export type SharedCapabilityKeyId = `@${string}:${string}`;

/**
 * Creates a cross-copy key. Identity deliberately excludes `version`: duplicate physical copies
 * still converge through Symbol.for, while an incompatible declaration is diagnosed immediately.
 */
export function sharedCapabilityKey<Surface = AnyCapabilitySurface>(
	options: SharedCapabilityKeyOptions | SharedCapabilityKeyId
): CapabilityKey<Surface> {
	if (typeof options === 'string') return sharedCapabilityKey<Surface>(parseKeyId(options));
	if (!options.owner.startsWith('@') || !options.name || !Number.isInteger(options.version)) {
		throw new Error(
			'[ixirjs] shared capability keys require a namespaced owner, non-empty name, and integer protocol version.'
		);
	}
	const symbol = Symbol.for(`${options.owner}:${options.name}`);
	const current = sharedKeyDeclarations.get(symbol);
	if (current) {
		if (
			current.owner !== options.owner ||
			current.name !== options.name ||
			current.version !== options.version
		) {
			console.warn(
				`[ixirjs] incompatible shared capability key declaration for "${options.owner}:${options.name}": protocol version ${current.version} is already registered, received ${options.version}.`
			);
		}
	} else {
		sharedKeyDeclarations.set(symbol, { ...options, symbol });
	}
	return symbol as CapabilityKey<Surface>;
}

// Split on the first colon only: an owner is a package scope and never contains one, while a name
// may (`@ixirjs/cap:cap:disclosure` is a legal, if unusual, owner-local name).
function parseKeyId(id: SharedCapabilityKeyId): SharedCapabilityKeyOptions {
	const separator = id.indexOf(':');
	return {
		owner: separator < 0 ? id : id.slice(0, separator),
		name: separator < 0 ? '' : id.slice(separator + 1),
		version: 1
	};
}

export function slotName(slot: symbol): string {
	return slot.description ?? slot.toString();
}

// Role strings remain the internal dispatch representation. `roles` and `customRole` are the
// collision-safe authoring values; raw strings are intentionally only accepted by dynamic APIs.
declare const ROLE: unique symbol;
export type Role<Name extends string = string, Context = unknown> = string & {
	readonly [ROLE]: { readonly name: Name; readonly context: Context };
};
export interface CustomRoleOptions<Name extends string> {
	owner: string;
	name: Name;
}
function role<Name extends string, Context>(owner: string, name: Name): Role<Name, Context> {
	// Built-ins retain their concise runtime projection names; custom roles are namespaced.
	return (owner === '@ixirjs' ? name : `${owner}:role:${name}`) as Role<Name, Context>;
}
export const roles = {
	item: role<'item', string>('@ixirjs', 'item'),
	input: role<'input', string>('@ixirjs', 'input'),
	container: role<'container', void>('@ixirjs', 'container'),
	content: role<'content', void>('@ixirjs', 'content'),
	surface: role<'surface', void>('@ixirjs', 'surface'),
	trigger: role<'trigger', void>('@ixirjs', 'trigger'),
	label: role<'label', void>('@ixirjs', 'label'),
	description: role<'description', void>('@ixirjs', 'description'),
	control: role<'control', void>('@ixirjs', 'control'),
	close: role<'close', void>('@ixirjs', 'close'),
	backdrop: role<'backdrop', void>('@ixirjs', 'backdrop'),
	tab: role<'tab', void>('@ixirjs', 'tab'),
	tabpanel: role<'tabpanel', void>('@ixirjs', 'tabpanel'),
	treeitem: role<'treeitem', void>('@ixirjs', 'treeitem'),
	treegroup: role<'treegroup', void>('@ixirjs', 'treegroup'),
	row: role<'row', void>('@ixirjs', 'row'),
	column: role<'column', string | undefined>('@ixirjs', 'column'),
	cell: role<'cell', string | { headers?: string | readonly string[] } | undefined>(
		'@ixirjs',
		'cell'
	),
	error: role<'error', void>('@ixirjs', 'error')
} as const;
export function customRole<Name extends string, Context = unknown>(
	options: CustomRoleOptions<Name>
): Role<Name, Context> {
	if (!options.owner.startsWith('@') || !options.name) {
		throw new Error('[ixirjs] custom roles require a namespaced owner and non-empty name.');
	}
	return role<Name, Context>(options.owner, options.name);
}
export type RoleCtxArgs<R> =
	R extends Role<string, infer Context>
		? [Context] extends [void]
			? [ctx?: undefined]
			: undefined extends Context
				? [ctx?: Context]
				: [ctx: Context]
		: [ctx?: unknown];
export type RoleCtx<R> = R extends Role<string, infer Context> ? Context : unknown;

export type CapabilityHost = 'bond' | 'atom';
export type CapabilitySetupResult = Disposable | (() => void) | void;

export interface CapabilityMetadata {
	readonly host?: CapabilityHost;
	/** Roles this capability projects behavior onto. Read by the host's DEV conflict check. */
	readonly projects?: readonly string[];
	readonly conflicts?: readonly (symbol | string)[];
	readonly docs?: string;
}

export interface CapabilityEnvelope<Surface = AnyCapabilitySurface> {
	readonly slot?: CapabilityKey<Surface>;
	readonly meta?: CapabilityMetadata;
	readonly surface?: Surface;
	readonly requires?: readonly symbol[];
}

const CAPABILITY_DESCRIPTOR = Symbol.for('@ixirjs/capability/descriptor');
type DescriptorBrand<H extends CapabilityHost> = {
	readonly [CAPABILITY_DESCRIPTOR]: H;
};

export interface BondCapability<Surface = AnyCapabilitySurface>
	extends CapabilityEnvelope<Surface>, DescriptorBrand<'bond'> {
	readonly slot: CapabilityKey<Surface>;
	behavior?(role: string, ctx?: unknown): Behavior | undefined;
	setup?(bond: Bond): CapabilitySetupResult;
	compose?(prior: BondCapability<Surface>): BondCapability<Surface>;
}
export type Capability<Surface = AnyCapabilitySurface> = BondCapability<Surface>;

export interface AtomCapability<
	Surface = AnyCapabilitySurface,
	N = AtomHost,
	B extends Bond = Bond,
	E extends Element | BondVirtualElement = Element | BondVirtualElement
>
	extends CapabilityEnvelope<Surface>, DescriptorBrand<'atom'> {
	readonly slot: CapabilityKey<Surface>;
	/**
	 * Named apart from a Bond capability's `behavior(role, ctx)` because the two are different
	 * shapes: a Bond capability projects per role, an atom capability attaches to its own node.
	 */
	readonly attach?: AtomBehavior<N, B, E>;
	setup?(node: N, bond: B | undefined): CapabilitySetupResult;
	compose?(prior: AtomCapability<Surface, N, B, E>): AtomCapability<Surface, N, B, E>;
}

export type CapabilityRoleMap = Record<string, (ctx: unknown) => Behavior | undefined>;

/** What both hosts' configs declare identically. `setup`/`compose` differ per host and stay below. */
export interface CapabilityConfigBase<Surface = AnyCapabilitySurface> {
	slot: CapabilityKey<Surface>;
	meta?: CapabilityMetadata;
	surface?: NoInfer<Surface>;
	requires?: readonly symbol[];
}

export interface CapabilityConfig<
	Surface = AnyCapabilitySurface
> extends CapabilityConfigBase<Surface> {
	setup?(bond: Bond): CapabilitySetupResult;
	compose?(prior: Capability<Surface>): Capability<Surface>;
	roles?: CapabilityRoleMap;
	behavior?(role: string, ctx?: unknown): Behavior | undefined;
}
export type BondCapabilityConfig<Surface = AnyCapabilitySurface> = CapabilityConfig<Surface>;
export interface AtomCapabilityConfig<
	Surface = AnyCapabilitySurface,
	N = AtomHost,
	B extends Bond = Bond,
	E extends Element | BondVirtualElement = Element | BondVirtualElement
> extends CapabilityConfigBase<Surface> {
	attach?: AtomBehavior<N, B, E>;
	setup?(node: N, bond: B | undefined): CapabilitySetupResult;
	compose?(prior: AtomCapability<Surface, N, B, E>): AtomCapability<Surface, N, B, E>;
}

/**
 * Branding is per-descriptor `Object.defineProperty`, and the obvious replacements are worse.
 *
 * Creation here costs ~0.63 µs, which is why `internCapabilityFactory` exists; what it cannot cover
 * is a capability closing over its Bond (every relationship and disclosure model), built once per
 * rendered Bond. Moving the two marks onto a shared frozen prototype makes creation 3.5x cheaper
 * (0.18 µs) and was measured end to end: `collapsible` and `tree` improved, and `card` — whose
 * descriptors are almost all interned — regressed 2.3%, well outside a 0.4% null-A/B floor.
 *
 * The reason is that the trade runs the wrong way for a descriptor. Reading `slot` / `behavior` /
 * `requires` off one costs 3.85 ns with the marks as own properties, 5.82 ns behind a literal
 * `__proto__`, and 9.08 ns after `Object.setPrototypeOf` — which demotes the object's map. An
 * interned descriptor is created once and read on every spread, so a 2.4x read penalty buys nothing
 * and costs continuously. Keep creation expensive and reads cheap; intern what can be interned.
 */
function brand<H extends CapabilityHost, T extends object>(
	host: H,
	descriptor: T
): T & DescriptorBrand<H> {
	Object.defineProperty(descriptor, CAPABILITY_DESCRIPTOR, { value: host });
	return Object.freeze(descriptor) as T & DescriptorBrand<H>;
}

/**
 * Descriptors are frozen and read on every spread, so an absent optional stays absent rather than
 * being present-and-undefined. Each builder below assigns only the keys it has, rather than
 * building the full shape and stripping the undefined ones: `delete` demotes an object to
 * dictionary mode, and these objects are read for the life of the page.
 */

/**
 * The synthesized `behavior(role, ctx)` over a role map, with the ctx-less projection memoized.
 *
 * Every definition-driven `atom.role(role)` call — every root and every role-carrying part —
 * projects with no ctx, and a role-map entry is a pure function of the descriptor's own options:
 * the behavior objects it returns are stateless (their `attrs`/`handlers` take the bond as an
 * argument). Building the same object once per rendered Bond was pure allocation; the cache lives
 * on the descriptor's closure, and interned descriptors make it page-global. A ctx-carrying
 * projection (item/input roles) stays uncached — its result can close over the ctx.
 */
function memoizedRoleBehavior(
	roles: CapabilityRoleMap
): (role: string, ctx?: unknown) => Behavior | undefined {
	// Definition-lifetime cache, never reactive state.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	const cached = new Map<string, Behavior | undefined>();
	return (role, ctx) => {
		if (ctx !== undefined) return roles[role]?.(ctx);
		if (cached.has(role)) return cached.get(role);
		const projected = roles[role]?.(undefined);
		cached.set(role, projected);
		return projected;
	};
}

export function defineCapability<Surface = AnyCapabilitySurface>(
	config: CapabilityConfig<Surface>
): Capability<Surface> {
	const { slot, meta, surface, requires, setup, compose, roles, behavior } = config;
	// Assigned rather than built-then-`compact`ed. The absent-stays-absent shape is the same, but
	// `compact` reached it by `delete`ing the undefined keys, and a deleted key demotes the object
	// to dictionary mode — on a descriptor that is then read on every spread for the life of the
	// page. Stateless descriptors intern and pay this once; a stateful one (every disclosure,
	// roving and selection model) is rebuilt per Bond, which is where it showed up: `compact` plus
	// `brand` were ~3% of the tree layer's SSR self time, one tree node being five capabilities.
	const descriptor: Record<string, unknown> = {
		slot,
		// A role map names exactly what the capability projects, and `meta.projects` is what the
		// host's DEV conflict check reads. Deriving it here rather than restating it per model
		// keeps the two in step; an explicit `meta.projects` still wins.
		meta: { ...(roles ? { projects: Object.keys(roles) } : {}), ...meta, host: 'bond' as const }
	};
	if (surface !== undefined) descriptor.surface = surface;
	if (requires !== undefined) descriptor.requires = requires;
	if (setup !== undefined) descriptor.setup = setup;
	if (compose !== undefined) descriptor.compose = compose;
	const projection = behavior ?? (roles ? memoizedRoleBehavior(roles) : undefined);
	if (projection !== undefined) descriptor.behavior = projection;
	return brand('bond', descriptor) as unknown as Capability<Surface>;
}
/** The published spelling of {@link defineCapability}, for symmetry with {@link defineAtomCapability}. */
export const defineBondCapability: typeof defineCapability = defineCapability;

export function defineAtomCapability<
	Surface = AnyCapabilitySurface,
	N = AtomHost,
	B extends Bond = Bond,
	E extends Element | BondVirtualElement = Element | BondVirtualElement
>(config: AtomCapabilityConfig<Surface, N, B, E>): AtomCapability<Surface, N, B, E> {
	// Same reason as `defineCapability` above: assign the present keys instead of deleting the
	// absent ones, so the descriptor keeps a fast shape for the reads it serves thereafter.
	const descriptor: Record<string, unknown> = {
		slot: config.slot,
		meta: { ...config.meta, host: 'atom' as const }
	};
	if (config.surface !== undefined) descriptor.surface = config.surface;
	if (config.requires !== undefined) descriptor.requires = config.requires;
	if (config.attach !== undefined) descriptor.attach = config.attach;
	if (config.setup !== undefined) descriptor.setup = config.setup;
	if (config.compose !== undefined) descriptor.compose = config.compose;
	return brand('atom', descriptor) as unknown as AtomCapability<Surface, N, B, E>;
}

/**
 * One rendered part's presentation capability: a shared slot key, the single `projects` entry that
 * names the part, its docs line, and the `attach` behavior — which is the only thing that actually
 * varies. Twenty-five of these across the component families were each declaring a module-level key
 * constant and restating the slot and meta block around it.
 *
 * Deliberately not interned: an `attach` closing over a component's own state must not be shared,
 * and the families that *can* share theirs already wrap this in `lazyCapability`.
 */
export function partCapability<
	B extends Bond = Bond,
	E extends Element | BondVirtualElement = Element | BondVirtualElement
>(
	id: SharedCapabilityKeyId,
	part: string,
	docs: string,
	attach: AtomBehavior<AtomHost, B, E>
): AtomCapability<void, AtomHost, B, E> {
	return defineAtomCapability<void, AtomHost, B, E>({
		slot: sharedCapabilityKey<void>(id),
		meta: { projects: [part], docs },
		attach
	});
}

/**
 * Validates a descriptor's brand and, on composition, that it kept its slot. `kind` selects the
 * wording; both hosts reach this through `CapabilityHost`, which already knows its own kind.
 */
export function normalizeCapability<T extends CapabilityEnvelope>(
	capability: T,
	host: CapabilityHost,
	expectedSlot?: symbol
): T {
	if (typeof capability?.slot !== 'symbol') {
		throw new TypeError(`[ixirjs] ${host} capability descriptors require a slot.`);
	}
	// A null/undefined descriptor already failed the slot check above.
	const candidate = capability as T & Partial<DescriptorBrand<CapabilityHost>>;
	if (candidate[CAPABILITY_DESCRIPTOR] !== host) {
		throw new TypeError(
			`[ixirjs] ${host} capability descriptors must be created by define${host === 'bond' ? 'Bond' : 'Atom'}Capability().`
		);
	}
	if (candidate.meta?.host !== host) {
		throw new TypeError(`[ixirjs] ${host} capability descriptor has an incompatible host.`);
	}
	if (expectedSlot !== undefined && candidate.slot !== expectedSlot) {
		throw new TypeError('[ixirjs] capability composition must preserve its registered slot.');
	}
	return capability;
}

export interface RoleProjectionConfig<Surface = AnyCapabilitySurface> {
	slot: CapabilityKey<Surface>;
	/** The roles this capability projects onto. Also becomes `meta.projects`. */
	roles: readonly string[];
	docs?: string;
	meta?: Omit<CapabilityMetadata, 'projects' | 'docs'>;
	surface?: NoInfer<Surface>;
	requires?: readonly symbol[];
	setup?(bond: Bond): CapabilitySetupResult;
	/** Read on every spread build, so it sees current state. `ctx` is the role's projection context. */
	attrs?(ctx: unknown, role: string): Record<string, unknown>;
	handlers?(ctx: unknown, role: string): Record<string, unknown>;
}

/**
 * One projection applied to a runtime-configured list of roles — the shape thirteen models were
 * each spelling out by hand:
 *
 * ```ts
 * const roles = options.roles ?? ['control'];
 * return defineCapability({
 *   slot, surface,
 *   meta: { projects: roles, docs: '…' },
 *   behavior: (role) => (roles.includes(role) ? { attrs: () => ({ … }) } : undefined)
 * });
 * ```
 *
 * Passing `defineCapability` a `roles` *map* instead covers statically named roles, each with
 * its own behavior. This one takes a *list* decided by the caller's options, with one behavior
 * across all of them, which is why those models reached for the raw `behavior` escape hatch.
 *
 * A model whose projection genuinely varies per role (`validation`, two role sets with different
 * attrs) or which derives state from `ctx` once per projection rather than per read (`geometry`,
 * `sort`) still uses `defineCapability` directly — this helper would misrepresent both.
 */
export function defineRoleProjection<Surface = AnyCapabilitySurface>(
	config: RoleProjectionConfig<Surface>
): Capability<Surface> {
	const { slot, roles, docs, meta, surface, requires, setup, attrs, handlers } = config;

	// `defineCapability` reads these by truthiness and re-tests each itself, so the outer `compact`
	// only ever removed keys the callee already tolerates — assign straight through instead.
	const projected: CapabilityConfig<Surface> = {
		slot,
		meta: { ...meta, projects: roles, ...(docs !== undefined ? { docs } : {}) },
		// Built per projection, not per definition, so the same delete-vs-assign rule applies with
		// more force here: this object is produced every time a role resolves against this model.
		behavior: (role: string, ctx?: unknown) => {
			if (!roles.includes(role)) return undefined;
			const behavior: Behavior = {};
			if (attrs) behavior.attrs = () => attrs(ctx, role);
			if (handlers) behavior.handlers = () => handlers(ctx, role);
			return behavior;
		}
	};
	if (surface !== undefined) projected.surface = surface;
	if (requires !== undefined) projected.requires = requires;
	if (setup !== undefined) projected.setup = setup;

	return defineCapability<Surface>(projected);
}
