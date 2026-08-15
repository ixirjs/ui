import { renderPropsRow, type PropDefinition } from '$docs/types';

export const iconProps: PropDefinition[] = [
	{
		name: 'src',
		type: 'Src',
		default: 'undefined',
		description:
			'Icon component to render. No icon set is bundled — pass one from any library, or supply an SVG as children instead.'
	},
	renderPropsRow
];
