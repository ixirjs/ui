import { describe, expect, it } from 'vitest';
import { buildColor, detectFormat, parseColor } from '$ixirjs/ui/components/input/color/shared';

describe('color parsing and building', () => {
	it('parses short hex with alpha and builds normalized hex', () => {
		const parsed = parseColor('#0f08');

		expect(parsed).toEqual({
			format: 'hex',
			channels: { r: '00', g: 'FF', b: '00' },
			alpha: 0x88 / 255
		});
		expect(buildColor(parsed!.format, parsed!.channels, parsed!.alpha)).toBe('#00FF0088');
	});

	it('parses legacy rgb channels and alpha', () => {
		const parsed = parseColor('rgb(10, 20, 30, 0.5)');

		expect(parsed).toEqual({
			format: 'rgb',
			channels: { r: 10, g: 20, b: 30 },
			alpha: 0.5
		});
		expect(buildColor(parsed!.format, parsed!.channels, parsed!.alpha)).toBe(
			'rgb(10, 20, 30, 0.50)'
		);
	});

	it('parses modern hsl slash alpha and rebuilds with configured precision', () => {
		const parsed = parseColor('hsl(210 50% 40% / 0.25)');

		expect(parsed).toEqual({
			format: 'hsl',
			channels: { h: 210, s: 50, l: 40 },
			alpha: 0.25
		});
		expect(buildColor(parsed!.format, parsed!.channels, parsed!.alpha)).toBe(
			'hsl(210.0deg 50.0% 40.0% / 0.25)'
		);
	});

	it('detects color-function color spaces', () => {
		const raw = 'color(display-p3 0.1 0.2 0.3 / 0.4)';

		expect(parseColor(raw)).toEqual({
			format: 'display-p3',
			channels: { r: 0.1, g: 0.2, b: 0.3 },
			alpha: 0.4
		});
		expect(detectFormat(raw)).toBe('display-p3');
	});
});
