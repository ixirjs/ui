import { renderPropsRow, type PropDefinition } from '$docs/types';

export const stepRootProps: PropDefinition[] = [
	{
		name: 'completed',
		type: 'boolean',
		default: 'false',
		description: 'Whether this step is completed'
	},
	{
		name: 'disabled',
		type: 'boolean',
		default: 'false',
		description: 'Whether this step is disabled'
	},
	{
		name: 'factory',
		type: 'Factory<StepBond>',
		default: 'undefined',
		description: 'Custom factory for creating step bond'
	},
	{
		name: 'index',
		type: 'number',
		default: 'required',
		description: 'Step index (0-based) in the stepper sequence'
	},
	{
		name: 'optional',
		type: 'boolean',
		default: 'false',
		description: 'Whether this step is optional'
	},
	renderPropsRow
];

export const stepIndicatorProps: PropDefinition[] = [renderPropsRow];

export const stepHeaderProps: PropDefinition[] = [renderPropsRow];

export const stepTitleProps: PropDefinition[] = [renderPropsRow];

export const stepDescriptionProps: PropDefinition[] = [renderPropsRow];

export const stepBodyProps: PropDefinition[] = [renderPropsRow];

export const stepSeparatorProps: PropDefinition[] = [renderPropsRow];

export const stepContentProps: PropDefinition[] = [renderPropsRow];

export const stepperRootProps: PropDefinition[] = [
	{
		name: 'disabled',
		type: 'boolean',
		default: 'false',
		description: 'Disable the entire stepper'
	},
	{
		name: 'factory',
		type: 'Factory<StepperBond>',
		default: 'undefined',
		description: 'Custom factory for creating stepper bond'
	},
	{
		name: 'linear',
		type: 'boolean',
		default: 'false',
		description: 'Enforce linear progression - users can only navigate to adjacent steps'
	},
	{
		name: 'onstepchange',
		type: 'StateChangeCallback<number, StepperBond> | undefined',
		default: 'undefined',
		description: 'Semantic callback; runs after the active step commits.'
	},
	{
		name: 'orientation',
		type: '"horizontal" | "vertical"',
		default: 'undefined',
		description: 'Layout orientation for the stepper'
	},
	{
		name: 'step',
		type: 'number',
		default: '0',
		description: 'Active step index (0-based). Bindable for two-way sync.'
	},
	renderPropsRow
];

export const stepperHeaderProps: PropDefinition[] = [renderPropsRow];

export const stepperBodyProps: PropDefinition[] = [renderPropsRow];

export const stepperFooterProps: PropDefinition[] = [renderPropsRow];

export const stepperContentProps: PropDefinition[] = [renderPropsRow];
