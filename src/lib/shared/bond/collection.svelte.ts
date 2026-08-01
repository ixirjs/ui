import { untrack } from 'svelte';
import { SvelteMap } from 'svelte/reactivity';
import { DEV } from 'esm-env';

// Typed, insertion-ordered, reactive collection of child bonds (cached per kind, registered as a collection:<kind> Capability).
// Sorting/selection are $derived views on the parent. Duplicate-id set throws in dev.
export class Collection<T> {
	readonly kind: string;
	#items: SvelteMap<string, T> = new SvelteMap();
	// Lazily rebuilt index cache: positional projections can call indexOf for every item.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#indexes = new Map<string, number>();
	#indexesDirty = true;

	constructor(kind: string) {
		this.kind = kind;
	}

	get size(): number {
		return this.#items.size;
	}

	get values(): readonly T[] {
		return Array.from(this.#items.values());
	}

	get keys(): readonly string[] {
		return Array.from(this.#items.keys());
	}

	get entries(): readonly [string, T][] {
		return Array.from(this.#items.entries());
	}

	[Symbol.iterator](): IterableIterator<[string, T]> {
		return this.#items[Symbol.iterator]();
	}

	get(id: string): T | undefined {
		return this.#items.get(id);
	}

	has(id: string): boolean {
		return this.#items.has(id);
	}

	delete(id: string): void {
		if (this.#items.delete(id)) this.#indexesDirty = true;
	}

	indexOf(id: string): number {
		// Registers the SvelteMap dependency for reactive reads, while the plain cache handles lookup.
		void this.#items.size;
		this.#refreshIndexes();
		return this.#indexes.get(id) ?? -1;
	}

	set(id: string, value: T): () => void {
		// Runs inside the child's mount effect: read #items untracked to avoid effect_update_depth_exceeded.
		if (DEV && untrack(() => this.#items.has(id))) {
			throw new Error(
				`Collection<${this.kind}>: duplicate id '${id}'. Each child must have a unique id within its parent.`
			);
		}
		const had = untrack(() => this.#items.has(id));
		this.#items.set(id, value);
		if (!had) this.#indexesDirty = true;
		return () => {
			// Only delete if our value is still registered — guards re-mounts that overwrote it.
			if (untrack(() => this.#items.get(id)) === value) this.delete(id);
		};
	}

	clear(): void {
		this.#items.clear();
		this.#indexes.clear();
		this.#indexesDirty = true;
	}

	#refreshIndexes(): void {
		if (!this.#indexesDirty) return;
		this.#indexes.clear();
		let i = 0;
		for (const key of this.#items.keys()) this.#indexes.set(key, i++);
		this.#indexesDirty = false;
	}
}
