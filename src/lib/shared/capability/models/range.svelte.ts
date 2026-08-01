import { clamp } from '$ixirjs/ui/utils/math';
import {
	defineCapability,
	sharedCapabilityKey,
	type Capability
} from '$ixirjs/ui/shared/capability/capability';

export interface RangeValueBacking {
	value(): number;
	set?(value: number): void;
	min?: () => number | undefined;
	max?: () => number | undefined;
	step?: () => number | undefined;
	disabled?: () => boolean;
	readonly?: () => boolean;
}

export interface RangeValueModel {
	readonly value: number;
	readonly min: number;
	readonly max: number;
	readonly step: number;
	readonly percent: number;
	readonly isAtMin: boolean;
	readonly isAtMax: boolean;
	readonly isDisabled: boolean;
	readonly isReadonly: boolean;
	set(value: number): void;
	increment(amount?: number): void;
	decrement(amount?: number): void;
}

export const RANGE_VALUE = sharedCapabilityKey<RangeValueModel>({
	owner: '@ixirjs/cap',
	name: 'range-value',
	version: 1
});

export function createRangeValue(backing: RangeValueBacking): RangeValueModel {
	const bounds = (): readonly [number, number] => normalizeBounds(backing.min?.(), backing.max?.());
	const value = (): number => {
		const [min, max] = bounds();
		const current = backing.value();
		return clamp(Number.isFinite(current) ? current : min, min, max);
	};
	const step = (): number => normalizeStep(backing.step?.());

	return {
		get value() {
			return value();
		},
		get min() {
			return bounds()[0];
		},
		get max() {
			return bounds()[1];
		},
		get step() {
			return step();
		},
		get percent() {
			return rangePercent(value(), this.min, this.max);
		},
		get isAtMin() {
			return value() <= this.min;
		},
		get isAtMax() {
			return value() >= this.max;
		},
		get isDisabled() {
			return backing.disabled?.() ?? false;
		},
		get isReadonly() {
			return backing.readonly?.() ?? false;
		},
		set(next) {
			if (backing.disabled?.() || backing.readonly?.()) return;
			const [min, max] = bounds();
			backing.set?.(clamp(Number.isFinite(next) ? next : min, min, max));
		},
		increment(amount = step()) {
			this.set(value() + amount);
		},
		decrement(amount = step()) {
			this.set(value() - amount);
		}
	};
}

export interface RangeValueProjectionOptions {
	roles?: readonly string[];
	valueText?: (model: RangeValueModel) => string | undefined;
}

export function rangeValueCapability(
	range: RangeValueModel,
	options: RangeValueProjectionOptions = {}
): Capability<RangeValueModel> {
	const roles = options.roles ?? ['control'];
	const valueText = options.valueText ?? ((model) => `${model.value}`);

	return defineCapability<RangeValueModel>({
		slot: RANGE_VALUE,
		surface: range,
		meta: {
			projects: roles,
			docs: 'Range value, bounds, step, and percent model with slider-style projection.'
		},
		behavior: (role) =>
			roles.includes(role)
				? {
						attrs: () => ({
							role: 'slider',
							'aria-valuemin': range.min,
							'aria-valuemax': range.max,
							'aria-valuenow': range.value,
							'aria-valuetext': valueText(range),
							tabindex: range.isDisabled ? -1 : 0,
							'aria-disabled': range.isDisabled ? 'true' : undefined,
							'aria-readonly': range.isReadonly ? 'true' : undefined,
							'data-value': range.value,
							'data-min': range.min,
							'data-max': range.max,
							'data-step': range.step,
							'data-percent': range.percent,
							'data-at-min': range.isAtMin ? '' : undefined,
							'data-at-max': range.isAtMax ? '' : undefined
						}),
						handlers: () => ({
							onkeydown: (event: KeyboardEvent) => handleRangeKey(event, range)
						})
					}
				: undefined
	});
}

function normalizeBounds(
	min: number | undefined,
	max: number | undefined
): readonly [number, number] {
	const lower = typeof min === 'number' && Number.isFinite(min) ? min : 0;
	const upper = typeof max === 'number' && Number.isFinite(max) ? max : 100;
	return lower <= upper ? [lower, upper] : [upper, lower];
}

function normalizeStep(step: number | undefined): number {
	return typeof step === 'number' && Number.isFinite(step) && step > 0 ? step : 1;
}

function rangePercent(value: number, min: number, max: number): number {
	const span = max - min;
	if (span <= 0) return value >= max ? 100 : 0;
	return clamp(((value - min) / span) * 100, 0, 100);
}

function handleRangeKey(event: KeyboardEvent, range: RangeValueModel): void {
	if (range.isDisabled || range.isReadonly) return;

	switch (event.key) {
		case 'ArrowRight':
		case 'ArrowUp':
			event.preventDefault();
			range.increment();
			break;
		case 'ArrowLeft':
		case 'ArrowDown':
			event.preventDefault();
			range.decrement();
			break;
		case 'Home':
			event.preventDefault();
			range.set(range.min);
			break;
		case 'End':
			event.preventDefault();
			range.set(range.max);
			break;
	}
}
