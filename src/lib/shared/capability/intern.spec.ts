import { describe, expect, it, vi } from 'vitest';
import { internCapabilityFactory } from './intern';
import { capabilityKey, defineCapability } from './capability';
import { ariaRole, focusable } from './models/atom.svelte';
import {
	labelledControl,
	rowColumnCellLink,
	tabPanelLink,
	treeItemGroupLink,
	triggerContentLink
} from './models/relationship.svelte';

describe('internCapabilityFactory', () => {
	it('shares one descriptor for equal primitive arguments', () => {
		let calls = 0;
		const factory = internCapabilityFactory((role: string) => {
			calls++;
			return Object.freeze({ role });
		});

		expect(factory('icon')).toBe(factory('icon'));
		expect(calls).toBe(1);
	});

	it('keys distinct primitive arguments separately', () => {
		const factory = internCapabilityFactory((role: string) => Object.freeze({ role }));
		expect(factory('icon')).not.toBe(factory('banner'));
	});

	it('does not confuse a string with a same-looking number or boolean', () => {
		const factory = internCapabilityFactory((value: unknown) => Object.freeze({ value }));
		expect(factory('1')).not.toBe(factory(1));
		expect(factory('true')).not.toBe(factory(true));
		expect(factory(undefined)).not.toBe(factory(null));
	});

	// Length-prefixed encoding: two different option sets must not collide by concatenation.
	it('cannot be forged by a value containing the key separator', () => {
		const factory = internCapabilityFactory((options: Record<string, unknown>) =>
			Object.freeze({ ...options })
		);
		expect(factory({ a: 'b=c,d', e: 'f' })).not.toBe(factory({ 'a=b': 'c,d', e: 'f' }));
	});

	it('treats option key order as irrelevant', () => {
		const factory = internCapabilityFactory((options: Record<string, unknown>) =>
			Object.freeze({ ...options })
		);
		expect(factory({ a: 1, b: 2 })).toBe(factory({ b: 2, a: 1 }));
	});

	// The load-bearing safety property: anything that could close over per-instance state must
	// produce a fresh descriptor, never a shared one.
	it('never shares when an argument could capture instance state', () => {
		const factory = internCapabilityFactory((options: Record<string, unknown>) =>
			Object.freeze({ ...options })
		);
		const callback = () => true;
		expect(factory({ selected: callback })).not.toBe(factory({ selected: callback }));
		expect(factory({ nested: { deep: 1 } })).not.toBe(factory({ nested: { deep: 1 } }));
		expect(factory({ list: ['a'] })).not.toBe(factory({ list: ['a'] }));
		expect(factory({ key: Symbol.for('x') })).not.toBe(factory({ key: Symbol.for('x') }));
	});

	it('stops caching past its entry cap without changing behaviour', () => {
		let calls = 0;
		const factory = internCapabilityFactory((role: string) => {
			calls++;
			return Object.freeze({ role });
		});
		for (let index = 0; index < 300; index++) factory(`role-${index}`);
		const before = calls;
		// Inside the cap, still shared; past it, recomputed but still correct.
		expect(factory('role-0')).toBe(factory('role-0'));
		expect(calls).toBe(before);
		expect(factory('role-299')).toEqual(factory('role-299'));
	});
});

describe('interned capability factories', () => {
	it('shares relationship descriptors across calls with equal options', () => {
		expect(labelledControl()).toBe(labelledControl());
		expect(rowColumnCellLink()).toBe(rowColumnCellLink());
		expect(treeItemGroupLink()).toBe(treeItemGroupLink());
		expect(triggerContentLink({ contentRole: 'region' })).toBe(
			triggerContentLink({ contentRole: 'region' })
		);
	});

	// The wrapper sees the call's arguments, not the factory's parameter defaults, so it cannot know
	// that `f()` and `f({})` reach the same body. Keying them apart costs one extra descriptor and
	// keeps the encoding honest; no call site in the library mixes the two forms.
	it('keys an omitted options argument apart from an explicit empty one', () => {
		expect(labelledControl()).not.toBe(labelledControl({}));
		expect(labelledControl({})).toBe(labelledControl({}));
	});

	it('keeps distinct options on distinct descriptors', () => {
		expect(labelledControl({ nativeFor: true })).not.toBe(labelledControl());
		expect(triggerContentLink({ contentRole: 'region' })).not.toBe(
			triggerContentLink({ contentRole: 'group' })
		);
	});

	it('shares atom projections across calls', () => {
		expect(ariaRole('icon')).toBe(ariaRole('icon'));
		expect(ariaRole('icon')).not.toBe(ariaRole('banner'));
		expect(focusable()).toBe(focusable());
	});

	// tabPanelLink is the one relationship whose real call site passes a bond-bound accessor.
	// Sharing that descriptor would leak one component's state into every other tab on the page.
	it('never shares a descriptor built from a bond-bound accessor', () => {
		const first = tabPanelLink({ selected: () => true });
		const second = tabPanelLink({ selected: () => true });
		expect(first).not.toBe(second);
	});

	// The header's one rule, mechanically: a surface is per-host state, so caching a descriptor
	// that carries one would give every Bond on the page the same model.
	it('refuses to cache a descriptor that carries a surface', () => {
		const error = vi.spyOn(console, 'error').mockImplementation(() => {});
		const stateful = internCapabilityFactory(function stateful() {
			return defineCapability({ slot: capabilityKey('stateful'), surface: { items: [] } });
		});

		expect(stateful()).not.toBe(stateful());
		expect(error).toHaveBeenCalledWith(expect.stringContaining('carries a surface'));
		error.mockRestore();
	});

	it('keeps every shared descriptor frozen', () => {
		expect(Object.isFrozen(labelledControl())).toBe(true);
		expect(Object.isFrozen(ariaRole('icon'))).toBe(true);
	});
});
