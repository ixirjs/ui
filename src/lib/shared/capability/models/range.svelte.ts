import { clamp } from '../../../utils/math';
import { defineCapability, sharedCapabilityKey, type Capability } from '../capability';

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

export const RANGE_VALUE = sharedCapabilityKey<RangeValueModel>('@svelte-atoms/cap:range-value');

export function createRangeValue(backing: RangeValueBacking): RangeValueModel {
	return {
		get value() {
			return backing.value();
		},
		get min() {
			return backing.min?.() ?? 0;
		},
		get max() {
			return backing.max?.() ?? 100;
		},
		get step() {
			return backing.step?.() ?? 1;
		},
		get percent() {
			return rangePercent(backing.value(), backing.min?.() ?? 0, backing.max?.() ?? 100);
		},
		get isAtMin() {
			return backing.value() <= (backing.min?.() ?? 0);
		},
		get isAtMax() {
			return backing.value() >= (backing.max?.() ?? 100);
		},
		get isDisabled() {
			return backing.disabled?.() ?? false;
		},
		get isReadonly() {
			return backing.readonly?.() ?? false;
		},
		set(value) {
			if (backing.disabled?.() || backing.readonly?.()) return;
			backing.set?.(clamp(value, backing.min?.() ?? 0, backing.max?.() ?? 100));
		},
		increment(amount = backing.step?.() ?? 1) {
			this.set(backing.value() + amount);
		},
		decrement(amount = backing.step?.() ?? 1) {
			this.set(backing.value() - amount);
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
			layer: 1,
			kind: 'model',
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

function rangePercent(value: number, min: number, max: number): number {
	const span = max - min;
	if (span <= 0) return value >= max ? 100 : 0;
	return clamp(((value - min) / span) * 100, 0, 100);
}

function handleRangeKey(event: KeyboardEvent, range: RangeValueModel): void {
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
