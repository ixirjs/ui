import { renderPropsRow, type PropDefinition } from '$docs/types';

export const colorSegmentProps: PropDefinition[] = [
	{
		name: 'channel',
		type: 'ChannelDef',
		default: 'undefined',
		description: 'The colour channel this segment edits — its key, range and formatting.'
	},
	{
		name: 'class',
		type: 'string',
		default: 'undefined',
		description: 'Additional classes, merged after the preset so they win.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'onchange',
		type: '((event: Event) => void) | undefined',
		default: 'undefined',
		description: 'Native change event, fired when the value is committed.'
	},
	{
		name: 'oncommit',
		type: 'StateChangeCallback<string | number | undefined>',
		default: 'undefined',
		description:
			'Called when editing of this segment finishes, so the parent can normalise the colour.'
	},
	{
		name: 'onfocusmove',
		type: '(dir: 1 | -1) => void',
		default: 'undefined',
		description:
			'Requests focus move to the previous or next segment, driving arrow-key navigation.'
	},
	{
		name: 'oninput',
		type: '((event: Event) => void) | undefined',
		default: 'undefined',
		description: 'Native input event, fired on every keystroke.'
	},
	{
		name: 'onvaluechange',
		type: 'StateChangeCallback<string | number | undefined>',
		default: 'undefined',
		description: 'Called when the segment’s value changes.'
	},
	{
		name: 'readonly',
		type: 'boolean',
		default: 'undefined',
		description:
			'Renders the current value but blocks editing. Unlike `disabled`, it stays focusable.'
	},
	{
		name: 'value',
		type: 'string | number | undefined',
		default: 'undefined',
		description: 'Current value of the control.'
	}
];

export const inputColorControlOwnProps: PropDefinition[] = [
	{
		name: 'alpha',
		type: 'boolean',
		default: 'false',
		description: 'Always show the alpha channel segment.'
	},
	{
		name: 'format',
		type: 'ColorFormat',
		default: 'undefined',
		description: 'Override the active format.'
	},
	{
		name: 'onvaluechange',
		type: 'StateChangeCallback<string, InputBondBase>',
		default: 'undefined',
		description: 'Semantic color value callback with event, bond, and reason context.'
	},
	{
		name: 'value',
		type: 'string',
		default: 'undefined',
		description: 'Bindable CSS color string.'
	}
];

export const inputColorControlProps: PropDefinition[] = [
	{
		name: 'alpha',
		type: 'boolean',
		default: 'false',
		description: 'Always show the alpha channel segment.'
	},
	{
		name: 'class',
		type: 'string',
		default: 'undefined',
		description: 'Additional classes, merged after the preset so they win.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'format',
		type: '"named" | "hex" | "rgb" | "hsl" | "hwb" | "lab" | "lch" | "oklab" | "oklch" | "display-p3" | "srgb" | "srgb-linear" | "a98-rgb" | "prophoto-rgb" | "rec2020" | "xyz-d50" | "xyz-d65"',
		default: 'undefined',
		description: 'Override the active format.'
	},
	{
		name: 'onchange',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native change event, fired when the value is committed.'
	},
	{
		name: 'oninput',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native input event, fired on every keystroke.'
	},
	{
		name: 'onvaluechange',
		type: '(value: string, context: StateChangeContext<InputBondBase, Event>) => void',
		default: 'undefined',
		description: 'Semantic color value callback with event, bond, and reason context.'
	},
	{
		name: 'placeholder',
		type: 'string',
		default: 'undefined',
		description: 'Hint text shown while the field is empty.'
	},
	{
		name: 'preset',
		type: 'PresetModuleName | FallbackPreset',
		default: 'undefined',
		description: 'Preset key to resolve presentation from. Defaults to this part’s own key.'
	},
	{
		name: 'readonly',
		type: 'boolean',
		default: 'undefined',
		description:
			'Renders the current value but blocks editing. Unlike `disabled`, it stays focusable.'
	},
	{
		name: 'value',
		type: 'string',
		default: 'undefined',
		description: 'Bindable CSS color string.'
	},
	renderPropsRow
];

export const segmentProps: PropDefinition[] = [
	{
		name: 'class',
		type: 'string',
		default: 'undefined',
		description: 'Additional classes, merged after the preset so they win.'
	},
	{
		name: 'digits',
		type: 'number',
		default: 'undefined',
		description: 'Digit width the segment pads to — 2 for hours and minutes.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'max',
		type: 'number',
		default: 'undefined',
		description: 'Highest accepted value. Values above it are rejected.'
	},
	{
		name: 'min',
		type: 'number',
		default: 'undefined',
		description: 'Lowest accepted value. Values below it are rejected.'
	},
	{
		name: 'onchange',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native change event, fired when the value is committed.'
	},
	{
		name: 'onfocusmove',
		type: '(dir: -1 | 1) => void',
		default: 'undefined',
		description:
			'Requests focus move to the previous or next segment, driving arrow-key navigation.'
	},
	{
		name: 'oninput',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native input event, fired on every keystroke.'
	},
	{
		name: 'onrollover',
		type: 'StateChangeCallback<1 | -1, never, KeyboardEvent>',
		default: 'undefined',
		description: 'Called when the value wraps past its bound, so the next segment can carry.'
	},
	{
		name: 'onvaluechange',
		type: 'StateChangeCallback<number | undefined>',
		default: 'undefined',
		description: 'Called when the segment’s numeric value changes.'
	},
	{
		name: 'placeholder',
		type: 'string',
		default: 'undefined',
		description: 'Hint text shown while the field is empty.'
	},
	{
		name: 'readonly',
		type: 'boolean',
		default: 'undefined',
		description:
			'Renders the current value but blocks editing. Unlike `disabled`, it stays focusable.'
	},
	{
		name: 'value',
		type: 'number | undefined',
		default: 'undefined',
		description: 'Current value of the control.'
	}
];

