import type { CapabilitySetupResult } from './capability';

export type RuntimeCapability = {
	readonly slot: symbol;
	readonly requires?: readonly symbol[];
	readonly setup?: unknown;
};

/** How a host names itself in a diagnostic; evaluated only when a message is actually built. */
export type RuntimeHostLabel = () => string;

/**
 * Error-message table for one host kind. Static and shared across every host of that kind — the
 * label travels as a call argument, so constructing a runtime allocates no per-host message
 * closures (six of them, previously, for strings only ever read on error paths).
 */
export type RuntimeMessages<C extends RuntimeCapability> = {
	missingRequirement: (label: RuntimeHostLabel, capability: C, requirement: symbol) => string;
	cycle: (label: RuntimeHostLabel, capabilities: readonly C[]) => string;
	alreadyActive: (label: RuntimeHostLabel) => string;
	disposed: (label: RuntimeHostLabel) => string;
	disposalFailed: (label: RuntimeHostLabel) => string;
	activationFailed: (label: RuntimeHostLabel) => string;
};

/** Internal lifecycle engine shared by Bond and Atom capability hosts. */
export class CapabilityRuntime<C extends RuntimeCapability, Owner> {
	// Plain collections: declaration-order registry state, never reactive state.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	readonly #slots = new Map<symbol, number>();
	#capabilities: C[] = [];
	#status: 'open' | 'activating' | 'active' | 'disposed' = 'open';
	#sealed = false;
	#ordered: readonly C[] | undefined;
	#destroyRoot: (() => void) | undefined;
	readonly #messages: RuntimeMessages<C>;
	readonly #label: RuntimeHostLabel;

	constructor(messages: RuntimeMessages<C>, label: RuntimeHostLabel) {
		this.#messages = messages;
		this.#label = label;
	}

	get capabilities(): readonly C[] {
		return this.#capabilities;
	}

	get isSealed(): boolean {
		return this.#sealed;
	}

	get isActive(): boolean {
		return this.#status === 'active';
	}

	/**
	 * Whether activation created a lifecycle owner that must be destroyed. False after the
	 * setup-free fast path in {@link activate}, where there is no `$effect.root` and `destroy()`
	 * would only flip status on the way to the collector.
	 */
	get hasTeardown(): boolean {
		return this.#destroyRoot !== undefined;
	}

	find(slot: symbol): C | undefined {
		const index = this.#slots.get(slot);
		return index === undefined ? undefined : this.#capabilities[index];
	}

