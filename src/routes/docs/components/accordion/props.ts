import { renderPropsRow, type PropDefinition } from '$docs/types';

export const accordionItemRootProps: PropDefinition[] = [
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
		description: 'Disable this accordion item individually'
	},
	{
		name: 'factory',
		type: 'Factory<AccordionItemBond>',
		default: 'undefined',
		description: 'Custom factory for the item bond, enabling advanced behavioral customization'
	},
	{
		name: 'presets',
		type: 'AccordionItemPresets | undefined',
		default: 'undefined',
		description: 'Per-instance presentation overrides for the Accordion item Bond.'
	},
	{
		name: 'value',
		type: 'string',
		default: 'undefined',
		description:
			'Unique identifier for this accordion item. Used to control open state programmatically.'
	},
	renderPropsRow
];

export const accordionItemHeaderProps: PropDefinition[] = [renderPropsRow];

export const accordionItemBodyProps: PropDefinition[] = [renderPropsRow];

export const accordionItemIndicatorProps: PropDefinition[] = [renderPropsRow];

export const accordionRootProps: PropDefinition[] = [
	{
		name: 'collapsible',
		type: 'boolean',
		default: 'false',
		description: 'Allow all items to be collapsed (no forced-open item)'
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
		default: 'false',
		description: 'Disable all accordion items'
	},
	{
		name: 'factory',
		type: 'Factory<AccordionBond>',
		default: 'undefined',
		description: 'Custom factory for the accordion bond, enabling advanced behavioral customization'
	},
	{
		name: 'multiple',
		type: 'boolean',
		default: 'false',
		description: 'Allow multiple accordion items to be open simultaneously'
	},
	{
		name: 'onvaluechange',
		type: 'StateChangeCallback<string | undefined, AccordionBond> | undefined',
		default: 'undefined',
		description: 'Single-mode callback; runs after the selected value commits.'
	},
	{
		name: 'onvalueschange',
		type: 'StateChangeCallback<string[], AccordionBond> | undefined',
		default: 'undefined',
		description: 'Multiple-mode callback; runs after the set of open values commits.'
	},
	{
		name: 'presets',
		type: 'AccordionPresets | undefined',
		default: 'undefined',
		description: 'Per-instance presentation overrides for the Accordion root Bond.'
	},
	{
		name: 'value',
		type: 'string',
		default: 'undefined',
		description: 'The value of the currently open item (controlled single-item mode)'
	},
	{
		name: 'values',
		type: 'string[]',
		default: 'undefined',
		description: 'Array of currently open item values (controlled multiple-item mode)'
	},
	renderPropsRow
];
