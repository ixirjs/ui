export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const treeRootProps: PropDefinition[] = [
	{
		name: 'open',
		type: 'boolean',
		default: 'false',
		description: 'Controls whether the tree is expanded (bindable)'
	},
	{
		name: 'onopenchange',
		type: 'StateChangeCallback<boolean, TreeBond> | undefined',
		default: 'undefined',
		description: 'Called after a real open-state transition commits.'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'false',
		description: 'Whether the tree is disabled'
	},
	{
		name: 'class',
		type: 'string',
		default: "''",
		description: 'Additional CSS classes'
	},
	{
		name: 'children',
		type: 'Snippet',
		default: '-',
		description: 'Tree content (Header and Body components)'
	}
];

export const treeHeaderProps: PropDefinition[] = [
	{
		name: 'class',
		type: 'string',
		default: "''",
		description: 'Additional CSS classes'
	},
	{
		name: 'children',
		type: 'Snippet',
		default: '-',
		description: 'Header content (clickable label)'
	},
	{
		name: 'onpointerdown',
		type: 'function',
		default: '-',
		description: 'Pointer down event handler'
	}
];

export const treeBodyProps: PropDefinition[] = [
	{
		name: 'class',
		type: 'string',
		default: "''",
		description: 'Additional CSS classes'
	},
	{
		name: 'children',
		type: 'Snippet',
		default: '-',
		description: 'Body content (nested trees or items)'
	}
];
