import { getContext, setContext } from 'svelte';
import { nanoid } from 'nanoid';
import { DEV } from 'esm-env';
import { StagedMap } from './staged-map.svelte';
import { bondContextKey } from './context';
import { Atom } from './atom.svelte';
import { BondState } from './state.svelte';
import { BOND_BRAND, ordinaryHasInstance } from './identity';
export { BOND_BRAND } from './identity';
import { collectionCapability, collectionSlot } from '../capability/models/collection.svelte';
import { slotName } from '../capability/capability';
import type {
	BondClass,
	BondStateProps as BondPropsBase,
	BondVirtualElement,
	NodeRegistration,
	NodeRegistrationOptions
} from './types';
import type { Behavior, Capability, CapabilityInfo, CapabilityKey } from '../capability';
import type { Collection } from './collection.svelte';

export abstract class Bond<Props extends BondPropsBase = BondPropsBase> {
	static CONTEXT_KEY = bondContextKey('bond');

	#id: string;
	#props: Props;
	#legacyState: BondState | undefined;
	#nodes = new StagedMap<NodeRegistration>();
	#name: string;
	// Single home for capabilities; collections also live here at slot collection:<kind>.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	#capabilities: Capability<any>[] = [];
	// Slot index mirrors #capabilities for O(1) lookup while preserving projection order.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#capabilitySlots = new Map<symbol, number>();
	#setupConsumed = false;
	#validated = false;
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#nodeRegistrations = new Map<Atom, string>();
	#nodeRegistrationId = 0;

