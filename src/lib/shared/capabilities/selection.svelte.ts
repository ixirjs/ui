import type { Behavior, Capability } from '../bond.svelte';

// `createSelection` returns the SelectionModel surface (storage-agnostic controller).
// `selectionCapability` wraps it into a projectable Capability for the role stitch.

// SelectionModel<T> — owns the logic of "which values are committed" (single vs multiple,
// set algebra) but not the storage: state lives in consumer-bindable bond props.
// Replaces hand-rolled set-algebra duplicated in accordion, tabs, select, datagrid, combobox.
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
}

// The storage seam the model controls. The bond supplies reactive accessors over its own props
// so two-way binding is preserved. Scalar components adapt via get/set shape conversions.
export interface SelectionBacking<T> {
	get(): readonly T[] | undefined;
	set(values: T[]): void;
	mode(): 'single' | 'multiple';
}

// Build a SelectionModel over an injected SelectionBacking.
// Pure controller — holds no state; every read/write goes through the backing.
export function createSelection<T>(backing: SelectionBacking<T>): SelectionModel<T> {
	const list = (): T[] => [...(backing.get() ?? [])];
	const has = (value: T): boolean => list().includes(value);

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
			return backing.get() ?? [];
		},
		isSelected: has,
		select,
		deselect,
		toggle,
		clear
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

// Wrap a SelectionModel into a projectable Capability (slot 'selection').
// 'item' (ctx = value) → aria-selected/data-selected + onclick that commits the value.
// 'container' → aria-multiselectable from the model's mode.
export function selectionCapability<T>(
	model: SelectionModel<T>,
	options: SelectionProjectionOptions = {}
): Capability<SelectionModel<T>> {
	const aria = options.aria ?? 'aria-selected';
	const commit = options.commit ?? 'toggle';
	const interactive = options.interactive ?? true;

	return {
		slot: 'selection',
		surface: model,
		behavior(role, ctx): Behavior | undefined {
			if (role === 'item') {
				const value = ctx as T;
				const projection: Behavior = {
					attrs: () => ({
						// aria-* is a boolean ARIA state (true/false); data-selected is a CSS
						// hook, emitted present-only (absent when unselected) so `[data-selected]`
						// selectors work conventionally.
						...(aria ? { [aria]: model.isSelected(value) } : {}),
						'data-selected': model.isSelected(value) ? '' : undefined
					})
				};
				if (interactive) {
					projection.handlers = () => ({
						onclick: () => (commit === 'select' ? model.select(value) : model.toggle(value))
					});
				}
				return projection;
			}
			if (role === 'container') {
				return {
					attrs: () => ({ 'aria-multiselectable': model.mode === 'multiple' })
				};
			}
			return undefined;
		}
	};
}
