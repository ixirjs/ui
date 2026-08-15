import { renderPropsRow, type PropDefinition } from '$docs/types';

export const dialogProps: PropDefinition[] = [
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'factory',
		type: '(props: DialogBondProps) => DialogBond',
		default: 'undefined',
		description: 'Replaces the Bond constructor, so a family can be extended or fused.'
	},
	{
		name: 'onclick',
		type: '((event: MouseEvent) => void) | undefined',
		default: 'undefined',
		description: 'Native click handler for the rendered dialog element.'
	},
	{
		name: 'onopenchange',
		type: 'StateChangeCallback<boolean, DialogBondBase<DialogBondProps>> | undefined',
		default: 'undefined',
		description: 'Semantic callback; runs after the open state commits.'
	},
	{
		name: 'open',
		type: 'boolean',
		default: 'undefined',
		description: 'Bindable open state.'
	},
	{
		name: 'order',
		type: 'LayerRelation',
		default: 'undefined',
		description: 'Position relative to a named portal elevation anchor.'
	},
	{
		name: 'portal',
		type: 'string | PortalBondBase<PortalBondProps>',
		default: 'undefined',
		description:
			'Portal surface to render into, by id or Bond. Defaults to the ambient portal, then the root portal.'
	},
	{
		name: 'presets',
		type: 'DialogPresets | undefined',
		default: 'undefined',
		description: 'Per-instance presentation overrides for bonded Dialog parts.'
	},
	{
		name: 'type',
		type: '"modal" | "non-modal" | undefined',
		default: 'undefined',
		description:
			'Modal (default) traps focus and blocks the background; non-modal preserves background access.'
	},
	{
		name: 'z-index',
		type: 'ZIndexInput',
		default: 'undefined',
		description:
			'Explicit z-index for the dialog surface. Prefer the semantic layer unless resolving a stacking conflict.'
	},
	renderPropsRow
];

export const dialogContentProps: PropDefinition[] = [renderPropsRow];

export const dialogHeaderProps: PropDefinition[] = [renderPropsRow];

export const dialogBodyProps: PropDefinition[] = [renderPropsRow];

export const dialogFooterProps: PropDefinition[] = [renderPropsRow];

export const dialogTitleProps: PropDefinition[] = [renderPropsRow];

export const dialogDescriptionProps: PropDefinition[] = [renderPropsRow];

export const dialogCloseButtonProps: PropDefinition[] = [
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
