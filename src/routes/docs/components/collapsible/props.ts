import { renderPropsRow, type PropDefinition } from '$docs/types';

export const collapsibleRootProps: PropDefinition[] = [
	{
		name: 'data',
		type: 'any',
		default: 'undefined',
		description: 'Arbitrary payload carried on the Bond, returned by lookups and snippet props.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'false',
		description: 'Disable the collapsible, preventing user interaction'
	},
	{
		name: 'factory',
		type: '(props: CollapsibleBondProps) => CollapsibleBond',
		default: 'undefined',
		description: 'Replaces the Bond constructor, so a family can be extended or fused.'
	},
	{
		name: 'onopenchange',
		type: '(value: boolean, context: StateChangeContext<CollapsibleBond, Event>) => void',
		default: 'undefined',
		description:
			'Semantic callback; runs after the open state commits, not when the toggle is clicked.'
	},
	{
		name: 'open',
		type: 'boolean',
		default: 'false',
		description: 'Whether the collapsible is open. Supports two-way binding with bind:open.'
	},
	{
		name: 'value',
		type: 'string',
		default: 'undefined',
		description: 'Current value of the control.'
	},
	renderPropsRow
];

export const collapsibleHeaderProps: PropDefinition[] = [renderPropsRow];

export const collapsibleBodyProps: PropDefinition[] = [renderPropsRow];

export const collapsibleIndicatorProps: PropDefinition[] = [renderPropsRow];
