import { renderPropsRow, type PropDefinition } from '$docs/types';

export const sidebarContentProps: PropDefinition[] = [renderPropsRow];

export const sidebarRootProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Snippet<[SidebarSnippetProps]>',
		default: 'undefined',
		description: 'Content of this part.'
	},
	{
		name: 'class',
		type: 'string',
		default: 'undefined',
		description: 'Additional classes, merged after the preset so they win.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'false',
		description: 'Disables the sidebar from being opened or closed.'
	},
	{
		name: 'factory',
		type: '(props: SidebarBondProps<Record<string, unknown>>) => SidebarBondBase',
		default: 'undefined',
		description: 'Custom factory for creating the sidebar bond instance.'
	},
	{
		name: 'onopenchange',
		type: 'StateChangeCallback<boolean, SidebarBondBase> | undefined',
		default: 'undefined',
		description: 'Called after a real open-state transition commits.'
	},
	{
		name: 'open',
		type: 'boolean',
		default: 'false',
		description: 'Whether the sidebar panel is currently open. Bindable for two-way control.'
	},
	{
		name: 'overlay',
		type: 'boolean',
		default: 'undefined',
		description:
			'Render as a portal-owned modal surface instead of an in-flow rail. Structural — read once at mount, not toggled at runtime.'
	},
	{
		name: 'portal',
		type: 'string | PortalBondBase<PortalBondProps>',
		default: 'undefined',
		description: 'Portal target when `overlay` is set; defaults through explicit → ambient → root.'
	},
	{
		name: 'width',
		type: 'string | number',
		default: 'undefined',
		description:
			'Width of the sidebar panel. Accepts CSS values (e.g., "320px", "20rem") or numeric pixel values.'
	},
	{
		name: 'z-index',
		type: 'number | ((layerValue: number) => number)',
		default: 'undefined',
		description:
			'Stacking elevation for the sidebar surface. Takes a named layer rather than a raw number so overlays stay ordered.'
	}
];
