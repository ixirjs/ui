export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const tooltipRootProps: PropDefinition[] = [
	{
		name: 'open',
		type: 'boolean',
		default: 'false',
		description: 'Controls the open/closed state of the tooltip. Bindable.'
	},
	{
		name: 'placement',
		type: '"top" | "bottom" | "left" | "right" | "top-start" | "top-end" | "bottom-start" | "bottom-end" | ...',
		default: '"top"',
		description: 'Where the tooltip appears relative to the trigger element.'
	},
	{
		name: 'offset',
		type: 'number',
		default: '0',
		description: 'Distance in pixels between the trigger and the tooltip content.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'false',
		description: 'Disables the tooltip.'
	},
	{
		name: 'placements',
		type: 'Placement[]',
		default: 'undefined',
		description: 'Fallback placements used by floating-ui when the primary placement overflows.'
	}
];

export const tooltipTriggerProps: PropDefinition[] = [
	{
		name: 'base',
		type: 'Component | keyof HTMLElementTagNameMap',
		default: '"button"',
		description: 'The underlying element or component used as the trigger.'
	},
	{
		name: 'children',
		type: 'Snippet',
		default: 'undefined',
		description: 'Content rendered inside the trigger element.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description: 'All HTML element props are forwarded to the trigger element.'
	}
];

export const tooltipContentProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Snippet',
		default: 'undefined',
		description: 'Content rendered inside the tooltip popup.'
	},
	{
		name: 'enter',
		type: '(node: Element) => { duration: number }',
		default: 'undefined',
		description: 'Motion animation callback when the tooltip enters.'
	},
	{
		name: 'exit',
		type: '(node: Element) => { duration: number }',
		default: 'undefined',
		description: 'Motion animation callback when the tooltip exits.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description: 'All HTML element props are forwarded to the content element.'
	}
];
