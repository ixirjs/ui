import { createAttachmentKey } from 'svelte/attachments';
import { BROWSER, DEV } from 'esm-env';
import { getElementId } from '$ixirjs/ui/utils/dom.svelte';
import { generateId, hasDynamicId } from './identity';
import type { Bond } from './bond.svelte';
import type { BondVirtualElement } from './types';
import { mergeAttributeLayer, mergeHandlerLayer } from './merge';
import { normalizeAtomCapability, slotName } from '$ixirjs/ui/shared/capability/capability';
import { CapabilityRuntime } from '$ixirjs/ui/shared/capability/runtime.svelte';
import {
	capabilityRuntimeMessages,
	capabilityValidationMessages,
	registerCapability
} from '$ixirjs/ui/shared/capability/host';
import type {
	AtomBehavior,
	AtomCapability,
	AnyCapabilitySurface,
	Behavior,
	CapabilityKey,
	CapabilitySetupResult,
	RoleCtxArgs
} from '$ixirjs/ui/shared/capability/capability';

type AtomAttachment<E extends Element | BondVirtualElement> = (node: E) => void | (() => void);
type AtomSpread<E extends Element | BondVirtualElement> = Record<string | symbol, unknown> & {
	[symbol: symbol]: AtomAttachment<E>;
};
type RoleApplication = { role: string; ctx: unknown };
type HostedAtomCapability<B extends Bond, E extends Element | BondVirtualElement> = AtomCapability<
	unknown,
	Atom<B, E>,
	B,
	E
>;
type HostedCapabilityRuntime<
	B extends Bond,
	E extends Element | BondVirtualElement
> = CapabilityRuntime<HostedAtomCapability<B, E>, { atom: Atom<B, E>; bond: B | undefined }>;
const EMPTY_ATOM_CAPABILITIES = Object.freeze([]) as readonly never[];
const EMPTY_ATOM_BEHAVIORS = Object.freeze([]) as readonly never[];
const EMPTY_TEARDOWN = () => {};
// Most Atoms declare no handlers. Returning a fresh `{}` per read allocated one object per
// rendered part purely to be spread into another object. Shared and frozen: the previous object
// was discarded immediately, so writing to it was already a silent no-op.
const EMPTY_HANDLERS: Record<string, unknown> = Object.freeze({});
export type AtomOptions = {
	namespace?: string;
	preset?: string;
	id?: string;
};

export class Atom<
	B extends Bond = Bond,
	E extends Element | BondVirtualElement = Element | BondVirtualElement
