const presetCode = `
import { setPreset } from '@svelte-atoms/core';

const preset = setPreset({
  input: () => ({
    class: 'flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50'
  })
});
`.trim();

const accessibilityFeatures = [
	'Proper label association with for/id',
	'Error message linking with aria-describedby',
	'Keyboard accessible',
	'Focus visible indicators',
	'Screen reader friendly'
];

const specializedControls = [
	{
		name: 'Text',
		preset: 'input.text',
		description:
			'`type="text"` specific control. Use instead of `Input.Control` for plain text — `Input.Control` will eventually route to specialized controls by type.',
		code: `<Input.Root>\n  <Input.TextControl bind:value={text} placeholder="Enter text..." />\n</Input.Root>`,
		props: '`value` (bindable), `placeholder`, `disabled`, `readonly`, `onchange`, `oninput`.'
	},
	{
		name: 'File',
		preset: 'input.file',
		description:
			'File picker with `accept` filter, `multiple` support, and a customisable `triggerContent` snippet.',
		code: `<Input.Root>\n  <Input.FileControl bind:files accept="image/*" multiple />\n</Input.Root>`,
		props:
			'`files` (bindable `File[]`), `accept`, `multiple`, `disabled`, `placeholder`, `triggerContent` snippet, `onchange`.'
	},
	{
		name: 'Number',
		preset: 'input.number',
		description: 'Numeric input with increment/decrement buttons.',
		code: `<Input.Root>\n  <Input.NumberControl bind:number={value} step={1} />\n</Input.Root>`,
		props:
			'`number` (bindable), `step` (default 1), `min`, `max`, `disabled`, `placeholder`, `decrementContent`, `incrementContent`, `onchange`.'
	},
	{
		name: 'URL',
		preset: 'input.url',
		description:
			'URL input with syntax-highlighted overlay. Segments colored via `--input-hl-*` CSS variables.',
		code: `<Input.Root>\n  <Input.UrlControl bind:value={url} placeholder="https://example.com" />\n</Input.Root>`,
		props: '`value` (bindable), `placeholder`, `disabled`, `readonly`, `onchange`, `oninput`.'
	},
	{
		name: 'Email',
		preset: 'input.email',
		description:
			'Email input with local/`@`/domain/TLD segment coloring via `--input-hl-*` CSS variables.',
		code: `<Input.Root>\n  <Input.EmailControl bind:value={email} />\n</Input.Root>`,
		props: '`value` (bindable), `placeholder`, `disabled`, `readonly`, `onchange`, `oninput`.'
	},
	{
		name: 'Location',
		preset: 'input.location',
		description:
			'Coordinate input (lat, lng). Displays in decimal degrees (`"dd"`) or DMS (`"dms"`) format with an optional geolocation button.',
		code: `<Input.Root>\n  <Input.LocationControl bind:value={coords} format="dd" />\n</Input.Root>`,
		props:
			'`value` (bindable `"lat, lng"` string), `lat` (bindable), `lng` (bindable), `format` (`"dd"` | `"dms"`), `precision` (default 6), `locate` (geolocation button, default true), `disabled`, `readonly`, `onchange`, `oninput`.'
	},
	{
		name: 'Phone',
		preset: 'input.phone',
		description:
			'Phone number input with mask format. `#` = required digit, `[#]` = optional. Supports per-segment color mapping.',
		code: `<Input.Root>\n  <Input.PhoneControl bind:value={phone} format="(###) ###-####" />\n</Input.Root>`,
		props:
			'`value` (bindable digits only), `format` (mask string), `segments` (color map), `placeholder`, `disabled`, `readonly`.'
	},
	{
		name: 'Time',
		preset: 'input.time',
		description:
			'Segment-based time picker. Supports 12/24h format, optional seconds, and rollover between segments.',
		code: `<Input.Root>\n  <Input.TimeControl bind:value={time} hourFormat={12} />\n</Input.Root>`,
		props:
			'`value` (bindable HH:MM or HH:MM:SS), `hourFormat` (`12` | `24`, default 24), `seconds` (boolean), `date` (bindable Date).'
	},
	{
		name: 'DateTime',
		preset: 'input.datetime',
		description: 'Combined date + time picker with full rollover cascade across all segments.',
		code: `<Input.Root>\n  <Input.DateTimeControl bind:value={datetime} />\n</Input.Root>`,
		props:
			'`value` (bindable ISO datetime string), `hourFormat` (`12` | `24`), `seconds` (boolean), `date` (bindable Date).'
	},
	{
		name: 'Date',
		preset: 'input.date',
		description: 'Date-only segment picker (YYYY-MM-DD).',
		code: `<Input.Root>\n  <Input.DateControl bind:value={date} />\n</Input.Root>`,
		props: '`value` (bindable YYYY-MM-DD string), `date` (bindable Date).'
	},
	{
		name: 'OTP',
		preset: 'input.otp',
		description:
			'One-time password input with individual character slots, keyboard navigation, and paste support.',
		code: `<Input.Root>\n  <Input.OtpControl length={6} type="numeric" oncomplete={(code) => verify(code)} />\n</Input.Root>`,
		props:
			'`value` (bindable string), `length` (default 6), `type` (`"numeric"` | `"alpha"` | `"alphanumeric"`), `oncomplete` (fires once when fully filled).'
	},
	{
		name: 'Color',
		preset: 'input.color',
		description:
			'Segmented CSS color editor. Auto-detects format from the value string. Use `Input.ColorSwatch` alongside it to show a live preview.',
		code: `<Input.Root>\n  <Input.ColorSwatch />\n  <Input.ColorControl bind:value={color} />\n</Input.Root>`,
		props:
			'`value` (bindable CSS color string), `format` (override auto-detect), `alpha` (force-show alpha segment), `oninput` (every change), `onchange` (on commit/blur).\n\nSupported formats: `named`, `hex`, `rgb`, `rgba`, `hsl`, `hsla`, `hwb`, `lab`, `lch`, `oklab`, `oklch`, `display-p3`, `srgb`, `srgb-linear`, `a98-rgb`, `prophoto-rgb`, `rec2020`, `xyz-d50`, `xyz-d65`.'
	},
	{
		name: 'Currency',
		preset: 'input.currency',
		description:
			'Locale-aware currency input with `Intl.NumberFormat` formatted overlay. Arrow Up/Down to increment, Shift×10, Alt×0.1. Blur clamps to `min`/`max`.',
		code: `<Input.Root>\n  <Input.CurrencyControl currency="USD" locale="en-US" min={0} />\n</Input.Root>`,
		props:
			'`value` (bindable string), `amount` (bindable number), `currency` (ISO 4217, default `"USD"`), `locale` (default `"en-US"`), `precision` (default 2), `min`, `max`, `step`.'
	}
];

