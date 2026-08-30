import { renderPropsRow, type PropDefinition } from '$docs/types';

export const stackRootProps: PropDefinition[] = [
	{
		name: 'factory',
		type: 'Factory<StackBond>',
		default: 'built-in',
		description: 'Custom factory for creating the StackBond instance.'
	},
	{
		name: 'onvaluechange',
		type: 'StateChangeCallback<string | undefined, StackBond> | undefined',
		default: 'undefined',
		description: 'Semantic callback; runs after the topmost value commits.'
	},
	{
		name: 'value',
		type: 'string | undefined',
		default: 'undefined',
		description:
			'Bindable. Reflects the id of the topmost (most recently raised) Stack.Item. Updates reactively as z-order changes.'
	},
	renderPropsRow
];

export const stackItemProps: PropDefinition[] = [
	{
		name: 'value',
		type: 'string',
		default: 'undefined',
		description:
			'Unique identifier for this item within the stack. Used by Bond z-order methods such as bringToFront and sendToBack.'
	},
	renderPropsRow
];