> {
	protected bond: B | undefined;
	protected key: string;
	#options: AtomOptions;
	#standaloneId: string | undefined;
	#resolvedId: string | undefined;
	#ownerIdIsDynamic: boolean;
	#idSource: (() => string | undefined) | undefined;

	// Identity and node state. Part identity is fixed and Bond identity usually is too, so the
	// element id is computed once instead of allocating a reactive signal for every Atom. Owners
	// that expose `id` as a props cell (see hasDynamicId) recompute on read and stay reactive.
	#element = $state<E | undefined>();

	// Behavior projection. The capability runtime is rare and therefore allocated on first use.
	#behaviors: Behavior<B, E>[] | undefined;
	#capabilityRuntime: HostedCapabilityRuntime<B, E> | undefined;
	#validated = false;
	// Keeps role projection idempotent for cached atoms.
	#roleApplications: RoleApplication[] | undefined;
	// Written once at declaration; reactivity rides the queue, not this set.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#roles: Set<string> | undefined;

	// Stable attachment keys. Mint lazily because SSR presentation never consumes DOM attachments.
	#attachKey: symbol | undefined;
	readonly #ownAttach: AtomAttachment<E> = (node) => this.#mount(node);

	constructor(bond: B | undefined, key: string, options: AtomOptions = {}) {
		this.bond = bond;
		this.key = key;
		this.#options = options;
		this.#standaloneId = options.id ?? (bond ? undefined : generateId());
		this.#ownerIdIsDynamic = hasDynamicId(bond);
		// Fixed-identity owners compute the element id once rather than allocating a signal per Atom.
		this.#resolvedId = this.#ownerIdIsDynamic ? undefined : this.#computeId();
	}

	get id() {
		return this.#idSource?.() ?? this.#resolvedId ?? this.#computeId();
	}

	// Presentation helpers bind the component's `id` prop here rather than replacing the
	// rendered attribute after Atom construction. Relationship capabilities then always
	// reference the same identity the DOM receives.
	bindId(source: () => string | undefined): void {
		this.#idSource = source;
	}

	get element() {
		return this.#element;
	}

	get name() {
		return this.key;
	}

	get kind() {
		return `${this.#namespace}-${this.name}`;
	}

	// Default preset key: root → bare bond.preset, others append name. Read as: preset ?? atom.preset.
	get preset(): string {
		const base = this.bond?.preset ?? this.#options.preset ?? this.#namespace;
		return this.name === 'root' ? base : `${base}.${this.name}`;
	}

	behavior(behavior: Behavior<B, E>): this {
		if (DEV && !this.bond) {
			console.warn(
				`[ixirjs] Atom("${this.name}").behavior(...) was registered without a Bond. Bond-dependent behavior will be skipped until the node is bonded.`
			);
		}
		(this.#behaviors ??= []).push(behavior);
		return this;
	}

	capability<C extends AtomCapability<AnyCapabilitySurface, Atom<B, E>, B, E>>(capability: C): C;
	capability<S>(key: CapabilityKey<S>): AtomCapability<S, Atom<B, E>, B, E> | undefined;
	capability<S = AnyCapabilitySurface>(
		capabilityOrKey: AtomCapability<AnyCapabilitySurface, Atom<B, E>, B, E> | CapabilityKey<S>
	): AtomCapability<S, Atom<B, E>, B, E> | undefined {
		if (typeof capabilityOrKey === 'symbol') {
			const found = this.#findCapability(capabilityOrKey) as
				| AtomCapability<S, Atom<B, E>, B, E>
				| undefined;
			if (DEV && !found) {
				console.warn(
					`[ixirjs] Atom("${this.name}").capability("${slotName(capabilityOrKey)}"): no atom capability registered.`
				);
			}
			return found;
		}

		return this.#registerCapability(capabilityOrKey) as AtomCapability<S, Atom<B, E>, B, E>;
	}

	surface<S>(key: CapabilityKey<S>): S | undefined {
		return this.capability(key)?.surface;
	}

	requireSurface<S>(key: CapabilityKey<S>): S {
		const surface = this.surface(key);
		if (surface === undefined) {
			throw new Error(
				`[ixirjs] required atom capability "${slotName(key)}" has no surface on Atom("${this.name}").`
			);
		}
		return surface;
	}

	get capabilities(): readonly AtomCapability<AnyCapabilitySurface, Atom<B, E>, B, E>[] {
		return (this.#capabilityRuntime?.capabilities ??
			EMPTY_ATOM_CAPABILITIES) as readonly AtomCapability<AnyCapabilitySurface, Atom<B, E>, B, E>[];
	}

	activateCapabilities(
		bond: B | undefined = this.bond,
		beforeSetups: readonly (() => CapabilitySetupResult)[] = []
	): () => void {
		if (!this.#capabilityRuntime && beforeSetups.length === 0) return EMPTY_TEARDOWN;
		this.#runtime().activate(
			{ atom: this, bond },
			(capability, owner) => capability.setup?.(owner.atom, owner.bond),
			beforeSetups
		);
		this.#validateCapabilities();
		return () => this.destroyCapabilities();
	}

	destroyCapabilities(): void {
		this.#capabilityRuntime?.destroy();
	}

	// item/input require a string ctx; structural roles take none; custom roles accept optional unknown.
	role<R extends string>(role: R, ...args: RoleCtxArgs<R>): this {
		const ctx = args[0] as unknown;
		if (this.#hasProjectedRole(role, ctx)) {
			this.#debugDuplicateRole(role);
			return this;
		}

		(this.#roleApplications ??= []).push({ role, ctx });
		(this.#roles ??= new Set()).add(role);

		if (!this.bond) return this;

		const behaviors = this.bond.behaviorsForRole(role, ctx);
		this.#warnIfRoleHasNoBehavior(role, behaviors);
		for (const behavior of behaviors) {
			if (behavior.attrs || behavior.handlers || behavior.onmount) {
				this.behavior(behavior as Behavior<B, E>);
			}
		}
		return this;
	}

	hasRole(role: string): boolean {
		return this.#roles?.has(role) ?? false;
	}

	get attrs(): Record<string, unknown> {
		// `data-bond`/`data-kind` are debug metadata, not a production selector contract — target
		// classes or the `part` attribute instead. Shipping them cost ~9% SSR CPU and ~18% HTML
		// bytes per card (measured on bench:ssr), almost all of it attribute serialization.
		if (!DEV) return { id: this.id };
		return this.bond
			? {
					id: this.id,
					'data-bond': this.bond.namespace,
					'data-kind': this.kind
				}
			: {
					id: this.id,
					'data-kind': this.kind
				};
	}

	get handlers(): Record<string, unknown> {
		return EMPTY_HANDLERS;
	}

	get attachments(): Record<string, (node: E) => void | (() => void)> {
		const key = (this.#attachKey ??= createAttachmentKey());
		return { [key]: this.#ownAttach };
	}

	get spread(): AtomSpread<E> {
		return this.#buildSpread(true);
	}

	/**
	 * Renderer-facing spread. SSR has no DOM attachment lifecycle, so avoid minting and copying
	 * attachment symbols that Svelte's server renderer discards. The public spread remains
	 * unchanged and always exposes its stable attachment contract.
	 */
	get presentationSpread(): Record<string | symbol, unknown> {
		return this.#buildSpread(BROWSER);
	}

	onmount(node: E): void | (() => void) {
		void node;
	}

	ondestroy?(): void {}

	/** For subclasses whose constructor requires a Bond; standalone Atoms must branch on bond. */
	protected requireBond(): B {
		if (!this.bond) throw new Error(`[ixirjs] Atom("${this.name}") requires a Bond.`);
		return this.bond;
	}

	protected setElement(element: E | undefined) {
		this.#element = element;
	}

	get #namespace(): string {
		return this.bond?.namespace ?? this.#options.namespace ?? 'atom';
	}

	#computeId(): string {
		const owner = this.bond?.id ?? (this.#standaloneId ??= generateId());
		return getElementId(owner, this.kind);
	}

	#registerCapability(
		capability: AtomCapability<AnyCapabilitySurface, Atom<B, E>, B, E>
	): AtomCapability<AnyCapabilitySurface, Atom<B, E>, B, E> {
		const registered = registerCapability(this.#runtime(), capability, {
			kind: 'atom',
			label: () => this.name,
			normalize: (descriptor, expectedSlot) =>
				normalizeAtomCapability(descriptor, expectedSlot as CapabilityKey<unknown> | undefined)
		});
		this.#validated = false;
		return registered;
	}

	#findCapability(
		slot: symbol
	): AtomCapability<AnyCapabilitySurface, Atom<B, E>, B, E> | undefined {
		return this.#capabilityRuntime?.find(slot);
	}

	#validateCapabilities(): void {
		if (!DEV || this.#validated) return;
		this.#validated = true;
		const { messages, inactiveLifecycle } = capabilityValidationMessages(
			'atom',
			() => this.name,
			this.#capabilityRuntime?.capabilities ?? EMPTY_ATOM_CAPABILITIES
		);
		for (const message of messages) console.warn(message);
		if (!inactiveLifecycle || this.#capabilityRuntime?.isActive) return;
		// The spread is built during render; activateCapabilities runs at mount. Ask after both.
		queueMicrotask(() => {
			if (!this.#capabilityRuntime?.isActive) console.warn(inactiveLifecycle);
		});
	}

	#nodeBehaviors(): readonly AtomBehavior<Atom<B, E>, B, E>[] {
		if (!this.#capabilityRuntime) return EMPTY_ATOM_BEHAVIORS;
		// One pass: the map/filter chain allocated a full-length array of mostly-undefined behaviors
		// before discarding them. Most capabilities carry none, so the kept set is usually smaller.
		const order = this.#capabilityRuntime.order();
		const behaviors: AtomBehavior<Atom<B, E>, B, E>[] = [];
		for (let index = 0; index < order.length; index++) {
			const behavior = order[index]!.attach;
			if (behavior) behaviors.push(behavior);
		}
		return behaviors;
	}

	#buildSpread(includeAttachments: boolean): AtomSpread<E> {
		this.#validateCapabilities();
		const nodeBehaviors = this.#nodeBehaviors();
		if (!this.#behaviors?.length && nodeBehaviors.length === 0) {
			return this.#baseSpread(includeAttachments);
		}

		const nodeSpread =
			nodeBehaviors.length === 0
				? { attrs: this.attrs, handlers: this.handlers }
				: mergeNodeBehaviors(this, this.bond, this.attrs, this.handlers, nodeBehaviors);
		const projectedSpread =
			this.bond && this.#behaviors?.length
				? mergeBehaviors(this.bond, nodeSpread.attrs, nodeSpread.handlers, this.#behaviors)
				: nodeSpread;

		return includeAttachments
			? {
					...projectedSpread.attrs,
					...projectedSpread.handlers,
					...this.attachments
				}
			: { ...projectedSpread.attrs, ...projectedSpread.handlers };
	}

	#baseSpread(includeAttachments: boolean): AtomSpread<E> {
		const attrs = this.attrs;
		const handlers = this.handlers;
		// `attrs` is built fresh by its getter on every read — the base class and every subclass
		// return an object literal — so with nothing to layer onto it there is no reason to copy it
		// into a second object. This is the shape every handler-free part takes on the server, where
		// no attachment is minted either.
		if (isEmptyHandlerLayer(handlers)) {
			return (includeAttachments ? { ...attrs, ...this.attachments } : attrs) as AtomSpread<E>;
		}

		return includeAttachments
			? { ...attrs, ...handlers, ...this.attachments }
			: { ...attrs, ...handlers };
	}

	#mount(node: E): void | (() => void) {
		this.setElement(node);
		const cleanups: Array<() => void> = [];
		try {
			const own = this.onmount(node);
			if (own) cleanups.push(own);

			if (this.bond) {
				for (const behavior of this.#behaviors ?? []) {
					const cleanup = behavior.onmount?.(node, this.bond);
					if (cleanup) cleanups.push(cleanup);
				}
			}

			for (const capability of this.#capabilityRuntime?.order() ?? EMPTY_ATOM_CAPABILITIES) {
				const cleanup = capability.attach?.onmount?.(node, this, this.bond);
				if (cleanup) cleanups.push(cleanup);
			}
		} catch (error) {
			const cleanupErrors = disposeMountCleanups(cleanups);
			this.setElement(undefined);
			throw cleanupErrors.length
				? new AggregateError(
						[error, ...cleanupErrors],
						`[ixirjs] Atom("${this.name}") mount failed.`
					)
				: error;
		}

		let mounted = true;
		return () => {
			if (!mounted) return;
			mounted = false;
			const errors = disposeMountCleanups(cleanups);
			try {
				this.ondestroy?.();
			} catch (error) {
				errors.push(error);
			} finally {
				this.setElement(undefined);
			}
			if (errors.length) {
				throw new AggregateError(errors, `[ixirjs] Atom("${this.name}") unmount failed.`);
			}
		};
	}

	#runtime(): HostedCapabilityRuntime<B, E> {
		return (this.#capabilityRuntime ??= new CapabilityRuntime<
			HostedAtomCapability<B, E>,
			{ atom: Atom<B, E>; bond: B | undefined }
		>(capabilityRuntimeMessages<HostedAtomCapability<B, E>>('atom'), () => this.name));
	}

	#hasProjectedRole(role: string, ctx: unknown): boolean {
		return this.#roleApplications?.some((a) => a.role === role && Object.is(a.ctx, ctx)) ?? false;
	}

	#debugDuplicateRole(role: string): void {
		if (!DEV) return;
		const owner = this.bond ? `${this.bond.name}/${this.name}` : this.name;
		console.debug(
			`[ixirjs] Atom("${owner}").role("${role}") was already projected for this context; skipping duplicate projection.`
		);
	}

	#warnIfRoleHasNoBehavior(role: string, behaviors: readonly Behavior<B, E>[]): void {
		if (!DEV || behaviors.length > 0) return;
		const owner = this.bond ? `${this.bond.name}/${this.name}` : this.name;
		console.warn(
			`[ixirjs] Atom("${owner}").role("${role}"): no capability responds to this role. If intentional, ignore.`
		);
	}
}

