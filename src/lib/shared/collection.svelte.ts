import { untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';

// Typed, insertion-ordered, reactive collection of child bonds (cached per kind, registered as a collection:<kind> Capability).
// Sorting/selection are $derived views on the parent. Duplicate-id attach throws in dev.
export class Collection<T> {
	readonly kind: string;
	#items: SvelteMap<string, T> = new SvelteMap();

	constructor(kind: string) {
		this.kind = kind;
	}

	get size(): number {
		return this.#items.size;
	}

	// Reactive, insertion-ordered array of values.
	get values(): readonly T[] {
		return Array.from(this.#items.values());
	}

	// Reactive, insertion-ordered array of ids.
	get keys(): readonly string[] {
		return Array.from(this.#items.keys());
	}

	// Reactive, insertion-ordered array of [id, value] pairs.
	get entries(): readonly [string, T][] {
		return Array.from(this.#items.entries());
	}

	get(id: string): T | undefined {
		return this.#items.get(id);
	}

	has(id: string): boolean {
		return this.#items.has(id);
	}

	// Remove the value under id. Prefer the cleanup from attach() for mount lifecycles.
	delete(id: string): void {
		this.#items.delete(id);
	}

	// Index of the value with this id in insertion order; -1 if missing.
	indexOf(id: string): number {
		let i = 0;
		for (const key of this.#items.keys()) {
			if (key === id) return i;
			i++;
		}
		return -1;
	}

	// Register a value under an id; returns a cleanup that removes it (called from atom onmount).
	attach(id: string, value: T): () => void {
		// Runs inside the child's mount effect: read #items untracked to avoid effect_update_depth_exceeded.
		if (import.meta.env?.DEV && untrack(() => this.#items.has(id))) {
			throw new Error(
				`Collection<${this.kind}>: duplicate id '${id}'. Each child must have a unique id within its parent.`
			);
		}
		this.#items.set(id, value);
		return () => {
			// Only delete if our value is still registered — guards re-mounts that overwrote it.
			if (untrack(() => this.#items.get(id)) === value) this.#items.delete(id);
		};
	}

	clear(): void {
		this.#items.clear();
	}
}