export const dateTimeControlImplProps: PropDefinition[] = [
	{
		name: 'class',
		type: 'string',
		default: 'undefined',
		description: 'Additional classes, merged after the preset so they win.'
	},
	{
		name: 'date',
		type: 'Date | null',
		default: 'undefined',
		description: 'Bindable Date object.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'mode',
		type: '"date" | "datetime"',
		default: "'datetime'",
		description: 'Which segments render. Set by the entry-point component, not by consumers.'
	},
	{
		name: 'onchange',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native change event, fired when the value is committed.'
	},
	{
		name: 'oninput',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native input event, fired on every keystroke.'
	},
	{
		name: 'onvaluechange',
		type: '(value: string, context: StateChangeContext<InputBondBase, Event> & { date: Date | null; }) => void',
		default: 'undefined',
		description: 'Semantic value callback with the synchronized `date` in context.'
	},
	{
		name: 'placeholder',
		type: 'string',
		default: 'undefined',
		description: 'Hint text shown while the field is empty.'
	},
	{
		name: 'preset',
		type: 'PresetModuleName | FallbackPreset',
		default: 'undefined',
		description: 'Preset key to resolve presentation from. Defaults to this part’s own key.'
	},
	{
		name: 'readonly',
		type: 'boolean',
		default: 'undefined',
		description:
			'Renders the current value but blocks editing. Unlike `disabled`, it stays focusable.'
	},
	{
		name: 'value',
		type: 'string',
		default: 'undefined',
		description: 'Bindable datetime string.'
	},
	{
		name: 'withSeconds',
		type: 'boolean',
		default: 'false',
		description: 'Show seconds segment.'
	},
	renderPropsRow
];

export const inputRootProps: PropDefinition[] = [
	{
		name: 'checked',
		type: 'boolean',
		default: 'false',
		description: 'The checked state for checkbox or radio input types.'
	},
	{
		name: 'factory',
		type: '((props: InputStateProps) => InputBond) | Factory<InputBondBase>',
		default: 'undefined',
		description: 'Replaces the Bond constructor, so a family can be extended or fused.'
	},
	{
		name: 'files',
		type: 'File[] | null',
		default: 'undefined',
		description: 'The list of selected files for file input types. Bind to read file selections.'
	},
	{
		name: 'value',
		type: 'string | number | string[] | null',
		default: 'undefined',
		description: 'The current value of the input. Bind this prop for two-way value binding.'
	},
	renderPropsRow
];

export const inputControlProps: PropDefinition[] = [
	{
		name: 'checked',
		type: 'boolean',
		default: 'undefined',
		description: 'Checked state for checkbox/radio inputs'
	},
	{
		name: 'children',
		type: 'InputChildren',
		default: 'undefined',
		description: 'Children content snippet'
	},
	{
		name: 'class',
		type: 'ClassValue | ClassValue[]',
		default: 'undefined',
		description: 'CSS class for the input control'
	},
	{
		name: 'date',
		type: 'Date | null',
		default: 'null',
		description: 'Date value for date inputs'
	},
	{
		name: 'files',
		type: 'File[]',
		default: 'undefined',
		description: 'File list for file inputs'
	},
	{
		name: 'number',
		type: 'number',
		default: 'undefined',
		description: 'Number value for number inputs'
	},
	{
		name: 'onchange',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native change callback. Receives only the DOM event.'
	},
	{
		name: 'oncheckedchange',
		type: 'InputStateChangeCallback<boolean, InputControlChangeDetails, Event>',
		default: 'undefined',
		description: 'Semantic callback for `type="checkbox"` and `type="radio"`.'
	},
	{
		name: 'ondatechange',
		type: 'InputStateChangeCallback<Date | null, InputControlChangeDetails, Event>',
		default: 'undefined',
		description: 'Semantic callback for native date/time input types.'
	},
	{
		name: 'onfileschange',
		type: 'InputStateChangeCallback<File[], InputControlChangeDetails, Event>',
		default: 'undefined',
		description: 'Semantic callback for `type="file"`.'
	},
	{
		name: 'oninput',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native input callback. Receives only the DOM event.'
	},
	{
		name: 'onnumberchange',
		type: 'InputStateChangeCallback<number | undefined, InputControlChangeDetails, Event>',
		default: 'undefined',
		description: 'Semantic callback for `type="number"`.'
	},
	{
		name: 'onvaluechange',
		type: 'InputStateChangeCallback<unknown, InputControlChangeDetails, Event>',
		default: 'undefined',
		description: 'Semantic callback for the parsed input value.'
	},
	{
		name: 'type',
		type: 'InputControlType',
		default: 'undefined',
		description: 'HTML input type attribute'
	},
	{
		name: 'value',
		type: 'any',
		default: 'undefined',
		description:
			'The native input value. Parsed number/date/file state uses the dedicated props below.'
	},
	renderPropsRow
];

