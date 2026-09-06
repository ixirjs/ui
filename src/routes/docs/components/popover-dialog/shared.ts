const presetCode = `import { setPreset } from '@ixirjs/ui/preset';

const preset = setPreset({
  'popover-dialog': () => ({ class: 'w-full max-w-lg rounded-lg border bg-popover shadow-lg' }),
  'popover-dialog.header': () => ({ class: 'border-b border-border px-6 py-4' }),
  'popover-dialog.body': () => ({ class: 'px-6 py-4' })
});`;

const useCases = [
	{ title: 'Confirmations', description: 'Open a modal confirmation from an in-flow trigger.' },
	{
		title: 'Filter panels',
		description: 'Keep filter controls inside a focus-managed modal surface.'
	},
	{
		title: 'Detail views',
		description: 'Present details without navigating away from the current page.'
	}
];

export const metadata = {
	title: 'PopoverDialog - IXIR UI',
	description: 'A Popover trigger with a portalled Dialog presentation.',
	componentTitle: 'PopoverDialog',
	componentDescription:
		'The canonical popover-dialog profile shares one open state between Popover trigger and Dialog modal parts. Render Content inside Dialog; there is no automatic viewport-dependent positioning mode.',
	summary: 'Popover trigger and focus-managed modal presentation',
	category: 'Overlay' as const,
	componentType: 'compound' as const,
	status: 'beta' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { PopoverDialog } from '@ixirjs/ui';",
	useCases,
	presetCode,
	accessibility: [
		'The trigger carries `aria-haspopup="dialog"` and `aria-expanded`',
		'Modal presentation traps focus and restores the previously focused element on close',
		'Escape closes through the shared overlay stack, innermost first',
		'One open state drives the trigger and its modal surface'
	]
};
