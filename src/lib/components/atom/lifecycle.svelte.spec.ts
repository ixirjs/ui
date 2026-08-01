import { describe, expect, it } from 'vitest';
import { createAttachmentKey } from 'svelte/attachments';
import {
	createLifecycleKey,
	isLifecycleKey,
	lifecycleType,
	getLifecycleProps,
	getLifecyclePropsByType
} from './lifecycle.svelte';

describe('createLifecycleKey', () => {
	it('defaults to the init phase and returns a fresh symbol each call', () => {
		const a = createLifecycleKey();
		const b = createLifecycleKey();
		expect(typeof a).toBe('symbol');
		expect(a).not.toBe(b);
		expect(lifecycleType(a)).toBe('init');
	});

	it('encodes the requested phase', () => {
		expect(lifecycleType(createLifecycleKey('init'))).toBe('init');
		expect(lifecycleType(createLifecycleKey('mount'))).toBe('mount');
		expect(lifecycleType(createLifecycleKey('destroy'))).toBe('destroy');
	});

	it('isLifecycleKey recognises its own keys at any phase', () => {
		expect(isLifecycleKey(createLifecycleKey('init'))).toBe(true);
		expect(isLifecycleKey(createLifecycleKey('destroy'))).toBe(true);
	});

	it('rejects plain symbols and svelte node-attachment keys', () => {
		expect(isLifecycleKey(Symbol('whatever'))).toBe(false);
		expect(isLifecycleKey(Symbol())).toBe(false);
		expect(isLifecycleKey(createAttachmentKey())).toBe(false); // node attachments stay separate
		expect(lifecycleType(createAttachmentKey())).toBeUndefined();
	});

	it('is usable as a computed prop key carrying a (bond) callback', () => {
		const key = createLifecycleKey('mount');
		let captured: unknown;
		const props = { [key]: (bond: unknown) => (captured = bond) };
		const found = Object.getOwnPropertySymbols(props).filter(isLifecycleKey);
		expect(found).toHaveLength(1);
		expect(lifecycleType(found[0]!)).toBe('mount');
		(props[found[0]!] as (b: unknown) => void)('the-bond');
		expect(captured).toBe('the-bond');
	});
});

describe('getLifecycleProps (all phases, grouped)', () => {
	it('groups every lifecycle callback by phase', () => {
		const init = createLifecycleKey('init');
		const init2 = createLifecycleKey('init');
		const destroy = createLifecycleKey('destroy');
		const initFn = () => 'i';
		const init2Fn = () => 'i2';
		const destroyFn = () => 'd';
		const props = {
			[init]: initFn,
			[init2]: init2Fn,
			[destroy]: destroyFn,
			class: 'ignored', // string keys ignored
			[createAttachmentKey()]: () => {} // node attachment ignored
		};

		expect(getLifecycleProps(props)).toEqual({
			init: [initFn, init2Fn],
			mount: [],
			destroy: [destroyFn]
		});
	});

	it('always returns an entry for every phase, even when empty', () => {
		expect(getLifecycleProps({})).toEqual({ init: [], mount: [], destroy: [] });
	});

	it('skips non-function values under a lifecycle key', () => {
		const key = createLifecycleKey('init');
		expect(getLifecycleProps({ [key]: 'not-a-fn' }).init).toEqual([]);
	});
});

describe('getLifecyclePropsByType (one phase of the grouped result)', () => {
	it('slices a single phase out of getLifecycleProps', () => {
		const init = createLifecycleKey('init');
		const init2 = createLifecycleKey('init');
		const destroy = createLifecycleKey('destroy');
		const initFn = () => 'i';
		const init2Fn = () => 'i2';
		const destroyFn = () => 'd';
		const grouped = getLifecycleProps({
			[init]: initFn,
			[init2]: init2Fn,
			[destroy]: destroyFn,
			class: 'ignored',
			[createAttachmentKey()]: () => {}
		});

		expect(getLifecyclePropsByType('init', grouped)).toEqual([initFn, init2Fn]);
		expect(getLifecyclePropsByType('destroy', grouped)).toEqual([destroyFn]);
		expect(getLifecyclePropsByType('mount', grouped)).toEqual([]);
	});
});