const useCases = [
	{
		title: 'Form Data Entry',
		description:
			'Collect user information in registration forms, profile updates, and data entry workflows.'
	},
	{
		title: 'Search Functionality',
		description:
			'Enable search queries in navigation bars, data tables, and content discovery interfaces.'
	},
	{
		title: 'Authentication',
		description: 'Capture credentials like email, username, and password in login and signup flows.'
	},
	{
		title: 'Settings and Configuration',
		description: 'Allow users to customize application settings, preferences, and account details.'
	},
	{
		title: 'Numeric Input',
		description:
			'Gather numeric data like quantities, prices, ages, or measurements with validation.'
	},
	{
		title: 'File Uploads',
		description: 'Enable file selection and upload functionality with the file input type variant.'
	}
];

const componentsSummary = [
	{
		name: 'Input.Root',
		description:
			'Container component that provides the input structure and manages child components.'
	},
	{
		name: 'Input.Control',
		description: 'The actual input element that accepts user text entry with various type options.'
	},
	{
		name: 'Input.Icon',
		description: 'Optional icon or prefix/suffix element displayed alongside the input control.'
	},
	{
		name: 'Input.Placeholder',
		description: 'Animated placeholder label that floats above the input when focused or filled.'
	},
	{
		name: 'Input.TextControl',
		description:
			'Plain text input, type="text" specific — the dedicated counterpart of Input.Control for text routing.'
	},
	{
		name: 'Input.FileControl',
		description:
			'File picker with customisable trigger content, accept filter, and multiple selection support.'
	},
	{
		name: 'Input.NumberControl',
		description: 'Numeric input with increment/decrement buttons and step control.'
	},
	{
		name: 'Input.UrlControl',
		description: 'URL input with protocol prefix display and focus/blur overlay.'
	},
	{
		name: 'Input.EmailControl',
		description: 'Email input with local/domain/TLD segment coloring.'
	},
	{
		name: 'Input.LocationControl',
		description:
			'Coordinate input (lat, lng) in decimal degrees or DMS format with optional geolocation button.'
	},
	{
		name: 'Input.PhoneControl',
		description:
			'Phone number input with mask format, optional digit slots, and segment color mapping.'
	},
	{
		name: 'Input.TimeControl',
		description: 'Segment-based time picker with 12/24h format and optional seconds.'
	},
	{
		name: 'Input.DateTimeControl',
		description: 'Segment-based date + time picker (datetime-local), optional seconds.'
	},
	{
		name: 'Input.DateControl',
		description: 'Segment-based date-only picker (YYYY-MM-DD).'
	},
	{
		name: 'Input.OtpControl',
		description:
			'One-time password slots with keyboard navigation, paste support, and oncomplete callback.'
	},
	{
		name: 'Input.ColorControl',
		description:
			'Segmented CSS color editor with auto-detection across 17 formats including named colors.'
	},
	{
		name: 'Input.ColorSwatch',
		description:
			'Color swatch preview inside an Input.Root, reads the current color value from the Bond.'
	},
	{
		name: 'Input.CurrencyControl',
		description:
			'Locale-aware currency input with Intl.NumberFormat overlay, min/max/step, and arrow key increment.'
	}
];

export const metadata = {
	title: 'Input - Svelte Atoms',
	description:
		'Compound input component for forms and data entry, supporting icons, placeholder, and all HTML input types.',
	componentTitle: 'Input',
	componentDescription:
		'Flexible input component with icons, placeholders, and all HTML input types.',
	componentType: 'compound' as const,
	status: 'stable' as const,
	packageName: '@svelte-atoms/core',
	importCode: "import { Input } from '@svelte-atoms/core';",
	breadcrumbs: [{ label: 'Components', href: '/docs/components' }, { label: 'Input' }],
	useCases,
	componentsSummary,
	examples: {
		preset: presetCode
	},
	accessibility: accessibilityFeatures,
	specializedControls
};
