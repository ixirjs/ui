const presetCode = `import { setPreset } from '@ixirjs/ui/preset';

const preset = setPreset({
  switch: () => ({ class: 'inline-flex h-6 w-11 rounded-full bg-input' }),
  'switch.thumb': () => ({ class: 'size-5 rounded-full bg-background shadow' })
});`;

const useCases = [
	{
		title: 'Settings panels',
		description: 'Toggle a preference that applies immediately, with no save step.'
	},
	{
		title: 'Feature flags',
		description: 'Enable or disable an optional capability in an admin surface.'
	},
	{
		title: 'Form fields',
		description: 'Submit a boolean alongside the rest of a form via `name` and `value`.'
	}
];

export const metadata = {
	title: 'Switch - IXIR UI',
	description: 'Accessible on/off toggle backed by a hidden native input.',
	componentTitle: 'Switch',
	componentDescription:
		'Binary on/off control with a bindable `checked` state, a replaceable thumb, and a hidden native input so it submits inside a form like a checkbox.',
	summary: 'Binary on/off toggle with form submission support',
	category: 'Form' as const,
	componentType: 'simple' as const,
	status: 'beta' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { Switch } from '@ixirjs/ui';",
	useCases,
	presetCode,
	accessibility: [
		'Renders a real `<button>` with `role="switch"` and `aria-checked`',
		'Space and Enter toggle the switch',
		'A hidden native input carries `name`/`value` into form submission',
		'`disabled` sets `aria-disabled` and removes the control from the tab order',
		'Label content is associated with the control, so clicking the label toggles it'
	]
};
