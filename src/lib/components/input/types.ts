import type { Base, RenderProps, SnippetProps, HtmlElementTagName } from '$ixirjs/ui/authoring';
import type { Snippet } from 'svelte';
import type { HTMLInputAttributes } from 'svelte/elements';
import type { Override, StateChangeCallback } from '$ixirjs/ui/types';
import type { ClassValue } from '$ixirjs/ui/utils';
import type { Factory } from '$ixirjs/ui/types';
import type { InputBond, InputStateProps } from './bond.svelte';
import type { PresetKey } from '$ixirjs/ui/preset';

// Input Snippet Props

export interface InputSnippetProps extends SnippetProps {
	// `Input.Root` renders `children` with `{ input }`.
	input: InputBond;
}

export type InputChildren = Snippet<[InputSnippetProps]>;

export type HourAmPmDigits = `0${number}` | `1${0 | 1 | 2}`;
export type HourDigits = `${0 | 1}${number}` | `2${0 | 1 | 2 | 3}`;
export type MinuteDigits = `${0 | 1 | 2 | 3 | 4 | 5}${number}`;
export type SecondDigits = MinuteDigits;

export type Time = `${HourAmPmDigits}:${MinuteDigits}`;
export type TimeFull = `${HourDigits}:${MinuteDigits}`;

export type InputControlType =
	| 'text'
	| 'search'
	| 'number'
	| 'email'
	| 'url'
	| 'tel'
	| 'file'
	| 'time'
	| 'datetime-local'
	| 'date'
	| 'color'
	| 'otp'
	| 'currency'
	| 'location'
	| null;

export interface InputRootProps<
	E extends HtmlElementTagName = 'div',
	B extends Base = Base
> extends RenderProps<E, B, InputChildren> {
	/** The current value of the input. Bind this prop for two-way value binding. */
	value?: string | number | string[] | null;
	/**
	 * The checked state for checkbox or radio input types.
	 * @default false
	 */
	checked?: boolean;
	/** The list of selected files for file input types. Bind to read file selections. */
	files?: File[] | null;
	// Mirrors `FieldRootProps.factory`: the bond is constructed from the input's state props.
	/** Replaces the Bond constructor, so a family can be extended or fused. */
	factory?: ((props: InputStateProps) => InputBond) | Factory<InputBond>;
}

// Derive richer input contexts from the package-wide callback contract while retaining
// type-specific parsed data that previously lived in native callback detail arguments.
export type InputStateChangeCallback<
	Value,
	Details extends object = Record<never, never>,
	E extends Event = Event
> = (
	value: Value,
	context: Parameters<StateChangeCallback<Value, InputBond, E>>[1] & Details
) => void;

export interface InputControlChangeDetails {
	value?: unknown;
	files?: File[] | undefined;
	date?: Date | null | undefined;
	number?: number | undefined;
	checked?: boolean | undefined;
}

interface InputControlBaseProps {
	/** The native input value. Parsed number/date/file state uses the dedicated props below. */
	value?: HTMLInputAttributes['value'];
	/** File list for file inputs */
	files?: File[];
	/**
	 * Date value for date inputs
	 * @default null
	 */
	date?: Date | null;
	/** Number value for number inputs */
	number?: number;
	/** Checked state for checkbox/radio inputs */
	checked?: boolean;
	/** CSS class for the input control */
	class?: ClassValue | ClassValue[];
	/** HTML input type attribute */
	type?: InputControlType | null;
	/** Children content snippet */
	children?: InputChildren;
	// Native DOM callbacks remain event-only. Parsed state is reported through semantic callbacks.
	/** Native change callback. Receives only the DOM event. */
	onchange?: (event: Event) => void;
	/** Native input callback. Receives only the DOM event. */
	oninput?: (event: Event) => void;
	/** Semantic callback for the parsed input value. */
	onvaluechange?: InputStateChangeCallback<unknown, InputControlChangeDetails>;
	/** Semantic callback for `type="number"`. */
	onnumberchange?: InputStateChangeCallback<number | undefined, InputControlChangeDetails>;
	/** Semantic callback for `type="file"`. */
	onfileschange?: InputStateChangeCallback<File[], InputControlChangeDetails>;
	/** Semantic callback for native date/time input types. */
	ondatechange?: InputStateChangeCallback<Date | null, InputControlChangeDetails>;
	/** Semantic callback for `type="checkbox"` and `type="radio"`. */
	oncheckedchange?: InputStateChangeCallback<boolean, InputControlChangeDetails>;
}

