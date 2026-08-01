export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const toastRootProps: PropDefinition[] = [
	{
		name: 'open',
		type: 'boolean',
		default: 'true',
		description: 'Controls visibility. Bindable.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'false',
		description: 'Disables interaction and prevents the toast from opening.'
	},
	{
		name: 'dismissible',
		type: 'boolean | undefined',
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
		name: 'onopenchange',
		type: 'StateChangeCallback<boolean, ToastBond> | undefined',
		default: 'undefined',
		description:
			'Called after a real open-state transition commits; close reasons are included when available.'
	},
	{
		name: 'factory',
		type: '((props: ToastBondProps) => ToastBond) | undefined',
		default: 'undefined',
		description: 'Optional factory to supply a custom bond instance.'
	}
];

export const toastTitleProps: PropDefinition[] = [];

export const toastDescriptionProps: PropDefinition[] = [];

export const toastCloseProps: PropDefinition[] = [
	{
		name: 'onclick',
		type: '((ev: MouseEvent) => void) | undefined',
		default: 'undefined',
		description:
			'Additional click handler. Call ev.preventDefault() to suppress the built-in close behavior.'
	}
];