	constructor(props: Props = {} as Props, name?: string) {
		// Cross-copy identity brand; read by static [Symbol.hasInstance].
		Object.defineProperty(this, BOND_BRAND, { value: true });
		this.#legacyState = props instanceof BondState ? props : undefined;
		this.#props = (this.#legacyState?.props ?? props ?? {}) as Props;
		this.#id = this.#props.id ?? nanoid(8);
		this.#name = name ?? '';
		if (this.#legacyState) this.#adoptLegacyState(this.#legacyState);
	}

	get id() {
		return this.props?.id ?? this.#id;
	}

	// Compatibility alias while older internals migrate from `bond.state.*` to `bond.*`.
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	get state(): any {
		return this;
	}

	get props() {
		return this.#props;
	}

	get name() {
		return this.#name;
	}

	// Bonds print as [object <name>] in consoles and Object.prototype.toString.
	get [Symbol.toStringTag]() {
		return this.name;
	}

	get namespace(): string {
		return this.name;
	}

	get preset(): string {
		return this.namespace;
	}

	share(): this {
		const key = (this.constructor as typeof Bond).CONTEXT_KEY;
		return setContext(key, this);
	}

	get elements() {
		const obj: Record<string, Element | BondVirtualElement | undefined> = {};
		for (const registration of this.#nodes.values()) {
			obj[registration.key] = registration.node.element;
		}
		return obj;
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	register<N extends Atom<any, any>>(node: N, options: NodeRegistrationOptions = {}): () => void {
		const key = options.key ?? node.name;
		const cardinality = options.cardinality ?? 'single';
		const existingId = this.#nodeRegistrations.get(node);

		if (existingId) {
			return () => this.unregister(node);
		}

		if (DEV && cardinality === 'single') {
			const duplicate = this.#nodes.values().find((registration) => registration.key === key)?.node;
			if (duplicate && duplicate !== node) {
				console.warn(
					`[svelte-atoms] Bond("${this.name}").register("${key}") received multiple nodes for a single-node slot. Use { cardinality: 'many' } when this is intentional.`
				);
			}
		}

		const id = `${key}:${++this.#nodeRegistrationId}`;
		this.#nodeRegistrations.set(node, id);
		this.#nodes.stage(id, { id, key, cardinality, node });

		let live = true;
		return () => {
			if (!live) return;
			live = false;
			this.unregister(node);
		};
	}

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	unregister(node: Atom<any, any>): void {
		const id = this.#nodeRegistrations.get(node);
		if (!id) return;
		this.#nodeRegistrations.delete(node);
		this.#nodes.delete(id);
	}

	node<N extends Atom = Atom>(key: string): N | undefined {
		return this.nodes<N>(key)[0];
	}

	nodes<N extends Atom = Atom>(kind?: string): N[] {
		return this.#nodes
			.values()
			.filter((registration) => {
				if (!kind) return true;
				const node = registration.node;
				return (
					registration.key === kind ||
					node.name === kind ||
					node.kind === kind ||
					node.hasRole(kind)
				);
			})
			.map((registration) => registration.node as N);
	}

	// Find the atom playing role (e.g. for aria-controls cross-references).
	atomByRole(role: string): Atom | undefined {
		return this.node(role);
	}

	collection<T>(kind: string): Collection<T> {
		const slot = collectionSlot(kind);
		const existing = this.#findCapability(slot);
		if (existing) return existing.surface as Collection<T>;
		const cap = collectionCapability<T>(kind);
		this.capability(cap);
		return cap.surface;
	}

	capability<C extends Capability>(capability: C): C;
	capability<S>(key: CapabilityKey<S>): Capability<S> | undefined;
	capability<S = unknown>(
		capabilityOrKey: Capability | CapabilityKey<S>
	): Capability<S> | undefined {
		if (typeof capabilityOrKey === 'symbol') {
			const found = this.#findCapability(capabilityOrKey) as Capability<S> | undefined;
			if (DEV && !found) {
				console.warn(
					`[svelte-atoms] Bond.capability("${slotName(capabilityOrKey)}"): no capability registered at this slot in "${this.id}".`
				);
			}
			return found;
		}

		const i = this.#capabilitySlots.get(capabilityOrKey.slot);
		if (i !== undefined) {
			const prior = this.#capabilities[i]!;
			const next = capabilityOrKey.compose ? capabilityOrKey.compose(prior) : capabilityOrKey;
			if (DEV) {
				const verb = capabilityOrKey.compose ? 'decorated' : 'replaced';
				console.debug(
					`[svelte-atoms] capability slot "${slotName(capabilityOrKey.slot)}" ${verb} in "${this.id}" (last-wins).`
				);
			}
			this.#capabilities[i] = next;
			return next as Capability<S>;
		} else {
			this.#capabilitySlots.set(capabilityOrKey.slot, this.#capabilities.length);
			this.#capabilities.push(capabilityOrKey);
			return capabilityOrKey as Capability<S>;
		}
	}

	get<S>(key: CapabilityKey<S>): S | undefined {
		return this.surface(key);
	}

	surface<S>(key: CapabilityKey<S>): S | undefined {
		return this.capability(key)?.surface;
	}

	require<S>(key: CapabilityKey<S>): S {
		return this.requireSurface(key);
	}

	requireSurface<S>(key: CapabilityKey<S>): S {
		const cap = this.requireCapability(key);
		if (cap.surface === undefined) {
			throw new Error(
				`[svelte-atoms] capability "${slotName(key)}" has no surface in "${this.id}".`
			);
		}
		return cap.surface;
	}

	requireCapability<S>(key: CapabilityKey<S>): Capability<S> {
		const found = this.#findCapability(key) as Capability<S> | undefined;
		if (!found) {
			throw new Error(
				`[svelte-atoms] required capability "${slotName(key)}" is not registered in "${this.id}".`
			);
		}
		return found;
	}

	get capabilities(): readonly Capability[] {
		return this.#capabilities;
	}

	describeCapabilities(): CapabilityInfo[] {
		return this.#capabilities.map((c) => ({
			slot: c.slot,
			description: c.slot.description,
			...(c.meta ? { meta: c.meta } : {}),
			hasSurface: c.surface !== undefined,
			requires: c.requires ?? [],
			hasSetup: typeof c.setup === 'function'
		}));
	}

	markSetupConsumed(): void {
		this.#setupConsumed = true;
	}

	behaviorsForRole(role: string, ctx?: unknown): Behavior[] {
		if (DEV && !this.#validated) {
			this.#validated = true;
			this.#validateCapabilities();
		}
		const out: Behavior[] = [];
		for (const capability of this.#capabilities) {
			const behavior = capability.behavior?.(role, ctx);
			if (behavior) out.push(behavior);
		}
		return out;
	}

	destroy() {
		this.#nodes.clear();
		this.#nodeRegistrations.clear();
	}

	#findCapability(slot: symbol): Capability | undefined {
		const i = this.#capabilitySlots.get(slot);
		return i === undefined ? undefined : this.#capabilities[i];
	}

	#adoptLegacyState(state: BondState): void {
		const record = state as unknown as Record<PropertyKey, unknown>;
		const keys = new Set<PropertyKey>(Reflect.ownKeys(state));
		let proto = Object.getPrototypeOf(state);
		while (proto && proto !== BondState.prototype) {
			for (const key of Reflect.ownKeys(proto)) {
				const descriptor = Object.getOwnPropertyDescriptor(proto, key);
				if (!descriptor || typeof descriptor.value === 'function') continue;
				keys.add(key);
			}
			proto = Object.getPrototypeOf(proto);
		}
		for (const key of keys) {
			if (key in this) continue;
			Object.defineProperty(this, key, {
				enumerable: true,
				configurable: true,
				get: () => record[key],
				set: (value) => {
					record[key] = value;
				}
			});
		}
		for (const capability of state.capabilities) {
			this.capability(capability);
		}
	}

	#validateCapabilities() {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const slots = new Set(this.#capabilities.map((c) => c.slot));
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const slotOwners = new Map(this.#capabilities.map((c) => [c.slot, c]));
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const roleOwners = new Map<string, Capability[]>();
		for (const cap of this.#capabilities) {
			for (const role of cap.meta?.projects ?? []) {
				const owners = roleOwners.get(role);
				if (owners) owners.push(cap);
				else roleOwners.set(role, [cap]);
			}
		}
		for (const cap of this.#capabilities) {
			for (const need of cap.requires ?? []) {
				if (!slots.has(need)) {
					console.warn(
						`[svelte-atoms] capability "${slotName(cap.slot)}" requires slot "${slotName(need)}", which is not registered in "${this.id}".`
					);
				}
			}
			for (const conflict of cap.meta?.conflicts ?? []) {
				if (typeof conflict === 'symbol') {
					const owner = slotOwners.get(conflict);
					if (owner && owner !== cap) {
						console.warn(
							`[svelte-atoms] capability "${slotName(cap.slot)}" conflicts with registered capability slot "${slotName(conflict)}" in "${this.id}".`
						);
					}
					continue;
				}

				const owners = roleOwners.get(conflict)?.filter((owner) => owner !== cap) ?? [];
				if (owners.length > 0) {
					console.warn(
						`[svelte-atoms] capability "${slotName(cap.slot)}" conflicts with role "${conflict}" projected by ${owners.map((owner) => `"${slotName(owner.slot)}"`).join(', ')} in "${this.id}".`
					);
				}
			}
		}
		if (!this.#setupConsumed && this.#capabilities.some((c) => c.setup)) {
			console.warn(
				`[svelte-atoms] "${this.id}" registered capabilities with setup() (focus/escape/...) but useCapabilities(bond) was never called — their whole-bond effects will not run.`
			);
		}
	}

	static get<T extends Bond>(this: BondClass<T>): T | undefined {
		return getBondContext(this);
	}

	static getOrThrow<T extends Bond>(this: BondClass<T>, message?: string): T {
		return requireBondContext(this, message);
	}

	static optional<T extends Bond>(this: BondClass<T>): T | undefined {
		return getBondContext(this);
	}

	static required<T extends Bond>(this: BondClass<T>, message?: string): T {
		return requireBondContext(this, message);
	}

	static set<T extends Bond>(this: BondClass<T>, bond: T): T {
		return setContext(this.CONTEXT_KEY, bond);
	}

	static [Symbol.hasInstance](this: unknown, value: unknown): boolean {
		if (this === Bond) {
			return value != null && typeof value === 'object' && BOND_BRAND in value;
		}
		return ordinaryHasInstance(this, value);
	}
}

function getBondContext<T extends Bond>(cls: BondClass<T>): T | undefined {
	return getContext(cls.CONTEXT_KEY);
}

function requireBondContext<T extends Bond>(cls: BondClass<T>, message?: string): T {
	const bond = getBondContext(cls);
	if (!bond) {
		throw new Error(
			message ?? '[svelte-atoms] Bond context missing: component must be used within its provider.'
		);
	}
	return bond;
}
