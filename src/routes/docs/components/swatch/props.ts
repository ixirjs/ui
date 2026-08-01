export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const swatchProps: PropDefinition[] = [
	{
		name: 'color',
		type: 'string',
		default: "''",
		description:
			'Any valid CSS color string. Empty string or missing value shows the checkerboard only.'
	},
	{
		name: 'class',
		type: 'string',
		default: "''",
		description:
			'CSS classes for sizing, border-radius, and additional styles. Size and radius are not set by default.'
	}
];
