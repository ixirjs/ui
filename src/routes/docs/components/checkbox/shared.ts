const presetCode = `
import { setPreset } from '@ixirjs/ui/preset';

const preset = setPreset({
  checkbox: () => ({
    class: 'h-5 w-5 rounded-sm border border-border bg-input cursor-pointer transition-colors',
  }),
  'checkbox.checkmark': () => ({
    class: 'flex items-center justify-center text-accent'
  }),
  'checkbox.indeterminate': () => ({
    class: 'flex items-center justify-center scale-50 bg-current rounded-[inherit]'
  })
});`.trim();

const accessibilityFeatures = [
	'Uses role="checkbox" with aria-checked for correct screen reader semantics',
	'Supports aria-checked="mixed" for the indeterminate state',
	'Wraps a hidden native <input type="checkbox"> for form compatibility',
	'Click and keyboard (Space) support for toggling',
	'Associates with a <label> via id/for for an enlarged click target',
	'Disabled state prevents interaction and can be read by assistive technologies'
];

const useCases = [
	{
		title: 'Terms & Conditions',
		description:
			'Require users to explicitly agree to terms of service or privacy policies before submitting a form.'
	},
	{
		title: 'Multi-select Filters',
		description:
			'Allow users to filter content by selecting one or more categories, tags, or attributes simultaneously.'
	},
	{
		title: 'Preference Settings',
		description:
			'Let users configure notification preferences, feature toggles, or subscription options independently.'
	},
	{
		title: 'Bulk Selection',
		description:
			'Enable selecting multiple rows in a table for bulk actions like delete, export, or status update.'
	},
	{
		title: 'Todo Lists',
		description:
			'Mark individual tasks as complete or incomplete in a checklist or task management interface.'
	},
	{
		title: 'Indeterminate Parent Selection',
		description:
			'Use the indeterminate state for a parent checkbox that represents a partially-selected group of children.'
	}
];

export const metadata = {
	title: 'Checkbox - Svelte Atoms',
	description: 'Accessible checkbox input for boolean and multi-select form controls.',
	componentTitle: 'Checkbox',
	componentDescription:
		'Custom checkbox with checked, unchecked, and indeterminate states, group binding, and form compatibility.',
	componentType: 'simple' as const,
	status: 'stable' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { Checkbox } from '@ixirjs/ui';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Checkbox' }],
	useCases,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
