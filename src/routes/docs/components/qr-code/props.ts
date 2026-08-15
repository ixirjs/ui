import { renderPropsRow, type PropDefinition } from '$docs/types';

export const qRCodeProps: PropDefinition[] = [
	{
		name: 'dots',
		type: '{ round?: number; scale?: number; } | undefined',
		default: 'undefined',
		description: 'Styling for the data modules: shape, colour and scale.'
	},
	{
		name: 'drawFunction',
		type: '"telegram" | ((canvasContext: any, left: number, top: number, nSize: number, scale: number, round: number, parameters: { isTiming: boolean; isAlignment: boolean; }, otherCells: { top: boolean; left: boolean; right: boolean; bottom: boolean; }) => undefined) | undefined',
		default: 'undefined',
		description: 'Replaces the module-drawing routine entirely, for a fully custom rendering.'
	},
	{
		name: 'finder',
		type: '{ round?: number; } | undefined',
		default: 'undefined',
		description: 'Styling for the three large corner squares a scanner locks onto.'
	},
	{
		name: 'gradient',
		type: '((ctx: any, size: number) => any) | { type: "linear"; direction: "to-right" | "to-bottom"; colorStops: { color: string; stop: number; }[]; } | { type: "round"; colorStops: { color: string; stop: number; }[]; } | undefined',
		default: 'undefined',
		description:
			'Gradient applied across the code instead of a flat colour. Keep contrast high or scanners fail.'
	},
	{
		name: 'logo',
		type: '{ image: string | Buffer; margin?: number; round?: number; scale?: number; } | undefined',
		default: 'undefined',
		description:
			'Image drawn over the centre. Error correction covers a small one; an oversized logo makes the code unreadable.'
	},
	{
		name: 'margin',
		type: '{ color?: string; size?: number; } | undefined',
		default: 'undefined',
		description: 'Quiet-zone size around the code. Scanners need some; zero often fails.'
	},
	{
		name: 'qr',
		type: '{ correctLevel?: number; maskPattern?: number; version?: number; } | undefined',
		default: 'undefined',
		description: 'Encoding options: version, error-correction level and mask.'
	},
	{
		name: 'value',
		type: 'string | undefined',
		default: 'undefined',
		description: 'Current value of the control.'
	},
	renderPropsRow
];