export const inputNumber12HourControlProps: PropDefinition[] = [
	{
		name: 'hourFormat',
		type: '12',
		default: 'undefined',
		description:
			'Selects the 12-hour variant, where `min`/`max` take an `hh:mm` string with an am/pm segment.'
	},
	{
		name: 'max',
		type: '`0${number}:0${number}` | `0${number}:1${number}` | `0${number}:2${number}` | `0${number}:3${number}` | `0${number}:4${number}` | `0${number}:5${number}` | `10:0${number}` | `10:1${number}` | `10:2${number}` | `10:3${number}` | `10:4${number}` | `10:5${number}` | `11:0${number}` | `11:1${number}` | `11:2${number}` | `11:3${number}` | `11:4${number}` | `11:5${number}` | `12:0${number}` | `12:1${number}` | `12:2${number}` | `12:3${number}` | `12:4${number}` | `12:5${number}`',
		default: 'undefined',
		description: 'Highest accepted value. Values above it are rejected.'
	},
	{
		name: 'min',
		type: '`0${number}:0${number}` | `0${number}:1${number}` | `0${number}:2${number}` | `0${number}:3${number}` | `0${number}:4${number}` | `0${number}:5${number}` | `10:0${number}` | `10:1${number}` | `10:2${number}` | `10:3${number}` | `10:4${number}` | `10:5${number}` | `11:0${number}` | `11:1${number}` | `11:2${number}` | `11:3${number}` | `11:4${number}` | `11:5${number}` | `12:0${number}` | `12:1${number}` | `12:2${number}` | `12:3${number}` | `12:4${number}` | `12:5${number}`',
		default: 'undefined',
		description: 'Lowest accepted value. Values below it are rejected.'
	}
];

export const inputNumber24HourControlProps: PropDefinition[] = [
	{
		name: 'hourFormat',
		type: '24',
		default: 'undefined',
		description: 'Selects the 24-hour variant, where `min`/`max` take a 24-hour `HH:mm` string.'
	},
	{
		name: 'max',
		type: '`0${number}:0${number}` | `0${number}:1${number}` | `0${number}:2${number}` | `0${number}:3${number}` | `0${number}:4${number}` | `0${number}:5${number}` | `1${number}:0${number}` | `1${number}:1${number}` | `1${number}:2${number}` | `1${number}:3${number}` | `1${number}:4${number}` | `1${number}:5${number}` | `20:0${number}` | `20:1${number}` | `20:2${number}` | `20:3${number}` | `20:4${number}` | `20:5${number}` | `21:0${number}` | `21:1${number}` | `21:2${number}` | `21:3${number}` | `21:4${number}` | `21:5${number}` | `22:0${number}` | `22:1${number}` | `22:2${number}` | `22:3${number}` | `22:4${number}` | `22:5${number}` | `23:0${number}` | `23:1${number}` | `23:2${number}` | `23:3${number}` | `23:4${number}` | `23:5${number}`',
		default: 'undefined',
		description: 'Highest accepted value. Values above it are rejected.'
	},
	{
		name: 'min',
		type: '`0${number}:0${number}` | `0${number}:1${number}` | `0${number}:2${number}` | `0${number}:3${number}` | `0${number}:4${number}` | `0${number}:5${number}` | `1${number}:0${number}` | `1${number}:1${number}` | `1${number}:2${number}` | `1${number}:3${number}` | `1${number}:4${number}` | `1${number}:5${number}` | `20:0${number}` | `20:1${number}` | `20:2${number}` | `20:3${number}` | `20:4${number}` | `20:5${number}` | `21:0${number}` | `21:1${number}` | `21:2${number}` | `21:3${number}` | `21:4${number}` | `21:5${number}` | `22:0${number}` | `22:1${number}` | `22:2${number}` | `22:3${number}` | `22:4${number}` | `22:5${number}` | `23:0${number}` | `23:1${number}` | `23:2${number}` | `23:3${number}` | `23:4${number}` | `23:5${number}`',
		default: 'undefined',
		description: 'Lowest accepted value. Values below it are rejected.'
	}
];

