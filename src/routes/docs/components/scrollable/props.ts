import { renderPropsRow, type PropDefinition } from '$docs/types';

export const scrollableRootProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'ScrollableChildren',
		default: 'undefined',
		description: 'Content of this part.'
	},
	{
		name: 'clientHeight',
		type: 'number',
		default: '0',
		description: 'Visible height of the scrollable container in pixels. Read-only via binding.'
	},
	{
		name: 'clientWidth',
		type: 'number',
		default: '0',
		description: 'Visible width of the scrollable container in pixels. Read-only via binding.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'false',
		description: 'Disables the scrollbar interaction when true.'
	},
	{
		name: 'factory',
		type: 'Factory<ScrollableBond>',
		default: 'undefined',
		description: 'Custom factory for creating the scrollable bond instance.'
	},
	{
		name: 'open',
		type: 'boolean',
		default: 'false',
		description: 'Controls whether the scrollbar is visible. Bindable for external control.'
	},
	{
		name: 'preset',
		type: 'PresetKey',
		default: 'undefined',
		description: 'Preset key to resolve presentation from. Defaults to this part’s own key.'
	},
	{
		name: 'scrollHeight',
		type: 'number',
		default: '0',
		description: 'Total scrollable height of the content area in pixels. Read-only via binding.'
	},
	{
		name: 'scrollWidth',
		type: 'number',
		default: '0',
		description: 'Total scrollable width of the content area in pixels. Read-only via binding.'
	},
	{
		name: 'scrollX',
		type: 'number',
		default: '0',
		description: 'Current horizontal scroll position in pixels. Bindable for programmatic control.'
	},
	{
		name: 'scrollY',
		type: 'number',
		default: '0',
		description: 'Current vertical scroll position in pixels. Bindable for programmatic control.'
	},
	renderPropsRow
];

export const scrollableContainerProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Snippet<[]>',
		default: 'undefined',
		description: 'Content of this part.'
	},
	{
		name: 'preset',
		type: 'PresetKey',
		default: 'undefined',
		description: 'Preset key to resolve presentation from. Defaults to this part’s own key.'
	},
	renderPropsRow
];

export const scrollableContentProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Snippet<[]>',
		default: 'undefined',
		description: 'Content of this part.'
	},
	{
		name: 'preset',
		type: 'PresetKey',
		default: 'undefined',
		description: 'Preset key to resolve presentation from. Defaults to this part’s own key.'
	},
	renderPropsRow
];

export const scrollableTrackProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Snippet<[]>',
		default: 'undefined',
		description: 'Content of this part.'
	},
	{
		name: 'orientation',
		type: '"horizontal" | "vertical"',
		default: 'undefined',
		description: 'Required. Specifies whether this track controls horizontal or vertical scrolling.'
	},
	{
		name: 'preset',
		type: 'PresetKey',
		default: 'undefined',
		description: 'Preset key to resolve presentation from. Defaults to this part’s own key.'
	},
	renderPropsRow
];

export const scrollableThumbProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Snippet<[]>',
		default: 'undefined',
		description: 'Content of this part.'
	},
	{
		name: 'orientation',
		type: '"horizontal" | "vertical"',
		default: 'undefined',
		description: 'Required. Specifies whether this thumb controls horizontal or vertical scrolling.'
	},
	{
		name: 'preset',
		type: 'PresetKey',
		default: 'undefined',
		description: 'Preset key to resolve presentation from. Defaults to this part’s own key.'
	},
	renderPropsRow
];