export interface InputControlProps<B extends Base = Base> extends Override<
	RenderProps<'input', B>,
	InputControlBaseProps
> {}

// Eight control prop types declared these same seven props, with the same descriptions, eight
// times over — the only thing that varied was which native attributes each control redeclares
// with a type of its own. `Omitted` names those; the rest of `HTMLInputAttributes` still flows
// through. `value` and `type` are always omitted: every control either declares its own `value`
// or has none, and every one of them fixes its element's `type`.
export type ControlPropsBase<Omitted extends keyof HTMLInputAttributes = never> = Omit<
	HTMLInputAttributes,
	'value' | 'type' | keyof CommonControlProps | Omitted
> &
	CommonControlProps;

interface CommonControlProps {
	/** Hint text shown while the field is empty. */
	placeholder?: string;
	/** Disables the control: it stops responding and is removed from the tab order. */
	disabled?: boolean;
	/** Renders the current value but blocks editing. Unlike `disabled`, it stays focusable. */
	readonly?: boolean;
	/** Additional classes, merged after the preset so they win. */
	class?: string;
	/** Preset key to resolve presentation from. Defaults to this part’s own key. */
	preset?: PresetKey;
	/** Native change event, fired when the value is committed. */
	onchange?: (event: Event) => void;
	/** Native input event, fired on every keystroke. */
	oninput?: (event: Event) => void;
}

// Number Control

export interface InputNumber12HourControlProps {
	/** Selects the 12-hour variant, where `min`/`max` take an `hh:mm` string with an am/pm segment. */
	hourFormat: 12;
	/** Lowest accepted value. Values below it are rejected. */
	min?: Time;
	/** Highest accepted value. Values above it are rejected. */
	max?: Time;
}

export interface InputNumber24HourControlProps {
	/** Selects the 24-hour variant, where `min`/`max` take a 24-hour `HH:mm` string. */
	hourFormat: 24;
	/** Lowest accepted value. Values below it are rejected. */
	min?: TimeFull;
	/** Highest accepted value. Values above it are rejected. */
	max?: TimeFull;
}

export type InputNumberControlProps = ControlPropsBase<'min' | 'max' | 'step'> &
	InputNumberControlOwnProps;

export interface InputNumberControlOwnProps {
	/** Bindable numeric value. */
	number?: number;
	/** Minimum allowed value. */
	min?: number;
	/** Maximum allowed value. */
	max?: number;
	// default 1
	/**
	 * Increment/decrement step.
	 * @default 1
	 */
	step?: number;
	/**
	 * Show/hide the increment and decrement buttons.
	 * @default true
	 */
	showControls?: boolean;
	/** Replaces the decrement button. Receives the action to call and whether the step is available. */
	decrement?: Snippet<[{ action: (event?: MouseEvent) => void; disabled: boolean }]>;
	/** Replaces the increment button. Receives the action to call and whether the step is available. */
	increment?: Snippet<[{ action: (event?: MouseEvent) => void; disabled: boolean }]>;
	/** Semantic number callback; native `oninput` and `onchange` are event-only. */
	onnumberchange?: StateChangeCallback<number | undefined, InputBond>;
}

