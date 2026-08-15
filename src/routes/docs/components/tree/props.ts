import { renderPropsRow, type PropDefinition } from '$docs/types';

export const treeRootProps: PropDefinition[] = [
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
		description: 'Whether the tree is disabled'
	},
	{
		name: 'factory',
		type: '(props: DisclosureStateProps) => TreeBondBase',
		default: 'undefined',
		description: 'Replaces the Bond constructor, so a family can be extended or fused.'
	},
	{
		name: 'onopenchange',
		type: 'StateChangeCallback<boolean, TreeBondBase> | undefined',
		default: 'undefined',
		description: 'Called after a real open-state transition commits.'
	},
	{
		name: 'open',
		type: 'boolean',
		default: 'false',
		description: 'Controls whether the tree is expanded (bindable)'
	},
	{
		name: 'presets',
		type: 'TreePresets | undefined',
		default: 'undefined',
		description: 'Per-instance presentation overrides for the Tree Bond.'
	},
	{
		name: 'value',
		type: 'string',
		default: 'undefined',
		description: 'Current value of the control.'
	},
	renderPropsRow
];

export const treeHeaderProps: PropDefinition[] = [
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'onpointerdown',
		type: '(PointerEventHandler<ElementType<E> & Element> & ((event: PointerEvent) => void)) | undefined',
		default: 'undefined',
		description: 'Pointer down event handler.'
	},
	{
		name: 'open',
		type: 'boolean',
		default: 'undefined',
		description:
			"Mirrors the owning tree node's open state, for parts that style themselves from it."
	},
	renderPropsRow
];

export const treeBodyProps: PropDefinition[] = [
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'open',
		type: 'boolean',
		default: 'undefined',
		description:
			"Mirrors the owning tree node's open state, for parts that style themselves from it."
	},
	renderPropsRow
];

export const treeIndicatorProps: PropDefinition[] = [
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'open',
		type: 'boolean',
		default: 'undefined',
		description:
			"Mirrors the owning tree node's open state, for parts that style themselves from it."
	},
	renderPropsRow
];