export const inputNumberControlOwnProps: PropDefinition[] = [
	{
		name: 'decrement',
		type: 'Snippet<[{ action: (event?: MouseEvent) => void; disabled: boolean; }]>',
		default: 'undefined',
		description:
			'Replaces the decrement button. Receives the action to call and whether the step is available.'
	},
	{
		name: 'increment',
		type: 'Snippet<[{ action: (event?: MouseEvent) => void; disabled: boolean; }]>',
		default: 'undefined',
		description:
			'Replaces the increment button. Receives the action to call and whether the step is available.'
	},
	{
		name: 'max',
		type: 'number',
		default: 'undefined',
		description: 'Maximum allowed value.'
	},
	{
		name: 'min',
		type: 'number',
		default: 'undefined',
		description: 'Minimum allowed value.'
	},
	{
		name: 'number',
		type: 'number',
		default: 'undefined',
		description: 'Bindable numeric value.'
	},
	{
		name: 'onnumberchange',
		type: 'StateChangeCallback<number | undefined, InputBondBase>',
		default: 'undefined',
		description: 'Semantic number callback; native `oninput` and `onchange` are event-only.'
	},
	{
		name: 'showControls',
		type: 'boolean',
		default: 'true',
		description: 'Show/hide the increment and decrement buttons.'
	},
	{
		name: 'step',
		type: 'number',
		default: '1',
		description: 'Increment/decrement step.'
	}
];

export const inputTimeControlProps: PropDefinition[] = [
	{
		name: 'class',
		type: 'string',
		default: 'undefined',
		description: 'Additional classes, merged after the preset so they win.'
	},
	{
		name: 'date',
		type: 'Date | undefined',
		default: 'undefined',
		description: 'Bindable Date object (time portion).'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'hourFormat',
		type: '12 | 24',
		default: '24',
		description: '12-hour or 24-hour format.'
	},
	{
		name: 'max',
		type: 'string',
		default: 'undefined',
		description: 'Highest accepted value. Values above it are rejected.'
	},
	{
		name: 'min',
		type: 'string',
		default: 'undefined',
		description: 'Lowest accepted value. Values below it are rejected.'
	},
	{
		name: 'onchange',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native change event, fired when the value is committed.'
	},
	{
		name: 'oninput',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native input event, fired on every keystroke.'
	},
	{
		name: 'onvaluechange',
		type: 'InputStateChangeCallback<string, { date: Date | undefined; }, Event>',
		default: 'undefined',
		description: 'Semantic value callback with the synchronized `date` in context.'
	},
	{
		name: 'placeholder',
		type: 'string',
		default: 'undefined',
		description: 'Hint text shown while the field is empty.'
	},
	{
		name: 'preset',
		type: 'PresetKey',
		default: 'undefined',
		description: 'Preset key to resolve presentation from. Defaults to this part’s own key.'
	},
	{
		name: 'readonly',
		type: 'boolean',
		default: 'undefined',
		description:
			'Renders the current value but blocks editing. Unlike `disabled`, it stays focusable.'
	},
	{
		name: 'value',
		type: 'string',
		default: 'undefined',
		description: 'Bindable time string (HH:mm or HH:mm:ss).'
	},
	{
		name: 'withSeconds',
		type: 'boolean',
		default: 'false',
		description: 'Show seconds segment.'
	},
	renderPropsRow
];

export const inputDateTimeControlProps: PropDefinition[] = [
	{
		name: 'class',
		type: 'string',
		default: 'undefined',
		description: 'Additional classes, merged after the preset so they win.'
	},
	{
		name: 'date',
		type: 'Date | null',
		default: 'undefined',
		description: 'Bindable Date object.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'mode',
		type: '"datetime"',
		default: 'undefined',
		description: 'Renders date and time segments together rather than a date alone.'
	},
	{
		name: 'onchange',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native change event, fired when the value is committed.'
	},
	{
		name: 'oninput',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native input event, fired on every keystroke.'
	},
	{
		name: 'onvaluechange',
		type: 'InputStateChangeCallback<string, { date: Date | null; }, Event>',
		default: 'undefined',
		description: 'Semantic value callback with the synchronized `date` in context.'
	},
	{
		name: 'placeholder',
		type: 'string',
		default: 'undefined',
		description: 'Hint text shown while the field is empty.'
	},
	{
		name: 'preset',
		type: 'PresetKey',
		default: 'undefined',
		description: 'Preset key to resolve presentation from. Defaults to this part’s own key.'
	},
	{
		name: 'readonly',
		type: 'boolean',
		default: 'undefined',
		description:
			'Renders the current value but blocks editing. Unlike `disabled`, it stays focusable.'
	},
	{
		name: 'value',
		type: 'string',
		default: 'undefined',
		description: 'Bindable datetime string.'
	},
	{
		name: 'withSeconds',
		type: 'boolean',
		default: 'false',
		description: 'Show seconds segment.'
	},
	renderPropsRow
];

