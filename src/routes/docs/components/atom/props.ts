export interface PropDefinition {
	name: string;
	type: string;
	default: string;
	description: string;
}

export const htmlAtomProps: PropDefinition[] = [
	{
		name: 'bond',
		type: 'Bond | undefined',
		default: 'undefined',
		description: 'Optional Bond context for dynamic presets and component coordination'
	},
	{
		name: 'base',
		type: 'B | undefined',
		default: 'undefined',
		description: 'Base'
	},
	{
		name: 'preset',
		type: 'PresetModuleName | (string & {}) | undefined',
		default: "''",
		description: 'Preset'
	},
	{
		name: 'variants',
		type: 'Variants | undefined',
		default: 'undefined',
		description:
			'Variant definition or function to resolve variants\n- VariantDefinition: Static variant config with base, variants, compoundVariants, defaultVariants\n- Function: Dynamic function that receives Bond and props, returns props'
	}
];
