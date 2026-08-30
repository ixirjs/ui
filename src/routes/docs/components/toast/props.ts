import { renderPropsRow, type PropDefinition } from '$docs/types';

export const toastRootProps: PropDefinition[] = [
	{
		name: 'disabled',
		type: 'boolean',
		default: 'false',
		description: 'Disables interaction and prevents the toast from opening.'
	},
	{
		name: 'dismissible',
		type: 'boolean',
		default: 'undefined',
		description: 'Hint for presets to show or hide a close affordance.'
	},
	{
		name: 'duration',
		type: 'number',
		default: '0',
		description: 'Auto-dismiss delay in milliseconds. Set to 0 to disable auto-dismiss.'
	},
	{
		name: 'factory',
		type: '(props: ToastBondProps) => ToastBond',
		default: 'undefined',
		description: 'Optional factory to supply a custom bond instance.'
	},
	{
		name: 'onclose',
		type: '((event: Event) => void) | undefined',
		default: 'undefined',
		description: 'Native close event handler for the rendered element.'
	},
	{
		name: 'onopenchange',
		type: 'StateChangeCallback<boolean, ToastBond> | undefined',
		default: 'undefined',
		description:
			'Called after a real open-state transition commits; close reasons are included when available.'
	},
	{
		name: 'open',
		type: 'boolean',
		default: 'true',
		description: 'Controls visibility. Bindable.'
	},
	renderPropsRow
];

export const toastTitleProps: PropDefinition[] = [
	{
		name: 'onclick',
		type: '((ev: MouseEvent) => void) | undefined',
		default: 'undefined',
		description:
			'Additional click handler. Call ev.preventDefault() to suppress the built-in close behavior.'
	},
	renderPropsRow
];

export const toastDescriptionProps: PropDefinition[] = [renderPropsRow];

export const toastCloseProps: PropDefinition[] = [
	{
		name: 'onclick',
		type: '((event: MouseEvent) => void) | undefined',
		default: 'undefined',
		description: 'Native click event.'
	},
	{
		name: 'onkeydown',
		type: '((event: KeyboardEvent) => void) | undefined',
		default: 'undefined',
		description: 'Native keydown event.'
	},
	renderPropsRow
];
