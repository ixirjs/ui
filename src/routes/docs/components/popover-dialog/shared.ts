const presetCode = `import { setPreset } from '@ixirjs/ui/preset';

const preset = setPreset({
  'popover-dialog': () => ({ class: 'w-full max-w-lg rounded-lg border bg-popover shadow-lg' }),
  'popover-dialog.header': () => ({ class: 'border-b border-border px-6 py-4' }),
  'popover-dialog.body': () => ({ class: 'px-6 py-4' })
});`;

const useCases = [
	{
		title: 'Responsive menus',
		description: 'Anchored beside the trigger on desktop, full-height sheet on mobile.'
	},
	{
		title: 'Filter panels',
		description: 'A compact popover that needs the whole screen when it is small.'
	},
	{
		title: 'Detail views',
		description: 'Preview in place on a wide layout, focus-trapped modal on a narrow one.'
	}
];

export const metadata = {
	title: 'PopoverDialog - IXIR UI',
	description: 'A popover on wide screens that becomes a modal dialog on small ones.',
	componentTitle: 'PopoverDialog',
	componentDescription:
		'A fused Bond: Popover supplies the trigger and positioning, Dialog supplies the modal parts. One open state drives both, so the same content is an anchored popover on a desktop and a focus-trapping dialog on a phone.',
	summary: 'Popover on desktop, modal dialog on small screens',
	category: 'Overlay' as const,
	componentType: 'compound' as const,
	status: 'beta' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { PopoverDialog } from '@ixirjs/ui';",
	useCases,
	presetCode,
	accessibility: [
		'The trigger carries `aria-haspopup="dialog"` and `aria-expanded` in both modes',
		'The dialog mode traps focus and restores it to the trigger on close',
		'Escape closes through the shared overlay stack, innermost first',
		'One open state drives both presentations, so assistive tech never sees two surfaces'
	]
};
