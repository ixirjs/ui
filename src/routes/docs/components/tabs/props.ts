import { renderPropsRow, type PropDefinition } from '$docs/types';

export const tabRootProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Snippet<[{ tab: TabBond; }]>',
		default: 'undefined',
		description: 'Content of this part.'
	},
	{
		name: 'data',
		type: 'unknown',
		default: 'undefined',
		description: 'Arbitrary payload carried on the Bond, returned by lookups and snippet props.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'factory',
		type: 'Factory<TabBond>',
		default: 'undefined',
		description: 'Replaces the Bond constructor, so a family can be extended or fused.'
	},
	{
		name: 'presets',
		type: 'TabPresets | undefined',
		default: 'undefined',
		description: 'Per-instance presentation overrides for the Tab Bond.'
	},
	{
		name: 'value',
		type: 'string',
		default: 'undefined',
		description: 'Current value of the control.'
	}
];

export const tabsRootProps: PropDefinition[] = [
	{
		name: 'factory',
		type: 'Factory<TabsBond>',
		default: 'undefined',
		description: 'Factory'
	},
	{
		name: 'onvaluechange',
		type: 'StateChangeCallback<D | undefined, TabsBond> | undefined',
		default: 'undefined',
		description:
			'Semantic callback fired after the active value commits. Receives `(value, { bond? })`.'
	},
	{
		name: 'presets',
		type: 'TabsPresets | undefined',
		default: 'undefined',
		description: 'Per-instance presentation overrides for the parent Tabs Bond.'
	},
	{
		name: 'value',
		type: 'D',
		default: 'undefined',
		description: 'Active tab value'
	},
	renderPropsRow
];

export const tabHeaderProps: PropDefinition[] = [
	{
		name: 'onclick',
		type: '((event: MouseEvent) => void) | undefined',
		default: 'undefined',
		description: 'Native click callback. Receives only the DOM event.'
	},
	renderPropsRow
];

export const tabBodyProps: PropDefinition[] = [renderPropsRow];

export const tabDescriptionProps: PropDefinition[] = [renderPropsRow];

export const tabsHeaderProps: PropDefinition[] = [renderPropsRow];

export const tabsBodyProps: PropDefinition[] = [renderPropsRow];

export const tabsContentProps: PropDefinition[] = [renderPropsRow];
