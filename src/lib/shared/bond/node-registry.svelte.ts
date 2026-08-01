import { BROWSER } from 'esm-env';
import type { Atom } from './atom.svelte';
import type { NodeRegistration, NodeRegistrationOptions } from './types';

/**
 * Render-safe registry with one canonical owner for identity, part indexes and reactivity.
 *
 * Plain indexes are updated synchronously so siblings can query registrations during render. A
 * single module-level microtask publishes reactive membership changes for every registry touched
 * in the turn, avoiding one staging map pair and one microtask per Bond. Server rendering needs
 * synchronous identity only, so it never schedules client reactivity work.
 */
export class NodeRegistry {
	// Insertion-ordered canonical registrations plus the exact-part index.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#byNode = new Map<Atom, NodeRegistration>();
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#byPart = new Map<string, NodeRegistration[]>();
	#version = $state(0);
	#nextId = 0;
	readonly #ownerName: () => string;

	constructor(ownerName: () => string) {
		this.#ownerName = ownerName;
	}

	register<N extends Atom>(node: N, options: NodeRegistrationOptions = {}): () => void {
		const key = options.key ?? node.name;
		const cardinality = options.cardinality ?? 'single';

		if (this.#byNode.has(node)) return () => this.unregister(node);

		const existing = this.#byPart.get(key);
		if (cardinality === 'single' && existing?.length) {
			throw new Error(
				`[ixirjs] Bond("${this.#ownerName()}").register("${key}") received multiple nodes for a single-node part. Use { cardinality: 'many' } when this is intentional.`
			);
		}

		const registration: NodeRegistration<N> = {
			id: `${key}:${++this.#nextId}`,
			key,
			cardinality,
			node
		};
		this.#byNode.set(node, registration);
		if (existing) existing.push(registration);
		else this.#byPart.set(key, [registration]);
		this.#publish();

		let live = true;
		return () => {
			if (!live) return;
			live = false;
			this.unregister(node);
		};
	}

	unregister(node: Atom): void {
		const registration = this.#byNode.get(node);
		if (!registration) return;
		this.#byNode.delete(node);

		const registrations = this.#byPart.get(registration.key);
		if (registrations) {
			const index = registrations.indexOf(registration);
			if (index !== -1) registrations.splice(index, 1);
			if (registrations.length === 0) this.#byPart.delete(registration.key);
		}
		this.#publish();
	}

	nodeByPart<N extends Atom = Atom>(part: string): N | undefined {
		this.#track();
		return this.#byPart.get(part)?.[0]?.node as N | undefined;
	}

	nodesByPart<N extends Atom = Atom>(part: string): N[] {
		this.#track();
		return (this.#byPart.get(part) ?? []).map((registration) => registration.node as N);
	}

	nodeByRole<N extends Atom = Atom>(role: string): N | undefined {
		this.#track();
		for (const registration of this.#byNode.values()) {
			if (registration.node.hasRole(role)) return registration.node as N;
		}
		return undefined;
	}

	nodesByRole<N extends Atom = Atom>(role: string): N[] {
		this.#track();
		const nodes: N[] = [];
		for (const registration of this.#byNode.values()) {
			if (registration.node.hasRole(role)) nodes.push(registration.node as N);
		}
		return nodes;
	}

	values(): NodeRegistration[] {
		this.#track();
		return Array.from(this.#byNode.values());
	}

	clear(): void {
		if (this.#byNode.size === 0 && this.#byPart.size === 0) return;
		this.#byNode.clear();
		this.#byPart.clear();
		this.#publish();
	}

	/** @internal Publishes one batched membership revision outside render. */
	commit(): void {
		this.#version += 1;
	}

	#track(): void {
		void this.#version;
	}

	#publish(): void {
		if (BROWSER) scheduleRegistryCommit(this);
	}
}

// All Bonds touched in one render share one microtask. Plain Set: scheduler state, never reactive.
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
