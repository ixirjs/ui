import { clamp } from '$ixirjs/ui/utils/math';
import {
	defineCapability,
	sharedCapabilityKey,
	type Capability
} from '$ixirjs/ui/shared/capability/capability';

export interface ProgressValueBacking {
	value(): number | null | undefined;
	min?: () => number | undefined;
	max?: () => number | undefined;
}

export interface ProgressValueModel {
	readonly value: number | null;
	readonly min: number;
	readonly max: number;
	readonly percent: number | null;
	readonly isIndeterminate: boolean;
	readonly isCompleted: boolean;
}

export const PROGRESS_VALUE = sharedCapabilityKey<ProgressValueModel>({
	owner: '@ixirjs/cap',
	name: 'progress-value',
	version: 1
});

export function createProgressValue(backing: ProgressValueBacking): ProgressValueModel {
	const bounds = (): readonly [number, number] => normalizeBounds(backing.min?.(), backing.max?.());
	return {
		get value() {
			const [min, max] = bounds();
			return normalizeValue(backing.value(), min, max);
		},
		get min() {
			return bounds()[0];
		},
		get max() {
			return bounds()[1];
		},
		get percent() {
			const value = this.value;
			return value === null ? null : progressPercent(value, this.min, this.max);
		},
		get isIndeterminate() {
			return this.value === null;
		},
		get isCompleted() {
			return this.percent === 100;
		}
	};
}

export interface ProgressValueProjectionOptions {
	roles?: readonly string[];
	valueText?: (model: ProgressValueModel) => string | undefined;
}

export function progressValueCapability(
	progress: ProgressValueModel,
	options: ProgressValueProjectionOptions = {}
): Capability<ProgressValueModel> {
	const roles = options.roles ?? ['progressbar'];
	const valueText = options.valueText ?? defaultValueText;

	return defineCapability<ProgressValueModel>({
		slot: PROGRESS_VALUE,
		surface: progress,
		meta: {
			projects: roles,
			docs: 'Progress value model and scoped progressbar projection.'
		},
		behavior: (role) =>
			roles.includes(role)
				? {
						attrs: () => progressAttrs(progress, valueText)
					}
				: undefined
	});
}

function normalizeValue(value: number | null | undefined, min: number, max: number): number | null {
	return value === null || value === undefined || !Number.isFinite(value)
		? null
		: clamp(value, min, max);
}

function normalizeBounds(
	min: number | undefined,
	max: number | undefined
): readonly [number, number] {
	const lower = typeof min === 'number' && Number.isFinite(min) ? min : 0;
	const upper = typeof max === 'number' && Number.isFinite(max) ? max : 100;
	return lower <= upper ? [lower, upper] : [upper, lower];
}

function progressPercent(value: number, min: number, max: number): number {
	const span = max - min;
	if (span <= 0) return value >= max ? 100 : 0;
	return clamp(((value - min) / span) * 100, 0, 100);
}

function defaultValueText(progress: ProgressValueModel): string | undefined {
	return progress.percent === null ? undefined : `${Math.round(progress.percent)}%`;
}

function progressAttrs(
	progress: ProgressValueModel,
	valueText: (model: ProgressValueModel) => string | undefined
): Record<string, unknown> {
	const indeterminate = progress.isIndeterminate;
	return {
		role: 'progressbar',
		'aria-valuemin': progress.min,
		'aria-valuemax': progress.max,
		'aria-valuenow': indeterminate ? undefined : progress.value,
		'aria-valuetext': indeterminate ? undefined : valueText(progress),
		'data-indeterminate': indeterminate ? '' : undefined,
		'data-value': indeterminate ? undefined : progress.value,
		'data-min': progress.min,
		'data-max': progress.max,
		'data-percent': indeterminate ? undefined : progress.percent,
		'data-completed': progress.isCompleted ? '' : undefined
	};
}
