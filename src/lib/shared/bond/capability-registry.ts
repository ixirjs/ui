import {
	collectionCapability,
	collectionSlot
} from '$ixirjs/ui/shared/capability/models/collection.svelte';
import { CapabilityHost } from '$ixirjs/ui/shared/capability/host';
import type { Behavior, Capability, CapabilityKey } from '$ixirjs/ui/shared/capability/capability';
import type { Bond } from './bond.svelte';
import type { Collection } from './collection.svelte';

/** Shared capability registry for Bond hosts, backed by the unified lifecycle runtime. */
export abstract class CapabilityRegistry {
	abstract get id(): string;

	#host: CapabilityHost<Capability, Bond> | undefined;
	#deferred: (() => Capability) | Array<() => Capability> | undefined;
	#deferredActivated = false;

	#getHost(): CapabilityHost<Capability, Bond> {
		if (this.#host) return this.#host;
		const host = new CapabilityHost<Capability, Bond>({ kind: 'bond', label: () => this.id });
		const deferred = this.#deferred;
		if (deferred) {
			if (Array.isArray(deferred)) {
				for (const create of deferred) host.register(create());
			} else host.register(deferred());
		}
		if (this.#deferredActivated) host.markActive();
		return (this.#host = host);
	}

	/** @internal Defers a setup-free default capability until its public surface is observed. */
	deferSetupFreeCapability(create: () => Capability): void {
		if (this.#host) {
			this.#host.register(create());
			return;
		}
		if (!this.#deferred) this.#deferred = create;
		else if (Array.isArray(this.#deferred)) this.#deferred.push(create);
		else this.#deferred = [this.#deferred, create];
	}

	collection<T>(kind: string): Collection<T> {
		const slot = collectionSlot(kind);
		const existing = this.#getHost().find(slot);
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
		return this.#getHost().registerOrFind(capabilityOrKey) as Capability<S> | undefined;
	}

	registerCapabilities(capabilities: readonly Capability[]): void {
		for (const capability of capabilities) this.capability(capability);
	}

	surface<S>(key: CapabilityKey<S>): S | undefined {
		return this.#getHost().surface(key) as S | undefined;
	}

	requireSurface<S>(key: CapabilityKey<S>): S {
		return this.#getHost().requireSurface(key) as S;
	}

	get capabilities(): readonly Capability[] {
		return this.#getHost().capabilities;
	}

	activateCapabilities(owner: Bond = this as unknown as Bond): void {
		if (!this.#host) {
			this.#deferredActivated = true;
			return;
		}
		const host = this.#getHost();
		host.activate(owner, (capability, bond) => capability.setup?.(bond));
		host.validate();
	}

	destroyCapabilities(): void {
		this.#host?.destroy();
	}

	/** Whether capability activation left a lifecycle owner to destroy (false after the setup-free fast path). */
	get hasCapabilityTeardown(): boolean {
		return this.#host?.hasTeardown ?? false;
	}

	/**
	 * Seals a setup-free host without creating a lifecycle owner. The test seam for capability unit
	 * tests: `activateCapabilities()` would run the setups, which is the thing under test.
	 * @internal
	 */
	markSetupConsumed(): void {
		this.#getHost().markActive();
	}

	behaviorsForRole(role: string, ctx?: unknown): Behavior[] {
		const host = this.#getHost();
		host.seal();
		host.validate();
		const out: Behavior[] = [];
		for (const capability of host.order()) {
			const behavior = capability.behavior?.(role, ctx);
			if (behavior) out.push(behavior);
		}
		return out;
	}
}