// Time Control
export interface InputTimeControlProps extends ControlPropsBase<'min' | 'max'> {
	// HH:MM or HH:MM:SS, always 24h internally
	/** Bindable time string (HH:mm or HH:mm:ss). */
	value?: string;
	// Date to sync time with (bindable)
	/** Bindable Date object (time portion). */
	date?: Date | undefined;
	// default 24
	/**
	 * 12-hour or 24-hour format.
	 * @default 24
	 */
	hourFormat?: 12 | 24;
	// default false
	/**
	 * Show seconds segment.
	 * @default false
	 */
	withSeconds?: boolean;
	// HH:MM, e.g. "08:00"
	/** Lowest accepted value. Values below it are rejected. */
	min?: string;
	// HH:MM, e.g. "18:00"
	/** Highest accepted value. Values above it are rejected. */
	max?: string;
	/** Semantic value callback with the synchronized `date` in context. */
	onvaluechange?: InputStateChangeCallback<string, { date: Date | undefined }>;
}

export interface InputDateTimeControlProps extends ControlPropsBase {
	// YYYY-MM-DDTHH:MM or YYYY-MM-DDTHH:MM:SS
	/** Bindable datetime string. */
	value?: string;
	// bindable, derived from value
	/** Bindable Date object. */
	date?: Date | null;
	/** Renders date and time segments together rather than a date alone. */
	mode?: 'datetime';
	// default false
	/**
	 * Show seconds segment.
	 * @default false
	 */
	withSeconds?: boolean;
	/** Semantic value callback with the synchronized `date` in context. */
	onvaluechange?: InputStateChangeCallback<string, { date: Date | null }>;
}

export interface InputDateControlProps extends ControlPropsBase {
	// YYYY-MM-DD
	/** Bindable date string (YYYY-MM-DD). */
	value?: string;
	// bindable, derived from value
	/** Bindable Date object. */
	date?: Date | null;
	/** Semantic value callback with `date` in context. `ondatechange` belongs to native-type `Input.Control`. */
	onvaluechange?: InputStateChangeCallback<string, { date: Date | null }>;
}

export type InputFileControlProps = ControlPropsBase<'files' | 'accept' | 'multiple'> &
	InputFileControlOwnProps;

export interface InputFileControlOwnProps {
	// bindable
	/**
	 * Bindable selected file list.
	 * @default []
	 */
	files?: File[];
	// MIME types / extensions, e.g. "image/*,.pdf"
	/** Accepted MIME types or file extensions. */
	accept?: string;
	/**
	 * Allow multiple file selection.
	 * @default false
	 */
	multiple?: boolean;
	/**
	 * Custom trigger button content.
	 * @default built-in
	 */
	triggerContent?: Snippet<[{ files: File[]; hasFiles: boolean; open: () => void }]>;
	/** Semantic file-list callback; native `oninput` and `onchange` are event-only. */
	onfileschange?: StateChangeCallback<File[], InputBond>;
}

// Single source of truth for shared string-value text controls. Native callbacks receive only
// their DOM event; semantic value notifications use the package-wide state callback contract.
export interface TextControlPropsBase extends ControlPropsBase {
	/** Bindable text value. */
	value?: string;
	/** Semantic value callback; native `oninput` and `onchange` are event-only. */
	onvaluechange?: StateChangeCallback<string, InputBond>;
}

export type InputUrlControlProps = TextControlPropsBase;

export type InputEmailControlProps = TextControlPropsBase;

export interface InputTextControlProps extends TextControlPropsBase {
	// default 'text'; use Input.PasswordControl for the show/hide toggle
	/** Input type. */
	type?: 'text' | 'search' | 'password';
}

export interface InputPasswordControlProps extends TextControlPropsBase {
	// show/hide toggle state (bindable)
	/**
	 * Toggles password visibility.
	 * @default false
	 */
	visible?: boolean;
	// custom show/hide toggle button content
	/**
	 * Custom show/hide toggle button.
	 * @default built-in
	 */
	toggleContent?: Snippet<
		[{ visible: boolean; toggle: (event?: MouseEvent) => void; disabled: boolean }]
	>;
	/** Semantic visibility callback. Context includes the current password value. */
	onvisiblechange?: InputStateChangeCallback<boolean, { value: string }, MouseEvent>;
}

