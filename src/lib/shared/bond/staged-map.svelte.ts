import { SvelteMap } from 'svelte/reactivity';

// Microtask-deferred writes: avoids state_unsafe_mutation in $derived contexts.
export class StagedMap<V> {
	// Intentionally a plain (non-reactive) Map: this is the staging buffer; only #committed is reactive.
	// eslint-disable-next-line svelte/prefer-svelte-reactivity
	#pending = new Map<string, V>();
	#committed = new SvelteMap<string, V>();
	#flushScheduled = false;

	#scheduleFlush() {
		if (this.#flushScheduled) return;
		this.#flushScheduled = true;
		queueMicrotask(() => {
			this.#flushScheduled = false;
			for (const [key, value] of this.#pending) this.#committed.set(key, value);
			this.#pending.clear();
		});
	}

	get(key: string): V | undefined {
		// Read #committed first to register the dependency, else the flush won't re-trigger.
		const committed = this.#committed.get(key);
		return this.#pending.get(key) ?? committed;
	}

	has(key: string): boolean {
		return this.#pending.has(key) || this.#committed.has(key);
	}

	// Finds a just-staged (not yet flushed) value synchronously.
	find(predicate: (value: V, key: string) => boolean): V | undefined {
		for (const [key, value] of this.#committed) {
			const current = this.#pending.get(key) ?? value;
			if (predicate(current, key)) return current;
		}
		for (const [key, value] of this.#pending) {
			if (this.#committed.has(key)) continue;
			if (predicate(value, key)) return value;
		}
		return undefined;
	}

	stage(key: string, value: V): void {
		this.#pending.set(key, value);
		this.#scheduleFlush();
	}

	delete(key: string): boolean {
		const pendingDeleted = this.#pending.delete(key);
		const committedDeleted = this.#committed.delete(key);
		return pendingDeleted || committedDeleted;
	}

	clear(): void {
		this.#pending.clear();
		this.#committed.clear();
	}

	forEach(cb: (key: string, value: V) => void): void {
		for (const [key, value] of this.#committed) {
			cb(key, this.#pending.get(key) ?? value);
		}
		for (const [key, value] of this.#pending) {
			if (this.#committed.has(key)) continue;
			cb(key, value);
		}
	}

	values(): V[] {
		const out: V[] = [];
		this.forEach((_, value) => out.push(value));
		return out;
	}
}
