import { describe, expect, it } from 'vitest';
import type { ClassValue } from '$svelte-atoms/core/utils';
import { mergeClassesWithPreset } from './classes';
import { extractRestProps } from './props';
import type { ResolvedProps } from './cache';
import {
	legacyMergeClassesWithPreset,
	legacyExtractRestProps
} from './presentation.legacy';

// Memory companion to presentation.bench.ts: measures allocation pressure (transient bytes/op)
// and cn memo retained footprint against the frozen legacy baseline.
// Requires --expose-gc:
//     NODE_OPTIONS=--expose-gc npx vitest run src/lib/components/atom/utils/presentation.memory.spec.ts
// In a normal test run every test skips. Assertions are loose sanity bounds — heap deltas are noisy.

declare const gc: undefined | (() => void);
const hasGc = typeof gc === 'function' && typeof process !== 'undefined';

function heapUsed(): number {
	return process.memoryUsage().heapUsed;
}

// Median transient bytes allocated per op. Forces GC before each batch, runs `ops` iterations,
// reads heap delta before next GC (garbage produced, not retained). Median absorbs mid-batch GCs.
function transientBytesPerOp(fn: () => void, ops = 20_000, batches = 9): number {
	// Warm-up: reach cache steady-state so we measure the per-render path.
	for (let i = 0; i < 5_000; i++) fn();
	const samples: number[] = [];
	for (let b = 0; b < batches; b++) {
		gc!();
		const h0 = heapUsed();
		for (let i = 0; i < ops; i++) fn();
		samples.push((heapUsed() - h0) / ops);
	}
	samples.sort((a, b) => a - b);
	return samples[Math.floor(batches / 2)]!;
}

// Bytes retained by `setup`'s side effects (caches), after double GC settles.
function retainedBytes(setup: () => void): number {
	gc!();
	gc!();
	const h0 = heapUsed();
	setup();
	gc!();
	gc!();
	return heapUsed() - h0;
}

const fmt = (b: number) => `${b.toFixed(1)} B/op`;

// Fixtures — same shapes as presentation.bench.ts.

const ROOT_FALLBACK = 'bg-card border-border flex list-none flex-col rounded-md shadow-sm';
const ARRAY_CLASS: ClassValue = [ROOT_FALLBACK, '$preset', 'my-custom-class p-6'];
const PRESET_CLASS = 'w-full max-w-md rounded-md p-4 accordion-preset';
const VARIANT_CLASS = 'bg-primary text-primary-foreground hover:bg-primary/80';

const VARIED: ClassValue[] = [];
for (let i = 0; i < 1000; i++) VARIED.push([ROOT_FALLBACK, '$preset', `unique-${i} p-${i % 12}`]);

const PRESET_PROPS = {
	class: PRESET_CLASS,
	as: 'ul',
	variants: { variant: {} },
	defaults: { variant: 'primary' },
	'data-preset': 'yes',
	'aria-label': 'from-preset'
};
const VARIANT_PROPS: ResolvedProps = {
	class: [VARIANT_CLASS],
	'data-variant': 'primary',
	'data-state': 'active'
};
const REST_PROPS = { id: 'atom-1', 'data-testid': 'root', onclick: () => {}, tabindex: 0 };
const FALLBACK_PROPS = { animate: () => {}, 'data-fb': '1' };

describe.skipIf(!hasGc)('presentation memory — transient allocations (GC pressure)', () => {
	it('class merge, hot $preset array path (repeated inputs)', () => {
		let li = 0;
		let ki = 0;
		const legacy = transientBytesPerOp(() => {
			li ^= 1; // alternate two inputs so neither engine sits on one literal
			legacyMergeClassesWithPreset(li ? ARRAY_CLASS : VARIED[0]!, PRESET_CLASS, VARIANT_CLASS);
		});
		const kernel = transientBytesPerOp(() => {
			ki ^= 1;
			mergeClassesWithPreset(ki ? ARRAY_CLASS : VARIED[0]!, PRESET_CLASS, VARIANT_CLASS);
		});
		console.info(`[mem] class merge HOT     legacy ${fmt(legacy)}  kernel ${fmt(kernel)}`);
		expect(kernel).toBeLessThan(Math.max(legacy * 3, 600)); // sanity bound, not a race
	});

	it(
		'class merge, varied inputs (cache-miss steady state)',
		{ timeout: 60_000 }, // misses run a real tailwind-merge per op — slow by design
		() => {
			let li = 0;
			let ki = 0;
			const legacy = transientBytesPerOp(() => {
				legacyMergeClassesWithPreset(VARIED[li++ % 1000]!, PRESET_CLASS, VARIANT_CLASS);
			});
			const kernel = transientBytesPerOp(() => {
				mergeClassesWithPreset(VARIED[ki++ % 1000]!, PRESET_CLASS, VARIANT_CLASS);
			});
			console.info(`[mem] class merge VARIED  legacy ${fmt(legacy)}  kernel ${fmt(kernel)}`);
			expect(kernel).toBeLessThan(Math.max(legacy * 3, 6000));
		}
	);

	it('rest-props cascade: extractRestProps vs kernel fold', () => {
		const legacy = transientBytesPerOp(() => {
			legacyExtractRestProps(PRESET_PROPS, VARIANT_PROPS, REST_PROPS, FALLBACK_PROPS);
		});
		const kernel = transientBytesPerOp(() => {
			extractRestProps(PRESET_PROPS, VARIANT_PROPS, REST_PROPS, FALLBACK_PROPS);
		});
		console.info(`[mem] rest-props cascade  legacy ${fmt(legacy)}  kernel ${fmt(kernel)}`);
		expect(kernel).toBeLessThan(Math.max(legacy * 2, 2000));
	});
});

describe.skipIf(!hasGc)('presentation memory — retained footprint', () => {
	it('cn memo at capacity (the kernel-only cache; twMerge cache exists in both)', () => {
		// Fill BOTH generations of the memo (capacity 500 each) with realistic
		// component-shaped keys; the settled heap delta is the memo's footprint.
		const retained = retainedBytes(() => {
			for (let i = 0; i < 1100; i++) {
				mergeClassesWithPreset(
					[ROOT_FALLBACK, '$preset', `retained-${i} px-${i % 16} text-${i % 7}xl`],
					PRESET_CLASS,
					VARIANT_CLASS
				);
			}
		});
		console.info(`[mem] cn memo retained at capacity: ${(retained / 1024).toFixed(1)} KiB`);
		// Generous ceiling: ~1000 entries of joined-class-string keys + values.
		expect(retained).toBeLessThan(3 * 1024 * 1024);
	});
});
