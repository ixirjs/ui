import type { ColorFormat, ChannelDef, ChannelValues } from './types';

// Color spaces valid inside the CSS color() function.
export const COLOR_FN_SPACES: ColorFormat[] = [
	'display-p3',
	'srgb',
	'srgb-linear',
	'a98-rgb',
	'prophoto-rgb',
	'rec2020',
	'xyz-d50',
	'xyz-d65'
];

export interface FormatDef {
	format: ColorFormat;
	// CSS function name, e.g. 'rgb', 'hsl', 'color'
	fn: string;
	// Colorspace argument for color()
	colorspace?: string;
	// Channel separator: ' ' (modern) or ', ' (legacy)
	sep: ' ' | ', ';
	channels: ChannelDef[];
	alpha: boolean;
}

export const FORMAT_DEFS: Record<ColorFormat, FormatDef> = {
	named: {
		format: 'named',
		fn: '',
		sep: ' ',
		channels: [{ id: 'name', label: 'Color name', kind: 'text', min: 0, max: 0 }],
		alpha: false
	},
	hex: {
		format: 'hex',
		fn: '#',
		sep: ' ',
		channels: [
			{ id: 'r', label: 'Red', kind: 'hex', min: 0, max: 255 },
			{ id: 'g', label: 'Green', kind: 'hex', min: 0, max: 255 },
			{ id: 'b', label: 'Blue', kind: 'hex', min: 0, max: 255 }
		],
		alpha: true
	},
	rgb: {
		format: 'rgb',
		fn: 'rgb',
		sep: ', ',
		channels: [
			{ id: 'r', label: 'Red', kind: 'integer', min: 0, max: 255 },
			{ id: 'g', label: 'Green', kind: 'integer', min: 0, max: 255 },
			{ id: 'b', label: 'Blue', kind: 'integer', min: 0, max: 255 }
		],
		alpha: true
	},
	hsl: {
		format: 'hsl',
		fn: 'hsl',
		sep: ' ',
		channels: [
			{ id: 'h', label: 'Hue', kind: 'angle', min: 0, max: 360, precision: 1, suffix: 'deg' },
			{
				id: 's',
				label: 'Saturation',
				kind: 'percent',
				min: 0,
				max: 100,
				precision: 1,
				suffix: '%'
			},
			{ id: 'l', label: 'Lightness', kind: 'percent', min: 0, max: 100, precision: 1, suffix: '%' }
		],
		alpha: true
	},
	hwb: {
		format: 'hwb',
		fn: 'hwb',
		sep: ' ',
		channels: [
			{ id: 'h', label: 'Hue', kind: 'angle', min: 0, max: 360, precision: 1, suffix: 'deg' },
			{ id: 'w', label: 'White', kind: 'percent', min: 0, max: 100, precision: 1, suffix: '%' },
			{ id: 'b', label: 'Blackness', kind: 'percent', min: 0, max: 100, precision: 1, suffix: '%' }
		],
		alpha: true
	},
	lab: {
		format: 'lab',
		fn: 'lab',
		sep: ' ',
		channels: [
			{ id: 'l', label: 'Lightness', kind: 'float', min: 0, max: 100, precision: 2 },
			{ id: 'a', label: 'a', kind: 'float', min: -125, max: 125, precision: 2 },
			{ id: 'b', label: 'b', kind: 'float', min: -125, max: 125, precision: 2 }
		],
		alpha: true
	},
	lch: {
		format: 'lch',
		fn: 'lch',
		sep: ' ',
		channels: [
			{ id: 'l', label: 'Lightness', kind: 'float', min: 0, max: 100, precision: 2 },
			{ id: 'c', label: 'Chroma', kind: 'float', min: 0, max: 150, precision: 2 },
			{ id: 'h', label: 'Hue', kind: 'angle', min: 0, max: 360, precision: 1, suffix: 'deg' }
		],
		alpha: true
	},
	oklab: {
		format: 'oklab',
		fn: 'oklab',
		sep: ' ',
		channels: [
			{ id: 'l', label: 'Lightness', kind: 'float', min: 0, max: 1, precision: 3 },
			{ id: 'a', label: 'a', kind: 'float', min: -0.4, max: 0.4, precision: 3 },
			{ id: 'b', label: 'b', kind: 'float', min: -0.4, max: 0.4, precision: 3 }
		],
		alpha: true
	},
	oklch: {
		format: 'oklch',
		fn: 'oklch',
		sep: ' ',
		channels: [
			{ id: 'l', label: 'Lightness', kind: 'float', min: 0, max: 1, precision: 3 },
			{ id: 'c', label: 'Chroma', kind: 'float', min: 0, max: 0.4, precision: 3 },
			{ id: 'h', label: 'Hue', kind: 'angle', min: 0, max: 360, precision: 1, suffix: 'deg' }
		],
		alpha: true
	},
	'display-p3': {
		format: 'display-p3',
		fn: 'color',
		colorspace: 'display-p3',
		sep: ' ',
		channels: [
			{ id: 'r', label: 'Red', kind: 'float', min: 0, max: 1, precision: 4 },
			{ id: 'g', label: 'Green', kind: 'float', min: 0, max: 1, precision: 4 },
			{ id: 'b', label: 'Blue', kind: 'float', min: 0, max: 1, precision: 4 }
		],
		alpha: true
	},
	srgb: {
		format: 'srgb',
		fn: 'color',
		colorspace: 'srgb',
		sep: ' ',
		channels: [
			{ id: 'r', label: 'Red', kind: 'float', min: 0, max: 1, precision: 4 },
			{ id: 'g', label: 'Green', kind: 'float', min: 0, max: 1, precision: 4 },
			{ id: 'b', label: 'Blue', kind: 'float', min: 0, max: 1, precision: 4 }
		],
		alpha: true
	},
	'srgb-linear': {
		format: 'srgb-linear',
		fn: 'color',
		colorspace: 'srgb-linear',
		sep: ' ',
		channels: [
			{ id: 'r', label: 'Red', kind: 'float', min: 0, max: 1, precision: 4 },
			{ id: 'g', label: 'Green', kind: 'float', min: 0, max: 1, precision: 4 },
			{ id: 'b', label: 'Blue', kind: 'float', min: 0, max: 1, precision: 4 }
		],
		alpha: true
	},
	'a98-rgb': {
		format: 'a98-rgb',
		fn: 'color',
		colorspace: 'a98-rgb',
		sep: ' ',
		channels: [
			{ id: 'r', label: 'Red', kind: 'float', min: 0, max: 1, precision: 4 },
			{ id: 'g', label: 'Green', kind: 'float', min: 0, max: 1, precision: 4 },
			{ id: 'b', label: 'Blue', kind: 'float', min: 0, max: 1, precision: 4 }
		],
		alpha: true
	},
	'prophoto-rgb': {
		format: 'prophoto-rgb',
		fn: 'color',
		colorspace: 'prophoto-rgb',
		sep: ' ',
		channels: [
			{ id: 'r', label: 'Red', kind: 'float', min: 0, max: 1, precision: 4 },
			{ id: 'g', label: 'Green', kind: 'float', min: 0, max: 1, precision: 4 },
			{ id: 'b', label: 'Blue', kind: 'float', min: 0, max: 1, precision: 4 }
		],
		alpha: true
	},
	rec2020: {
		format: 'rec2020',
		fn: 'color',
		colorspace: 'rec2020',
		sep: ' ',
		channels: [
			{ id: 'r', label: 'Red', kind: 'float', min: 0, max: 1, precision: 4 },
			{ id: 'g', label: 'Green', kind: 'float', min: 0, max: 1, precision: 4 },
			{ id: 'b', label: 'Blue', kind: 'float', min: 0, max: 1, precision: 4 }
		],
		alpha: true
	},
	'xyz-d50': {
		format: 'xyz-d50',
		fn: 'color',
		colorspace: 'xyz-d50',
		sep: ' ',
		channels: [
			{ id: 'x', label: 'X', kind: 'float', min: -0.5, max: 1.5, precision: 4 },
			{ id: 'y', label: 'Y', kind: 'float', min: -0.5, max: 1.5, precision: 4 },
			{ id: 'z', label: 'Z', kind: 'float', min: -0.5, max: 1.5, precision: 4 }
		],
		alpha: true
	},
	'xyz-d65': {
		format: 'xyz-d65',
		fn: 'color',
		colorspace: 'xyz-d65',
		sep: ' ',
		channels: [
			{ id: 'x', label: 'X', kind: 'float', min: -0.5, max: 1.5, precision: 4 },
			{ id: 'y', label: 'Y', kind: 'float', min: -0.5, max: 1.5, precision: 4 },
			{ id: 'z', label: 'Z', kind: 'float', min: -0.5, max: 1.5, precision: 4 }
		],
		alpha: true
	}
};

