import { describe, expect, it } from 'vitest';
import { foldPresentation } from './fold';

describe('foldPresentation', () => {
	it('applies defaults < preset attrs < variants < consumer props', () => {
		const out = foldPresentation(
			{ 'data-tier': 'defaults', 'data-default': 'kept' },
			{ attrs: { 'data-tier': 'preset', 'data-preset': 'kept' } },
			{ 'data-tier': 'variant', 'data-variant': 'kept' },
			{ 'data-tier': 'rest' }
		);
		expect(out.attrs).toMatchObject({
			'data-tier': 'rest',
			'data-default': 'kept',
			'data-preset': 'kept',
			'data-variant': 'kept'
		});
	});

	it('never spreads top-level preset configuration or unsupported attachments', () => {
		const malformed = {
			class: 'preset-class',
			attrs: { 'data-kept': 'yes', attachments: ['also-not-dom'] },
			variants: {},
			defaults: {},
			render: { as: 'span' },
			attachments: ['not-supported'],
			title: 'top-level-leak'
		} as never;
		const out = foldPresentation(undefined, malformed, undefined, {});
		expect(out.attrs).toEqual({ 'data-kept': 'yes' });
	});

	it('preserves symbol props from defaults, variants, and consumer props but not presets', () => {
		const symbol = Symbol('lifecycle');
		expect(
			foldPresentation(
				{ [symbol]: 'default' } as Record<string, unknown>,
				{ attrs: { 'data-preset': true } },
				{ [symbol]: 'variant' } as Record<string, unknown>,
				{ [symbol]: 'consumer' } as Record<string, unknown>
			).attrs[symbol]
		).toBe('consumer');
	});

	it('applies an instance layer after variants and before consumer attrs', () => {
		const out = foldPresentation(
			{ attrs: { 'data-tier': 'defaults' } },
			{ class: 'preset', attrs: { 'data-preset': true } },
			{ class: ['variant'], attrs: { 'data-tier': 'variant' } },
			{ class: 'consumer', 'data-tier': 'consumer' },
			undefined,
			{ class: 'instance', attrs: { 'data-tier': 'instance', 'data-instance': true } }
		);

		expect(out.instanceClass).toBe('instance');
		expect(out.attrs).toMatchObject({
			'data-tier': 'consumer',
			'data-preset': true,
			'data-instance': true
		});
	});

	it('captures preset and variant classes separately', () => {
		const out = foldPresentation(undefined, { class: 'preset' }, { class: ['variant'] }, {});
		expect(out.presetClass).toBe('preset');
		expect(out.variantClass).toEqual(['variant']);
	});

	it('folds motion into a separate renderer channel', () => {
		const initial = () => undefined;
		const enter = () => ({ duration: 100 });
		const exit = () => ({ duration: 200 });
		const animate = () => undefined;
		const out = foldPresentation(
			{ motion: { initial } },
			{ attrs: { animate: 'not-an-attr' }, motion: { enter } },
			{ motion: { exit } },
			{ motion: { animate }, 'data-kept': 'yes' }
		);

		expect(out.motion).toEqual({ initial, enter, exit, animate });
		expect(out.attrs).toEqual({ 'data-kept': 'yes' });
	});

	it('lets null disable a motion phase while undefined inherits it', () => {
		const presetEnter = () => ({ duration: 100 });
		const consumerAnimate = () => undefined;
		const inherited = foldPresentation(
			undefined,
			{ motion: { enter: presetEnter, exit: () => ({}) } },
			undefined,
			{},
			{ enter: undefined, exit: null, animate: consumerAnimate }
		);

		expect(inherited.motion.enter).toBe(presetEnter);
		expect(inherited.motion.exit).toBeUndefined();
		expect(inherited.motion.animate).toBe(consumerAnimate);
	});
});
