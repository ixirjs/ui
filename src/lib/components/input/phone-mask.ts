import type { PhoneSpan, PhoneSpanType } from '$ixirjs/ui/components/input/types';

export type PhoneMaskToken =
	| { type: 'digit'; optional: boolean; slotIndex: number }
	| { type: 'lit'; char: string; optional: boolean };

export const PHONE_SEGMENT_COLORS: Record<string, string> = {
	country: 'var(--input-hl-accent, var(--foreground))',
	area: 'var(--foreground)',
	prefix: 'var(--input-hl-secondary, var(--foreground))',
	line: 'var(--foreground)',
	other: 'var(--foreground)'
};

export function parsePhoneFormat(format: string): PhoneMaskToken[] {
	const tokens: PhoneMaskToken[] = [];
	let i = 0;
	let slotIndex = 0;

	while (i < format.length) {
		if (format[i] === '[' && format[i + 1] === '#' && format[i + 2] === ']') {
			tokens.push({ type: 'digit', optional: true, slotIndex: slotIndex++ });
			i += 3;
		} else if (format[i] === '#') {
			tokens.push({ type: 'digit', optional: false, slotIndex: slotIndex++ });
			i++;
		} else {
			tokens.push({ type: 'lit', char: format[i]!, optional: false });
			i++;
		}
	}

	for (let j = 0; j < tokens.length; j++) {
		const token = tokens[j]!;
		if (token.type !== 'lit') continue;
		token.optional = nearestDigitOptional(tokens, j, -1) && nearestDigitOptional(tokens, j, 1);
	}

	return tokens;
}

export function phoneMaskMaxDigits(tokens: readonly PhoneMaskToken[]): number {
	return tokens.filter((token) => token.type === 'digit').length;
}

export function buildPhoneMasked(
	tokens: readonly PhoneMaskToken[],
	digits: string,
	empty = '_'
): string {
	let out = '';
	const anyOptionalFilled = hasFilledOptionalDigit(tokens, digits);

	for (const token of tokens) {
		if (token.type === 'digit') {
			const digit = digits[token.slotIndex];
			if (digit !== undefined) out += digit;
			else if (!token.optional) out += empty;
		} else if (!token.optional || anyOptionalFilled) {
			out += token.char;
		}
	}

	return out;
}

export function nextPhoneCursorPos(tokens: readonly PhoneMaskToken[], digits: string): number {
	const anyOptionalFilled = hasFilledOptionalDigit(tokens, digits);
	let pos = 0;

	for (const token of tokens) {
		if (token.type === 'digit') {
			const filled = digits[token.slotIndex] !== undefined;
			if (token.optional && !filled && !anyOptionalFilled) continue;
			if (!filled) return pos;
			pos++;
		} else {
			const willRender = !token.optional || anyOptionalFilled;
			if (willRender) pos++;
		}
	}

	return pos;
}

export function phoneDigitSlotKinds(
	tokens: readonly PhoneMaskToken[],
	segments: Record<string, number> | undefined
): string[] {
	const kinds: string[] = [];

	if (segments) {
		for (const [kind, count] of Object.entries(segments)) {
			for (let i = 0; i < count; i++) kinds.push(kind);
		}
	}

	while (kinds.length < phoneMaskMaxDigits(tokens)) kinds.push('other');
	return kinds;
}

export function phoneOverlaySpans(options: {
	tokens: readonly PhoneMaskToken[];
	value: string;
	digitSlotKind: readonly string[];
	segments: Record<string, number> | undefined;
}): PhoneSpan[] {
	const { tokens, value, digitSlotKind, segments } = options;
	const spans: PhoneSpan[] = [];
	const anyOptionalFilled = hasFilledOptionalDigit(tokens, value);

	for (const token of tokens) {
		if (token.type === 'digit') {
			const filled = value[token.slotIndex] !== undefined;
			if (!filled && token.optional) continue;
			const text = filled ? value[token.slotIndex]! : '_';
			const kind = (digitSlotKind[token.slotIndex] ?? 'other') as PhoneSpanType;
			const type: PhoneSpanType = filled ? kind : 'empty';
			const style = filled
				? segments
					? `color: ${PHONE_SEGMENT_COLORS[kind] ?? PHONE_SEGMENT_COLORS['other']}`
					: 'color: var(--foreground)'
				: 'color: color-mix(in oklch, var(--muted-foreground) 40%, transparent)';
			spans.push({ text, class: '', style, type });
			continue;
		}

		if (token.optional && !anyOptionalFilled) continue;
		spans.push({ text: token.char, class: 'text-muted-foreground', type: 'lit' });
	}

	return mergeAdjacentPhoneSpans(spans);
}

export function deletePhoneDigitsFromCursor(
	tokens: readonly PhoneMaskToken[],
	value: string,
	cursor: number
): string {
	let charPos = 0;
	const anyOptionalFilled = hasFilledOptionalDigit(tokens, value);

	for (const token of tokens) {
		if (token.type === 'digit') {
			const filled = value[token.slotIndex] !== undefined;
			if (!filled && token.optional) continue;
			if (charPos >= cursor) return value.slice(0, token.slotIndex);
			charPos++;
			continue;
		}

		const willRender = !token.optional || anyOptionalFilled;
		if (willRender) charPos++;
	}

	return value;
}

function nearestDigitOptional(
	tokens: readonly PhoneMaskToken[],
	start: number,
	step: 1 | -1
): boolean {
	for (let i = start + step; i >= 0 && i < tokens.length; i += step) {
		const token = tokens[i]!;
		if (token.type === 'digit') return token.optional;
	}
	return false;
}

function hasFilledOptionalDigit(tokens: readonly PhoneMaskToken[], digits: string): boolean {
	return tokens.some(
		(token) => token.type === 'digit' && token.optional && digits[token.slotIndex] !== undefined
	);
}

function mergeAdjacentPhoneSpans(spans: readonly PhoneSpan[]): PhoneSpan[] {
	return spans.reduce<PhoneSpan[]>((acc, span) => {
		const last = acc[acc.length - 1];
		if (last && last.type === span.type) {
			last.text += span.text;
			return acc;
		}
		return [...acc, { ...span }];
	}, []);
}
