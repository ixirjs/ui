import { renderPropsRow, type PropDefinition } from '$docs/types';

export const popoverRootProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'PopoverChildren',
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
		type: 'Record<string, unknown>',
		default: 'undefined',
		description: 'Extend'
	},
	{
		name: 'offset',
		type: 'number',
		default: 'undefined',
		description: 'Distance in pixels between the virtual cursor anchor and content.'
	},
	{
		name: 'onopenchange',
		type: 'StateChangeCallback<boolean, PopoverBond> | undefined',
		default: 'undefined',
		description:
			'Called after a real open-state transition commits; dismissal events and reasons are included when available.'
	},
	{
		name: 'open',
		type: 'boolean',
		default: 'false',
		description: 'Bindable open state for the menu.'
	},
	{
		name: 'placement',
		type: 'Placement',
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
		type: 'string | PortalBond',
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
		type: 'PopoverPresets | undefined',
		default: 'undefined',
		description: 'Per-instance presentation overrides for bonded Popover parts.'
	}
];

export const popoverOverlayProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'PopoverChildren',
		default: 'undefined',
		description: 'Content of this part.'
	},
	{
		name: 'layer',
		type: 'LayerInput | undefined',
		default: 'undefined',
		description: "Semantic z-index layer for the floating content. Defaults to `'popover'`."
	},
	{
		name: 'order',
		type: 'LayerRelation | undefined',
		default: 'undefined',
		description:
			'Order the content relative to a registered ZLayer anchor — `below` a sticky header registered via `ZLayer.anchor(...)` puts the popover beneath it.'
	},
	{
		name: 'portal',
		type: 'string | PortalBond | undefined',
		default: 'undefined',
		description: 'Portal surface to render the overlay into, by id or Bond.'
	},
	{
		name: 'z-index',
		type: 'ZIndexInput | undefined',
		default: 'undefined',
		description:
			'Explicit z-index for the overlay. Prefer the semantic layer unless resolving a stacking conflict.'
	},
	renderPropsRow
];

export const popoverContentProps: PropDefinition[] = [
	{
		name: 'layer',
		type: 'LayerInput | undefined',
		default: 'undefined',
		description: "Semantic z-index layer for the floating content. Defaults to `'popover'`."
	},
	{
		name: 'maxWidth',
		type: 'AnchorSize',
		default: 'undefined',
		description:
			"Cap the content's width. A CSS length, `'var(--sa-anchor-width)'` to clamp it to never exceed the trigger, or an AnchorSizeFn."
	},
	{
		name: 'minWidth',
		type: 'AnchorSize',
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
		type: 'AnchorSize',
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

export const popoverIndicatorProps: PropDefinition[] = [renderPropsRow];

export const popoverTailProps: PropDefinition[] = [
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

export const popoverTriggerProps: PropDefinition[] = [renderPropsRow];