	register(capability: C, replace: (prior: C, next: C) => C): C {
		const slot = capability.slot;
		const index = this.#slots.get(slot);
		if (index !== undefined) {
			const resolved = replace(this.#capabilities[index]!, capability);
			this.#capabilities[index] = resolved;
			this.#ordered = undefined;
			return resolved;
		}

		this.#slots.set(slot, this.#capabilities.length);
		this.#capabilities.push(capability);
		this.#ordered = undefined;
		return capability;
	}

	/** Seals and returns one dependency-stable order for setup, projection, mount, and teardown. */
	order(): readonly C[] {
		if (!this.#ordered) this.#ordered = this.#resolveOrder();
		this.#sealed = true;
		return this.#ordered;
	}

	seal(): void {
		void this.order();
	}

	// Compatibility only: seals a setup-free test/legacy host without creating an owner root.
	markActive(): void {
		if (this.#status !== 'open') return;
		this.order();
		this.#status = 'active';
	}

	activate(
		owner: Owner,
		setup: (capability: C, owner: Owner) => CapabilitySetupResult,
		beforeSetups: readonly (() => CapabilitySetupResult)[] = []
	): void {
		if (this.#status === 'active' || this.#status === 'activating') {
			throw new Error(this.#messages.alreadyActive(this.#label));
		}
		if (this.#status === 'disposed') throw new Error(this.#messages.disposed(this.#label));

		// Resolve the complete graph before setup starts. Missing requirements and cycles are
		// construction errors, not partially-live runtime states.
		const ordered = this.order();

		// A Bond whose capabilities are all role/behavior-only (no `setup`) — e.g. Card's
		// `labelledControl` — has nothing for `$effect.root` to own: no setup to run, no teardown
		// to schedule. Skipping the scope allocation entirely is safe because `destroy()` already
		// treats an absent `#destroyRoot` as a no-op.
		if (
			beforeSetups.length === 0 &&
			ordered.every((capability) => capability.setup === undefined)
		) {
			this.#status = 'active';
			return;
		}

		this.#status = 'activating';
		let rollbackFailed = false;

		try {
			this.#destroyRoot = $effect.root(() => {
				const teardowns: Array<() => void> = [];
				try {
					for (const initialize of beforeSetups) {
						const live = initialize();
						if (live) teardowns.push(toTeardown(live));
					}
					for (const capability of ordered) {
						const live = setup(capability, owner);
						if (live) teardowns.push(toTeardown(live));
					}
				} catch (error) {
					const cleanupErrors = disposeLifo(teardowns);
					if (cleanupErrors.length > 0) {
						rollbackFailed = true;
						throw new AggregateError(
							[error, ...cleanupErrors],
							this.#messages.activationFailed(this.#label)
						);
					}
					throw error;
				}

				return () => throwDisposalErrors(teardowns, this.#messages.disposalFailed(this.#label));
			});
			this.#status = 'active';
		} catch (error) {
			// create_effect destroys nested effects when the root callback throws. A clean rollback
			// is retryable; a failed rollback is permanently disposed because ownership is uncertain.
			this.#destroyRoot = undefined;
			this.#sealed = rollbackFailed;
			this.#status = rollbackFailed ? 'disposed' : 'open';
			throw error;
		}
	}

	destroy(): void {
		if (this.#status === 'disposed') return;
		this.#status = 'disposed';
		this.#sealed = true;
		const destroy = this.#destroyRoot;
		this.#destroyRoot = undefined;
		destroy?.();
	}

	#resolveOrder(): readonly C[] {
		const count = this.#capabilities.length;
		if (count === 0) return EMPTY_CAPABILITIES as readonly C[];

		// Registration order is very often already a valid topological order, and the sort below is
		// not cheap: it allocates two arrays, a nested array per capability, a `Set` per capability,
		// and a queue, all to reproduce the order it was given. This scan settles that in one pass
		// over the declared edges with no allocation at all — measured at 0.04 µs against 1.42 µs for
		// the sort on a three-capability disclosure host, which is the shape every bonded family with
		// a relationship takes. Resolving the graph runs once per host instance, so that is per
		// rendered Bond, not per application.
		//
		// Returning `#capabilities` here is order-identical to running the sort, not merely
		// order-*compatible*. Kahn's algorithm below pops the lowest ready index, which yields the
		// lexicographically smallest topological order; that order is unique, and the identity
		// permutation is the smallest of all permutations. So whenever registration order is a valid
		// topological order it IS the one the sort would produce.
		//
		// A capability whose requirement is missing, self-referential, or ordered after it falls
		// through to the sort, which raises the same missing-requirement or cycle error as before.
		if (this.#isRegistrationOrderTopological(count)) return this.#capabilities;

		const indegree = Array<number>(count).fill(0);
		const dependants = Array.from({ length: count }, () => [] as number[]);

		for (let index = 0; index < count; index++) {
			const capability = this.#capabilities[index]!;
			// Repeating one requirement must not create a false cycle.
			const requirements = new Set(capability.requires ?? []);
			for (const requirement of requirements) {
				const dependency = this.#slots.get(requirement);
				if (dependency === undefined) {
					throw new Error(this.#messages.missingRequirement(this.#label, capability, requirement));
				}
				indegree[index] = indegree[index]! + 1;
				dependants[dependency]!.push(index);
			}
		}

		// Kahn's algorithm with an index-sorted ready queue gives a stable topological order:
		// declaration order is retained wherever dependency edges do not constrain it.
		const ready: number[] = [];
		for (let index = 0; index < count; index++) {
			if (indegree[index] === 0) ready.push(index);
		}
		const ordered: C[] = [];
		while (ready.length > 0) {
			const index = ready.shift()!;
			ordered.push(this.#capabilities[index]!);
			for (const dependant of dependants[index]!) {
				indegree[dependant] = indegree[dependant]! - 1;
				if (indegree[dependant] === 0) insertSorted(ready, dependant);
			}
		}

		if (ordered.length !== count) {
			const cycle = this.#capabilities.filter((_, index) => indegree[index]! > 0);
			throw new Error(this.#messages.cycle(this.#label, cycle));
		}
		return ordered;
	}

	/** Whether every declared requirement is registered strictly before the capability needing it. */
	#isRegistrationOrderTopological(count: number): boolean {
		for (let index = 0; index < count; index++) {
			const requires = this.#capabilities[index]!.requires;
			if (requires === undefined) continue;
			for (let edge = 0; edge < requires.length; edge++) {
				const dependency = this.#slots.get(requires[edge]!);
				if (dependency === undefined || dependency >= index) return false;
			}
		}
		return true;
	}
}

const EMPTY_CAPABILITIES: readonly RuntimeCapability[] = Object.freeze([]);

/** Runs teardowns newest-first, collecting rather than propagating errors. Shared with `Atom`. */
export function disposeLifo(teardowns: readonly (() => void)[]): unknown[] {
	const errors: unknown[] = [];
	for (let index = teardowns.length - 1; index >= 0; index--) {
		try {
			teardowns[index]!();
		} catch (error) {
			errors.push(error);
		}
	}
	return errors;
}

function throwDisposalErrors(teardowns: readonly (() => void)[], message: string): void {
	const errors = disposeLifo(teardowns);
	if (errors.length > 0) throw new AggregateError(errors, message);
}

function toTeardown(live: Exclude<CapabilitySetupResult, void>): () => void {
	if (typeof live === 'function') return live;
	return () => live[Symbol.dispose]();
}

function insertSorted(values: number[], value: number): void {
	const index = values.findIndex((candidate) => candidate > value);
	if (index === -1) values.push(value);
	else values.splice(index, 0, value);
}
