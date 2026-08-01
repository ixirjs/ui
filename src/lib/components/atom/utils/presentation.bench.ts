import { bench, describe } from 'vitest';
import { type ClassValue } from '$svelte-atoms/core/utils';
import { mergeClassesWithPreset } from './classes';
import { extractRestProps } from './props';
import type { ResolvedProps } from './cache';
import { legacyMergeClassesWithPreset, legacyExtractRestProps } from './presentation.legacy';

// Fixtures — real component-root shape: class={['<fallback>', '$preset', klass]}
// with a class-only preset + resolved variants (see accordion-root.svelte).

const ROOT_FALLBACK = 'bg-card border-border flex list-none flex-col rounded-md shadow-sm';
const USER_CLASS = 'my-custom-class p-6';
const ARRAY_CLASS: ClassValue = [ROOT_FALLBACK, '$preset', USER_CLASS];
const PRESET_CLASS = 'w-full max-w-md rounded-md p-4 accordion-preset';
const VARIANT_CLASS = 'bg-primary text-primary-foreground hover:bg-primary/80';

// Worst case for the memo: every call sees a distinct user class (cache misses).
const VARIED: ClassValue[] = [];
for (let i = 0; i < 1000; i++) VARIED.push([ROOT_FALLBACK, '$preset', `unique-${i} p-${i % 12}`]);
let variedIdx = 0;

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

// Benchmarks

describe('class merge — component-root $preset array (hot path, repeated inputs)', () => {
	bench('legacy: double twMerge, no memo', () => {
		legacyMergeClassesWithPreset(ARRAY_CLASS, PRESET_CLASS, VARIANT_CLASS);
	});
	bench('kernel: single twMerge + LRU memo', () => {
		mergeClassesWithPreset(ARRAY_CLASS, PRESET_CLASS, VARIANT_CLASS);
	});
});

describe('class merge — varied inputs (memo miss worst case)', () => {
	bench('legacy', () => {
		legacyMergeClassesWithPreset(VARIED[variedIdx++ % 1000]!, PRESET_CLASS, VARIANT_CLASS);
	});
	bench('kernel', () => {
		mergeClassesWithPreset(VARIED[variedIdx++ % 1000]!, PRESET_CLASS, VARIANT_CLASS);
	});
});

describe('class merge — plain string user class, no placeholder', () => {
	bench('legacy', () => {
		legacyMergeClassesWithPreset(USER_CLASS, PRESET_CLASS, VARIANT_CLASS);
	});
	bench('kernel', () => {
		mergeClassesWithPreset(USER_CLASS, PRESET_CLASS, VARIANT_CLASS);
	});
});

describe('rest-props cascade — fallback → preset → variants → rest', () => {
	bench('legacy extractRestProps', () => {
		legacyExtractRestProps(PRESET_PROPS, VARIANT_PROPS, REST_PROPS, FALLBACK_PROPS);
	});
	bench('kernel fold (attrs axis)', () => {
		extractRestProps(PRESET_PROPS, VARIANT_PROPS, REST_PROPS, FALLBACK_PROPS);
	});
});
