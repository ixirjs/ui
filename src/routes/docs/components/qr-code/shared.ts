const useCases = [
	{
		title: 'Device pairing',
		description: 'Encode a short-lived pairing token for a phone to scan.'
	},
	{
		title: 'Links and tickets',
		description: 'Turn a URL or booking reference into a scannable code.'
	},
	{
		title: 'Branded codes',
		description: 'Apply a gradient and centre logo so the code matches the product.'
	}
];

export const metadata = {
	title: 'QrCode - IXIR UI',
	description: 'Render a styled QR code from any string value.',
	componentTitle: 'QrCode',
	componentDescription:
		'Draws a QR code for `value` on a canvas, with the finder shape, dot style, gradient, logo and margin all exposed as props so the code can match a brand without post-processing.',
	summary: 'Styled QR code with custom dots, gradients and logo',
	category: 'Display' as const,
	componentType: 'simple' as const,
	status: 'beta' as const,
	packageName: '@ixirjs/ui',
	importCode: "import { QrCode } from '@ixirjs/ui';",
	useCases,
	accessibility: [
		'Give the element an `aria-label` describing what the code encodes',
		'Always show the encoded value as selectable text nearby — a QR code is unusable to a screen reader',
		'Keep contrast high between dots and background; a low-contrast gradient can defeat scanners'
	]
};
