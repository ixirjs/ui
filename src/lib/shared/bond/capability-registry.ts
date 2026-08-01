import { DEV } from 'esm-env';
import {
	collectionCapability,
	collectionSlot
} from '$ixirjs/ui/shared/capability/models/collection.svelte';
import { normalizeBondCapability, slotName } from '$ixirjs/ui/shared/capability/capability';
import { CapabilityRuntime } from '$ixirjs/ui/shared/capability/runtime.svelte';
import {
	capabilityRuntimeMessages,
	capabilityValidationMessages,
	registerCapability
} from '$ixirjs/ui/shared/capability/host';
import type { Behavior, Capability, CapabilityKey } from '$ixirjs/ui/shared/capability/capability';
import type { Bond } from './bond.svelte';
import type { Collection } from './collection.svelte';

/** Shared capability registry for Bond hosts, backed by the unified lifecycle runtime. */
export abstract class CapabilityRegistry {
	abstract get id(): string;

	readonly #runtime = new CapabilityRuntime<Capability, Bond>(
		capabilityRuntimeMessages<Capability>('bond', () => this.id)
	);
	#validated = false;

	collection<T>(kind: string): Collection<T> {
		const slot = collectionSlot(kind);
		const existing = this.#runtime.find(slot);
		if (existing) return existing.surface as Collection<T>;
		const capability = collectionCapability<T>(kind);
		this.capability(capability);
		return capability.surface;
	}

	capability<C extends Capability>(capability: C): C;
	capability<S>(key: CapabilityKey<S>): Capability<S> | undefined;
	capability<S = unknown>(
		capabilityOrKey: Capability | CapabilityKey<S>
	): Capability<S> | undefined {
		if (typeof capabilityOrKey === 'symbol') {
			const found = this.#runtime.find(capabilityOrKey) as Capability<S> | undefined;
			if (DEV && !found) {
				console.warn(
					`[ixirjs] capability("${slotName(capabilityOrKey)}"): no capability registered at this slot in "${this.id}".`
				);
			}
			return found;
		}

		const registered = registerCapability(this.#runtime, capabilityOrKey, {
			kind: 'bond',
			label: () => this.id,
			normalize: (capability, expectedSlot) =>
				normalizeBondCapability(capability, expectedSlot as CapabilityKey<unknown> | undefined)
		});
		this.#validated = false;
		return registered as Capability<S>;
	}

	registerCapabilities(capabilities: readonly Capability[]): void {
		for (const capability of capabilities) this.capability(capability);
	}

	surface<S>(key: CapabilityKey<S>): S | undefined {
		return this.capability(key)?.surface;
	}

	requireCapability<S>(key: CapabilityKey<S>): Capability<S> {
		const found = this.#runtime.find(key) as Capability<S> | undefined;
		if (!found) {
			throw new Error(
				`[ixirjs] required capability "${slotName(key)}" is not registered in "${this.id}".`
			);
		}
		return found;
	}

	requireSurface<S>(key: CapabilityKey<S>): S {
		const capability = this.requireCapability(key);
		if (capability.surface === undefined) {
			throw new Error(`[ixirjs] capability "${slotName(key)}" has no surface in "${this.id}".`);
		}
		return capability.surface;
	}

	get capabilities(): readonly Capability[] {
		return this.#runtime.capabilities;
	}

	activateCapabilities(owner: Bond = this as unknown as Bond): void {
		this.#runtime.activate(owner, (capability, bond) => capability.setup?.(bond));
		if (DEV && !this.#validated) {
			this.#validated = true;
			this.#validateCapabilities();
		}
	}

	destroyCapabilities(): void {
		this.#runtime.destroy();
	}

	/** Seals a setup-free host without creating a lifecycle owner. Used by capability unit tests. */
	markSetupConsumed(): void {
		this.#runtime.markActive();
	}

	behaviorsForRole(role: string, ctx?: unknown): Behavior[] {
		this.#runtime.seal();
		if (DEV && !this.#validated) {
			this.#validated = true;
			this.#validateCapabilities();
		}
		const out: Behavior[] = [];
		for (const capability of this.#runtime.order()) {
			const behavior = capability.behavior?.(role, ctx);
			if (behavior) out.push(behavior);
		}
		return out;
	}

	#validateCapabilities(): void {
		const { messages, inactiveLifecycle } = capabilityValidationMessages(
			'bond',
			() => this.id,
			this.capabilities
		);
		for (const message of messages) console.warn(message);
		if (!inactiveLifecycle || this.#runtime.isActive) return;
		// A Bond that projects a role while still constructing reaches here before bindBond's own
		// constructor activates it. Every activation path is synchronous, so ask again once the
		// turn settles rather than reporting a lifecycle that is a few statements away.
		queueMicrotask(() => {
			if (!this.#runtime.isActive) console.warn(inactiveLifecycle);
		});
	}
}
