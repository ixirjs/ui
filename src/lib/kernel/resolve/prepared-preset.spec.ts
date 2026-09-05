import { describe, expect, it, vi } from 'vitest';
import { getPreset, installPreset } from '$ixirjs/ui/preset/context.svelte';
import type { PresetEntry, PresetEntryRecord } from '$ixirjs/ui/preset';
import { preparePresetEntry, resolvePreset } from './preset';

describe('prepared preset composition', () => {
	it('prepares without invoking factories and preserves factory-before-getter ordering', () => {
		const trace: string[] = [];
		let value = 'before';
		const record = {
			get class() {
				trace.push('class');
				return value;
			}
		};
		installPreset({
			'card.header': () => {
				trace.push('left');
				return record;
			}
		});
		installPreset({
			'card.header': () => {
				trace.push('right');
				value = 'after';
				return { class: 'right' };
			}
		});
		const entry = getPreset('card.header')!;
		const prepared = preparePresetEntry(entry)!;
		expect(trace).toEqual([]);
		expect(preparePresetEntry(entry)).toBe(prepared);
		const expected = resolvePreset(entry({ bond: undefined }));
		const originalTrace = [...trace];
		trace.length = 0;
		value = 'before';
		const actual = prepared.resolve({ bond: undefined });
		expect(actual).toEqual(expected);
		expect(trace).toEqual(originalTrace);
		expect(trace.slice(0, 2)).toEqual(['left', 'right']);
		expect(actual).not.toBe(prepared.resolve({ bond: undefined }));
		expect(Object.isFrozen(actual)).toBe(false);
	});

	it('preserves nested rich merge grouping, null motion, aliases and mutable input', () => {
		const exit = () => ({ duration: 20 });
		const a: PresetEntryRecord = {
			class: ['a', '$preset'],
			attrs: { title: 'a' },
			motion: null,
			variants: { tone: { hot: { class: 'hot', motion: null } } }
		};
		const b: PresetEntryRecord = {
			class: 'b',
			attrs: { role: 'button' },
			motion: { exit },
			variants: { tone: { hot: { motion: { exit } } } },
			defaults: { tone: 'hot' },
			compounds: [{ tone: 'hot', class: 'compound' }]
		};
		const c: PresetEntryRecord = { class: 'c', attrs: { title: 'c' }, render: { as: 'section' } };
		for (const record of [a, b, c]) installPreset({ 'card.body': () => record });
		const entry = getPreset('card.body')!;
		const prepared = preparePresetEntry(entry)!;
		for (const title of ['before', 'after']) {
			c.attrs!.title = title;
			expect(prepared.resolve({ bond: undefined })).toEqual(
				resolvePreset(entry({ bond: undefined }))
			);
		}
		expect(prepared.resolve({ bond: undefined })?.motion).toEqual({
			initial: null,
			enter: null,
			exit,
			animate: null
		});
	});

	it('removes outer layer-wrapper freezes without skipping factory calls', () => {
		let calls = 0;
		installPreset({
			'card.title': () => {
				calls++;
				return { class: 'a' };
			}
		});
		installPreset({
			'card.title': () => {
				calls++;
				return { class: 'b' };
			}
		});
		const entry = getPreset('card.title')!;
		const prepared = preparePresetEntry(entry)!;
		for (const n of [100, 200, 400]) {
			const freeze = vi.spyOn(Object, 'freeze');
			let before = 0,
				after = 0;
			calls = 0;
			try {
				for (let i = 0; i < n; i++) resolvePreset(entry({ bond: undefined }));
				before = freeze.mock.calls.length;
				freeze.mockClear();
				for (let i = 0; i < n; i++) prepared.resolve({ bond: undefined });
				after = freeze.mock.calls.length;
			} finally {
				freeze.mockRestore();
			}
			expect(before).toBe(2 * n);
			expect(after).toBe(0);
			expect(calls).toBe(4 * n);
		}
	});

	it('keeps ordinary factories opaque and supports empty results from either side', () => {
		const plain = () => ({ class: 'plain' });
		expect(preparePresetEntry(plain)).toBeUndefined();
		let left: PresetEntryRecord | undefined;
		let right: PresetEntryRecord | undefined = { class: 'right' };
		installPreset({ 'card.footer': (() => left) as PresetEntry });
		installPreset({ 'card.footer': (() => right) as PresetEntry });
		const entry = getPreset('card.footer')!;
		const prepared = preparePresetEntry(entry)!;
		expect(prepared.resolve({ bond: undefined })).toBe(right);
		left = { class: 'left' };
		right = undefined;
		expect(prepared.resolve({ bond: undefined })).toBe(left);
		left = undefined;
		expect(prepared.resolve({ bond: undefined })).toBeUndefined();
	});
});
