import {
	defineCapability,
	sharedCapabilityKey,
	type Behavior,
	type Capability,
	type CapabilityKey
} from '$ixirjs/ui/shared/capability/capability';

// Surface type travels with the key — capability(SELECTION) is typed without a cast.
export const SELECTION = sharedCapabilityKey<SelectionModel<unknown>>('@ixirjs/cap:selection');

// One runtime slot holds every SelectionModel<T>; specialize its phantom surface only where T is known.
const selectionSlot = <T>(): CapabilityKey<SelectionModel<T>> =>
	SELECTION as CapabilityKey<SelectionModel<T>>;

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
}

const EMPTY_VALUES: readonly never[] = [];

// Match Set membership semantics while still allowing callers to define equality for proxied values.
function sameValueZero<T>(left: T, right: T): boolean {
	return left === right || (left !== left && right !== right);
}

// Pure controller — every read/write goes through the backing.
export function createSelection<T>(backing: SelectionBacking<T>): SelectionModel<T> {
	const values = (): readonly T[] => backing.get() ?? EMPTY_VALUES;
	const list = (): T[] => [...values()];
	const equals = backing.equals ?? sameValueZero;
	// Read through the reactive backing every time. A cached Set keyed only by array identity goes stale
	// when a Svelte state array mutates in place.
	const has = (value: T): boolean => values().some((current) => equals(current, value));
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

// Options for `selectionCapability`'s atom projections.
type SelectionProjectionBase = {
	// ARIA attribute for selectedness: 'aria-selected' (default), 'aria-checked', or false to omit.
	aria?: 'aria-selected' | 'aria-checked' | false;
	// Click commits via `toggle` (default) or `select` (replace-style, e.g. tabs).
	commit?: 'toggle' | 'select';
	// If false, skip onclick — use when the component owns its own guarded handler.
	interactive?: boolean;
};

/** Maps the string item-role context to a selection value. Non-string selections must provide it. */
export type SelectionProjectionOptions<T = string> = SelectionProjectionBase &
	([T] extends [string] ? { itemValue?: (item: string) => T } : { itemValue: (item: string) => T });

export function selectionCapability<T>(
	model: SelectionModel<T>,
	options: SelectionProjectionOptions<T> = {} as SelectionProjectionOptions<T>
): Capability<SelectionModel<T>> {
	const aria = options.aria ?? 'aria-selected';
	const commit = options.commit ?? 'toggle';
	const interactive = options.interactive ?? true;
	const itemValue = options.itemValue as ((item: string) => T) | undefined;

	return defineCapability<SelectionModel<T>>({
		slot: selectionSlot<T>(),
		surface: model,
		meta: {
			docs: 'Selection model surface with selectedness and optional commit projections.'
		},
		roles: {
			item: (id) => {
				if (typeof id !== 'string') return undefined;
				// String selections use their item id directly; other domains must map explicitly.
				const value = itemValue ? itemValue(id) : (id as T);
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