/** Parse a CSS color string into its format, channel values, and alpha. */
export function parseColor(
	raw: string
): { format: ColorFormat; channels: ChannelValues; alpha: number | undefined } | undefined {
	const s = raw.trim();
	if (!s) return undefined;

	// Named color — single all-letters word (red, cornflowerblue, transparent)
	if (/^[a-zA-Z]+$/.test(s)) {
		return { format: 'named', channels: { name: s }, alpha: undefined };
	}

	// Hex 6 or 8
	const hex8 = s.match(/^#([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})([0-9a-fA-F]{2})?$/);
	if (hex8) {
		return {
			format: 'hex',
			channels: { r: hex8[1]!.toUpperCase(), g: hex8[2]!.toUpperCase(), b: hex8[3]!.toUpperCase() },
			alpha: hex8[4] ? parseInt(hex8[4], 16) / 255 : undefined
		};
	}
	// Short hex 3 or 4
	const hex3 = s.match(/^#([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])([0-9a-fA-F])?$/);
	if (hex3) {
		return {
			format: 'hex',
			channels: {
				r: (hex3[1]! + hex3[1]!).toUpperCase(),
				g: (hex3[2]! + hex3[2]!).toUpperCase(),
				b: (hex3[3]! + hex3[3]!).toUpperCase()
			},
			alpha: hex3[4] ? parseInt(hex3[4] + hex3[4], 16) / 255 : undefined
		};
	}

	// Functional
	const fnM = s.match(/^([a-z-]+)\((.+)\)$/i);
	if (!fnM) return undefined;

	// Both capture groups are required by the regex above, so they're present when fnM matched.
	const fn = fnM[1]!.toLowerCase();
	const body = fnM[2]!;

	// color(colorspace …)
	if (fn === 'color') {
		const spaceIdx = body.search(/\s/);
		const cs = (spaceIdx > 0 ? body.slice(0, spaceIdx) : body).toLowerCase() as ColorFormat;
		if (!(cs in FORMAT_DEFS)) return undefined;
		const rest = spaceIdx > 0 ? body.slice(spaceIdx + 1) : '';
		const vals = parseChannelArgs(rest, true);
		const def = FORMAT_DEFS[cs];
		const channels: ChannelValues = {};
		def.channels.forEach((ch, i) => {
			channels[ch.id] = vals[i];
		});
		return { format: cs, channels, alpha: vals[def.channels.length] as number | undefined };
	}

	// Named fn
	const fmtEntry = Object.values(FORMAT_DEFS).find((f) => f.fn === fn && !f.colorspace);
	if (!fmtEntry) return undefined;

	const vals = parseChannelArgs(body, false);
	const channels: ChannelValues = {};
	fmtEntry.channels.forEach((ch, i) => {
		channels[ch.id] = vals[i];
	});
	return {
		format: fmtEntry.format,
		channels,
		alpha: vals[fmtEntry.channels.length] as number | undefined
	};
}

function parseChannelArgs(body: string, spaceSep: boolean): Array<number | undefined> {
	const slashIdx = body.lastIndexOf('/');
	let main = body;
	let alphaStr: string | undefined;
	if (slashIdx !== -1) {
		main = body.slice(0, slashIdx).trim();
		alphaStr = body.slice(slashIdx + 1).trim();
	}

	const tokens = main
		.split(spaceSep ? /\s+/ : /[\s,]+/)
		.map((t) => t.trim())
		.filter(Boolean)
		.map(parseChannelValue);

	if (alphaStr !== undefined) tokens.push(parseChannelValue(alphaStr));
	return tokens;
}

function parseChannelValue(t: string): number | undefined {
	if (t.toLowerCase() === 'none') return undefined;
	if (t.endsWith('%')) return parseFloat(t);
	const n = parseFloat(t.replace(/deg|grad|rad|turn$/i, ''));
	return isNaN(n) ? undefined : n;
}

/** Build a CSS color string from a format, channel values, and alpha. */
export function buildColor(
	format: ColorFormat,
	channels: ChannelValues,
	alpha: number | undefined
): string {
	const def = FORMAT_DEFS[format];
	if (!def) return '';

	if (format === 'named') {
		return String(channels['name'] ?? '');
	}

	if (format === 'hex') {
		const r = (channels['r'] as string | undefined) ?? '00';
		const g = (channels['g'] as string | undefined) ?? '00';
		const b = (channels['b'] as string | undefined) ?? '00';
		const a =
			alpha !== undefined
				? Math.round(alpha * 255)
						.toString(16)
						.padStart(2, '0')
				: '';
		return `#${r}${g}${b}${a}`;
	}

	const vals = def.channels.map((ch) => {
		const v = channels[ch.id];
		if (v === undefined) return 'none';
		const precision = ch.precision ?? 0;
		const num =
			precision > 0
				? (typeof v === 'number' ? v : parseFloat(String(v))).toFixed(precision)
				: String(Math.round(typeof v === 'number' ? v : parseFloat(String(v))));
		return ch.suffix ? num + ch.suffix : num;
	});

	const alphaStr = alpha !== undefined ? ` / ${alpha.toFixed(2)}` : '';

	if (def.colorspace) {
		return `color(${def.colorspace} ${vals.join(' ')}${alphaStr})`;
	}

	const sep = def.sep;
	// Legacy rgb/hsl with commas — put alpha inside as rgba/hsla
	if (sep === ', ' && alpha !== undefined) {
		vals.push(alpha.toFixed(2));
		return `${def.fn}(${vals.join(sep)})`;
	}

	return `${def.fn}(${vals.join(sep)}${alphaStr})`;
}

/** Detect the color format of a raw CSS string, if parseable. */
export function detectFormat(raw: string): ColorFormat | undefined {
	return parseColor(raw)?.format;
}
