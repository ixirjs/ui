export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const inputRootProps: PropDefinition[] = [
	{
		name: 'value',
		type: 'string | number | string[] | null | undefined',
		default: "''",
		description: 'The current value of the input. Bind this prop for two-way value binding.'
	},
	{
		name: 'checked',
		type: 'boolean | undefined',
		default: 'false',
		description: 'The checked state for checkbox or radio input types.'
	},
	{
		name: 'files',
		type: 'File[] | null | undefined',
		default: 'undefined',
		description: 'The list of selected files for file input types. Bind to read file selections.'
	},
	{
		name: 'children',
		type: 'Snippet<[]> | undefined',
		default: 'undefined',
		description:
			'Slot for composing Input.Control, Input.Icon, and Input.Placeholder sub-components inside the input root.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];

export const inputControlProps: PropDefinition[] = [
	{
		name: 'type',
		type: 'string | undefined',
		default: "'text'",
		description: 'HTML input type (text, email, password, number, search, url, tel, etc.).'
	},
	{
		name: 'placeholder',
		type: 'string | undefined',
		default: 'undefined',
		description:
			'Native placeholder text shown when the input is empty (alternative to Input.Placeholder).'
	},
	{
		name: 'disabled',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Disables the input control, preventing user interaction.'
	},
	{
		name: 'readonly',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Makes the input read-only, allowing focus but not editing.'
	},
	{
		name: 'oninput',
		type: '((event: Event) => void) | undefined',
		default: 'undefined',
		description: 'Native input callback. Receives only the DOM event.'
	},
	{
		name: 'onchange',
		type: '((event: Event) => void) | undefined',
		default: 'undefined',
		description: 'Native change callback. Receives only the DOM event.'
	},
	{
		name: 'onvaluechange',
		type: 'InputStateChangeCallback<unknown, InputControlChangeDetails> | undefined',
		default: 'undefined',
		description: 'Semantic callback for the parsed input value.'
	},
	{
		name: 'onnumberchange',
		type: 'InputStateChangeCallback<number | undefined, InputControlChangeDetails> | undefined',
		default: 'undefined',
		description: 'Semantic callback for `type="number"`.'
	},
	{
		name: 'onfileschange',
		type: 'InputStateChangeCallback<File[], InputControlChangeDetails> | undefined',
		default: 'undefined',
		description: 'Semantic callback for `type="file"`.'
	},
	{
		name: 'ondatechange',
		type: 'InputStateChangeCallback<Date | null, InputControlChangeDetails> | undefined',
		default: 'undefined',
		description: 'Semantic callback for native date/time input types.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML input element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];

export const commonControlProps: PropDefinition[] = [
	{ name: 'value', type: 'string', default: "''", description: 'Bindable string value.' },
	{ name: 'placeholder', type: 'string', default: "''", description: 'Placeholder text.' },
	{ name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the control.' },
	{
		name: 'readonly',
		type: 'boolean',
		default: 'false',
		description: 'Makes the control read-only.'
	},
	{ name: 'class', type: 'string', default: "''", description: 'Additional CSS classes.' },
	{ name: 'preset', type: 'string', default: 'per-type', description: 'Override the preset key.' },
	{
		name: 'oninput',
		type: '((event: Event) => void) | undefined',
		default: 'undefined',
		description: 'Native input callback. Receives only the DOM event.'
	},
	{
		name: 'onchange',
		type: '((event: Event) => void) | undefined',
		default: 'undefined',
		description: 'Native change callback. Receives only the DOM event.'
	},
	{
		name: 'onvaluechange',
		type: 'StateChangeCallback<string, InputBond> | undefined',
		default: 'undefined',
		description:
			'Semantic callback fired after a string value commits. Receives `(value, context)`.'
	}
];

export const textControlProps: PropDefinition[] = [
	{ name: 'value', type: 'string', default: "''", description: 'Bindable text value.' },
	{ name: 'type', type: "'text' | 'search'", default: "'text'", description: 'Input type.' },
	{ name: 'placeholder', type: 'string', default: "''", description: 'Placeholder text.' },
	{ name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the control.' },
	{
		name: 'readonly',
		type: 'boolean',
		default: 'false',
		description: 'Makes the control read-only.'
	},
	{
		name: 'onvaluechange',
		type: 'StateChangeCallback<string, InputBond> | undefined',
		default: 'undefined',
		description: 'Semantic value callback; native `oninput` and `onchange` are event-only.'
	}
];

export const passwordControlProps: PropDefinition[] = [
	{ name: 'value', type: 'string', default: "''", description: 'Bindable password value.' },
	{ name: 'placeholder', type: 'string', default: "''", description: 'Placeholder text.' },
	{
		name: 'visible',
		type: 'boolean',
		default: 'false',
		description: 'Toggles password visibility.'
	},
	{ name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the control.' },
	{
		name: 'toggleContent',
		type: 'Snippet',
		default: 'built-in',
		description: 'Custom show/hide toggle button.'
	},
	{
		name: 'onvaluechange',
		type: 'StateChangeCallback<string, InputBond> | undefined',
		default: 'undefined',
		description: 'Semantic password value callback.'
	},
	{
		name: 'onvisiblechange',
		type: 'InputStateChangeCallback<boolean, { value: string }, MouseEvent> | undefined',
		default: 'undefined',
		description: 'Semantic visibility callback. Context includes the current password value.'
	}
];

export const emailControlProps: PropDefinition[] = [
	{ name: 'value', type: 'string', default: "''", description: 'Bindable email string.' },
	{ name: 'placeholder', type: 'string', default: "''", description: 'Placeholder text.' },
	{ name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the control.' },
	{
		name: 'readonly',
		type: 'boolean',
		default: 'false',
		description: 'Makes the control read-only.'
	},
	{
		name: 'onvaluechange',
		type: 'StateChangeCallback<string, InputBond> | undefined',
		default: 'undefined',
		description: 'Semantic value callback; native `oninput` and `onchange` are event-only.'
	}
];

export const urlControlProps: PropDefinition[] = [
	{ name: 'value', type: 'string', default: "''", description: 'Bindable URL string.' },
	{ name: 'placeholder', type: 'string', default: "''", description: 'Placeholder text.' },
	{ name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the control.' },
	{
		name: 'readonly',
		type: 'boolean',
		default: 'false',
		description: 'Makes the control read-only.'
	},
	{
		name: 'onvaluechange',
		type: 'StateChangeCallback<string, InputBond> | undefined',
		default: 'undefined',
		description: 'Semantic value callback; native `oninput` and `onchange` are event-only.'
	}
];

export const phoneControlProps: PropDefinition[] = [
	{ name: 'value', type: 'string', default: "''", description: 'Bindable phone string.' },
	{
		name: 'format',
		type: 'string',
		default: "'+# (###) ###-####'",
		description: 'Mask pattern. # = required digit, [#] = optional.'
	},
	{
		name: 'segments',
		type: 'PhoneSegmentMap',
		default: 'undefined',
		description: 'Color map for segment highlighting.'
	},
	{ name: 'disabled', type: 'boolean', default: 'false', description: 'Disables the control.' },
	{
		name: 'onvaluechange',
		type: 'StateChangeCallback<string, InputBond> | undefined',
		default: 'undefined',
		description: 'Semantic value callback; native `oninput` and `onchange` are event-only.'
	}
];

export const numberControlProps: PropDefinition[] = [
	{ name: 'number', type: 'number', default: 'undefined', description: 'Bindable numeric value.' },
	{ name: 'step', type: 'number', default: '1', description: 'Increment/decrement step.' },
	{ name: 'min', type: 'number', default: 'undefined', description: 'Minimum allowed value.' },
	{ name: 'max', type: 'number', default: 'undefined', description: 'Maximum allowed value.' },
	{
		name: 'buttons',
		type: 'boolean',
		default: 'true',
		description: 'Show/hide increment buttons.'
	},
	{
		name: 'onnumberchange',
		type: 'StateChangeCallback<number | undefined, InputBond> | undefined',
		default: 'undefined',
		description: 'Semantic number callback; native `oninput` and `onchange` are event-only.'
	}
];

export const currencyControlProps: PropDefinition[] = [
	{ name: 'value', type: 'string', default: "''", description: 'Bindable raw numeric string.' },
	{
		name: 'amount',
		type: 'number',
		default: 'undefined',
		description: 'Bindable parsed numeric amount.'
	},
	{ name: 'currency', type: 'string', default: "'USD'", description: 'ISO 4217 currency code.' },
	{
		name: 'locale',
		type: 'string',
		default: "'en-US'",
		description: 'BCP 47 locale for formatting.'
	},
	{ name: 'precision', type: 'number', default: '2', description: 'Decimal places.' },
	{ name: 'min', type: 'number', default: 'undefined', description: 'Minimum value.' },
	{ name: 'max', type: 'number', default: 'undefined', description: 'Maximum value.' },
	{
		name: 'onvaluechange',
		type: 'InputStateChangeCallback<string, { amount: number | undefined }> | undefined',
		default: 'undefined',
		description: 'Semantic value callback with parsed `amount`; native callbacks are event-only.'
	}
];

export const timeControlProps: PropDefinition[] = [
	{
		name: 'value',
		type: 'string',
		default: "''",
		description: 'Bindable time string (HH:mm or HH:mm:ss).'
	},
	{
		name: 'date',
		type: 'Date',
		default: 'undefined',
		description: 'Bindable Date object (time portion).'
	},
	{ name: 'hourFormat', type: '12 | 24', default: '24', description: '12-hour or 24-hour format.' },
	{ name: 'withSeconds', type: 'boolean', default: 'false', description: 'Show seconds segment.' },
	{
		name: 'onvaluechange',
		type: 'InputStateChangeCallback<string, { date: Date | undefined }> | undefined',
		default: 'undefined',
		description: 'Semantic value callback with the synchronized `date` in context.'
	}
];

export const dateControlProps: PropDefinition[] = [
	{
		name: 'value',
		type: 'string',
		default: "''",
		description: 'Bindable date string (YYYY-MM-DD).'
	},
	{ name: 'date', type: 'Date', default: 'undefined', description: 'Bindable Date object.' },
	{
		name: 'onvaluechange',
		type: 'InputStateChangeCallback<string, { date: Date | null }> | undefined',
		default: 'undefined',
		description:
			'Semantic value callback with `date` in context. `ondatechange` belongs to native-type `Input.Control`.'
	}
];

export const dateTimeControlProps: PropDefinition[] = [
	{ name: 'value', type: 'string', default: "''", description: 'Bindable datetime string.' },
	{ name: 'date', type: 'Date', default: 'undefined', description: 'Bindable Date object.' },
	{ name: 'hourFormat', type: '12 | 24', default: '24', description: '12-hour or 24-hour format.' },
	{ name: 'withSeconds', type: 'boolean', default: 'false', description: 'Show seconds segment.' },
	{
		name: 'onvaluechange',
		type: 'InputStateChangeCallback<string, { date: Date | null }> | undefined',
		default: 'undefined',
		description: 'Semantic value callback with the synchronized `date` in context.'
	}
];

export const colorControlProps: PropDefinition[] = [
	{ name: 'value', type: 'string', default: "''", description: 'Bindable CSS color string.' },
	{
		name: 'format',
		type: 'ColorFormat',
		default: "'auto'",
		description: 'Override the active format.'
	},
	{
		name: 'alpha',
		type: 'boolean',
		default: 'false',
		description: 'Always show the alpha channel segment.'
	},
	{
		name: 'oninput',
		type: '((event: Event) => void) | undefined',
		default: 'undefined',
		description: 'Native input callback. Receives only the DOM event.'
	},
	{
		name: 'onchange',
		type: '((event: Event) => void) | undefined',
		default: 'undefined',
		description: 'Native change callback. Receives only the DOM event.'
	},
	{
		name: 'onvaluechange',
		type: 'StateChangeCallback<string, InputBond> | undefined',
		default: 'undefined',
		description: 'Semantic color value callback with event, bond, and reason context.'
	}
];

export const otpControlProps: PropDefinition[] = [
	{ name: 'value', type: 'string', default: "''", description: 'Bindable OTP string.' },
	{ name: 'length', type: 'number', default: '6', description: 'Number of OTP slots.' },
	{
		name: 'type',
		type: "'numeric' | 'alpha' | 'alphanumeric'",
		default: "'numeric'",
		description: 'Accepted character set.'
	},
	{
		name: 'groupSize',
		type: 'number',
		default: 'undefined',
		description: 'Visual grouping (gap every N slots).'
	},
	{
		name: 'onvaluechange',
		type: 'StateChangeCallback<string, InputBond> | undefined',
		default: 'undefined',
		description: 'Semantic value callback; native `oninput` and `onchange` are event-only.'
	},
	{
		name: 'oncomplete',
		type: 'function',
		default: 'undefined',
		description: 'Fires once when all slots are filled.'
	}
];

export const fileControlProps: PropDefinition[] = [
	{ name: 'files', type: 'File[]', default: '[]', description: 'Bindable selected file list.' },
	{
		name: 'accept',
		type: 'string',
		default: 'undefined',
		description: 'Accepted MIME types or file extensions.'
	},
	{
		name: 'multiple',
		type: 'boolean',
		default: 'false',
		description: 'Allow multiple file selection.'
	},
	{
		name: 'triggerContent',
		type: 'Snippet',
		default: 'built-in',
		description: 'Custom trigger button content.'
	},
	{
		name: 'onfileschange',
		type: 'StateChangeCallback<File[], InputBond> | undefined',
		default: 'undefined',
		description: 'Semantic file-list callback; native `oninput` and `onchange` are event-only.'
	}
];

export const locationControlProps: PropDefinition[] = [
	{
		name: 'value',
		type: 'string',
		default: "''",
		description: 'Bindable formatted coordinate string.'
	},
	{ name: 'lat', type: 'number', default: 'undefined', description: 'Bindable latitude.' },
	{ name: 'lng', type: 'number', default: 'undefined', description: 'Bindable longitude.' },
	{
		name: 'format',
		type: "'dd' | 'dms'",
		default: "'dd'",
		description: 'Decimal degrees or degrees/minutes/seconds.'
	},
	{ name: 'precision', type: 'number', default: '6', description: 'Decimal places for DD format.' },
	{
		name: 'onvaluechange',
		type: 'InputStateChangeCallback<string, { lat: number | undefined; lng: number | undefined }> | undefined',
		default: 'undefined',
		description: 'Semantic value callback with parsed `lat` and `lng` in context.'
	}
];
