import { defineCapability, sharedCapabilityKey, type Capability } from '../capability';

export interface DateSelectionState {
	value?: Date | null | undefined;
	start?: Date | null | undefined;
	end?: Date | null | undefined;
	visibleMonth?: Date | null | undefined;
}

export interface DateSelectionBacking {
	get(): DateSelectionState;
	set(state: DateSelectionState): void;
}

export interface DateSelectionModel {
	readonly value: Date | null;
	readonly start: Date | null;
	readonly end: Date | null;
	readonly visibleMonth: Date | null;
	readonly isRange: boolean;
	select(date: Date): void;
	selectRange(start: Date | null, end: Date | null): void;
	setVisibleMonth(month: Date | null): void;
	clear(): void;
}

export const DATE_SELECTION = sharedCapabilityKey<DateSelectionModel>(
	'@svelte-atoms/cap:date-selection'
);

export function createDateSelection(backing: DateSelectionBacking): DateSelectionModel {
	return {
		get value() {
			return backing.get().value ?? null;
		},
		get start() {
			return backing.get().start ?? null;
		},
		get end() {
			return backing.get().end ?? null;
		},
		get visibleMonth() {
			return backing.get().visibleMonth ?? null;
		},
		get isRange() {
			const state = backing.get();
			return state.start !== undefined || state.end !== undefined;
		},
		select(date) {
			backing.set({ ...backing.get(), value: date, start: null, end: null });
		},
		selectRange(start, end) {
			backing.set({ ...backing.get(), value: null, start, end });
		},
		setVisibleMonth(month) {
			backing.set({ ...backing.get(), visibleMonth: month });
		},
		clear() {
			backing.set({ visibleMonth: backing.get().visibleMonth ?? null });
		}
	};
}

export interface DateSelectionProjectionOptions {
	roles?: readonly string[];
}

export function dateSelectionCapability(
	selection: DateSelectionModel,
	options: DateSelectionProjectionOptions = {}
): Capability<DateSelectionModel> {
	const roles = options.roles ?? ['control'];

	return defineCapability<DateSelectionModel>({
		slot: DATE_SELECTION,
		surface: selection,
		meta: {
			layer: 1,
			kind: 'model',
			projects: roles,
			docs: 'Single date, date range, and visible month selection model.'
		},
		behavior: (role) =>
			roles.includes(role)
				? {
						attrs: () => ({
							'data-date': dateAttr(selection.value),
							'data-range': selection.isRange ? '' : undefined,
							'data-range-start': dateAttr(selection.start),
							'data-range-end': dateAttr(selection.end),
							'data-visible-month': monthAttr(selection.visibleMonth)
						})
					}
				: undefined
	});
}

function dateAttr(date: Date | null): string | undefined {
	return date ? date.toISOString().slice(0, 10) : undefined;
}

function monthAttr(date: Date | null): string | undefined {
	return date ? date.toISOString().slice(0, 7) : undefined;
}
