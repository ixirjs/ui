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
 * Creates a cross-copy key. Identity deliberately excludes `version`: duplicate physical copies
 * still converge through Symbol.for, while an incompatible declaration is diagnosed immediately.
 */
export function sharedCapabilityKey<Surface = AnyCapabilitySurface>(
	options: SharedCapabilityKeyOptions
): CapabilityKey<Surface> {
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
export type BuiltinRole = (typeof roles)[keyof typeof roles];
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

export interface CapabilityConfig<Surface = AnyCapabilitySurface> {
	slot: CapabilityKey<Surface>;
	meta?: CapabilityMetadata;
	surface?: NoInfer<Surface>;
	requires?: readonly symbol[];
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
> {
	slot: CapabilityKey<Surface>;
	meta?: CapabilityMetadata;
	surface?: NoInfer<Surface>;
	requires?: readonly symbol[];
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

export function defineCapability<Surface = AnyCapabilitySurface>(
	config: CapabilityConfig<Surface>
): Capability<Surface> {
	const { slot, meta, surface, requires, setup, compose, roles, behavior } = config;
	const project =
		behavior ?? (roles ? (role: string, ctx?: unknown) => roles[role]?.(ctx) : undefined);
	return brand('bond', {
		slot,
		meta: { ...meta, host: 'bond' },
		...(surface !== undefined ? { surface } : {}),
		...(requires ? { requires } : {}),
		...(setup ? { setup } : {}),
		...(compose ? { compose } : {}),
		...(project ? { behavior: project } : {})
	});
}
/**
 * The published spelling of {@link defineCapability}, named for symmetry with
 * {@link defineAtomCapability} at the package boundary. Identical at runtime: `defineCapability` is
 * the internal name (used throughout `models/`), `defineBondCapability` is the one on
 * `@ixirjs/ui/shared`. Both are kept so neither layer has to restate the other's vocabulary.
 */
export const defineBondCapability: typeof defineCapability = defineCapability;

export function defineAtomCapability<
	Surface = AnyCapabilitySurface,
	N = AtomHost,
	B extends Bond = Bond,
	E extends Element | BondVirtualElement = Element | BondVirtualElement
>(config: AtomCapabilityConfig<Surface, N, B, E>): AtomCapability<Surface, N, B, E> {
	return brand('atom', {
		slot: config.slot,
		meta: { ...config.meta, host: 'atom' },
		...(config.surface !== undefined ? { surface: config.surface } : {}),
		...(config.requires ? { requires: config.requires } : {}),
		...(config.attach ? { attach: config.attach } : {}),
		...(config.setup ? { setup: config.setup } : {}),
		...(config.compose ? { compose: config.compose } : {})
	});
}

function normalizeDescriptor<T extends CapabilityEnvelope>(
	capability: T,
	host: CapabilityHost,
	expectedSlot?: symbol
): T {
	const candidate = capability as T & Partial<DescriptorBrand<CapabilityHost>>;
	if (!candidate || candidate[CAPABILITY_DESCRIPTOR] !== host) {
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

export function normalizeBondCapability<S>(
	capability: Capability<S>,
	expectedSlot?: CapabilityKey<S>
): Capability<S> {
	if (typeof capability.slot !== 'symbol') {
		throw new TypeError('[ixirjs] bond capability descriptors require a slot.');
	}
	return normalizeDescriptor(capability, 'bond', expectedSlot);
}
export function normalizeAtomCapability<
	S,
	N,
	B extends Bond,
	E extends Element | BondVirtualElement
>(
	capability: AtomCapability<S, N, B, E>,
	expectedSlot?: CapabilityKey<S>
): AtomCapability<S, N, B, E> {
	if (typeof capability.slot !== 'symbol') {
		throw new TypeError('[ixirjs] atom capability descriptors require a slot.');
	}
	return normalizeDescriptor(capability, 'atom', expectedSlot);
}

/**
 * The one taxonomy helper that does something a plain `defineCapability` does not: it derives
 * `meta.projects` from the role map, and `projects` is read by the host's DEV conflict check.
 * The former siblings (`defineModel/Relationship/Policy/EffectCapability`) only stamped a
 * `layer`/`kind` pair that nothing ever read — they were documentation shaped like code.
 */
export type ProjectionCapabilityConfig<Surface = AnyCapabilitySurface> =
	CapabilityConfig<Surface> & {
		roles: CapabilityRoleMap;
	};
export function defineProjectionCapability<Surface = AnyCapabilitySurface>(
	config: ProjectionCapabilityConfig<Surface>
): Capability<Surface> {
	return defineCapability({
		...config,
		meta: { projects: Object.keys(config.roles), ...config.meta }
	});
}

/** Last descriptor wins, while the first occurrence fixes the slot position. */
export function normalizeCapabilities(capabilities: readonly Capability[]): Capability[] {
	const indices = new Map<symbol, number>();
	const normalized: Capability[] = [];
	for (const capability of capabilities) {
		const descriptor = normalizeBondCapability(capability);
		const index = indices.get(descriptor.slot);
		if (index === undefined) {
			indices.set(descriptor.slot, normalized.length);
			normalized.push(descriptor);
		} else {
			normalized[index] = descriptor;
		}
	}
	return normalized;
}
