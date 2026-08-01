import {
	defineProjectionCapability,
	sharedCapabilityKey,
	type Behavior,
	type Capability
} from '../capability';

// Surface type travels with the key — capability(SELECTION) is typed without a cast.
export const SELECTION = sharedCapabilityKey<SelectionModel<unknown>>(
	'@svelte-atoms/cap:selection'
);

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
}

const EMPTY_VALUES: readonly never[] = [];

// Pure controller — every read/write goes through the backing.
export function createSelection<T>(backing: SelectionBacking<T>): SelectionModel<T> {
	let cachedValues: readonly T[] | undefined;
	let cachedSet: Set<T> | undefined;
	const values = (): readonly T[] => backing.get() ?? EMPTY_VALUES;
	const list = (): T[] => [...values()];
	const selectedSet = (): Set<T> => {
		const current = values();
		if (current !== cachedValues) {
			cachedValues = current;
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			cachedSet = new Set(current);
		}
		return cachedSet!;
	};
	const has = (value: T): boolean => selectedSet().has(value);

	const select = (value: T | T[]): void => {
		const incoming = Array.isArray(value) ? value : [value];
		if (backing.mode() === 'multiple') {
			// eslint-disable-next-line svelte/prefer-svelte-reactivity
			backing.set([...new Set([...list(), ...incoming])]);
		} else {
			// single: the first incoming value wins (matches accordion/select today)
			const first = incoming[0];
			backing.set(first === undefined ? [] : [first]);
		}
	};

	const deselect = (value: T | T[]): void => {
		// eslint-disable-next-line svelte/prefer-svelte-reactivity
		const outgoing = new Set(Array.isArray(value) ? value : [value]);
		backing.set(list().filter((v) => !outgoing.has(v)));
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

// Options for `selectionCapability`'s atom projections.
export interface SelectionProjectionOptions {
	// ARIA attribute for selectedness: 'aria-selected' (default), 'aria-checked', or false to omit.
	aria?: 'aria-selected' | 'aria-checked' | false;
	// Click commits via `toggle` (default) or `select` (replace-style, e.g. tabs).
	commit?: 'toggle' | 'select';
	// If false, skip onclick — use when the component owns its own guarded handler.
	interactive?: boolean;
}

export function selectionCapability<T>(
	model: SelectionModel<T>,
	options: SelectionProjectionOptions = {}
): Capability<SelectionModel<T>> {
	const aria = options.aria ?? 'aria-selected';
	const commit = options.commit ?? 'toggle';
	const interactive = options.interactive ?? true;

	return defineProjectionCapability<SelectionModel<T>>({
		slot: SELECTION,
		surface: model,
		meta: {
			docs: 'Selection model surface with selectedness and optional commit projections.'
		},
		roles: {
			item: (id) => {
				const value = id as T;
				const projection: Behavior = {
					attrs: () => {
						const selected = model.isSelected(value);
						return {
							// aria-* is a boolean state; data-selected is a present-only CSS hook
							// (absent when unselected) so `[data-selected]` selectors work.
							...(aria ? { [aria]: selected } : {}),
							'data-selected': selected ? '' : undefined
						};
					}
				};
				if (interactive) {
					projection.handlers = () => ({
						onclick: () => (commit === 'select' ? model.select(value) : model.toggle(value))
					});
				}
				return projection;
			},
			container: () => ({
				attrs: () => ({ 'aria-multiselectable': model.mode === 'multiple' })
			})
		}
	});
}
