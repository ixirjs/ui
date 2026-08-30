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

function nextDirection(
	cycle: readonly SortDirectionState[],
	current: SortDirectionState
): SortDirectionState {
	const index = cycle.findIndex((direction) => direction === current);
	return cycle[(index + 1) % cycle.length];
}