// Identity first: the shared empty layer is the overwhelmingly common answer. A subclass that
// returns its own empty object still takes the cheap early-exit walk rather than a key array.
function isEmptyHandlerLayer(handlers: Record<string, unknown>): boolean {
	if (handlers === EMPTY_HANDLERS) return true;
	for (const key in handlers) {
		if (Object.hasOwn(handlers, key)) return false;
	}
	return true;
}

function disposeMountCleanups(cleanups: readonly (() => void)[]): unknown[] {
	const errors: unknown[] = [];
	for (let index = cleanups.length - 1; index >= 0; index--) {
		try {
			cleanups[index]!();
		} catch (error) {
			errors.push(error);
		}
	}
	return errors;
}

// Generated atom class helpers.

export type DefineAtomSetup<N extends Atom, B> = (atom: N, bond: B) => void;

export type DefineAtomOptions<B extends Bond = Bond> = AtomOptions & {
	key: string;
	/** Optional construction fallback; an explicit constructor argument wins. */
	bond?: B;
};

export type DefinedAtomClass<
	B extends Bond = Bond,
	E extends Element | BondVirtualElement = Element | BondVirtualElement
> = {
	new <T extends B = B>(bond?: T): Atom<T, E>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAtomClass = new (bond: any) => Atom<any, any>;

export function defineAtom<
	B extends Bond = Bond,
	E extends Element | BondVirtualElement = Element | BondVirtualElement
>(
	options: DefineAtomOptions<B>,
	setup?: <T extends B>(atom: Atom<T, E>, bond: T | undefined) => void
): DefinedAtomClass<B, E>;
export function defineAtom<
	B extends Bond = Bond,
	E extends Element | BondVirtualElement = Element | BondVirtualElement
>(
	key: string,
	setup?: <T extends B>(atom: Atom<T, E>, bond: T) => void
): { new <T extends B = B>(bond: T): Atom<T, E> };
export function defineAtom<C extends AnyAtomClass>(
	Base: C,
	setup?: DefineAtomSetup<InstanceType<C>, ConstructorParameters<C>[0]>
): C;
export function defineAtom(
	keyOptionsOrBase: string | DefineAtomOptions | AnyAtomClass,
	setup?: DefineAtomSetup<Atom, Bond | undefined>
): AnyAtomClass {
	if (typeof keyOptionsOrBase === 'string') {
		const key = keyOptionsOrBase;
		return class GeneratedAtomClass extends Atom {
			constructor(bond: Bond) {
				super(bond, key);
				setup?.(this, bond);
			}
		} as AnyAtomClass;
	}

	if (typeof keyOptionsOrBase === 'object') {
		const { key, bond: defaultBond, namespace, preset, id } = keyOptionsOrBase;
		return class GeneratedAtomClass extends Atom {
			constructor(bond: Bond | undefined = defaultBond) {
				super(bond, key, {
					...(namespace !== undefined ? { namespace } : {}),
					...(preset !== undefined ? { preset } : {}),
					...(id !== undefined ? { id } : {})
				});
				setup?.(this, bond);
			}
		} as AnyAtomClass;
	}

	const Base = keyOptionsOrBase;
	return class GeneratedAtomClass extends Base {
		constructor(bond: ConstructorParameters<typeof Base>[0]) {
			super(bond);
			setup?.(this as unknown as Atom, bond);
		}
	} as AnyAtomClass;
}

// Spread merging.

// The `source`/`nextSource` labels only feed DEV conflict diagnostics, but an inline literal
// allocates on every behavior of every spread build in production too. One frozen object per
// layer pair keeps the wording and costs nothing per merge (same trick as MERGE_ATOM_LAYER in
// presentation-props.ts).
const BOND_BEHAVIOR_LAYER = Object.freeze({
	source: 'bond behavior',
	nextSource: 'capability behavior'
});
const ATOM_BEHAVIOR_LAYER = Object.freeze({
	source: 'atom behavior',
	nextSource: 'atom capability'
});

function mergeBehaviors<B extends Bond, E extends Element | BondVirtualElement>(
	bond: B,
	baseAttrs: Record<string, unknown>,
	baseHandlers: Record<string, unknown>,
	behaviors: readonly Behavior<B, E>[]
): { attrs: Record<string, unknown>; handlers: Record<string, unknown> } {
	let attrs: Record<string, unknown> = { ...baseAttrs };
	let handlers: Record<string, unknown> = { ...baseHandlers };

	for (const behavior of behaviors) {
		if (behavior.attrs) {
			attrs = mergeAttributeLayer(attrs, behavior.attrs(bond), BOND_BEHAVIOR_LAYER);
		}
		if (behavior.handlers) {
			handlers = mergeHandlerLayer(handlers, behavior.handlers(bond), BOND_BEHAVIOR_LAYER);
		}
	}

	return { attrs, handlers };
}

function mergeNodeBehaviors<
	N extends Atom<B, E>,
	B extends Bond,
	E extends Element | BondVirtualElement
>(
	node: N,
	bond: B | undefined,
	baseAttrs: Record<string, unknown>,
	baseHandlers: Record<string, unknown>,
	behaviors: readonly AtomBehavior<N, B, E>[]
): { attrs: Record<string, unknown>; handlers: Record<string, unknown> } {
	let attrs: Record<string, unknown> = { ...baseAttrs };
	let handlers: Record<string, unknown> = { ...baseHandlers };

	for (const behavior of behaviors) {
		if (behavior.attrs) {
			attrs = mergeAttributeLayer(attrs, behavior.attrs(node, bond), ATOM_BEHAVIOR_LAYER);
		}
		if (behavior.handlers) {
			handlers = mergeHandlerLayer(handlers, behavior.handlers(node, bond), ATOM_BEHAVIOR_LAYER);
		}
	}

	return { attrs, handlers };
}
