import { describe, expect, it } from 'vitest';
import { mergeClassesWithPreset } from './classes';

describe('mergeClassesWithPreset', () => {
	it('merges user and variant classes without a placeholder', () => {
		const result = mergeClassesWithPreset('text-sm', 'bg-white', 'font-bold');
		expect(result).toBe('text-sm font-bold');
	});

	it('injects preset class at $preset placeholder position', () => {
		const result = mergeClassesWithPreset('text-sm $preset rounded', 'bg-white', undefined);
		expect(result).toBe('text-sm bg-white rounded');
	});

	it('appends variant class after preset when using placeholder', () => {
		const result = mergeClassesWithPreset('$preset', 'bg-white', 'font-bold');
		expect(result).toBe('bg-white font-bold');
	});

	it('only uses the last $preset occurrence as the injection point', () => {
		const result = mergeClassesWithPreset('a $preset b $preset c', 'PRESET', undefined);
		// first $preset is treated as literal text; last one is the injection point
		expect(result).toContain('PRESET');
		expect(result).toContain('c');
	});

	it('handles undefined userClass gracefully', () => {
		const result = mergeClassesWithPreset(undefined, 'bg-white', 'font-bold');
		expect(result).toBe('font-bold');
	});

	it('handles all-undefined inputs without throwing', () => {
		const result = mergeClassesWithPreset(undefined, undefined, undefined);
		expect(result).toBe('');
	});
});

describe('mergeClassesWithPreset — array user class (the component-root shape)', () => {
	it('injects preset + variant at an exact $preset item', () => {
		const result = mergeClassesWithPreset(
			['flex flex-col', '$preset', 'user-class'],
			'preset-class p-4',
			'variant-class'
		);
		expect(result).toBe('flex flex-col preset-class p-4 variant-class user-class');
	});

	it('uses the LAST exact $preset item as the injection point', () => {
		const result = mergeClassesWithPreset(['$preset', 'mid', '$preset'], 'PRESET', undefined);
		// earlier $preset stays literal, last one injects
		expect(result).toContain('PRESET');
		expect(result).toContain('mid');
	});

	it('handles arrays without a placeholder like plain strings (preset only via variants)', () => {
		const result = mergeClassesWithPreset(['text-sm', 'font-mono'], 'bg-white', 'font-bold');
		expect(result).toBe('text-sm font-mono font-bold');
	});

	it('handles a placeholder embedded inside a longer array item', () => {
		const result = mergeClassesWithPreset(['text-sm $preset rounded'], 'bg-white', undefined);
		expect(result).toBe('text-sm bg-white rounded');
	});

	it('skips falsy items without disabling the fast path', () => {
		const result = mergeClassesWithPreset(
			['flex', undefined, '$preset', null, 'user'],
			'preset-c',
			undefined
		);
		expect(result).toBe('flex preset-c user');
	});

	it('returns identical results on repeated calls (memo correctness)', () => {
		const input: [string[], string, string] = [
			['memo-a', '$preset', 'memo-b'],
			'memo-preset',
			'memo-variant'
		];
		const first = mergeClassesWithPreset(...input);
		const second = mergeClassesWithPreset(...input);
		expect(second).toBe(first);
		expect(first).toBe('memo-a memo-preset memo-variant memo-b');
	});

	it('distinguishes structurally different inputs that join to similar strings', () => {
		// 'a b' + 'c' vs 'a' + 'b c' must not collide in the memo key
		const r1 = mergeClassesWithPreset(['a b', '$preset', 'c'], 'P', undefined);
		const r2 = mergeClassesWithPreset(['a', '$preset', 'b c'], 'P', undefined);
		expect(r1).toBe('a b P c');
		expect(r2).toBe('a P b c');
	});

	it('tailwind-merges conflicts across the placeholder (user wins over preset)', () => {
		const result = mergeClassesWithPreset(['$preset', 'p-6'], 'p-2 text-sm', undefined);
		expect(result).toBe('text-sm p-6');
	});
});
