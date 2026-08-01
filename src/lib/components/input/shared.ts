import {
	createPresentation,
	type PresentationView
} from '$ixirjs/ui/components/atom/presentation.svelte';
import type { ClassValue } from 'svelte/elements';
import type { PresetKey, PresetLike } from '$ixirjs/ui/preset';
import type { StateChangeContext } from '$ixirjs/ui/types';
import type { InputBond } from './bond.svelte';

// Native controls use the same resolver/fold as HtmlAtom, but keep their native element markup.
export function resolveControlPreset(
	presetKey: () => unknown,
	bond: InputBond | undefined,
	restProps: () => Record<string, unknown> = () => ({}),
	klass?: () => ClassValue | null | undefined,
	variantProps?: () => Record<string, unknown>,
	instance?: () => PresetLike | undefined
): PresentationView {
	return createPresentation({
		preset: () => presetKey() as PresetKey | undefined,
		bond: () => bond,
		class: klass,
		variantProps,
		instance,
		restProps
	});
}

export function inputChangeContext<
	Details extends object = Record<never, never>,
	E extends Event = Event
>(
	bond: InputBond | undefined,
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

// Base field styling shared by the text-like input controls (text, password, base control).
// Single source of truth for the transparent, full-size input field appearance.
export const INPUT_FIELD_CLASS =
	'text-foreground placeholder:text-muted-foreground h-full w-full flex-1 bg-transparent px-2 leading-1 outline-none';

// Single source of truth for writing a text control's value back to the input bond. Routes through
// the bond's InputModel (`bond.value.set`) — the documented general approach — rather than poking
// `bond.props.value` directly, so any coercion/notification the model adds stays centralized.
export function writeInputValue(bond: InputBond | undefined, value: string): void {
	bond?.value.set(value);
}

// Typed controls keep richer values on the bindable props surface. These helpers make the
// intentional storage shape explicit and keep direct state writes out of the controls.
export function writeInputRawValue(
	bond: InputBond | undefined,
	value: string | number | Date | undefined
): void {
	if (bond) bond.props.value = value;
}

export function writeInputNumber(bond: InputBond | undefined, value: number | undefined): void {
	writeInputRawValue(bond, value);
}

export function writeInputFiles(bond: InputBond | undefined, files: File[]): void {
	if (bond) bond.props.files = files;
}

export function writeInputChecked(bond: InputBond | undefined, checked: boolean): void {
	if (bond) bond.props.checked = checked;
}
