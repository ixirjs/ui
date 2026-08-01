import type { Base, HtmlAtomProps, SnippetProps } from '../atom';
import type { Snippet } from 'svelte';
import type { Override } from '$svelte-atoms/core/types';
import type { ClassValue } from '$svelte-atoms/core/utils';
import type { InputBond } from './bond.svelte';

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
}

// Detail payload forwarded as the 2nd arg of `Input.Control`'s change/input handlers — a snapshot
// of the parsed bindable values plus the originating DOM event.
export interface InputControlDetail {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	value?: any;
	// `| undefined` (not just `?:`): these snapshot the bindable values, which are present-but-undefined.
	files?: File[] | undefined;
	date?: Date | null | undefined;
	number?: number | undefined;
	checked?: boolean | undefined;
	event?: Event;
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
	// Declared here (the Override's `U` side) so they win over the native `<input>` handlers that
	// `Override`'s Omit would otherwise collapse to `{}` via HtmlAtomProps' index signature.
	onchange?: (event: Event, detail?: InputControlDetail) => void;
	oninput?: (event: Event, detail?: InputControlDetail) => void;
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
	preset?: string;
	showControls?: boolean;
	decrement?: Snippet<[{ action: () => void; disabled: boolean }]>;
	increment?: Snippet<[{ action: () => void; disabled: boolean }]>;
	onchange?: (ev?: Event, options?: { number: number }) => void;
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
	preset?: string;
	onchange?: (ev: Event, options: { value: string }) => void;
	oninput?: (ev: Event, options: { value: string }) => void;
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
	preset?: string;
	onchange?: (ev: Event, options: { value: string; date: Date | null }) => void;
	oninput?: (ev: Event, options: { value: string; date: Date | null }) => void;
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
	preset?: string;
	onchange?: (ev: Event, options: { value: string; date: Date | null }) => void;
	oninput?: (ev: Event, options: { value: string; date: Date | null }) => void;
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
	preset?: string;
	triggerContent?: Snippet<[{ files: File[]; hasFiles: boolean; open: () => void }]>;
	onchange?: (ev: Event, options: { files: File[] }) => void;
}

// Single source of truth for the shared string-value text-control prop shape: the bindable
// string `value`, the standard field flags, and the `{ value }` change/input handlers. The
// plain string controls (url/email/text/password) extend this; controls with a richer detail
// payload (currency, location, …) stay bespoke.
export interface TextControlPropsBase {
	value?: string;
	placeholder?: string;
	disabled?: boolean;
	readonly?: boolean;
	class?: string;
	preset?: string;
	onchange?: (ev: Event, options: { value: string }) => void;
	oninput?: (ev: Event, options: { value: string }) => void;
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
	toggleContent?: Snippet<[{ visible: boolean; toggle: () => void; disabled: boolean }]>;
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
	// crosshair "locate me" button via navigator.geolocation (default true)
	locate?: boolean;
	placeholder?: string;
	disabled?: boolean;
	readonly?: boolean;
	class?: string;
	preset?: string;
	onchange?: (
		ev: Event,
		options: { lat: number | undefined; lng: number | undefined; value: string }
	) => void;
	oninput?: (
		ev: Event,
		options: { lat: number | undefined; lng: number | undefined; value: string }
	) => void;
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
	preset?: string;
	onchange?: (ev: Event, options: { value: string }) => void;
	oninput?: (ev: Event, options: { value: string }) => void;
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
	preset?: string;
	onchange?: (ev: Event, options: { value: string; amount: number | undefined }) => void;
	oninput?: (ev: Event, options: { value: string; amount: number | undefined }) => void;
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
	preset?: string;
	onchange?: (ev: Event, options: { value: string }) => void;
	oninput?: (ev: Event, options: { value: string }) => void;
	// fires when all slots are filled
	oncomplete?: (value: string) => void;
}
