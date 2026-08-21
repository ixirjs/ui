import { BROWSER } from 'esm-env';
import { createAttachmentKey } from 'svelte/attachments';
import type { Atom } from './atom.svelte';
import type { Bond } from './bond.svelte';
import type {
	BondVirtualElement,
	NodeCardinality,
	NodeRegistration,
	NodeRegistrationOptions
} from './types';

export type LazyNodePlan<N extends Atom = Atom> = Readonly<{
	key: string;
	cardinality: NodeCardinality;
	roles: readonly string[];
	id(bond: Bond): string;
	create(bond: Bond): N;
}>;

/** A registered semantic identity whose full Atom is created only when a public query needs it. */
export class LazyNodeDescriptor<N extends Atom = Atom> {
	readonly #registrationIndex: number;
	readonly #id: string;
	readonly plan: LazyNodePlan<N>;
	readonly #bond: Bond;
	readonly #registry: NodeRegistry;
	#node: N | undefined;
	#element: Element | BondVirtualElement | undefined;
	#idSource: (() => string | undefined) | undefined;

	constructor(
		plan: LazyNodePlan<N>,
		bond: Bond,
		registry: NodeRegistry,
		registrationIndex: number
	) {
		this.plan = plan;
		this.#bond = bond;
		this.#registry = registry;
		this.#id = plan.id(bond);
		this.#registrationIndex = registrationIndex;
	}

	get registrationId(): string {
		return `${this.plan.key}:${this.#registrationIndex}`;
	}

	get id(): string {
		return this.#idSource?.() ?? this.#node?.id ?? this.#id;
	}

	get node(): N | undefined {
		return this.#node;
	}

	bindId(source: () => string | undefined): void {
		this.#idSource = source;
		this.#node?.bindId(source);
	}

	get element(): Element | BondVirtualElement | undefined {
		return this.#node?.element ?? this.#element;
	}

