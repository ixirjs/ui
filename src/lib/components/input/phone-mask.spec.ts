import { describe, expect, it } from 'vitest';
import {
	buildPhoneMasked,
	deletePhoneDigitsFromCursor,
	nextPhoneCursorPos,
	parsePhoneFormat,
	phoneDigitSlotKinds,
	phoneMaskMaxDigits,
	phoneOverlaySpans
} from '$ixirjs/ui/components/input/phone-mask';

describe('phone mask helpers', () => {
	it('parses required and optional digit slots and renders optional literals after optional input', () => {
		const tokens = parsePhoneFormat('#[#]-[#]#');

		expect(phoneMaskMaxDigits(tokens)).toBe(4);
		expect(buildPhoneMasked(tokens, '1')).toBe('1_');
		expect(buildPhoneMasked(tokens, '12')).toBe('12-_');
		expect(buildPhoneMasked(tokens, '1234')).toBe('12-34');
		expect(nextPhoneCursorPos(tokens, '12')).toBe(3);
	});

	it('maps digit slots to configured segment kinds and defaults the rest to other', () => {
		const tokens = parsePhoneFormat('+# (###) ##');

		expect(phoneDigitSlotKinds(tokens, { country: 1, area: 3 })).toEqual([
			'country',
			'area',
			'area',
			'area',
			'other',
			'other'
		]);
	});

	it('builds merged overlay spans with typed digit groups and literals', () => {
		const tokens = parsePhoneFormat('+# (###) ###-####');
		const digitSlotKind = phoneDigitSlotKinds(tokens, {
			country: 1,
			area: 3,
			prefix: 3,
			line: 4
		});

		const spans = phoneOverlaySpans({
			tokens,
			value: '15551234567',
			digitSlotKind,
			segments: { country: 1, area: 3, prefix: 3, line: 4 }
		});

		expect(spans.map((span) => ({ text: span.text, type: span.type }))).toEqual([
			{ text: '+', type: 'lit' },
			{ text: '1', type: 'country' },
			{ text: ' (', type: 'lit' },
			{ text: '555', type: 'area' },
			{ text: ') ', type: 'lit' },
			{ text: '123', type: 'prefix' },
			{ text: '-', type: 'lit' },
			{ text: '4567', type: 'line' }
		]);
	});

	it('deletes from the digit slot rendered at or after the cursor', () => {
		const tokens = parsePhoneFormat('##-##');

		expect(deletePhoneDigitsFromCursor(tokens, '1234', 3)).toBe('12');
		expect(deletePhoneDigitsFromCursor(tokens, '1234', 99)).toBe('1234');
	});
});
