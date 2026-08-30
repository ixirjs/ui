// Owns selection logic but not storage — state lives in the bond props the consumer bindables.
export interface SelectionModel<T> {
	// `'single'` collapses the committed set to one value; `'multiple'` unions.
	readonly mode: 'single' | 'multiple';
	// The committed values, in storage order. Reactive (reads the backing store).
	readonly values: readonly T[];
	isSelected(value: T): boolean;
	// Commit `value`(s). In single mode the first incoming value wins.
	select(value: T | T[]): void;
	deselect(value: T | T[]): void;
	// Commit if absent, remove if present.
	toggle(value: T): void;
	clear(): void;
	// Iterable protocol — yields the committed values in storage order (`[...selection]`, `for…of`).
	[Symbol.iterator](): IterableIterator<T>;
}

// The storage seam the model controls. The bond supplies reactive accessors over its own props
// so two-way binding is preserved. Scalar components adapt via get/set shape conversions.
export interface SelectionBacking<T> {
	get(): readonly T[] | undefined;
	set(values: T[]): void;
	mode(): 'single' | 'multiple';
	// Required when T itself is an array: distinguishes one array value from the legacy batch form.
	isValue?(value: unknown): value is T;
	// Required when backing storage proxies or recreates non-primitive values and semantic equality differs.
	equals?(left: T, right: T): boolean;
	/**
	 * Declare `get()` **reactive** — that reading it inside a `$derived` re-runs when the values
	 * change. `isSelected` is then answered from a Set in O(1) instead of scanning.
	 *
	 * Opt-in, and deliberately not inferred: a stale index cannot be detected from the outside. A
	 * plain array behind a plain getter never invalidates a derived, and identity and length both
	 * survive `values[3] = x`, so a model that assumed reactivity would answer from the first Set it
	 * ever built, forever. Bond props satisfy this; a plain array does not.
	 */
	indexed?: boolean;
}

const EMPTY_VALUES: readonly never[] = [];

// Below this a linear scan beats building a Set. See `membership`.
const SET_MIN = 8;

// Match Set membership semantics while still allowing callers to define equality for proxied values.
function sameValueZero<T>(left: T, right: T): boolean {
	return left === right || (left !== left && right !== right);
}

// Pure controller — every read/write goes through the backing.
export function createSelection<T>(backing: SelectionBacking<T>): SelectionModel<T> {
	const values = (): readonly T[] => backing.get() ?? EMPTY_VALUES;
	const list = (): T[] => [...values()];
	const equals = backing.equals ?? sameValueZero;

	/**
	 * Membership index, or `undefined` whenever the scan has to answer instead.
	 *
	 * Built only for a backing that declares itself `indexed`. Skipped when the caller defines its
	 * own `equals` (a `Set` is SameValueZero and cannot honour it), and below a handful of values,
	 * where allocating the Set costs more than the comparisons it saves — which is every single-mode
	 * selection, and `createDisclosure`, whose whole "selection" is one sentinel.
	 */
	const membership = $derived.by(() => {
		if (!backing.indexed || backing.equals) return undefined;
		const current = values();
		return current.length < SET_MIN ? undefined : new Set(current);
	});

	// O(1) for an indexed backing, and the scan this model has always done for anything else.
	const has = (value: T): boolean => {
		const index = membership;
		if (index) return index.has(value);
		return values().some((item) => equals(item, value));
	};

	const asValues = (value: T | T[]): readonly T[] =>
		backing.isValue?.(value) ? [value] : Array.isArray(value) ? value : [value];

	const select = (value: T | T[]): void => {
		const incoming = asValues(value);
		if (backing.mode() === 'multiple') {
			const next = list();
			for (const item of incoming) {
				if (!next.some((current) => equals(current, item))) next.push(item);
			}
			backing.set(next);
		} else {
			// single: the first incoming value wins (matches accordion/select today)
			const first = incoming[0];
			backing.set(first === undefined ? [] : [first]);
		}
	};

	const deselect = (value: T | T[]): void => {
		const outgoing = asValues(value);
		backing.set(list().filter((current) => !outgoing.some((item) => equals(current, item))));
	};

	const toggle = (value: T): void => {
		if (has(value)) deselect(value);
		else select(value);
	};

	const clear = (): void => backing.set([]);

	return {
		get mode() {
			return backing.mode();
		},
		get values() {
			return values();
		},
		isSelected: has,
		select,
		deselect,
		toggle,
		clear,
		// Snapshot the backing each iteration so the read registers reactivity at the call site.
		[Symbol.iterator]: () => list()[Symbol.iterator]()
	};
}
