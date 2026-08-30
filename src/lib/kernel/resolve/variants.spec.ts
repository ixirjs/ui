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

	it('publishes ordinary attributes from matching variant values', () => {
		const result = resolveVariants(
			{
				class: '',
				variants: {
					state: {
						open: {
							class: 'is-open',
							'data-state': 'open',
							'aria-expanded': true,
							role: 'button',
							motion: { enter: () => ({ duration: 100 }) }
						}
					}
				},
				compounds: [],
				defaults: {}
			},
			null,
			{ state: 'open' }
		);
		expect(result).toMatchObject({
			'data-state': 'open',
			'aria-expanded': true,
			role: 'button'
		});
		expect(result.motion).toMatchObject({ enter: expect.any(Function) });
	});

	it('merges motion per phase across multiple active variant axes', () => {
		const enter = () => ({ duration: 100 });
		const exit = () => ({ duration: 200 });
		const result = resolveVariants(
			{
				class: '',
				variants: {
					presence: { open: { motion: { enter } } },
					direction: { left: { motion: { exit } } }
				},
				compounds: [],
				defaults: {}
			},
			null,
			{ presence: 'open', direction: 'left' }
		);

		expect(result.motion).toEqual({ enter, exit });
	});

	it('merges preset and local variant motion per phase', () => {
		const enter = () => ({ duration: 100 });
		const exit = () => ({ duration: 200 });
		const result = mergeVariants(
			{ presence: { open: { motion: { enter } } } },
			undefined,
			undefined,
			undefined,
			{ class: [], motion: { exit } },
			null,
			{ presence: 'open' }
		);

		expect(result?.motion).toEqual({ enter, exit });
	});

	it('accepts legacy flat phases in variant values without publishing them as attrs', () => {
		const enter = () => ({ duration: 100 });
		const result = resolveVariants(
			{
				class: '',
				variants: { presence: { open: { enter } } },
				compounds: [],
				defaults: {}
			},
			null,
			{ presence: 'open' }
		);

		expect(result.motion).toEqual({ enter });
		expect(result).not.toHaveProperty('enter');
	});

	it('does not publish attachment symbols or reserved presentation fields', () => {
		const attachment = Symbol('attachment');
		const result = resolveVariants(
			{
				class: '',
				variants: {
					state: {
						open: {
							attachments: ['leak'],
							attrs: { title: 'leak' },
							render: { as: 'button' },
							as: 'button',
							[attachment]: () => undefined,
							'data-safe': true
						}
					}
				},
				compounds: [],
				defaults: {}
			},
			null,
			{ state: 'open' }
		);
		expect(result).not.toHaveProperty('attachments');
		expect(result).not.toHaveProperty('attrs');
		expect(result).not.toHaveProperty('render');
		expect(result).not.toHaveProperty('as');
		expect(Object.getOwnPropertySymbols(result)).toEqual([]);
		expect(result['data-safe']).toBe(true);
	});

	it('observes in-place changes to a stable reactive definition', () => {
		const def = {
			class: '',
			variants: { size: { sm: 'text-sm' } },
			compounds: [],
			defaults: { size: 'sm' }
		};
		expect(resolveVariants(def, null, {}).class).toContain('text-sm');
		def.variants.size.sm = 'text-updated';
		expect(resolveVariants(def, null, {}).class).toContain('text-updated');
	});
});

describe('mergeVariants', () => {
	it('returns undefined when neither preset nor local variants exist', () => {
		const result = mergeVariants(undefined, undefined, undefined, undefined, undefined, null, {});
		expect(result).toBeUndefined();
	});

	it('invalidates the preset definition cache when sibling semantic fields change', () => {
		const variants = { size: { sm: 'text-sm', lg: 'text-lg' } };
		const first = mergeVariants(variants, 'first', [], { size: 'sm' }, undefined, null, {});
		const second = mergeVariants(variants, 'second', [], { size: 'lg' }, undefined, null, {});
		expect(first?.class).toContain('first');
		expect(first?.class).toContain('text-sm');
		expect(second?.class).toContain('second');
		expect(second?.class).toContain('text-lg');
		expect(second?.class).not.toContain('first');
	});

	it('invalidates cached compounds while retaining the variants map', () => {
		const variants = { tone: { calm: 'calm' } };
		const first = mergeVariants(
			variants,
			undefined,
			[{ tone: 'calm', class: 'first-compound' }],
			{},
			undefined,
			null,
			{ tone: 'calm' }
		);
		const second = mergeVariants(
			variants,
			undefined,
			[{ tone: 'calm', class: 'second-compound' }],
			{},
			undefined,
			null,
			{ tone: 'calm' }
		);
		expect(first?.class).toContain('first-compound');
		expect(second?.class).toContain('second-compound');
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
