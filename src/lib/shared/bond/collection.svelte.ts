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

	// `values` is read once per rendered child (a datagrid cell resolves its column through it), so
	// allocating the array per read made an R×C grid O(R·C²). Plain cache, cleared by every mutator
	// — the same shape `#indexes` uses, and unlike a `$derived` it is also correct on the server,
	// where there is no effect graph and columns register while cells are already reading.
	#values: readonly T[] | undefined;

	get values(): readonly T[] {
		// Registers the SvelteMap dependency for reactive reads; the cache serves the array.
		void this.#items.size;
		return (this.#values ??= Array.from(this.#items.values()));
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
		if (this.#items.delete(id)) {
			this.#indexesDirty = true;
			this.#values = undefined;
		}
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
		// Dirty on replacement too: the values cache holds the value, not just the ordering.
		if (!had) this.#indexesDirty = true;
		this.#values = undefined;
		return () => {
			// Only delete if our value is still registered — guards re-mounts that overwrote it.
			if (untrack(() => this.#items.get(id)) === value) this.delete(id);
		};
	}

	clear(): void {
		this.#items.clear();
		this.#indexes.clear();
		this.#values = undefined;
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
