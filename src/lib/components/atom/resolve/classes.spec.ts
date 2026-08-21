import { describe, expect, it } from 'vitest';
import { mergeClassesWithPreset } from './classes';

describe('mergeClassesWithPreset', () => {
	it('inserts preset and variant classes automatically before consumer classes', () => {
		const result = mergeClassesWithPreset('text-sm p-4', 'bg-white p-2', 'font-bold');
		expect(result).toBe('bg-white font-bold text-sm p-4');
	});

	it('injects preset class at $preset placeholder position', () => {
		const result = mergeClassesWithPreset('text-sm $preset rounded', 'bg-white', undefined);
		expect(result).toBe('text-sm bg-white rounded');
	});

	it('appends variant class after preset when using placeholder', () => {
		const result = mergeClassesWithPreset('$preset', 'bg-white', 'font-bold');
		expect(result).toBe('bg-white font-bold');
	});

	it('uses the last $preset occurrence as the injection point and discards earlier sentinels', () => {
		const result = mergeClassesWithPreset('a $preset b $preset c', 'PRESET', undefined);
		expect(result).toBe('a b PRESET c');
	});

	it('includes preset classes when the consumer class is absent', () => {
		const result = mergeClassesWithPreset(undefined, 'bg-white', 'font-bold');
		expect(result).toBe('bg-white font-bold');
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

	it('uses the last exact $preset item as the injection point and discards earlier sentinels', () => {
		const result = mergeClassesWithPreset(['$preset', 'mid', '$preset'], 'PRESET', undefined);
		expect(result).toBe('mid PRESET');
	});

	it('resolves nested component-root sentinels without changing wrapper structure', () => {
		const result = mergeClassesWithPreset(
			[
				'input-root',
				'$preset',
				['checkbox-root', '$preset', ['datagrid-cell-checkbox', '$preset', 'user-class']],
				'relative'
			],
			'datagrid-preset',
			'variant-class'
		);

		expect(result).toBe(
			'input-root checkbox-root datagrid-cell-checkbox datagrid-preset variant-class user-class relative'
		);
	});

	it('automatically inserts preset classes for arrays without a placement token', () => {
		const result = mergeClassesWithPreset(['text-sm', 'font-mono'], 'bg-white', 'font-bold');
		expect(result).toBe('bg-white font-bold text-sm font-mono');
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

describe('mergeClassesWithPreset — the resolved-class cache stays sound under mutation', () => {
	// The cache keys on the array's first entry and validates the rest element-wise. These pin the
	// element-wise part: comparing by array reference would serve a stale string to any caller that
	// reuses one array and edits it, which is exactly what `resolve/variants.ts` warns about.

	it('misses when a reference-stable user array is mutated in place', () => {
		const live = ['cache-mut-a', '$preset', 'text-sm'];
		expect(mergeClassesWithPreset(live, undefined, undefined)).toBe('cache-mut-a text-sm');
		live[2] = 'text-lg';
		expect(mergeClassesWithPreset(live, undefined, undefined)).toBe('cache-mut-a text-lg');
		live.length = 2;
		expect(mergeClassesWithPreset(live, undefined, undefined)).toBe('cache-mut-a');
	});

	it('misses when a reference-stable preset array is mutated in place', () => {
		const preset = ['bg-red-500'];
		const user = ['cache-mut-b', '$preset', ''];
		expect(mergeClassesWithPreset(user, preset, undefined)).toBe('cache-mut-b bg-red-500');
		preset[0] = 'bg-blue-500';
		expect(mergeClassesWithPreset(user, preset, undefined)).toBe('cache-mut-b bg-blue-500');
	});

	it('never stores a nested class array, so an inner edit still re-resolves', () => {
		const nested = ['cache-mut-c', '$preset', ['inner', '$preset', 'x']];
		expect(mergeClassesWithPreset(nested, undefined, undefined)).toBe('cache-mut-c inner x');
		(nested[2] as string[])[0] = 'inner2';
		expect(mergeClassesWithPreset(nested, undefined, undefined)).toBe('cache-mut-c inner2 x');
	});

	it('keeps an empty base class off the cache key', () => {
		// Roughly 25 plans declare `class: ''`. Bucketing them together would make the scan cost more
		// than the merge, so `''` bypasses the cache entirely — it must still resolve correctly.
		expect(mergeClassesWithPreset(['', undefined, '$preset', 'p-2'], 'p-4', undefined)).toBe('p-2');
		expect(mergeClassesWithPreset(['', undefined, '$preset', 'p-6'], 'p-4', undefined)).toBe('p-6');
	});
});
