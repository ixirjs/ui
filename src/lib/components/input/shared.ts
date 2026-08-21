import { Kernel } from '$ixirjs/ui/components/atom/kernel/index.svelte';
import { createPresentation } from '$ixirjs/ui/components/atom/presentation.svelte';
import type { PresetKey, PresetLike } from '$ixirjs/ui/preset';
import type { StateChangeContext } from '$ixirjs/ui/types';
import { toClassValue } from '$ixirjs/ui/utils';
import type { ClassValue } from 'svelte/elements';
import { InputBond, type InputStateProps } from './bond.svelte';

const INPUT_PART = Kernel.plan(InputBond, 'input', { class: '' });

export interface ControlOptions {
	preset: () => unknown;
	restProps?: () => Record<string, unknown>;
	class?: () => ClassValue | null | undefined;
	variantProps?: () => Record<string, unknown>;
	instance?: () => PresetLike | undefined;
	/** Semantic type for a control whose registered element is not an `<input>`. */
	type?: () => string | undefined;
}

/** Internal control seam: registration, presentation, state mutation, and callback context. */
export function useControl(options: ControlOptions) {
	const part = Kernel.node(INPUT_PART, () => ({}), { context: 'optional' });
	const bond = part.bond;
	if (options.type) part.atom.declareType(options.type);

	const klass = options.class;
	const presentation = createPresentation({
		preset: () => options.preset() as PresetKey | undefined,
		bond: () => bond,
		class: klass && (() => toClassValue(klass() ?? '', bond)),
		variantProps: options.variantProps,
		instance: options.instance,
		restProps: options.restProps ?? (() => ({}))
	});

	function context<Details extends object = Record<never, never>, E extends Event = Event>(
		event?: E,
		reason?: string,
		details?: Details
	): StateChangeContext<InputBond, E> & Details {
		return {
			...(event ? { event } : {}),
			...(bond ? { bond } : {}),
			...(reason ? { reason } : {}),
			...(details ?? ({} as Details))
		};
	}

	return {
		get attrs() {
			return { ...part.atom.spread, ...presentation.attrs };
		},
		get class() {
			return presentation.class;
		},
		get isComposed() {
			return bond !== undefined;
		},
		setValue(value: InputStateProps['value']) {
			bond?.setValue(value);
		},
		setFiles(files: File[]) {
			bond?.setFiles(files);
		},
		setChecked(checked: boolean) {
			bond?.setChecked(checked);
		},
		context,
		notify<Value, Details extends object = Record<never, never>, E extends Event = Event>(
			callback:
				| ((value: Value, context: StateChangeContext<InputBond, E> & Details) => void)
				| undefined,
			value: Value,
			event?: E,
			reason?: string,
			details?: Details
		) {
			callback?.(value, context(event, reason, details));
		}
	};
}

export type InputControlHandle = ReturnType<typeof useControl>;

/** Empty and invalid native numeric values are both represented as `undefined`, never `NaN`. */
export function toFiniteNumber(input: HTMLInputElement): number | undefined {
	if (input.value.trim() === '') return undefined;
	return Number.isNaN(input.valueAsNumber) ? undefined : input.valueAsNumber;
}

export const INPUT_FIELD_CLASS =
	'text-foreground placeholder:text-muted-foreground h-full w-full flex-1 bg-transparent px-2 leading-1 outline-none';

/**
 * The field class for controls that paint their text in an `aria-hidden` overlay behind a
 * transparent input (segmented, phone, currency). Distinct from `INPUT_FIELD_CLASS`: monospaced so
 * the overlay lines up glyph for glyph, and `caret-foreground` so the caret survives the
 * transparent text. Each control still picks its own text/placeholder colours, since when the real
 * text shows through differs — on focus, on parse, or never.
 */
export const INPUT_OVERLAY_FIELD_CLASS =
	'relative h-full w-full flex-1 bg-transparent px-2 font-mono text-sm caret-foreground outline-none';

/** Disabled affordance, applied by every control that renders its own element. */
export const INPUT_DISABLED_CLASS = 'cursor-not-allowed opacity-50';
