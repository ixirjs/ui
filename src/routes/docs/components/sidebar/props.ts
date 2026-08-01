export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const sidebarRootProps: PropDefinition[] = [
	{
		name: 'open',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Whether the sidebar panel is currently open. Bindable for two-way control.'
	},
	{
		name: 'onopenchange',
		type: 'StateChangeCallback<boolean, SidebarBond> | undefined',
		default: 'undefined',
		description: 'Called after a real open-state transition commits.'
	},
	{
		name: 'disabled',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Disables the sidebar from being opened or closed.'
	},
	{
		name: 'width',
		type: 'string | number | undefined',
		default: 'undefined',
		description:
			'Width of the sidebar panel. Accepts CSS values (e.g., "320px", "20rem") or numeric pixel values.'
	},
	{
		name: 'factory',
		type: 'Factory<SidebarBond> | undefined',
		default: 'undefined',
		description: 'Custom factory for creating the sidebar bond instance.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];

export const sidebarContentProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Snippet | undefined',
		default: 'undefined',
		description: 'Content to render inside the sidebar panel.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description:
			'All HTML element props are supported. See [Atom Props](/docs/components/atom#props) for the complete list of inherited properties.'
	}
];