export const inputDateControlProps: PropDefinition[] = [
	{
		name: 'class',
		type: 'string',
		default: 'undefined',
		description: 'Additional classes, merged after the preset so they win.'
	},
	{
		name: 'date',
		type: 'Date | null',
		default: 'undefined',
		description: 'Bindable Date object.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'onchange',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native change event, fired when the value is committed.'
	},
	{
		name: 'oninput',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native input event, fired on every keystroke.'
	},
	{
		name: 'onvaluechange',
		type: 'InputStateChangeCallback<string, { date: Date | null; }, Event>',
		default: 'undefined',
		description:
			'Semantic value callback with `date` in context. `ondatechange` belongs to native-type `Input.Control`.'
	},
	{
		name: 'placeholder',
		type: 'string',
		default: 'undefined',
		description: 'Hint text shown while the field is empty.'
	},
	{
		name: 'preset',
		type: 'PresetKey',
		default: 'undefined',
		description: 'Preset key to resolve presentation from. Defaults to this part’s own key.'
	},
	{
		name: 'readonly',
		type: 'boolean',
		default: 'undefined',
		description:
			'Renders the current value but blocks editing. Unlike `disabled`, it stays focusable.'
	},
	{
		name: 'value',
		type: 'string',
		default: 'undefined',
		description: 'Bindable date string (YYYY-MM-DD).'
	},
	renderPropsRow
];

export const inputFileControlOwnProps: PropDefinition[] = [
	{
		name: 'accept',
		type: 'string',
		default: 'undefined',
		description: 'Accepted MIME types or file extensions.'
	},
	{
		name: 'files',
		type: 'File[]',
		default: '[]',
		description: 'Bindable selected file list.'
	},
	{
		name: 'multiple',
		type: 'boolean',
		default: 'false',
		description: 'Allow multiple file selection.'
	},
	{
		name: 'onfileschange',
		type: 'StateChangeCallback<File[], InputBondBase>',
		default: 'undefined',
		description: 'Semantic file-list callback; native `oninput` and `onchange` are event-only.'
	},
	{
		name: 'triggerContent',
		type: 'Snippet<[{ files: File[]; hasFiles: boolean; open: () => void; }]>',
		default: 'built-in',
		description: 'Custom trigger button content.'
	}
];

export const inputTextControlProps: PropDefinition[] = [
	{
		name: 'class',
		type: 'string',
		default: 'undefined',
		description: 'Additional classes, merged after the preset so they win.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'onchange',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native change event, fired when the value is committed.'
	},
	{
		name: 'oninput',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native input event, fired on every keystroke.'
	},
	{
		name: 'onvaluechange',
		type: 'StateChangeCallback<string, InputBondBase>',
		default: 'undefined',
		description: 'Semantic value callback; native `oninput` and `onchange` are event-only.'
	},
	{
		name: 'placeholder',
		type: 'string',
		default: 'undefined',
		description: 'Hint text shown while the field is empty.'
	},
	{
		name: 'preset',
		type: 'PresetKey',
		default: 'undefined',
		description: 'Preset key to resolve presentation from. Defaults to this part’s own key.'
	},
	{
		name: 'readonly',
		type: 'boolean',
		default: 'undefined',
		description:
			'Renders the current value but blocks editing. Unlike `disabled`, it stays focusable.'
	},
	{
		name: 'type',
		type: '"search" | "text" | "password"',
		default: 'undefined',
		description: 'Input type.'
	},
	{
		name: 'value',
		type: 'string',
		default: 'undefined',
		description: 'Bindable text value.'
	},
	renderPropsRow
];

export const inputPasswordControlProps: PropDefinition[] = [
	{
		name: 'class',
		type: 'string',
		default: 'undefined',
		description: 'Additional classes, merged after the preset so they win.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'onchange',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native change event, fired when the value is committed.'
	},
	{
		name: 'oninput',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native input event, fired on every keystroke.'
	},
	{
		name: 'onvaluechange',
		type: 'StateChangeCallback<string, InputBondBase>',
		default: 'undefined',
		description: 'Semantic value callback; native `oninput` and `onchange` are event-only.'
	},
	{
		name: 'onvisiblechange',
		type: 'InputStateChangeCallback<boolean, { value: string; }, MouseEvent>',
		default: 'undefined',
		description: 'Semantic visibility callback. Context includes the current password value.'
	},
	{
		name: 'placeholder',
		type: 'string',
		default: 'undefined',
		description: 'Hint text shown while the field is empty.'
	},
	{
		name: 'preset',
		type: 'PresetKey',
		default: 'undefined',
		description: 'Preset key to resolve presentation from. Defaults to this part’s own key.'
	},
	{
		name: 'readonly',
		type: 'boolean',
		default: 'undefined',
		description:
			'Renders the current value but blocks editing. Unlike `disabled`, it stays focusable.'
	},
	{
		name: 'toggleContent',
		type: 'Snippet<[{ visible: boolean; toggle: (event?: MouseEvent) => void; disabled: boolean; }]>',
		default: 'built-in',
		description: 'Custom show/hide toggle button.'
	},
	{
		name: 'value',
		type: 'string',
		default: 'undefined',
		description: 'Bindable text value.'
	},
	{
		name: 'visible',
		type: 'boolean',
		default: 'false',
		description: 'Toggles password visibility.'
	},
	renderPropsRow
];

