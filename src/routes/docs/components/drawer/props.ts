import { renderPropsRow, type PropDefinition } from '$docs/types';

export const slideoverRootProps: PropDefinition[] = [
	{
		name: 'disabled',
		type: 'boolean',
		default: 'false',
		description: 'Disables the drawer trigger, preventing the drawer from being opened.'
	},
	{
		name: 'factory',
		type: 'Factory<DrawerBond>',
		default: 'undefined',
		description: 'Custom factory function to create a DrawerBond instance with custom logic.'
	},
	{
		name: 'onclose',
		type: '((event: Event) => void) | undefined',
		default: 'undefined',
		description: 'Native close event handler for the rendered dialog element.'
	},
	{
		name: 'onopenchange',
		type: 'StateChangeCallback<boolean, DrawerBond> | undefined',
		default: 'undefined',
		description:
			'Called after a real open-state transition commits; dismissal events and reasons are included when available.'
	},
	{
		name: 'open',
		type: 'boolean',
		default: 'false',
		description: 'Controls whether the drawer is open. Bind this prop for controlled usage.'
	},
	{
		name: 'order',
		type: 'LayerRelation',
		default: 'undefined',
		description: 'Position relative to a named portal elevation anchor.'
	},
	{
		name: 'portal',
		type: 'string | PortalBond',
		default: 'undefined',
		description:
			'Portal surface to render into, by id or Bond. Defaults to the nearest active portal.'
	},
	{
		name: 'position',
		type: '"fixed" | "absolute"',
		default: 'undefined',
		description:
			'CSS positioning for the drawer surface. `fixed` pins it to the viewport, `absolute` to the nearest positioned ancestor.'
	},
	{
		name: 'presets',
		type: 'DrawerPresets | undefined',
		default: 'undefined',
		description: 'Per-instance presentation overrides for bonded Drawer parts.'
	},
	{
		name: 'side',
		type: '"top" | "right" | "bottom" | "left"',
		default: 'undefined',
		description:
			'Which edge of the screen the drawer slides in from. Controls the slide animation direction.'
	},
	{
		name: 'z-index',
		type: 'ZIndexInput',
		default: 'undefined',
		description: 'Explicit z-index for the drawer surface.'
	},
	renderPropsRow
];

export const slideoverContentProps: PropDefinition[] = [renderPropsRow];

export const slideoverHeaderProps: PropDefinition[] = [renderPropsRow];

export const drawerBodyProps: PropDefinition[] = [renderPropsRow];

export const slideoverFooterProps: PropDefinition[] = [renderPropsRow];

export const slideoverTitleProps: PropDefinition[] = [renderPropsRow];

export const slideoverDescriptionProps: PropDefinition[] = [renderPropsRow];

export const slideoverBackdropProps: PropDefinition[] = [renderPropsRow];
