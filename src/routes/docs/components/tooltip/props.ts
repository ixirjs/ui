import { renderPropsRow, type PropDefinition } from '$docs/types';

export const tooltipTriggerProps: PropDefinition[] = [
	{
		name: 'content',
		type: 'string | Snippet<[TooltipSnippetProps]>',
		default: 'undefined',
		description: 'Tooltip body — a plain string, or a snippet for rich content.'
	},
	{
		name: 'delay',
		type: 'number',
		default: 'undefined',
		description: 'Delay in milliseconds before the tooltip opens on hover.'
	},
	{
		name: 'placement',
		type: '"top" | "right" | "bottom" | "left"',
		default: 'undefined',
		description: 'Preferred side to place the tooltip on, relative to the trigger.'
	},
	renderPropsRow
];

export const tooltipRootProps: PropDefinition[] = [
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
		type: '((props: TooltipBondProps) => TooltipBond) | undefined',
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
		type: 'StateChangeCallback<boolean, TooltipBond> | undefined',
		default: 'undefined',
		description:
			'Called after a real open-state transition commits; pointer and dismissal details are included when available.'
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
		description: 'Per-instance presentation overrides for this family’s compound slots.'
	}
];

export const tooltipContentProps: PropDefinition[] = [
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
