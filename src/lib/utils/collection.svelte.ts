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

	/**
	 * Membership signal for the whole-collection views, published at most once per read.
	 *
	 * Every view below used to register `void this.#items.size`, so all n of them depended on
	 * `SvelteMap`'s size source and every `set` marked every one of them. Mounting n children is n
	 * sets, so the marking was O(n²) with a small constant — the accordion fitted at k = 1.55 and a
	 * 400-item mount cost ~1 s.
	 *
	 * The fix is NOT to defer the publish. Deferring it to a microtask is what previous attempts did,
	 * and it fails two invariants that are asserted synchronously: the accordion's "one tabbable
	 * header at mount" (a11y, a hard gate) and `collection.svelte.spec.ts`'s same-tick derived view.
	 * Flushing a pending publish from inside a read does not rescue it either — a `$derived` that is
	 * still CLEAN short-circuits and never calls into this class, so there is no read to flush from.
	 *
	 * So the publish stays synchronous and is instead COALESCED. `#dirtySinceRead` records whether
	 * every dependent is already marked. While it is true a further `set` cannot tell any reader
	 * anything it has not been told, so the bump is skipped; a tracked read clears it, and the next
	 * write bumps again. n registrations with no interleaved read cost exactly one bump instead of n,
	 * and any read still observes the collection as of that instant. The flag is a plain field, not
	 * `$state`, so clearing it inside a read is not a reactive write and needs no `untrack`.
	 */
	#version = $state(0);
	#dirtySinceRead = false;

	constructor(kind: string) {
		this.kind = kind;
	}

	/** Registers the coalesced membership dependency. */
	#track(): void {
		this.#dirtySinceRead = false;
		void this.#version;
	}

	#publish(): void {
		if (this.#dirtySinceRead) return;
		this.#dirtySinceRead = true;
		// Untracked for the same reason `set` reads `#items` untracked: this runs inside the child's
		// mount effect, and `#version++` READS the signal before writing it. Tracked, that subscribes
		// the registering effect to the very signal it bumps, so the effect re-runs and re-registers
		// — which silently reorders the collection. The tree keyboard specs catch it as focus landing
		// on the wrong node.
		untrack(() => this.#version++);
	}

	get size(): number {
		this.#track();
		return untrack(() => this.#items.size);
	}

	// `values` is read once per rendered child (a datagrid cell resolves its column through it), so
	// allocating the array per read made an R×C grid O(R·C²). Plain cache, cleared by every mutator
	// — the same shape `#indexes` uses, and unlike a `$derived` it is also correct on the server,
	// where there is no effect graph and columns register while cells are already reading.
	#values: readonly T[] | undefined;

	get values(): readonly T[] {
		this.#track();
		return (this.#values ??= untrack(() => Array.from(this.#items.values())));
	}

	// Same cache shape as `#values` — these were the two remaining per-read `Array.from` walks.
	#keys: readonly string[] | undefined;
	#entries: readonly [string, T][] | undefined;

	get keys(): readonly string[] {
		this.#track();
		return (this.#keys ??= untrack(() => Array.from(this.#items.keys())));
	}

	get entries(): readonly [string, T][] {
		this.#track();
		return (this.#entries ??= untrack(() => Array.from(this.#items.entries())));
	}

	[Symbol.iterator](): IterableIterator<[string, T]> {
		return this.#items[Symbol.iterator]();
	}

	// `get`/`has` stay on `SvelteMap`'s own per-key sources. Those are already fine-grained — a `set`
	// marks only readers of that one key — so they are not what made mounting quadratic, and routing
	// them through the batched signal would make every key-reader depend on the whole collection.
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
			this.#keys = undefined;
			this.#entries = undefined;
			this.#publish();
		}
	}

	indexOf(id: string): number {
		this.#track();
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
		this.#keys = undefined;
		this.#entries = undefined;
		this.#publish();
		return () => {
			// Only delete if our value is still registered — guards re-mounts that overwrote it.
			if (untrack(() => this.#items.get(id)) === value) this.delete(id);
		};
	}

	clear(): void {
		this.#items.clear();
		this.#indexes.clear();
		this.#values = undefined;
		this.#keys = undefined;
		this.#entries = undefined;
		this.#indexesDirty = true;
		this.#publish();
	}

	#refreshIndexes(): void {
		if (!this.#indexesDirty) return;
		this.#indexes.clear();
		let i = 0;
		for (const key of untrack(() => Array.from(this.#items.keys()))) this.#indexes.set(key, i++);
		this.#indexesDirty = false;
	}
}
