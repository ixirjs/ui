export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const contextMenuRootProps: PropDefinition[] = [
	{
		name: 'open',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Bindable open state for the menu.'
	},
	{
		name: 'disabled',
		type: 'boolean | undefined',
		default: 'false',
		description: 'Prevents the context-menu trigger from opening the menu.'
	},
	{
		name: 'placement',
		type: 'Placement | undefined',
		default: "'bottom-start'",
		description: 'Preferred Floating UI placement for the menu.'
	},
	{
		name: 'placements',
		type: 'Placement[] | undefined',
		default: 'undefined',
		description: 'Ordered fallback placements used when the preferred placement does not fit.'
	},
	{
		name: 'offset',
		type: 'number | undefined',
		default: 'undefined',
		description: 'Distance in pixels between the virtual cursor anchor and content.'
	},
	{
		name: 'position',
		type: "'fixed' | 'absolute' | undefined",
		default: "'absolute'",
		description: 'CSS positioning strategy for floating content.'
	},
	{
		name: 'portal',
		type: 'string | PortalBond | undefined',
		default: 'ambient portal → root.l0',
		description:
			'Portal target selector or PortalBond instance. Resolution is explicit target → ambient portal → root.l0, preserving nested overlay containment.'
	},
	{
		name: 'onopenchange',
		type: 'StateChangeCallback<boolean, ContextMenuBond> | undefined',
		default: 'undefined',
		description: 'Runs after an open-state transition commits.'
	},
	{
		name: 'factory',
		type: '((props: ContextMenuBondProps) => ContextMenuBond) | undefined',
		default: 'undefined',
		description: 'Advanced factory for a custom context-menu bond.'
	}
];

export const contextMenuTriggerProps: PropDefinition[] = [
	{
		name: 'preset',
		type: 'PresetKey | undefined',
		default: 'undefined',
		description:
			'Optional presentation override; the trigger resolves the context-menu trigger preset.'
	},
	{
		name: 'oncontextmenu',
		type: '((event: MouseEvent) => void) | undefined',
		default: 'undefined',
		description:
			'Native callback run before opening. Call event.preventDefault() to cancel opening.'
	},
	{
		name: 'onclick',
		type: '((event: MouseEvent) => void) | undefined',
		default: 'undefined',
		description: 'Native click callback. Clicks do not open the context menu.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description: 'Other supported HTML atom props, including class and children.'
	}
];

export const contextMenuContentProps: PropDefinition[] = [
	{
		name: 'preset',
		type: 'PresetKey | undefined',
		default: 'undefined',
		description: 'Use context-menu.content for a context-menu-specific presentation entry.'
	},
	{
		name: 'minWidth',
		type: 'AnchorSize | undefined',
		default: "''",
		description: 'Minimum width. Context menus do not inherit the trigger width by default.'
	},
	{
		name: 'width / maxWidth',
		type: 'AnchorSize | undefined',
		default: 'undefined',
		description:
			'Fixed or maximum content width, as a CSS length or function of trigger measurements.'
	},
	{
		name: 'onclickoutside',
		type: '((event: PointerEvent, bond: PopoverBond) => void) | undefined',
		default: 'undefined',
		description: 'Called for an outside press; providing it replaces the default close handler.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description: 'Other supported HTML atom props, including class, children, and as.'
	}
];

export const contextMenuItemProps: PropDefinition[] = [
	{
		name: 'id',
		type: 'string | undefined',
		default: 'generated id',
		description: 'Stable item identity used by roving focus.'
	},
	{
		name: 'preset',
		type: 'PresetKey | undefined',
		default: 'undefined',
		description: 'Use context-menu.item for a context-menu-specific presentation entry.'
	},
	{
		name: 'disabled',
		type: 'boolean | undefined',
		default: 'undefined',
		description: 'Disables the item.'
	},
	{
		name: 'onclick',
		type: '((event: MouseEvent) => void) | undefined',
		default: 'undefined',
		description: 'Native click callback. Call event.preventDefault() to keep the menu open.'
	},
	{
		name: '...atomProps',
		type: 'HtmlAtomProps',
		default: '-',
		description: 'Other supported HTML atom props, including class and children.'
	}
];
