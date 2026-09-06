import { createDisclosure, type Disclosure, type DisclosureBacking } from '$ixirjs/ui/capability';
import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import type { StateChangeCallback, StateChangeContext } from '$ixirjs/ui/types';

export type DisclosureChange = Pick<StateChangeContext, 'event' | 'reason'>;

/** Storage and final policy belong to the backing owner, not to the prototype. */
export interface DisclosurePort {
	get(): boolean;
	set(next: boolean, change: DisclosureChange): void;
	/** A group can distinguish toggle from an explicit close (Accordion does). */
	toggle?(change: DisclosureChange): void;
}

export interface DisclosureOptions {
	name: string;
	seed: string;
	state: DisclosurePort;
	disabled(): boolean;
}

/** One implementation for standalone and parent-owned disclosure. No registry or mirrored state. */
export class DisclosureBond {
	readonly #options: DisclosureOptions;
	readonly #model: Disclosure;
	#change: DisclosureChange = {};

	constructor(options: DisclosureOptions) {
		this.#options = options;
		this.#model = createDisclosure({
			get: () => options.state.get(),
			set: (next) => {
				if (next !== options.state.get()) options.state.set(next, this.#change);
			}
		});
	}

	get name(): string {
		return this.#options.name;
	}
	get isOpen(): boolean {
		return this.#model.isOpen;
	}
	get isDisabled(): boolean {
		return this.#options.disabled();
	}
	partId(part: string): string {
		return Kernel.id(this.#options.seed, `${this.name}-${part}`);
	}

	// Like Collapsible, imperative commands do not imply a disabled-interaction policy.
	// The trigger guards user input; an overlay adapter would additionally guard opening.
	open(change: DisclosureChange = {}): void {
		this.#run(this.#model.open, change);
	}
	close(change: DisclosureChange = {}): void {
		this.#run(this.#model.close, change);
	}
	toggle(change: DisclosureChange = {}): void {
		if (this.#options.state.toggle) this.#options.state.toggle(change);
		else this.#run(this.#model.toggle, change);
	}

	#run(command: () => void, change: DisclosureChange): void {
		const previous = this.#change;
		this.#change = change;
		try {
			command();
		} finally {
			// No-op, rejection, throws and reentrant callbacks cannot leak gesture metadata.
			this.#change = previous;
		}
	}
}

export function createDisclosureBond(options: DisclosureOptions): DisclosureBond {
	return new DisclosureBond(options);
}

/** The standalone port: equality gate, authoritative write, then public-owner notification. */
export function controlledDisclosure<B>(
	backing: DisclosureBacking,
	owner: () => B,
	onchange?: StateChangeCallback<boolean, B>
): DisclosurePort {
	return {
		get: () => backing.get(),
		set(next, change) {
			if (next === backing.get()) return;
			backing.set(next);
			if (backing.get() === next) onchange?.(next, { ...change, bond: owner() });
		}
	};
}

// Test-only context. Production adapters retain their existing family-specific context keys.
export const DisclosureContext = Kernel.context<DisclosureBond>('prototype/disclosure');
