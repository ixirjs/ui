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
	it('defaults to the mount phase and returns a fresh symbol each call', () => {
		const a = createLifecycleKey();
		const b = createLifecycleKey();
		expect(typeof a).toBe('symbol');
		expect(a).not.toBe(b);
		expect(lifecycleType(a)).toBe('mount');
	});

	it('encodes the requested phase', () => {
		expect(lifecycleType(createLifecycleKey('mount'))).toBe('mount');
		expect(lifecycleType(createLifecycleKey('destroy'))).toBe('destroy');
	});

	it('isLifecycleKey recognises its own keys at any phase', () => {
		expect(isLifecycleKey(createLifecycleKey('mount'))).toBe(true);
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
		const mount = createLifecycleKey('mount');
		const mount2 = createLifecycleKey('mount');
		const destroy = createLifecycleKey('destroy');
		const mountFn = () => 'm';
		const mount2Fn = () => 'm2';
		const destroyFn = () => 'd';
		const props = {
			[mount]: mountFn,
			[mount2]: mount2Fn,
			[destroy]: destroyFn,
			class: 'ignored', // string keys ignored
			[createAttachmentKey()]: () => {} // node attachment ignored
		};

		expect(getLifecycleProps(props)).toEqual({
			mount: [mountFn, mount2Fn],
			destroy: [destroyFn]
		});
	});

	it('always returns an entry for every phase, even when empty', () => {
		expect(getLifecycleProps({})).toEqual({ mount: [], destroy: [] });
	});

	it('skips non-function values under a lifecycle key', () => {
		const key = createLifecycleKey('mount');
		expect(getLifecycleProps({ [key]: 'not-a-fn' }).mount).toEqual([]);
	});
});

describe('getLifecyclePropsByType (one phase of the grouped result)', () => {
	it('slices a single phase out of getLifecycleProps', () => {
		const mount = createLifecycleKey('mount');
		const mount2 = createLifecycleKey('mount');
		const destroy = createLifecycleKey('destroy');
		const mountFn = () => 'm';
		const mount2Fn = () => 'm2';
		const destroyFn = () => 'd';
		const grouped = getLifecycleProps({
			[mount]: mountFn,
			[mount2]: mount2Fn,
			[destroy]: destroyFn,
			class: 'ignored',
			[createAttachmentKey()]: () => {}
		});

		expect(getLifecyclePropsByType('mount', grouped)).toEqual([mountFn, mount2Fn]);
		expect(getLifecyclePropsByType('destroy', grouped)).toEqual([destroyFn]);
	});
});