	materialize(): N {
		if (this.#node) return this.#node;
		const node = this.plan.create(this.#bond);
		if (this.#idSource) node.bindId(this.#idSource);
		try {
			node.adoptElement(this.#element as never);
			node.activateCapabilities(this.#bond);
		} catch (error) {
			node.destroyCapabilities();
			throw error;
		}
		this.#node = node;
		this.#registry.adoptLazyNode(node, this);
		return node;
	}

	mount(element: Element | BondVirtualElement): () => void {
		this.#element = element;
		this.#node?.adoptElement(element as never);
		this.#registry.publishLazy();
		return () => {
			if (this.#element !== element) return;
			this.#element = undefined;
			this.#node?.adoptElement(undefined);
			this.#registry.publishLazy();
		};
	}

	destroy(): void {
		this.#node?.destroyCapabilities();
		this.#node = undefined;
		this.#element = undefined;
	}
}

/**
 * Render-safe registry with one canonical owner for identity, part indexes and reactivity.
 *
 * Eager Atoms retain their original maps and hot path. Lazy semantic descriptors share one ordered
 * list: Bond families have few slots, so a short scan avoids per-Bond maps and per-part arrays.
 * A public node query materializes the descriptor; ID/element lookup does not.
 */
export class NodeRegistry {
	// Eager indexes stay absent for Kernel-only Bonds.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#byNode: Map<Atom, NodeRegistration> | undefined;
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#byPart: Map<string, NodeRegistration[]> | undefined;
	/** Canonical mixed insertion order, allocated only after the first lazy registration. */
	#order: Array<NodeRegistration | LazyNodeDescriptor> | undefined;
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#descriptorByNode: Map<Atom, LazyNodeDescriptor> | undefined;
	#version = $state(0);
	#nextId = 0;
	readonly #owner: Bond | (() => string);

	constructor(owner: Bond | (() => string)) {
		this.#owner = owner;
	}

	register<N extends Atom>(node: N, options: NodeRegistrationOptions = {}): () => void {
		const key = options.key ?? node.name;
		const cardinality = options.cardinality ?? 'single';

		if (this.#byNode?.has(node)) return () => this.unregister(node);

		const existing = this.#byPart?.get(key);
		// The lazy scan answers ONE question — is a single-node part being registered twice — and it
		// walks every registration on this Bond to answer it. Computed unconditionally it was an O(n)
		// scan per registration for `cardinality: 'many'` parts too, which is O(n²) over a collection
		// (menu items, grid cells, tree nodes) to prove something that cannot be true for them.
		if (cardinality === 'single') {
			const lazyExisting = this.#order?.some(
				(entry) => entry instanceof LazyNodeDescriptor && entry.plan.key === key
			);
			if (existing?.length || lazyExisting) throw this.#cardinalityError(key);
		}

		const registration: NodeRegistration<N> = {
			id: `${key}:${++this.#nextId}`,
			key,
			cardinality,
			node
		};
		(this.#byNode ??= new Map()).set(node, registration);
		if (existing) existing.push(registration);
		else (this.#byPart ??= new Map()).set(key, [registration]);
		this.#order?.push(registration);
		this.#publish();

		let live = true;
		return () => {
			if (!live) return;
			live = false;
			this.unregister(node);
		};
	}

	registerLazy<N extends Atom>(plan: LazyNodePlan<N>, bond: Bond): LazyNodeDescriptor<N> {
		// Same O(n²) as `register` above, and this is the hotter of the two: every Kernel part
		// registers through here.
		if (plan.cardinality === 'single') {
			const eager = this.#byPart?.get(plan.key);
			const lazy = this.#order?.some(
				(entry) => entry instanceof LazyNodeDescriptor && entry.plan.key === plan.key
			);
			if (eager?.length || lazy) throw this.#cardinalityError(plan.key);
		}

		const descriptor = new LazyNodeDescriptor(plan, bond, this, ++this.#nextId);
		(this.#order ??= Array.from(this.#byNode?.values() ?? [])).push(descriptor);
		this.#publish();
		return descriptor;
	}

	unregister(node: Atom): void {
		const lazy = this.#descriptorByNode?.get(node);
		if (lazy) {
			this.unregisterLazy(lazy);
			return;
		}

		const registration = this.#byNode?.get(node);
		if (!registration) return;
		this.#byNode!.delete(node);

		const registrations = this.#byPart?.get(registration.key);
		if (registrations) {
			const index = registrations.indexOf(registration);
			if (index !== -1) registrations.splice(index, 1);
			if (registrations.length === 0) this.#byPart!.delete(registration.key);
		}
		if (this.#order) {
			const index = this.#order.indexOf(registration);
			if (index !== -1) this.#order.splice(index, 1);
		}
		this.#publish();
	}

	unregisterLazy(descriptor: LazyNodeDescriptor): void {
		const orderIndex = this.#order?.indexOf(descriptor) ?? -1;
		if (orderIndex === -1) return;
		this.#order!.splice(orderIndex, 1);
		if (descriptor.node) this.#descriptorByNode?.delete(descriptor.node);
		descriptor.destroy();
		this.#publish();
	}

	nodeByPart<N extends Atom = Atom>(part: string): N | undefined {
		this.#track();
		if (!this.#order) return this.#byPart?.get(part)?.[0]?.node as N | undefined;
		for (const entry of this.#order) {
			if (entry instanceof LazyNodeDescriptor) {
				if (entry.plan.key === part) return entry.materialize() as N;
			} else if (entry.key === part) return entry.node as N;
		}
		return undefined;
	}

	nodesByPart<N extends Atom = Atom>(part: string): N[] {
		this.#track();
		if (!this.#order) {
			return (this.#byPart?.get(part) ?? []).map((registration) => registration.node as N);
		}
		const nodes: N[] = [];
		for (const entry of this.#order) {
			if (entry instanceof LazyNodeDescriptor) {
				if (entry.plan.key === part) nodes.push(entry.materialize() as N);
			} else if (entry.key === part) nodes.push(entry.node as N);
		}
		return nodes;
	}

	nodeByRole<N extends Atom = Atom>(role: string): N | undefined {
		this.#track();
		for (const entry of this.#order ?? this.#byNode?.values() ?? []) {
			if (entry instanceof LazyNodeDescriptor) {
				if (entry.node?.hasRole(role) || entry.plan.roles.includes(role)) {
					return entry.materialize() as N;
				}
			} else if (entry.node.hasRole(role)) return entry.node as N;
		}
		return undefined;
	}

	nodesByRole<N extends Atom = Atom>(role: string): N[] {
		this.#track();
		const nodes: N[] = [];
		for (const entry of this.#order ?? this.#byNode?.values() ?? []) {
			if (entry instanceof LazyNodeDescriptor) {
				if (entry.node?.hasRole(role) || entry.plan.roles.includes(role)) {
					nodes.push(entry.materialize() as N);
				}
			} else if (entry.node.hasRole(role)) nodes.push(entry.node as N);
		}
		return nodes;
	}

	idByRole(role: string): string | undefined {
		this.#track();
		for (const entry of this.#order ?? this.#byNode?.values() ?? []) {
			if (entry instanceof LazyNodeDescriptor) {
				if (entry.node?.hasRole(role) || entry.plan.roles.includes(role)) return entry.id;
			} else if (entry.node.hasRole(role)) return entry.node.id;
		}
		return undefined;
	}

	/** @internal Called by a descriptor exactly once when its Atom is first requested. */
	adoptLazyNode(node: Atom, descriptor: LazyNodeDescriptor): void {
		(this.#descriptorByNode ??= new Map()).set(node, descriptor);
	}

	/** @internal Publishes descriptor element changes through the registry's existing revision. */
	publishLazy(): void {
		this.#publish();
	}

	values(): NodeRegistration[] {
		this.#track();
		if (!this.#order) return Array.from(this.#byNode?.values() ?? []);
		return this.#order.map((entry) =>
			entry instanceof LazyNodeDescriptor
				? {
						id: entry.registrationId,
						key: entry.plan.key,
						cardinality: entry.plan.cardinality,
						node: entry.materialize()
					}
				: entry
		);
	}

	elementValues(): Array<{
		key: string;
		element: Element | BondVirtualElement | undefined;
	}> {
		this.#track();
		return Array.from(this.#order ?? this.#byNode?.values() ?? [], (entry) =>
			entry instanceof LazyNodeDescriptor
				? { key: entry.plan.key, element: entry.element }
				: { key: entry.key, element: entry.node.element }
		);
	}

	clear(): void {
		if (!this.#byNode?.size && !this.#order?.length) return;
		this.#byNode?.clear();
		this.#byPart?.clear();
		for (const entry of this.#order ?? []) {
			if (entry instanceof LazyNodeDescriptor) entry.destroy();
		}
		this.#order = undefined;
		this.#descriptorByNode = undefined;
		this.#publish();
	}

	/** @internal Publishes one batched membership revision outside render. */
	commit(): void {
		this.#version += 1;
	}

	#cardinalityError(key: string): Error {
		return new Error(
			`[ixirjs] Bond("${typeof this.#owner === 'function' ? this.#owner() : this.#owner.name}").register("${key}") received multiple nodes for a single-node part. Use { cardinality: 'many' } when this is intentional.`
		);
	}

	#track(): void {
		void this.#version;
	}

	#publish(): void {
		if (BROWSER) scheduleRegistryCommit(this);
	}
}

const EMPTY_LAZY_ATTACHMENTS: Record<symbol, never> = Object.freeze({});

/** @internal Client-only element capture for a compiled lazy descriptor. */
export function lazyNodeAttachment(
	descriptor: LazyNodeDescriptor
): Record<symbol, (node: Element | BondVirtualElement) => void | (() => void)> {
	if (!BROWSER) return EMPTY_LAZY_ATTACHMENTS;
	const key = createAttachmentKey();
	return { [key]: (node) => descriptor.mount(node) };
}

// eslint-disable-next-line svelte/prefer-svelte-reactivity
const pendingRegistries = new Set<NodeRegistry>();
let registryCommitScheduled = false;

function scheduleRegistryCommit(registry: NodeRegistry): void {
	pendingRegistries.add(registry);
	if (registryCommitScheduled) return;
	registryCommitScheduled = true;
	queueMicrotask(() => {
		registryCommitScheduled = false;
		const batch = Array.from(pendingRegistries);
		pendingRegistries.clear();
		for (const pending of batch) pending.commit();
	});
}
