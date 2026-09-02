import { Kernel } from '$ixirjs/ui/kernel/kernel.svelte';
import type { PresetLike, PresetModuleName } from '$ixirjs/ui/preset';
import type { StateChangeContext } from '$ixirjs/ui/types';
import type { ClassValue } from 'svelte/elements';
import { InputContext, type InputBond, type InputStateProps } from './bond.svelte';

export interface ControlOptions {
	preset: () => unknown;
	restProps?: () => Record<string, unknown>;
	class?: () => ClassValue | null | undefined;
	variantProps?: () => Record<string, unknown>;
	instance?: () => PresetLike | undefined;
	/**
	 * The control's semantic input type, which `bond.number`/`bond.date`/the placeholder gate on. A
	 * control rendering a real `<input>` names the type it renders; the segment-based ones (time,
	 * datetime, color) render spans, so they declare theirs instead.
	 */
	type?: () => string | undefined;
	/** The control's own base class, merged once by the seam ahead of the preset's. */
	base?: string;
}

/** Internal control seam: identity, presentation, state mutation, and callback context. */
export function useControl(options: ControlOptions) {
	const bond = InputContext.get();
	if (bond && options.type) bond.declareType(options.type);

	const klass = options.class;
	const rest = options.restProps ?? (() => ({}));
	// The preset key is read once, at init, the way the seam always was; a consumer `preset` in the
	// rest props still wins per resolution.
	const el = Kernel.element(klass ? () => ({ class: klass(), ...rest() }) : rest, {
		preset: options.preset() as PresetModuleName | undefined,
		class: options.base ?? '',
		state: bond,
		...(options.variantProps && { variantProps: options.variantProps }),
		...(options.instance && { layer: options.instance }),
		// A consumer-supplied `id` (Field.Control passes its own `field-control-*`) wins over
		// `bond.controlId` in restProps merge order — which is why nothing keys a lookup on the
		// bond id; `bond.date` is told the parsed date via `setDate` instead.
		attrs: () => (bond ? { id: bond.controlId } : {})
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
		// `class` and the rest travel apart: a plain-field control hands its base class to the seam
		// via `base`, while the overlay/pin controls whose class depends on focus/composition state
		// still fold it at the tag, and the file control's hidden input keeps a literal `sr-only`.
		get attrs() {
			const { class: _class, ...attrs } = el.attrs;
			return attrs;
		},
		get class(): string {
			return el.attrs.class as string;
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
		setDate(date: Date | null) {
			bond?.declareDate(date);
		},
		context,
		/**
		 * The plain-field input handler: consumer hook first, then the bindable write, the bond
		 * write, and the semantic callback. Controls whose value is not the element's own text
		 * (number, currency, phone's mask mode) write their own.
		 */
		handleInput(
			oninput: ((event: Event) => void) | undefined,
			onvaluechange:
				| ((value: string, context: StateChangeContext<InputBond, Event>) => void)
				| undefined,
			onvalue: (value: string) => void
		) {
			return (event: Event) => {
				oninput?.(event);
				if (event.defaultPrevented) return;

				const next = (event.currentTarget as HTMLInputElement).value;
				onvalue(next);
				bond?.setValue(next);
				onvaluechange?.(next, context(event, 'input'));
			};
		},
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
	'text-foreground placeholder:text-muted-foreground h-full w-full flex-1 bg-transparent px-2 leading-1 outline-none disabled:cursor-not-allowed disabled:opacity-50';

/**
 * The field class for controls that paint their text in an `aria-hidden` overlay behind a
 * transparent input (segmented, phone, currency). Distinct from `INPUT_FIELD_CLASS`: monospaced so
 * the overlay lines up glyph for glyph, and `caret-foreground` so the caret survives the
 * transparent text. Each control still picks its own text/placeholder colours, since when the real
 * text shows through differs — on focus, on parse, or never.
 */
export const INPUT_OVERLAY_FIELD_CLASS =
	'relative h-full w-full flex-1 bg-transparent px-2 font-mono text-sm caret-foreground outline-none disabled:cursor-not-allowed disabled:opacity-50';

/** Disabled affordance, applied by every control that renders its own element. */
export const INPUT_DISABLED_CLASS = 'cursor-not-allowed opacity-50';
