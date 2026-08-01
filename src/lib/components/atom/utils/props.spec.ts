import { describe, expect, it, vi } from 'vitest';
import { extractRestProps, mergeAtomProps } from './props';

describe('extractRestProps', () => {
	it('fallback is lowest priority — preset overrides it', () => {
		const fallbackAnimate = vi.fn();
		const presetAnimate = vi.fn();

		const result = extractRestProps(
			{ animate: presetAnimate },
			undefined,
			{},
			{ animate: fallbackAnimate }
		);

		expect(result.animate).toBe(presetAnimate);
	});

	it('fallback is used when neither preset nor restProps provide the prop', () => {
		const fallbackAnimate = vi.fn();

		const result = extractRestProps(undefined, undefined, {}, { animate: fallbackAnimate });

		expect(result.animate).toBe(fallbackAnimate);
	});

	it('restProps is highest priority — overrides preset and fallback', () => {
		const presetAnimate = vi.fn();
		const userAnimate = vi.fn();

		const result = extractRestProps({ animate: presetAnimate }, undefined, {
			animate: userAnimate
		});

		expect(result.animate).toBe(userAnimate);
	});

	it('strips internal atom keys from preset', () => {
		const result = extractRestProps(
			{
				class: 'text-red',
				base: 'div',
				as: 'span',
				variants: {},
				compounds: [],
				defaults: {},
				role: 'button'
			},
			undefined,
			{}
		);

		expect(result.class).toBeUndefined();
		expect(result.base).toBeUndefined();
		expect(result.as).toBeUndefined();
		expect(result.variants).toBeUndefined();
		expect(result.role).toBe('button');
	});

	it('preserves Symbol-keyed props from every layer', () => {
		const sym = Symbol('attach');
		const fallbackVal = vi.fn();
		const presetVal = vi.fn();
		const restVal = vi.fn();

		const fallback = {} as Record<symbol, unknown>;
		fallback[sym] = fallbackVal;

		const preset = {} as Record<symbol, unknown>;
		preset[sym] = presetVal;

		const rest = {} as Record<symbol, unknown>;
		rest[sym] = restVal;

		// restProps wins
		const result = extractRestProps(
			preset as Record<string, unknown>,
			undefined,
			rest as Record<string, unknown>,
			fallback as Record<string, unknown>
		);

		expect((result as Record<symbol, unknown>)[sym]).toBe(restVal);
	});
});

describe('mergeAtomProps', () => {
	it('runs user event props before atom handlers and skips atom handlers when default is prevented', () => {
		const order: string[] = [];
		const event = {
			defaultPrevented: false,
			preventDefault() {
				this.defaultPrevented = true;
			}
		};

		const props = mergeAtomProps(
			{
				preset: 'test.root',
				spread: { onclick: () => order.push('atom') }
			},
			undefined,
			{
				onclick: (ev: typeof event) => {
					order.push('user');
					ev.preventDefault();
				}
			}
		);

		expect(props.preset).toBe('test.root');
		(props.onclick as (ev: typeof event) => void)(event);
		expect(order).toEqual(['user']);
	});

	it('keeps atom attachment symbols before user attachment symbols', () => {
		const atomKey = Symbol('atom');
		const userKey = Symbol('user');

		const props = mergeAtomProps({ spread: { [atomKey]: () => undefined } }, 'fallback', {
			[userKey]: () => undefined
		} as Record<string, unknown>);

		expect(props.preset).toBe('fallback');
		expect(Object.getOwnPropertySymbols(props)).toEqual([atomKey, userKey]);
	});
});
