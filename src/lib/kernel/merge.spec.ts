import { describe, expect, it, vi } from 'vitest';
import {
	mergeAttributeLayer,
	mergeHandlerLayer,
	mergeSpreadProps,
	type AtomAttachment
} from './merge';

function event() {
	return {
		defaultPrevented: false,
		preventDefault() {
			this.defaultPrevented = true;
		}
	};
}

describe('bond merge rules - attributes', () => {
	it('keeps the generated id for internal layers but lets user props override it', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		const internal = mergeAttributeLayer(
			{ id: 'generated-id' },
			{ id: 'capability-id' },
			{ source: 'test atom' }
		);
		const user = mergeSpreadProps({ id: 'generated-id' }, { id: 'user-id' }, { nextIsUser: true });

		expect(internal.id).toBe('generated-id');
		expect(user.id).toBe('user-id');
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('id attribute "id" conflict'));
		warn.mockRestore();
	});

	it('merges classes and styles with later style properties winning', () => {
		const merged = mergeAttributeLayer(
			{
				class: ['root', false, 'enabled'],
				style: 'color: red; --gap: 2px;'
			},
			{
				class: 'pressed',
				style: { color: 'blue', margin: 0 }
			}
		);

		expect(merged.class).toBe('root enabled pressed');
		expect(merged.style).toBe('color: blue; --gap: 2px; margin: 0;');
	});

	it('warns on conflicting data and unsafe aria values while merging safe aria token lists', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		const merged = mergeAttributeLayer(
			{
				'data-state': 'closed',
				'aria-expanded': false,
				'aria-labelledby': 'label-a label-b'
			},
			{
				'data-state': 'open',
				'aria-expanded': true,
				'aria-labelledby': 'label-b label-c'
			}
		);

		expect(merged['data-state']).toBe('open');
		expect(merged['aria-expanded']).toBe(true);
		expect(merged['aria-labelledby']).toBe('label-a label-b label-c');
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('data attribute "data-state"'));
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('ARIA attribute "aria-expanded"'));
		warn.mockRestore();
	});

	it('treats role as exclusive and disabled/inert/hidden as true-wins', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

		const merged = mergeAttributeLayer(
			{ role: 'button', disabled: true, inert: false, hidden: undefined },
			{ role: 'tab', disabled: false, inert: '', hidden: false }
		);

		expect(merged.role).toBe('tab');
		expect(merged.disabled).toBe(true);
		expect(merged.inert).toBe(true);
		expect(merged.hidden).toBe(false);
		expect(warn).toHaveBeenCalledWith(expect.stringContaining('role attribute "role"'));
		warn.mockRestore();
	});
});

describe('bond merge rules - handlers', () => {
	it('composes internal handlers after the base handler and skips internal work when default is prevented', () => {
		const order: string[] = [];
		const merged = mergeHandlerLayer(
			{
				onclick: (ev: ReturnType<typeof event>) => {
					order.push('base');
					ev.preventDefault();
				}
			},
			{
				onclick: () => order.push('internal')
			}
		);

		(merged.onclick as (ev: ReturnType<typeof event>) => void)(event());

		expect(order).toEqual(['base']);
	});

	it('runs user handlers before internal handlers from a spread merge', () => {
		const order: string[] = [];
		const merged = mergeSpreadProps(
			{
				onclick: () => order.push('internal')
			},
			{
				onclick: () => order.push('user')
			},
			{ nextIsUser: true }
		);

		(merged.onclick as (ev: ReturnType<typeof event>) => void)(event());

		expect(order).toEqual(['user', 'internal']);
	});

	it('skips internal handlers when the user handler prevents default', () => {
		const order: string[] = [];
		const merged = mergeSpreadProps(
			{
				onclick: () => order.push('internal')
			},
			{
				onclick: (ev: ReturnType<typeof event>) => {
					order.push('user');
					ev.preventDefault();
				}
			},
			{ nextIsUser: true }
		);

		(merged.onclick as (ev: ReturnType<typeof event>) => void)(event());

		expect(order).toEqual(['user']);
	});
});

describe('bond merge rules - attachments', () => {
	it('composes colliding attachments with base mount first and user cleanup first', () => {
		const key = Symbol('attachment');
		const order: string[] = [];
		const elementRef: AtomAttachment<Element> = () => {
			order.push('element mount');
			return () => order.push('element cleanup');
		};
		const userAttachment: AtomAttachment<Element> = () => {
			order.push('user mount');
			return () => order.push('user cleanup');
		};

		const merged = mergeSpreadProps<Element>(
			{ [key]: elementRef },
			{ [key]: userAttachment },
			{ nextIsUser: true }
		);
		const cleanup = (merged[key] as AtomAttachment<Element>)({} as Element);
		if (typeof cleanup === 'function') cleanup();

		expect(order).toEqual(['element mount', 'user mount', 'user cleanup', 'element cleanup']);
	});

	it('preserves symbol order so element refs mount before user attachments', () => {
		const elementKey = Symbol('element');
		const userKey = Symbol('user');

		const merged = mergeSpreadProps(
			{ [elementKey]: () => undefined },
			{ [userKey]: () => undefined },
			{ nextIsUser: true }
		);

		expect(Object.getOwnPropertySymbols(merged)).toEqual([elementKey, userKey]);
	});
});