export const inputLocationControlProps: PropDefinition[] = [
	{
		name: 'class',
		type: 'string',
		default: 'undefined',
		description: 'Additional classes, merged after the preset so they win.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'format',
		type: '"dd" | "dms"',
		default: 'undefined',
		description: 'Decimal degrees or degrees/minutes/seconds.'
	},
	{
		name: 'lat',
		type: 'number | undefined',
		default: 'undefined',
		description: 'Bindable latitude.'
	},
	{
		name: 'lng',
		type: 'number | undefined',
		default: 'undefined',
		description: 'Bindable longitude.'
	},
	{
		name: 'onchange',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native change event, fired when the value is committed.'
	},
	{
		name: 'oninput',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native input event, fired on every keystroke.'
	},
	{
		name: 'onvaluechange',
		type: 'InputStateChangeCallback<string, { lat: number | undefined; lng: number | undefined; }, Event>',
		default: 'undefined',
		description: 'Semantic value callback with parsed `lat` and `lng` in context.'
	},
	{
		name: 'placeholder',
		type: 'string',
		default: 'undefined',
		description: 'Hint text shown while the field is empty.'
	},
	{
		name: 'precision',
		type: 'number',
		default: '6',
		description: 'Decimal places for DD format.'
	},
	{
		name: 'preset',
		type: 'PresetKey',
		default: 'undefined',
		description: 'Preset key to resolve presentation from. Defaults to this part’s own key.'
	},
	{
		name: 'readonly',
		type: 'boolean',
		default: 'undefined',
		description:
			'Renders the current value but blocks editing. Unlike `disabled`, it stays focusable.'
	},
	{
		name: 'value',
		type: 'string',
		default: 'undefined',
		description: 'Bindable formatted coordinate string.'
	},
	renderPropsRow
];

export const inputPhoneControlProps: PropDefinition[] = [
	{
		name: 'class',
		type: 'string',
		default: 'undefined',
		description: 'Additional classes, merged after the preset so they win.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'format',
		type: 'string',
		default: 'undefined',
		description: 'Mask pattern. # = required digit, [#] = optional.'
	},
	{
		name: 'onchange',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native change event, fired when the value is committed.'
	},
	{
		name: 'oninput',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native input event, fired on every keystroke.'
	},
	{
		name: 'onvaluechange',
		type: 'StateChangeCallback<string, InputBondBase>',
		default: 'undefined',
		description: 'Semantic value callback; native `oninput` and `onchange` are event-only.'
	},
	{
		name: 'placeholder',
		type: 'string',
		default: 'undefined',
		description: 'Hint text shown while the field is empty.'
	},
	{
		name: 'preset',
		type: 'PresetKey',
		default: 'undefined',
		description: 'Preset key to resolve presentation from. Defaults to this part’s own key.'
	},
	{
		name: 'readonly',
		type: 'boolean',
		default: 'undefined',
		description:
			'Renders the current value but blocks editing. Unlike `disabled`, it stays focusable.'
	},
	{
		name: 'segments',
		type: 'Record<string, number>',
		default: 'undefined',
		description: 'Color map for segment highlighting.'
	},
	{
		name: 'span',
		type: 'Snippet<[PhoneSpan]>',
		default: 'undefined',
		description:
			'Renders each overlay span of the formatted number — its text, class and segment type.'
	},
	{
		name: 'value',
		type: 'string',
		default: 'undefined',
		description: 'Bindable phone string.'
	},
	renderPropsRow
];

export const inputCurrencyControlProps: PropDefinition[] = [
	{
		name: 'amount',
		type: 'number | undefined',
		default: 'undefined',
		description: 'Bindable parsed numeric amount.'
	},
	{
		name: 'class',
		type: 'string',
		default: 'undefined',
		description: 'Additional classes, merged after the preset so they win.'
	},
	{
		name: 'currency',
		type: 'string',
		default: 'undefined',
		description: 'ISO 4217 currency code.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'locale',
		type: 'string',
		default: 'undefined',
		description: 'BCP 47 locale for formatting.'
	},
	{
		name: 'max',
		type: 'number',
		default: 'undefined',
		description: 'Maximum value.'
	},
	{
		name: 'min',
		type: 'number',
		default: 'undefined',
		description: 'Minimum value.'
	},
	{
		name: 'onchange',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native change event, fired when the value is committed.'
	},
	{
		name: 'oninput',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native input event, fired on every keystroke.'
	},
	{
		name: 'onvaluechange',
		type: 'InputStateChangeCallback<string, { amount: number | undefined; }, Event>',
		default: 'undefined',
		description: 'Semantic value callback with parsed `amount`; native callbacks are event-only.'
	},
	{
		name: 'placeholder',
		type: 'string',
		default: 'undefined',
		description: 'Hint text shown while the field is empty.'
	},
	{
		name: 'precision',
		type: 'number',
		default: '2',
		description: 'Decimal places.'
	},
	{
		name: 'preset',
		type: 'PresetKey',
		default: 'undefined',
		description: 'Preset key to resolve presentation from. Defaults to this part’s own key.'
	},
	{
		name: 'readonly',
		type: 'boolean',
		default: 'undefined',
		description:
			'Renders the current value but blocks editing. Unlike `disabled`, it stays focusable.'
	},
	{
		name: 'step',
		type: 'number',
		default: 'undefined',
		description: 'Granularity the value snaps to.'
	},
	{
		name: 'value',
		type: 'string',
		default: 'undefined',
		description: 'Bindable raw numeric string.'
	},
	renderPropsRow
];

