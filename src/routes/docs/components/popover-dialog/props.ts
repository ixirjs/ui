import { renderPropsRow, type PropDefinition } from '$docs/types';

export const popoverDialogRootProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Slot',
		default: 'undefined',
		description: 'Content of this part.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'onopenchange',
		type: 'StateChangeCallback<boolean, PopoverDialogBond> | undefined',
		default: 'undefined',
		description: 'Semantic callback; runs after the open state commits.'
	},
	{
		name: 'open',
		type: 'boolean',
		default: 'undefined',
		description: 'Bindable open state, shared by the popover and dialog presentations.'
	},
	{
		name: 'presets',
		type: 'PopoverDialogPresets | undefined',
		default: 'undefined',
		description: 'Per-instance presentation overrides for the fused Popover/Dialog parts.'
	}
];

export const popoverDialogContentProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Slot',
		default: 'undefined',
		description: 'Content of this part.'
	},
	{
		name: 'onclick',
		type: '((event: MouseEvent) => void) | undefined',
		default: 'undefined',
		description: 'Native click handler for the rendered dialog element.'
	},
	{
		name: 'portal',
		type: 'PortalTarget',
		default: 'undefined',
		description: 'Portal surface to render the content into, by id or Bond.'
	},
	{
		name: 'type',
		type: '"modal" | "non-modal"',
		default: 'undefined',
		description: 'Whether the dialog presentation traps focus and blocks the page behind it.'
	},
	{
		name: 'z-index',
		type: 'ZIndexInput',
		default: 'undefined',
		description: 'Explicit z-index for the content surface.'
	},
	renderPropsRow
];