export interface InputLocationControlProps extends ControlPropsBase {
	// raw coords e.g. "40.7128, -74.0060", bindable, normalised on input/paste
	/** Bindable formatted coordinate string. */
	value?: string;
	// decimal degrees, bindable, derived from value
	/** Bindable latitude. */
	lat?: number | undefined;
	// decimal degrees, bindable, derived from value
	/** Bindable longitude. */
	lng?: number | undefined;
	// 'dd' decimal degrees (default), 'dms' degrees/minutes/seconds
	/** Decimal degrees or degrees/minutes/seconds. */
	format?: 'dd' | 'dms';
	// decimal places in 'dd' mode (default 6)
	/**
	 * Decimal places for DD format.
	 * @default 6
	 */
	precision?: number;
	/** Semantic value callback with parsed `lat` and `lng` in context. */
	onvaluechange?: InputStateChangeCallback<
		string,
		{ lat: number | undefined; lng: number | undefined }
	>;
}

// One overlay span rendered by the phone control's `span` snippet.
export type PhoneSpanType = 'country' | 'area' | 'prefix' | 'line' | 'other' | 'lit' | 'empty';
export interface PhoneSpan {
	text: string;
	class: string;
	style?: string;
	type: PhoneSpanType;
}

export interface InputPhoneControlProps extends ControlPropsBase {
	// Clean digits only (no format chars); full string in free mode
	/** Bindable phone string. */
	value?: string;
	// Input mask: `#` = required digit, `[#]` = optional digit, other chars are literals
	/** Mask pattern. # = required digit, [#] = optional. */
	format?: string;
	// Segment color map keyed by name with digit counts; must sum to total `#` in format
	/** Color map for segment highlighting. */
	segments?: Record<string, number>;
	/** Semantic value callback; native `oninput` and `onchange` are event-only. */
	onvaluechange?: StateChangeCallback<string, InputBond>;
	/** Renders each overlay span of the formatted number — its text, class and segment type. */
	span?: Snippet<[PhoneSpan]>;
}

export interface InputCurrencyControlProps extends ControlPropsBase<'min' | 'max' | 'step'> {
	// raw decimal string, bindable, e.g. "1234.50"
	/** Bindable raw numeric string. */
	value?: string;
	// parsed amount, bindable
	/** Bindable parsed numeric amount. */
	amount?: number | undefined;
	// ISO 4217, default 'USD'
	/** ISO 4217 currency code. */
	currency?: string;
	// BCP 47, default 'en-US'
	/** BCP 47 locale for formatting. */
	locale?: string;
	// default 2
	/**
	 * Decimal places.
	 * @default 2
	 */
	precision?: number;
	/** Minimum value. */
	min?: number;
	/** Maximum value. */
	max?: number;
	// arrow up/down step, defaults to 10^(-precision)
	/** Granularity the value snaps to. */
	step?: number;
	/** Semantic value callback with parsed `amount`; native callbacks are event-only. */
	onvaluechange?: InputStateChangeCallback<string, { amount: number | undefined }>;
}

// Color Control — types live in ./color/types.ts
export type { InputColorControlProps } from './color/types';

export interface InputPinControlProps extends ControlPropsBase {
	// entered characters, bindable
	/** Bindable pin string. */
	value?: string;
	// default 6
	/**
	 * Number of OTP slots.
	 * @default 6
	 */
	length?: number;
	// default 'numeric'
	/** Accepted character set. */
	type?: 'numeric' | 'alpha' | 'alphanumeric';
	// separator every N slots (e.g. 3 for "123—456")
	/** Visual grouping (gap every N slots). */
	groupSize?: number;
	/** Semantic value callback; native `oninput` and `onchange` are event-only. */
	onvaluechange?: StateChangeCallback<string, InputBond>;
	// fires when all slots are filled
	/** Fires once when all slots are filled. */
	oncomplete?: (value: string) => void;
}

/** @deprecated Renamed to `InputPinControlProps`. */
export type InputOtpControlProps = InputPinControlProps;