export const inputPinControlProps: PropDefinition[] = [
	{
		name: 'class',
		type: 'string',
		default: 'undefined',
		description: 'Additional classes, merged after the preset so they win.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'groupSize',
		type: 'number',
		default: 'undefined',
		description: 'Visual grouping (gap every N slots).'
	},
	{
		name: 'length',
		type: 'number',
		default: '6',
		description: 'Number of OTP slots.'
	},
	{
		name: 'onchange',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native change event, fired when the value is committed.'
	},
	{
		name: 'oncomplete',
		type: '(value: string) => void',
		default: 'undefined',
		description: 'Fires once when all slots are filled.'
	},
	{
		name: 'oninput',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native input event, fired on every keystroke.'
	},
	{
		name: 'onvaluechange',
		type: 'StateChangeCallback<string, InputBondBase>',
		default: 'undefined',
		description: 'Semantic value callback; native `oninput` and `onchange` are event-only.'
	},
	{
		name: 'placeholder',
		type: 'string',
		default: 'undefined',
		description: 'Hint text shown while the field is empty.'
	},
	{
		name: 'preset',
		type: 'PresetKey',
		default: 'undefined',
		description: 'Preset key to resolve presentation from. Defaults to this part’s own key.'
	},
	{
		name: 'readonly',
		type: 'boolean',
		default: 'undefined',
		description:
			'Renders the current value but blocks editing. Unlike `disabled`, it stays focusable.'
	},
	{
		name: 'type',
		type: '"numeric" | "alpha" | "alphanumeric"',
		default: 'undefined',
		description: 'Accepted character set.'
	},
	{
		name: 'value',
		type: 'string',
		default: 'undefined',
		description: 'Bindable pin string.'
	},
	renderPropsRow
];

export const inputNumberControlProps: PropDefinition[] = [
	{
		name: 'class',
		type: 'string',
		default: 'undefined',
		description: 'Additional classes, merged after the preset so they win.'
	},
	{
		name: 'decrement',
		type: 'Snippet<[{ action: (event?: MouseEvent) => void; disabled: boolean; }]>',
		default: 'undefined',
		description:
			'Replaces the decrement button. Receives the action to call and whether the step is available.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'increment',
		type: 'Snippet<[{ action: (event?: MouseEvent) => void; disabled: boolean; }]>',
		default: 'undefined',
		description:
			'Replaces the increment button. Receives the action to call and whether the step is available.'
	},
	{
		name: 'max',
		type: 'number',
		default: 'undefined',
		description: 'Maximum allowed value.'
	},
	{
		name: 'min',
		type: 'number',
		default: 'undefined',
		description: 'Minimum allowed value.'
	},
	{
		name: 'number',
		type: 'number',
		default: 'undefined',
		description: 'Bindable numeric value.'
	},
	{
		name: 'onchange',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native change event, fired when the value is committed.'
	},
	{
		name: 'oninput',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native input event, fired on every keystroke.'
	},
	{
		name: 'onnumberchange',
		type: '(value: number | undefined, context: StateChangeContext<InputBondBase, Event>) => void',
		default: 'undefined',
		description: 'Semantic number callback; native `oninput` and `onchange` are event-only.'
	},
	{
		name: 'placeholder',
		type: 'string',
		default: 'undefined',
		description: 'Hint text shown while the field is empty.'
	},
	{
		name: 'preset',
		type: 'PresetModuleName | FallbackPreset',
		default: 'undefined',
		description: 'Preset key to resolve presentation from. Defaults to this part’s own key.'
	},
	{
		name: 'readonly',
		type: 'boolean',
		default: 'undefined',
		description:
			'Renders the current value but blocks editing. Unlike `disabled`, it stays focusable.'
	},
	{
		name: 'showControls',
		type: 'boolean',
		default: 'true',
		description: 'Show/hide the increment and decrement buttons.'
	},
	{
		name: 'step',
		type: 'number',
		default: '1',
		description: 'Increment/decrement step.'
	},
	renderPropsRow
];

export const inputFileControlProps: PropDefinition[] = [
	{
		name: 'accept',
		type: 'string',
		default: 'undefined',
		description: 'Accepted MIME types or file extensions.'
	},
	{
		name: 'class',
		type: 'string',
		default: 'undefined',
		description: 'Additional classes, merged after the preset so they win.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'files',
		type: 'File[]',
		default: '[]',
		description: 'Bindable selected file list.'
	},
	{
		name: 'multiple',
		type: 'boolean',
		default: 'false',
		description: 'Allow multiple file selection.'
	},
	{
		name: 'onchange',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native change event, fired when the value is committed.'
	},
	{
		name: 'onfileschange',
		type: '(value: File[], context: StateChangeContext<InputBondBase, Event>) => void',
		default: 'undefined',
		description: 'Semantic file-list callback; native `oninput` and `onchange` are event-only.'
	},
	{
		name: 'oninput',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native input event, fired on every keystroke.'
	},
	{
		name: 'placeholder',
		type: 'string',
		default: 'undefined',
		description: 'Hint text shown while the field is empty.'
	},
	{
		name: 'preset',
		type: 'PresetModuleName | FallbackPreset',
		default: 'undefined',
		description: 'Preset key to resolve presentation from. Defaults to this part’s own key.'
	},
	{
		name: 'readonly',
		type: 'boolean',
		default: 'undefined',
		description:
			'Renders the current value but blocks editing. Unlike `disabled`, it stays focusable.'
	},
	{
		name: 'triggerContent',
		type: 'Snippet<[{ files: File[]; hasFiles: boolean; open: () => void; }]>',
		default: 'built-in',
		description: 'Custom trigger button content.'
	},
	renderPropsRow
];

