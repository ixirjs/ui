import type { Base, HtmlAtomProps, SnippetProps } from '$ixirjs/ui/components/atom';
import type { Snippet } from 'svelte';
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
	E extends keyof HTMLElementTagNameMap = 'div',
	B extends Base = Base
> extends HtmlAtomProps<E, B, InputChildren> {
	value?: string | number | string[] | null;
	checked?: boolean;
	files?: File[] | null;
	// Mirrors `FieldRootProps.factory`: the bond is constructed from the input's state props.
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
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	value?: any;
	files?: File[];
	date?: Date | null;
	number?: number;
	checked?: boolean;
	class?: ClassValue | ClassValue[];
	type?: InputControlType | null;
	children?: InputChildren;
	// Native DOM callbacks remain event-only. Parsed state is reported through semantic callbacks.
	onchange?: (event: Event) => void;
	oninput?: (event: Event) => void;
	onvaluechange?: InputStateChangeCallback<unknown, InputControlChangeDetails>;
	onnumberchange?: InputStateChangeCallback<number | undefined, InputControlChangeDetails>;
	onfileschange?: InputStateChangeCallback<File[], InputControlChangeDetails>;
	ondatechange?: InputStateChangeCallback<Date | null, InputControlChangeDetails>;
	oncheckedchange?: InputStateChangeCallback<boolean, InputControlChangeDetails>;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface InputControlProps<B extends Base = Base> extends Override<
	HtmlAtomProps<'input', B>,
	InputControlBaseProps
> {}

// Number Control

export interface InputNumber12HourControlProps {
	hourFormat: 12;
	min?: Time;
	max?: Time;
}

export interface InputNumber24HourControlProps {
	hourFormat: 24;
	min?: TimeFull;
	max?: TimeFull;
}

export interface InputNumberControlProps {
	number?: number;
	min?: number;
	max?: number;
	// default 1
	step?: number;
	disabled?: boolean;
	placeholder?: string;
	preset?: PresetKey;
	showControls?: boolean;
	decrement?: Snippet<[{ action: (event?: MouseEvent) => void; disabled: boolean }]>;
	increment?: Snippet<[{ action: (event?: MouseEvent) => void; disabled: boolean }]>;
	onchange?: (event: Event) => void;
	oninput?: (event: Event) => void;
	onnumberchange?: StateChangeCallback<number | undefined, InputBond>;
}

// Time Control
export interface InputTimeControlProps {
	// HH:MM or HH:MM:SS, always 24h internally
	value?: string;
	// Date to sync time with (bindable)
	date?: Date | undefined;
	// default 24
	hourFormat?: 12 | 24;
	// default false
	withSeconds?: boolean;
	// HH:MM, e.g. "08:00"
	min?: string;
	// HH:MM, e.g. "18:00"
	max?: string;
	disabled?: boolean;
	readonly?: boolean;
	class?: string;
	preset?: PresetKey;
	onchange?: (event: Event) => void;
	oninput?: (event: Event) => void;
	onvaluechange?: InputStateChangeCallback<string, { date: Date | undefined }>;
}

export interface InputDateTimeControlProps {
	// YYYY-MM-DDTHH:MM or YYYY-MM-DDTHH:MM:SS
	value?: string;
	// bindable, derived from value
	date?: Date | null;
	// 'datetime' shows date + time segments
	mode?: 'datetime';
	// default false
	withSeconds?: boolean;
	disabled?: boolean;
	readonly?: boolean;
	class?: string;
	preset?: PresetKey;
	onchange?: (event: Event) => void;
	oninput?: (event: Event) => void;
	onvaluechange?: InputStateChangeCallback<string, { date: Date | null }>;
}

export interface InputDateControlProps {
	// YYYY-MM-DD
	value?: string;
	// bindable, derived from value
	date?: Date | null;
	// 'date' selects date-only mode
	mode: 'date';
	// ignored in date mode, kept for API compatibility
	withSeconds?: boolean;
	disabled?: boolean;
	readonly?: boolean;
	class?: string;
	preset?: PresetKey;
	onchange?: (event: Event) => void;
	oninput?: (event: Event) => void;
	onvaluechange?: InputStateChangeCallback<string, { date: Date | null }>;
}

export interface InputFileControlProps {
	// bindable
	files?: File[];
	// MIME types / extensions, e.g. "image/*,.pdf"
	accept?: string;
	multiple?: boolean;
	disabled?: boolean;
	placeholder?: string;
	class?: string;
	preset?: PresetKey;
	triggerContent?: Snippet<[{ files: File[]; hasFiles: boolean; open: () => void }]>;
	onchange?: (event: Event) => void;
	oninput?: (event: Event) => void;
	onfileschange?: StateChangeCallback<File[], InputBond>;
}

// Single source of truth for shared string-value text controls. Native callbacks receive only
// their DOM event; semantic value notifications use the package-wide state callback contract.
export interface TextControlPropsBase {
	value?: string;
	placeholder?: string;
	disabled?: boolean;
	readonly?: boolean;
	class?: string;
	preset?: PresetKey;
	onchange?: (event: Event) => void;
	oninput?: (event: Event) => void;
	onvaluechange?: StateChangeCallback<string, InputBond>;
}

export type InputUrlControlProps = TextControlPropsBase;

export type InputEmailControlProps = TextControlPropsBase;

export interface InputTextControlProps extends TextControlPropsBase {
	// default 'text'; use Input.PasswordControl for the show/hide toggle
	type?: 'text' | 'search' | 'password';
}

export interface InputPasswordControlProps extends TextControlPropsBase {
	// show/hide toggle state (bindable)
	visible?: boolean;
	// custom show/hide toggle button content
	toggleContent?: Snippet<
		[{ visible: boolean; toggle: (event?: MouseEvent) => void; disabled: boolean }]
	>;
	onvisiblechange?: InputStateChangeCallback<boolean, { value: string }, MouseEvent>;
}

export interface InputLocationControlProps {
	// raw coords e.g. "40.7128, -74.0060", bindable, normalised on input/paste
	value?: string;
	// decimal degrees, bindable, derived from value
	lat?: number | undefined;
	// decimal degrees, bindable, derived from value
	lng?: number | undefined;
	// 'dd' decimal degrees (default), 'dms' degrees/minutes/seconds
	format?: 'dd' | 'dms';
	// decimal places in 'dd' mode (default 6)
	precision?: number;
	placeholder?: string;
	disabled?: boolean;
	readonly?: boolean;
	class?: string;
	preset?: PresetKey;
	onchange?: (event: Event) => void;
	oninput?: (event: Event) => void;
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

export interface InputPhoneControlProps {
	// Clean digits only (no format chars); full string in free mode
	value?: string;
	// Input mask: `#` = required digit, `[#]` = optional digit, other chars are literals
	format?: string;
	// Segment color map keyed by name with digit counts; must sum to total `#` in format
	segments?: Record<string, number>;
	placeholder?: string;
	disabled?: boolean;
	readonly?: boolean;
	class?: string;
	preset?: PresetKey;
	onchange?: (event: Event) => void;
	oninput?: (event: Event) => void;
	onvaluechange?: StateChangeCallback<string, InputBond>;
	// renders each overlay span (text, class, type)
	span?: Snippet<[PhoneSpan]>;
}

export interface InputCurrencyControlProps {
	// raw decimal string, bindable, e.g. "1234.50"
	value?: string;
	// parsed amount, bindable
	amount?: number | undefined;
	// ISO 4217, default 'USD'
	currency?: string;
	// BCP 47, default 'en-US'
	locale?: string;
	// default 2
	precision?: number;
	min?: number;
	max?: number;
	// arrow up/down step, defaults to 10^(-precision)
	step?: number;
	placeholder?: string;
	disabled?: boolean;
	readonly?: boolean;
	class?: string;
	preset?: PresetKey;
	onchange?: (event: Event) => void;
	oninput?: (event: Event) => void;
	onvaluechange?: InputStateChangeCallback<string, { amount: number | undefined }>;
}

// Color Control — types live in ./color/types.ts
export type { InputColorControlProps } from './color/types';

export interface InputOtpControlProps {
	// entered characters, bindable
	value?: string;
	// default 6
	length?: number;
	// default 'numeric'
	type?: 'numeric' | 'alpha' | 'alphanumeric';
	// separator every N slots (e.g. 3 for "123—456")
	groupSize?: number;
	// empty-slot placeholder char (default '·')
	placeholder?: string;
	disabled?: boolean;
	readonly?: boolean;
	class?: string;
	preset?: PresetKey;
	onchange?: (event: Event) => void;
	oninput?: (event: Event) => void;
	onvaluechange?: StateChangeCallback<string, InputBond>;
	// fires when all slots are filled
	oncomplete?: (value: string) => void;
}
