import { describe, expect, it, vi } from 'vitest';
import { mergeAtomProps } from '$ixirjs/ui/shared/bond/presentation-props';

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

	it('binds a custom id to the atom identity used by relationships', () => {
		let idSource: (() => string | undefined) | undefined;
		const props = mergeAtomProps(
			{
				spread: { id: 'generated-content' },
				bindId: (source) => {
					idSource = source;
				}
			},
			'test.content',
			{ id: 'custom-content' }
		);

		expect(props.id).toBe('custom-content');
		expect(idSource?.()).toBe('custom-content');
	});

	it('strips the defaults layer from ordinary component rest props', () => {
		const props = mergeAtomProps(undefined, 'test.root', {
			defaults: { animate: vi.fn() },
			'data-kept': 'yes'
		});
		expect(props).not.toHaveProperty('defaults');
		expect(props['data-kept']).toBe('yes');
	});
});
