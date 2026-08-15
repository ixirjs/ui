import { renderPropsRow, type PropDefinition } from '$docs/types';

export const dropdownMenuItemProps: PropDefinition[] = [
	{
		name: 'animate',
		type: '(this: DropdownMenuItemAtom) => void | (() => void)',
		default: 'undefined',
		description: 'Animation configuration'
	},
	{
		name: 'class',
		type: 'ClassValue',
		default: 'undefined',
		description: 'Custom CSS class(es) to apply to the dropdown menu item'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the item.'
	},
	{
		name: 'enter',
		type: '(this: DropdownMenuItemAtom) => Partial<TransitionConfig> | void',
		default: 'undefined',
		description: 'Transition function for entering'
	},
	{
		name: 'exit',
		type: '(this: DropdownMenuItemAtom) => Partial<TransitionConfig> | void',
		default: 'undefined',
		description: 'Transition function for exiting'
	},
	{
		name: 'factory',
		type: '() => DropdownMenuItemAtom',
		default: 'undefined',
		description: 'Factory function for advanced custom item Atom creation'
	},
	{
		name: 'id',
		type: 'string',
		default: 'generated id',
		description: 'Stable item identity used by roving focus.'
	},
	{
		name: 'initial',
		type: '(this: DropdownMenuItemAtom) => void | (() => void)',
		default: 'undefined',
		description: 'Initial state configuration'
	},
	{
		name: 'onclick',
		type: '(event: MouseEvent) => void',
		default: 'undefined',
		description: 'Native click callback. Call event.preventDefault() to keep the menu open.'
	},
	{
		name: 'ondestroy',
		type: '(this: DropdownMenuItemAtom) => void',
		default: 'undefined',
		description: 'Function called when element is destroyed'
	},
	{
		name: 'onmount',
		type: '(this: DropdownMenuItemAtom) => void',
		default: 'undefined',
		description: 'Function called when element is mounted'
	},
	{
		name: 'preset',
		type: 'PresetKey',
		default: 'undefined',
		description: 'Use context-menu.item for a context-menu-specific presentation entry.'
	},
	renderPropsRow
];

export const dropdownMenuContentProps: PropDefinition[] = [renderPropsRow];

export const dropdownMenuRootProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Snippet<[{ popover: PopoverBond; }]>',
		default: 'undefined',
		description: 'Children'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'false',
		description: 'Prevents the context-menu trigger from opening the menu.'
	},
	{
		name: 'extend',
		type: '{ [x: string]: unknown; }',
		default: 'undefined',
		description: 'Extend'
	},
	{
		name: 'factory',
		type: '((props: DropdownMenuBondProps) => DropdownMenuBond) | undefined',
		default: 'undefined',
		description: 'Replaces the Bond constructor, so a family can be extended or fused.'
	},
	{
		name: 'offset',
		type: 'number',
		default: 'undefined',
		description: 'Distance in pixels between the virtual cursor anchor and content.'
	},
	{
		name: 'onopenchange',
		type: 'StateChangeCallback<boolean, DropdownMenuBondBase<PopoverBondProps>> | undefined',
		default: 'undefined',
		description:
			'Semantic callback; runs after the open state commits, not when the trigger is clicked.'
	},
	{
		name: 'open',
		type: 'boolean',
		default: 'false',
		description: 'Bindable open state for the menu.'
	},
	{
		name: 'placement',
		type: '"top" | "right" | "bottom" | "left" | "top-start" | "top-end" | "right-start" | "right-end" | "bottom-start" | "bottom-end" | "left-start" | "left-end"',
		default: 'undefined',
		description: 'Preferred Floating UI placement for the menu.'
	},
	{
		name: 'placements',
		type: 'Placement[]',
		default: 'undefined',
		description: 'Ordered fallback placements used when the preferred placement does not fit.'
	},
	{
		name: 'portal',
		type: 'string | PortalBondBase<PortalBondProps>',
		default: 'ambient portal → root.l0',
		description:
			'Portal target selector or PortalBond instance. Resolution is explicit target → ambient portal → root.l0, preserving nested overlay containment.'
	},
	{
		name: 'position',
		type: '"fixed" | "absolute"',
		default: 'undefined',
		description: "CSS positioning strategy for the floating content. Defaults to `'absolute'`."
	},
	{
		name: 'presets',
		type: 'DropdownMenuPresets | undefined',
		default: 'undefined',
		description: 'Per-instance presentation overrides for this family’s compound slots.'
	}
];
