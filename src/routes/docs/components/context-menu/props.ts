import { renderPropsRow, type PropDefinition } from '$docs/types';

export const contextMenuTriggerProps: PropDefinition[] = [
	{
		name: 'oncontextmenu',
		type: '((event: MouseEvent) => void) | undefined',
		default: 'undefined',
		description:
			'Native callback run before opening. Call event.preventDefault() to cancel opening.'
	},
	renderPropsRow
];

export const contextMenuRootProps: PropDefinition[] = [
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
		type: '((props: ContextMenuBondProps) => ContextMenuBond) | undefined',
		default: 'undefined',
		description: 'Advanced factory for a custom context-menu bond.'
	},
	{
		name: 'offset',
		type: 'number',
		default: 'undefined',
		description: 'Distance in pixels between the virtual cursor anchor and content.'
	},
	{
		name: 'onopenchange',
		type: 'StateChangeCallback<boolean, ContextMenuBondBase<PopoverBondProps>> | undefined',
		default: 'undefined',
		description: 'Runs after an open-state transition commits.'
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

export const contextMenuContentProps: PropDefinition[] = [
	{
		name: 'layer',
		type: 'LayerInput | undefined',
		default: 'undefined',
		description: "Semantic z-index layer for the floating content. Defaults to `'popover'`."
	},
	{
		name: 'maxWidth',
		type: 'string | AnchorSizeFn',
		default: 'undefined',
		description:
			"Cap the content's width. A CSS length, `'var(--sa-anchor-width)'` to clamp it to never exceed the trigger, or an AnchorSizeFn."
	},
	{
		name: 'minWidth',
		type: 'string | AnchorSizeFn',
		default: 'undefined',
		description:
			"Floor the content's width. A CSS length, `'var(--sa-anchor-width)'` to match the trigger — right for select/dropdown/combobox menus that align with their trigger — or an AnchorSizeFn."
	},
	{
		name: 'onclickoutside',
		type: '(ev: PointerEvent, atom: PopoverBond) => void',
		default: 'undefined',
		description: 'Called for an outside press; providing it replaces the default close handler.'
	},
	{
		name: 'order',
		type: 'LayerRelation | undefined',
		default: 'undefined',
		description: 'Order the content relative to a registered ZLayer anchor (sticky-under).'
	},
	{
		name: 'overlay',
		type: 'Component<PopoverOverlayProps<"div", SnippetBase | ComponentBase | ExplicitBase>, {}, string>',
		default: 'undefined',
		description: 'Replaces the overlay component the content renders into.'
	},
	{
		name: 'width',
		type: 'string | AnchorSizeFn',
		default: 'undefined',
		description:
			"Fix the content's width. A CSS length, `'var(--sa-anchor-width)'` to match the trigger's measured width exactly, or an AnchorSizeFn computed from the trigger."
	},
	{
		name: 'z-index',
		type: 'ZIndexInput | undefined',
		default: 'undefined',
		description: 'Explicit z-index for the floating content, forwarded to the Overlay.'
	},
	renderPropsRow
];

export const contextMenuTailProps: PropDefinition[] = [
	{
		name: 'padding',
		type: 'number | undefined',
		default: 'undefined',
		description:
			'Minimum distance, in px, between the tail wrapper and the content edge. Defaults to `0`.'
	},
	{
		name: 'size',
		type: 'number | undefined',
		default: 'undefined',
		description:
			"Base thickness of the tail, in px. Drives the whole shape and stays consistent across placements. Defaults to the content's shorter side."
	},
	renderPropsRow
];

export const contextMenuDividerProps: PropDefinition[] = [
	{
		name: 'transparent',
		type: 'boolean',
		default: 'false',
		description: 'Transparent'
	},
	{
		name: 'vertical',
		type: 'boolean',
		default: 'false',
		description: 'Vertical'
	},
	renderPropsRow
];

export const contextMenuGroupProps: PropDefinition[] = [renderPropsRow];

export const contextMenuIndicatorProps: PropDefinition[] = [renderPropsRow];

export const contextMenuItemProps: PropDefinition[] = [
	{
		name: 'animate',
		type: '(this: DropdownMenuItemAtom) => void | (() => void)',
		default: 'undefined',
		description: 'Animation configuration'
	},
	{
		name: 'class',
		type: 'ClassValue | ClassValueFunction | undefined',
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
		type: 'PresetModuleName | FallbackPreset',
		default: 'undefined',
		description: 'Use context-menu.item for a context-menu-specific presentation entry.'
	},
	renderPropsRow
];

export const contextMenuTitleProps: PropDefinition[] = [renderPropsRow];
