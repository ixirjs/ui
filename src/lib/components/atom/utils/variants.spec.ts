import { describe, expect, it } from 'vitest';
import { resolveVariants, mergeVariants, resolveLocalVariants } from './variants';

describe('resolveVariants', () => {
	it('returns base class when no variants or compounds exist', () => {
		const result = resolveVariants(
			{ class: 'base-class', variants: {}, compounds: [], defaults: {} },
			null,
			{}
		);
		expect(result.class).toEqual(['base-class']);
	});

	it('picks the matching variant class', () => {
		const result = resolveVariants(
			{
				class: '',
				variants: { size: { sm: 'text-sm', lg: 'text-lg' } },
				compounds: [],
				defaults: {}
			},
			null,
			{ size: 'sm' }
		);
		expect(result.class).toContain('text-sm');
		expect(result.class).not.toContain('text-lg');
	});

	it('applies defaults when prop is absent', () => {
		const result = resolveVariants(
			{
				class: '',
				variants: { size: { sm: 'text-sm', lg: 'text-lg' } },
				compounds: [],
				defaults: { size: 'lg' }
			},
			null,
			{}
		);
		expect(result.class).toContain('text-lg');
	});

	it('applies compound variant when all conditions match', () => {
		const result = resolveVariants(
			{
				class: '',
				variants: { size: { sm: 'text-sm' }, color: { red: 'text-red' } },
				compounds: [{ size: 'sm', color: 'red', class: 'compound-class' }],
				defaults: {}
			},
			null,
			{ size: 'sm', color: 'red' }
		);
		expect(result.class).toContain('compound-class');
	});

	it('does not apply compound when conditions do not fully match', () => {
		const result = resolveVariants(
			{
				class: '',
				variants: { size: { sm: 'text-sm' }, color: { red: 'text-red' } },
				compounds: [{ size: 'sm', color: 'red', class: 'compound-class' }],
				defaults: {}
			},
			null,
			{ size: 'sm', color: 'blue' }
		);
		expect(result.class).not.toContain('compound-class');
	});

	it('returns same reference for repeated identical inputs (cache hit)', () => {
		const def = { class: '', variants: { size: { sm: 'text-sm' } }, compounds: [], defaults: {} };
		const a = resolveVariants(def, null, { size: 'sm' });
		const b = resolveVariants(def, null, { size: 'sm' });
		expect(a).toBe(b);
	});
});

describe('mergeVariants', () => {
	it('returns undefined when neither preset nor local variants exist', () => {
		const result = mergeVariants(undefined, undefined, undefined, undefined, undefined, null, {});
		expect(result).toBeUndefined();
	});

	it('concatenates preset and local classes', () => {
		const localVariants = { class: ['local-class'] };
		const result = mergeVariants(
			{ size: { sm: 'preset-sm' } },
			'preset-base',
			[],
			{},
			localVariants,
			null,
			{ size: 'sm' }
		);
		expect((result!.class as string[]).join(' ')).toContain('preset-base');
		expect((result!.class as string[]).join(' ')).toContain('local-class');
	});
});

describe('resolveLocalVariants', () => {
	it('returns undefined for falsy input', () => {
		expect(resolveLocalVariants(null, null, {})).toBeUndefined();
		expect(resolveLocalVariants(undefined, null, {})).toBeUndefined();
	});

	it('calls plain function variants', () => {
		const fn = (_bond: unknown, props: Record<string, unknown>) => ({ class: [props.x as string] });
		const result = resolveLocalVariants(fn, null, { x: 'custom' });
		expect(result!.class).toContain('custom');
	});
});
