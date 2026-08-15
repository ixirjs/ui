import { renderPropsRow, type PropDefinition } from '$docs/types';

export const fieldRootProps: PropDefinition[] = [
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'extend',
		type: 'Record<string, unknown>',
		default: 'undefined',
		description: 'Extra capabilities composed onto this Bond at construction.'
	},
	{
		name: 'factory',
		type: '((props: FieldStateProps) => FieldBond) | Factory<FieldBondBase<FieldStateProps<Record<string, unknown>, unknown>>>',
		default: 'undefined',
		description: 'Replaces the Bond constructor, so a family can be extended or fused.'
	},
	{
		name: 'mode',
		type: 'ValidationMode | undefined',
		default: 'undefined',
		description: "Overrides the form's trigger mode for this field."
	},
	{
		name: 'name',
		type: 'string',
		default: 'undefined',
		description: 'Field name for form data'
	},
	{
		name: 'readonly',
		type: 'boolean',
		default: 'undefined',
		description:
			'Renders the current value but blocks editing. Unlike `disabled`, it stays focusable.'
	},
	{
		name: 'required',
		type: 'boolean',
		default: 'undefined',
		description: 'Marks the control as required, projecting `aria-required` onto it.'
	},
	{
		name: 'schema',
		type: 'StandardSchemaV1<unknown, unknown> | undefined',
		default: 'undefined',
		description:
			"A Standard Schema checked against this field's value alone, independent of the form’s."
	},
	{
		name: 'value',
		type: 'unknown',
		default: 'undefined',
		description: 'Field value'
	},
	renderPropsRow
];

export const fieldLabelProps: PropDefinition[] = [
	{
		name: 'for',
		type: 'never',
		default: 'undefined',
		description: 'ID of the associated form control'
	},
	renderPropsRow
];

export const fieldControlProps: PropDefinition[] = [
	{
		name: 'checked',
		type: 'boolean',
		default: 'undefined',
		description: 'Bindable checked state, for checkbox and radio controls.'
	},
	{
		name: 'children',
		type: 'FieldChildren',
		default: 'undefined',
		description:
			'Control content (Input.Control, Textarea.Control, etc.). Receives { field } in snippet props.'
	},
	{
		name: 'date',
		type: 'Date | null',
		default: 'undefined',
		description: 'Bindable parsed Date, for date and datetime controls.'
	},
	{
		name: 'files',
		type: 'File[] | null',
		default: 'undefined',
		description: 'Bindable selected file list, for file controls.'
	},
	{
		name: 'number',
		type: 'number',
		default: 'undefined',
		description: 'Bindable parsed number, for numeric controls.'
	},
	{
		name: 'onblur',
		type: '(event: FocusEvent) => void',
		default: 'undefined',
		description:
			'Native blur event. Runs after the field is marked touched and the `blur` trigger is evaluated.'
	},
	{
		name: 'onchange',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native change event, fired when the value is committed.'
	},
	{
		name: 'oncheckedchange',
		type: 'FieldStateChangeCallback<boolean>',
		default: 'undefined',
		description: 'Semantic callback for checkbox and radio controls.'
	},
	{
		name: 'ondatechange',
		type: 'FieldStateChangeCallback<Date | null>',
		default: 'undefined',
		description: 'Semantic callback for date and datetime controls.'
	},
	{
		name: 'onfileschange',
		type: 'FieldStateChangeCallback<File[]>',
		default: 'undefined',
		description: 'Semantic callback for file controls.'
	},
	{
		name: 'oninput',
		type: '(event: Event) => void',
		default: 'undefined',
		description: 'Native input event, fired on every keystroke.'
	},
	{
		name: 'onnumberchange',
		type: 'FieldStateChangeCallback<number | undefined>',
		default: 'undefined',
		description: 'Semantic callback for numeric controls.'
	},
	{
		name: 'onvaluechange',
		type: 'FieldStateChangeCallback<unknown>',
		default: 'undefined',
		description: 'Semantic callback; runs after the field value commits.'
	},
	{
		name: 'value',
		type: 'unknown',
		default: 'undefined',
		description: 'Current value of the control.'
	},
	{
		name: 'valueAsDate',
		type: 'Date',
		default: 'undefined',
		description: 'The value reinterpreted as a Date; `undefined` when it does not parse.'
	},
	{
		name: 'valueAsNumber',
		type: 'number',
		default: 'undefined',
		description: 'The value reinterpreted as a number; `NaN` when it does not parse.'
	},
	renderPropsRow
];