export const inputUrlControlProps: PropDefinition[] = [
	{
		name: 'class',
		type: 'string',
		default: 'undefined',
		description: 'Additional classes, merged after the preset so they win.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'onchange',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native change event, fired when the value is committed.'
	},
	{
		name: 'oninput',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native input event, fired on every keystroke.'
	},
	{
		name: 'onvaluechange',
		type: '(value: string, context: StateChangeContext<InputBondBase, Event>) => void',
		default: 'undefined',
		description: 'Semantic value callback; native `oninput` and `onchange` are event-only.'
	},
	{
		name: 'placeholder',
		type: 'string',
		default: 'undefined',
		description: 'Hint text shown while the field is empty.'
	},
	{
		name: 'preset',
		type: 'PresetModuleName | FallbackPreset',
		default: 'undefined',
		description: 'Preset key to resolve presentation from. Defaults to this part’s own key.'
	},
	{
		name: 'readonly',
		type: 'boolean',
		default: 'undefined',
		description:
			'Renders the current value but blocks editing. Unlike `disabled`, it stays focusable.'
	},
	{
		name: 'value',
		type: 'string',
		default: 'undefined',
		description: 'Bindable text value.'
	},
	renderPropsRow
];

export const inputEmailControlProps: PropDefinition[] = [
	{
		name: 'class',
		type: 'string',
		default: 'undefined',
		description: 'Additional classes, merged after the preset so they win.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'onchange',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native change event, fired when the value is committed.'
	},
	{
		name: 'oninput',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native input event, fired on every keystroke.'
	},
	{
		name: 'onvaluechange',
		type: '(value: string, context: StateChangeContext<InputBondBase, Event>) => void',
		default: 'undefined',
		description: 'Semantic value callback; native `oninput` and `onchange` are event-only.'
	},
	{
		name: 'placeholder',
		type: 'string',
		default: 'undefined',
		description: 'Hint text shown while the field is empty.'
	},
	{
		name: 'preset',
		type: 'PresetModuleName | FallbackPreset',
		default: 'undefined',
		description: 'Preset key to resolve presentation from. Defaults to this part’s own key.'
	},
	{
		name: 'readonly',
		type: 'boolean',
		default: 'undefined',
		description:
			'Renders the current value but blocks editing. Unlike `disabled`, it stays focusable.'
	},
	{
		name: 'value',
		type: 'string',
		default: 'undefined',
		description: 'Bindable text value.'
	},
	renderPropsRow
];

export const inputOtpControlProps: PropDefinition[] = [
	{
		name: 'class',
		type: 'string',
		default: 'undefined',
		description: 'Additional classes, merged after the preset so they win.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'groupSize',
		type: 'number',
		default: 'undefined',
		description: 'Visual grouping (gap every N slots).'
	},
	{
		name: 'length',
		type: 'number',
		default: '6',
		description: 'Number of OTP slots.'
	},
	{
		name: 'onchange',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native change event, fired when the value is committed.'
	},
	{
		name: 'oncomplete',
		type: '(value: string) => void',
		default: 'undefined',
		description: 'Fires once when all slots are filled.'
	},
	{
		name: 'oninput',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native input event, fired on every keystroke.'
	},
	{
		name: 'onvaluechange',
		type: '(value: string, context: StateChangeContext<InputBondBase, Event>) => void',
		default: 'undefined',
		description: 'Semantic value callback; native `oninput` and `onchange` are event-only.'
	},
	{
		name: 'placeholder',
		type: 'string',
		default: 'undefined',
		description: 'Hint text shown while the field is empty.'
	},
	{
		name: 'preset',
		type: 'PresetModuleName | FallbackPreset',
		default: 'undefined',
		description: 'Preset key to resolve presentation from. Defaults to this part’s own key.'
	},
	{
		name: 'readonly',
		type: 'boolean',
		default: 'undefined',
		description:
			'Renders the current value but blocks editing. Unlike `disabled`, it stays focusable.'
	},
	{
		name: 'type',
		type: '"numeric" | "alpha" | "alphanumeric"',
		default: 'undefined',
		description: 'Accepted character set.'
	},
	{
		name: 'value',
		type: 'string',
		default: 'undefined',
		description: 'Bindable pin string.'
	},
	renderPropsRow
];
