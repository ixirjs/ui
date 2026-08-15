import { renderPropsRow, type PropDefinition } from '$docs/types';

export const portalSurfaceProps: PropDefinition[] = [
	{
		name: 'band',
		type: 'LayerInput | undefined',
		default: 'undefined',
		description:
			'Named elevation band the surface sits in. Bands order relative to each other, not by raw z-index.'
	},
	{
		name: 'children',
		type: 'PortalSurfaceChildren',
		default: 'undefined',
		description: 'Content of this part.'
	},
	{
		name: 'order',
		type: 'LayerRelation | undefined',
		default: 'undefined',
		description: 'Orders this surface against a registered layer anchor (sticky-under).'
	},
	{
		name: 'owner',
		type: 'OverlayView | undefined',
		default: 'undefined',
		description: 'Overlay that owns this surface, so dismissal and focus restore route back to it.'
	},
	{
		name: 'portal',
		type: 'PortalTarget | undefined',
		default: 'undefined',
		description:
			'Target surface, by id or Bond. Omitted, it resolves to the ambient portal and then the root portal.'
	},
	{
		name: 'z-index',
		type: 'ZIndexInput | undefined',
		default: 'undefined',
		description:
			'Explicit z-index, escaping the band ordering. Prefer `band` unless you have a specific stacking conflict.'
	},
	renderPropsRow
];

export const portalOuterProps: PropDefinition[] = [
	{
		name: 'factory',
		type: '(props: PortalBondProps) => PortalBondBase<PortalBondProps>',
		default: 'undefined',
		description: 'Replaces the Bond constructor, so a family can be extended or fused.'
	},
	{
		name: 'id',
		type: 'string',
		default: 'undefined',
		description: 'DOM id. Falls back to one derived from the Bond’s identity seed.'
	},
	renderPropsRow
];

export const activePortalProps: PropDefinition[] = [
	{
		name: 'children',
		type: 'Snippet<[]>',
		default: 'undefined',
		description: 'Content of this part.'
	},
	{
		name: 'portal',
		type: 'PortalTarget | undefined',
		default: 'undefined',
		description:
			'Target surface, by id or Bond. Omitted, it resolves to the ambient portal and then the root portal.'
	}
];

export const teleportProps: PropDefinition[] = [
	{
		name: 'portal',
		type: 'PortalTarget | undefined',
		default: 'undefined',
		description:
			'Target surface, by id or Bond. Omitted, it resolves to the ambient portal and then the root portal.'
	},
	renderPropsRow
];
