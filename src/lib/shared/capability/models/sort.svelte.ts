import { defineCapability, sharedCapabilityKey, type Capability } from '../capability';

export type SortDirection = 'asc' | 'desc';
export type SortDirectionState = SortDirection | undefined;

export interface SortState {
	field?: string | undefined;
	direction?: SortDirectionState;
	priority?: number | undefined;
}

export interface SortBacking {
	get(): SortState;
	set(state: SortState): void;
}

export interface SortModel {
	readonly field: string | undefined;
	readonly direction: SortDirectionState;
	readonly priority: number | undefined;
	isSorted(field: string): boolean;
	directionFor(field: string): SortDirectionState;
	toggle(field: string): void;
	clear(): void;
}

export interface SortModelOptions {
	cycle?: readonly SortDirectionState[];
}

export const SORT = sharedCapabilityKey<SortModel>('@svelte-atoms/cap:sort');

export function createSort(backing: SortBacking, options: SortModelOptions = {}): SortModel {
	const cycle = options.cycle ?? ['asc', 'desc', undefined];

	return {
		get field() {
			return backing.get().field;
		},
		get direction() {
			return backing.get().direction;
		},
		get priority() {
			return backing.get().priority;
		},
		isSorted(field) {
			const state = backing.get();
			return state.field === field && state.direction !== undefined;
		},
		directionFor(field) {
			return this.isSorted(field) ? backing.get().direction : undefined;
		},
		toggle(field) {
			const state = backing.get();
			const current = state.field === field ? state.direction : undefined;
			const next = nextDirection(cycle, current);
			backing.set(next ? { field, direction: next, priority: state.priority } : {});
		},
		clear() {
			backing.set({});
		}
	};
}

export interface SortProjectionOptions {
	roles?: readonly string[];
	interactive?: boolean;
}

export interface SortProjectionContext {
	field?: string | undefined;
}

export function sortCapability(
	sort: SortModel,
	options: SortProjectionOptions = {}
): Capability<SortModel> {
	const roles = options.roles ?? ['column'];
	const interactive = options.interactive ?? true;

	return defineCapability<SortModel>({
		slot: SORT,
		surface: sort,
		meta: {
			layer: 1,
			kind: 'model',
			projects: roles,
			docs: 'Sort key, direction, and priority model with scoped sortable-column projection.'
		},
		behavior: (role, ctx) => {
			if (!roles.includes(role)) return undefined;
			const field = sortField(ctx);
			return {
				attrs: () => sortAttrs(sort, field),
				handlers: () =>
					interactive && field
						? {
								onclick: () => sort.toggle(field)
							}
						: {}
			};
		}
	});
}

function nextDirection(
	cycle: readonly SortDirectionState[],
	current: SortDirectionState
): SortDirectionState {
	const index = cycle.findIndex((direction) => direction === current);
	return cycle[(index + 1) % cycle.length];
}

function sortField(ctx: unknown): string | undefined {
	if (typeof ctx === 'string') return ctx;
	if (ctx && typeof ctx === 'object' && 'field' in ctx) {
		const field = (ctx as SortProjectionContext).field;
		return typeof field === 'string' ? field : undefined;
	}
	return undefined;
}

function sortAttrs(sort: SortModel, field: string | undefined): Record<string, unknown> {
	const direction = field ? sort.directionFor(field) : undefined;
	return {
		role: 'columnheader',
		'aria-sort': direction === 'asc' ? 'ascending' : direction === 'desc' ? 'descending' : 'none',
		'data-sort': direction,
		'data-sort-field': field,
		'data-sort-priority': direction ? sort.priority : undefined
	};
}
