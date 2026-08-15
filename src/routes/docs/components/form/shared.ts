const presetCode = `
import { setPreset } from '@ixirjs/ui/preset';

const preset = setPreset({
  form: () => ({
    class: 'flex flex-col gap-4'
  }),
  'field.root': () => ({
    class: 'flex flex-col gap-1'
  }),
  'field.label': () => ({
    class: 'text-sm font-medium'
  }),
  'field.control': () => ({
    class: 'w-full'
	}),
	'field.helper-text': () => ({
		class: 'text-xs text-muted-foreground mt-1'
  })
});
`.trim();

const accessibilityFeatures = [
	'Proper semantic form and input elements',
	'Label association with for/id attributes',
	'Keyboard navigation and focus management',
	'Built-in validation with aria-invalid and aria-errormessage',
	'Field.Error renders only while invalid, so aria-errormessage always points at live text',
	'Error messages announced as role="alert" when they appear',
	'Support for required and optional fields'
];

const useCases = [
	{
		title: 'Registration & Login Forms',
		description:
			'Build accessible sign-up and login forms with field-level validation, error messages, and label associations.'
	},
	{
		title: 'Settings & Profile Editing',
		description:
			'Create user settings panels where fields map to specific data keys, with schema-based validation and error feedback.'
	},
	{
		title: 'Multi-Step Forms',
		description:
			'Compose individual Field groups across steps in a wizard flow, with shared validation logic and state management.'
	},
	{
		title: 'Contact & Feedback Forms',
		description:
			'Collect user input like name, email, and message in a structured form with required field validation and submission handling.'
	},
	{
		title: 'Data Entry Interfaces',
		description:
			'Build admin or internal forms for creating or editing records (products, users, configurations) with rich input types and schema validation.'
	},
	{
		title: 'Checkout & Payment Forms',
		description:
			'Compose complex checkout flows with address, payment, and billing fields using consistent layout and field error display.'
	}
];

const componentsSummary = [
	{
		name: 'Form.Root',
		description:
			'Root form element. Holds the schema or validation source, aggregates values and errors across its fields, and validates on submit. Renders as a semantic <form> element.'
	},
	{
		name: 'Field.Root',
		description:
			'Container for a single form field. Manages the field bond (name, value, validation), and provides field context to all field atoms.'
	},
	{
		name: 'Field.Label',
		description:
			'Accessible label element automatically associated with the field control via the field bond. Exposes { field } in snippet children.'
	},
	{
		name: 'Field.Control',
		description:
			'Wrapper component that connects an input element (Input.Root, Textarea.Root, etc.) to the field bond for value and validation state wiring. Exposes { field } in snippet children.'
	},
	{
		name: 'Field.HelperText',
		description:
			'Helper text rendered under the field control for guidance, hints, or supporting context. Exposes { field } in snippet children.'
	},
	{
		name: 'Field.Error',
		description:
			'Validation message for the field, rendered only while it is invalid. Defaults to the first error message; exposes { field } in snippet children for full control.'
	}
];

export const metadata = {
	title: 'Form & Field - Svelte Atoms',
	description:
		'Composable form and field components for building accessible, validated forms. Works with any Standard Schema library — Zod, Valibot, ArkType — with no adapter.',
	componentTitle: 'Form & Field',
	componentDescription:
		'Composable form components with Standard Schema validation, configurable trigger modes, and support for externally owned form state.',
	summary: 'Form layout with field validation and accessible error display',
	category: 'Form' as const,
	componentType: 'compound' as const,
	status: 'beta' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { Form, Field } from '@ixirjs/ui';",
	useCases,
	componentsSummary,
	presetCode,
	accessibility: accessibilityFeatures
};
