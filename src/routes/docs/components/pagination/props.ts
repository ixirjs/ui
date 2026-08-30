import { renderPropsRow, type PropDefinition } from '$docs/types';

export const paginationRootProps: PropDefinition[] = [
	{
		name: 'disabled',
		type: 'boolean',
		default: 'undefined',
		description: 'Disables the control: it stops responding and is removed from the tab order.'
	},
	{
		name: 'factory',
		type: '(props: PaginationStateProps) => PaginationBond',
		default: 'undefined',
		description: 'Replaces the Bond constructor, so a family can be extended or fused.'
	},
	{
		name: 'label',
		type: 'string',
		default: 'undefined',
		description: 'Accessible name for the navigation landmark.'
	},
	{
		name: 'page',
		type: 'number',
		default: 'undefined',
		description: 'Bindable 1-based current page. Previous/Next commit through it.'
	},
	{
		name: 'pageSize',
		type: 'number | undefined',
		default: 'undefined',
		description: 'Items per page. Defaults to 10.'
	},
	{
		name: 'total',
		type: 'number | undefined',
		default: 'undefined',
		description:
			'Total item count across all pages. Omit — or pass `undefined` — for an unknown-length source, and `hasNext` stays true. Explicitly `| undefined` because under `exactOptionalPropertyTypes` a bare `total?: number` rejects `total={maybeCount}`, which is the shape an async-loaded count always has.'
	},
	renderPropsRow
];

export const paginationPreviousProps: PropDefinition[] = [renderPropsRow];

export const paginationNextProps: PropDefinition[] = [renderPropsRow];