export const fieldHelperTextProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'FieldChildren',
		default: 'undefined',
		description:
			'Helper text content rendered under the field control. Receives { field } in snippet props.'
	},
	renderPropsRow
];

export const fieldErrorProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'FieldChildren',
		default: 'undefined',
		description:
			"Error content. Defaults to the field's first validation message. Receives { field }."
	},
	renderPropsRow
];

export const formRootProps: PropDefinition[] = [
	{
		name: 'blockInvalidSubmit',
		type: 'boolean | undefined',
		default: 'undefined',
		description:
			'Call `preventDefault()` on an invalid submit. Off by default: the form validates and populates errors but still submits, which is what keeps a no-JS/progressively-enhanced form working.'
	},
	{
		name: 'children',
		type: 'FormChildren | (FormChildren & Snippet<[]>)',
		default: 'undefined',
		description: 'Form content'
	},
	{
		name: 'class',
		type: '((string | ClassArray | ClassDictionary | ClassValueFunction | ClassValue[]) & (ClassValue | null)) | undefined',
		default: 'undefined',
		description: 'Additional CSS classes to apply'
	},
	{
		name: 'errors',
		type: 'ErrorRecord | undefined',
		default: 'undefined',
		description: "An externally owned error bag, flat or nested. Superforms' `$errors` fits as-is."
	},
	{
		name: 'factory',
		type: '(props: FormProps<Record<string, unknown>>) => FormBond<FormProps<Record<string, unknown>>>',
		default: 'undefined',
		description: 'Replaces the Bond constructor, so a family can be extended or fused.'
	},
	{
		name: 'mode',
		type: 'ValidationMode | undefined',
		default: 'undefined',
		description: "When fields re-check themselves. Defaults to `'touched'`."
	},
	{
		name: 'onsubmit',
		type: 'EventHandler<SubmitEvent, HTMLFormElement> | (EventHandler<SubmitEvent, HTMLFormElement> & EventHandler<SubmitEvent, HTMLFormElement & Element>) | null',
		default: 'undefined',
		description:
			"Native submit handler, forwarded unchanged. It runs *after* validation, so the bond it can reach already holds this submit's errors."
	},
	{
		name: 'onvalidate',
		type: '((details: FormValidateDetails) => void) | undefined',
		default: 'undefined',
		description: 'Fires after a submit-triggered validation run, with the aggregate result.'
	},
	{
		name: 'preset',
		type: 'PresetKey | undefined',
		default: 'undefined',
		description: 'Preset key to resolve presentation from. Defaults to this part’s own key.'
	},
	{
		name: 'renderless',
		type: 'boolean',
		default: 'undefined',
		description:
			'Renders no `<form>` element of its own, so the Bond can wrap markup a parent already owns.'
	},
	{
		name: 'schema',
		type: 'StandardSchemaV1<unknown, unknown> | undefined',
		default: 'undefined',
		description:
			"Any [Standard Schema](https://standardschema.dev) — Zod, Valibot, ArkType, Effect. No adapter, no wrapper: pass the schema itself. Errors are routed to fields by matching the issue path against each field's `name`."
	},
	{
		name: 'source',
		type: 'ValidationSource | undefined',
		default: 'undefined',
		description: 'A validation source for state this form does not own — see `superformsSource`.'
	}
];

export const fieldTextProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Snippet<[FieldSnippetProps]>',
		default: 'undefined',
		description:
			'Helper text content rendered under the field control. Receives { field } in snippet props.'
	},
	renderPropsRow
];
