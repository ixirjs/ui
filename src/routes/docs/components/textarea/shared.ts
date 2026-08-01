const presetCode = `
import { setPreset } from '@ixirjs/ui/preset';

const preset = setPreset({
  textarea: () => ({
    class: 'REPLACE_WITH_PRESET_CLASSES'
  })
});
`.trim();

const accessibilityFeatures = [
	'Proper label association',
	'Error message linking',
	'Keyboard accessible',
	'Resize handle visible',
	'Screen reader friendly'
];

const useCases = [
	{
		title: 'Message Composition',
		description:
			'Provide a multi-line text input for composing messages, emails, or comments in chat and communication interfaces.'
	},
	{
		title: 'Form Long-text Fields',
		description:
			'Capture longer user inputs like addresses, bios, descriptions, or feedback in form submissions.'
	},
	{
		title: 'Code or Markdown Editors',
		description:
			'Use as a base for simple code snippet editors or markdown input fields with monospace fonts and resizing control.'
	},
	{
		title: 'Product or Content Descriptions',
		description:
			'Allow authors to enter multi-line product descriptions, blog post excerpts, or content summaries in CMS interfaces.'
	},
	{
		title: 'Support Ticket Forms',
		description:
			'Collect detailed issue descriptions or support requests in help desk and customer service forms.'
	}
];

const componentsSummary = [
	{
		name: 'Textarea.Root',
		description:
			'Wrapper container for the textarea, providing layout context and preset styling for the field group.'
	},
	{
		name: 'Textarea.Control',
		description:
			'The actual textarea input element with full support for value, placeholder, rows, cols, maxlength, and validation attributes.'
	}
];

export const metadata = {
	title: 'Textarea - Svelte Atoms',
	description: 'Multi-line text input component for capturing longer text content in forms.',
	componentTitle: 'Textarea',
	componentDescription:
		'Multi-line text input with character limits, validation, and configurable dimensions.',
	componentType: 'compound' as const,
	status: 'stable' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { Textarea } from '@ixirjs/ui';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Textarea' }],
	useCases,
	componentsSummary,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures
};
