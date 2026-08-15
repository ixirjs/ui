import { describe, expect, expectTypeOf, it, vi } from 'vitest';
import { render } from 'vitest-browser-svelte';
import { Atom, Bond, defineAtom, type BondStateProps } from './index';
import {
	capabilityKey,
	ariaRole,
	dataState,
	defineCapability,
	defineAtomCapability,
	elementRef,
	focusable,
	pressable
} from '$ixirjs/ui/shared/capability';
import AtomProbe from '$ixirjs/ui/test/shared/bond/atom-probe.test.svelte';

const MODEL = capabilityKey<{ value: number }>('atom-test-model');

class TestBond extends Bond<BondStateProps> {
	constructor(props: BondStateProps = {}) {
		super(props, 'atom-test');
	}
}

class TestAtom extends Atom<TestBond> {
	constructor(bond: TestBond, key = 'root') {
		super(bond, key);
	}
}

class LifecycleAtom extends TestAtom {
	constructor(
		bond: TestBond,
		private readonly events: string[]
	) {
		super(bond, 'lifecycle');
	}

	override onmount(): () => void {
		this.events.push('mount:own');
		return () => this.events.push('cleanup:own');
	}
}

describe('Atom', () => {
	it('creates fixed-key atom classes with setup behavior', () => {
		const ButtonAtom = defineAtom<TestBond, HTMLButtonElement>('button', (atom) => {
			atom.capability(ariaRole('button'));
			atom.capability(dataState('ready'));
		});
		const bond = new TestBond({ id: 'button-id' });
		const atom = new ButtonAtom(bond);

		expect(atom).toBeInstanceOf(Atom);
		expect(atom.name).toBe('button');
		expect(atom.id).toBe('atom-test-button-button-id');
		expect(atom.spread.role).toBe('button');
		expect(atom.spread['data-state']).toBe('ready');
	});

	it('creates atom classes by extending an existing atom class', () => {
		const EnhancedAtom = defineAtom(TestAtom, (atom) => {
			atom.capability(dataState('enhanced'));
		});
		const bond = new TestBond({ id: 'enhanced-id' });
		const atom = new EnhancedAtom(bond);

		expectTypeOf<typeof EnhancedAtom>().toEqualTypeOf<typeof TestAtom>();
		expect(atom).toBeInstanceOf(TestAtom);
		expect(atom.name).toBe('root');
		expect(atom.spread['data-state']).toBe('enhanced');
	});

	it('creates optionally bonded atom classes from object options', () => {
		let setupBond: TestBond | undefined;
		const options = {
			key: 'root',
			namespace: 'standalone',
			preset: 'standalone-preset',
			id: 'node-id'
		};
		const StandaloneAtom = defineAtom<TestBond>(options, (_atom, bond) => {
			setupBond = bond;
		});
		options.key = 'mutated';

		const standalone = new StandaloneAtom();
		expect(standalone.name).toBe('root');
		expect(standalone.kind).toBe('standalone-root');
		expect(standalone.id).toBe('standalone-root-node-id');
		expect(standalone.preset).toBe('standalone-preset');
		expect(standalone.spread['data-bond']).toBeUndefined();
		expect(setupBond).toBeUndefined();

		const bond = new TestBond({ id: 'bond-id' });
		const bonded = new StandaloneAtom(bond);
		expect(bonded.kind).toBe('atom-test-root');
		expect(bonded.id).toBe('atom-test-root-bond-id');
		expect(bonded.preset).toBe('atom-test');
		expect(setupBond).toBe(bond);
	});

	it('uses and permits overriding an object-defined default Bond', () => {
		const defaultBond = new TestBond({ id: 'default' });
		const otherBond = new TestBond({ id: 'other' });
		const GeneratedAtom = defineAtom<TestBond>({ key: 'item', bond: defaultBond });

		expect(new GeneratedAtom().id).toBe('atom-test-item-default');
		expect(new GeneratedAtom(otherBond).id).toBe('atom-test-item-other');
	});

	it('can exist without a Bond', () => {
		const node = new Atom(undefined, 'root', {
			namespace: 'standalone',
			id: 'node-id'
		});

		expect(node.id).toBe('standalone-root-node-id');
		expect(node.kind).toBe('standalone-root');
		expect(node.preset).toBe('standalone');
		expect(node.spread['data-kind']).toBe('standalone-root');
		expect(node.spread['data-bond']).toBeUndefined();

		expect(() => node.role('trigger')).not.toThrow();
		expect(node.hasRole('trigger')).toBe(true);
	});

	it('uses a bound user id as its relationship identity', () => {
		const atom = new TestAtom(new TestBond({ id: 'relationship-id' }), 'content');
		atom.bindId(() => 'custom-content');

		expect(atom.id).toBe('custom-content');
		expect(atom.spread.id).toBe('custom-content');
	});

	it('preserves stable attachment keys across spread reads', () => {
		const node = new Atom(undefined, 'item');

		const first = Object.getOwnPropertySymbols(node.spread);
		const second = Object.getOwnPropertySymbols(node.spread);

		expect(second).toEqual(first);
	});

	it('clears its mounted element when the attachment is destroyed', () => {
		const node = new Atom(undefined, 'root');
		const attachmentKey = Object.getOwnPropertySymbols(node.spread)[0]!;
		const attach = node.spread[attachmentKey] as (element: HTMLDivElement) => () => void;
		const element = document.createElement('div');

		const cleanup = attach(element);

		expect(node.element).toBe(element);

		cleanup();

		expect(node.element).toBeUndefined();
	});

	it('hosts bondless atom capabilities in spread', () => {
		const onPress = vi.fn();
		const node = new Atom(undefined, 'trigger', {
			namespace: 'node-cap',
			id: 'trigger-id'
		});

		node.capability(ariaRole('tab'));
		node.capability(dataState('active'));
		node.capability(focusable({ tabindex: 2 }));
		node.capability(pressable({ role: false, tabindex: false, onPress }));

		expect(node.spread.role).toBe('tab');
		expect(node.spread['data-state']).toBe('active');
		expect(node.spread['data-focusable']).toBe('');
		expect(node.spread.tabindex).toBe(2);

		const click = node.spread.onclick as (event: MouseEvent) => void;
		click(new MouseEvent('click'));

		const keydown = node.spread.onkeydown as (event: KeyboardEvent) => void;
		keydown(new KeyboardEvent('keydown', { key: 'Enter', cancelable: true }));

		expect(onPress).toHaveBeenCalledTimes(2);
		expect(node.capabilities.map((capability) => capability.slot.description)).toContain(
			'@ixirjs/atom:data-state'
		);
	});

	it('replaces atom capabilities by slot without keeping stale spread behavior', () => {
		const SLOT = capabilityKey<{ value: string }>('replaceable-atom-capability');
		const node = new Atom(undefined, 'root');

		node.capability(
			defineAtomCapability({
				slot: SLOT,
				surface: { value: 'first' },
				attach: { attrs: () => ({ 'data-first': '' }) }
			})
		);
		node.capability(
			defineAtomCapability({
				slot: SLOT,
				surface: { value: 'second' },
				attach: { attrs: () => ({ 'data-second': '' }) }
			})
		);

		expect(node.surface(SLOT)).toEqual({ value: 'second' });
		expect(node.spread['data-first']).toBeUndefined();
		expect(node.spread['data-second']).toBe('');
	});

	// `compose` is the composition mechanism itself; the decorate* helpers that used to wrap it
	// were deleted for want of a single caller.
	it('composes over a prior atom capability registered at the same slot', () => {
		const SLOT = capabilityKey<{ value: string }>('composable-atom-capability');
		const node = new Atom(undefined, 'root');

		node.capability(
			defineAtomCapability({
				slot: SLOT,
				surface: { value: 'base' },
				attach: { attrs: () => ({ 'data-base': 'yes' }) }
			})
		);
		const composed = node.capability(
			defineAtomCapability<{ value: string }>({
				slot: SLOT,
				compose: (prior) =>
					defineAtomCapability<{ value: string }>({
						slot: SLOT,
						surface: { value: `${prior.surface?.value ?? 'missing'}+composed` },
						attach: {
							attrs: (atom, bond) => ({
								...prior.attach?.attrs?.(atom, bond),
								'data-composed': 'yes'
							})
						}
					})
			})
		);

		expect(composed.surface).toEqual({ value: 'base+composed' });
		expect(node.surface(SLOT)).toEqual({ value: 'base+composed' });
		expect(node.spread['data-base']).toBe('yes');
		expect(node.spread['data-composed']).toBe('yes');
	});

	it('validates atom capability requirements and conflicts', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const NEED = capabilityKey('required-atom-capability');
		const SLOT = capabilityKey('requires-atom-capability');
		const PROJECT = capabilityKey('projecting-atom-capability');
		const CONFLICT = capabilityKey('conflicting-atom-capability');
		const node = new Atom(undefined, 'root');

		node.capability(defineAtomCapability({ slot: NEED }));
		node.capability(
			defineAtomCapability({
				slot: SLOT,
				requires: [NEED],
				attach: { attrs: () => ({ 'data-ready': '' }) }
			})
		);
		node.capability(
			defineAtomCapability({
				slot: PROJECT,
				meta: { projects: ['data-ready'] },
				attach: { attrs: () => ({ 'data-project': '' }) }
			})
		);
		node.capability(
			defineAtomCapability({
				slot: CONFLICT,
				meta: { conflicts: ['data-ready'] },
				attach: { attrs: () => ({ 'data-conflict': '' }) }
			})
		);

		void node.spread;

		expect(warn).toHaveBeenCalledWith(expect.stringContaining('conflicts with projection'));
		warn.mockRestore();
	});

	it('runs atom capability setup through the common atom protocol', () => {
		const node = new Atom(undefined, 'root');
		const cleanup = vi.fn();
		const setup = vi.fn(() => cleanup);

		node.capability(defineAtomCapability({ slot: capabilityKey('setup-teardown'), setup }));
		const teardown = node.activateCapabilities();

		expect(setup).toHaveBeenCalledWith(node, undefined);

		teardown?.();

		expect(cleanup).toHaveBeenCalledTimes(1);
	});

	it('rejects atom missing requirements and cycles before setup', () => {
		const missingSetup = vi.fn();
		const missing = new Atom(undefined, 'missing');
		missing.capability(
			defineAtomCapability({
				slot: capabilityKey('atom:missing:owner'),
				requires: [capabilityKey('atom:missing:dependency')],
				setup: missingSetup
			})
		);

		expect(() => missing.activateCapabilities()).toThrow('which is not registered');
		expect(missingSetup).not.toHaveBeenCalled();

		const first = capabilityKey('atom:cycle:first');
		const second = capabilityKey('atom:cycle:second');
		const cycleSetup = vi.fn();
		const cyclic = new Atom(undefined, 'cyclic');
		cyclic.capability(defineAtomCapability({ slot: first, requires: [second], setup: cycleSetup }));
		cyclic.capability(defineAtomCapability({ slot: second, requires: [first], setup: cycleSetup }));

		expect(() => cyclic.activateCapabilities()).toThrow('dependency cycle');
		expect(cycleSetup).not.toHaveBeenCalled();
	});

	it('disposes atom setup in LIFO order and aggregates failures', () => {
		const events: string[] = [];
		const node = new Atom(undefined, 'root');
		for (const name of ['first', 'throws', 'last']) {
			node.capability(
				defineAtomCapability({
					slot: capabilityKey(`atom:dispose:${name}`),
					setup: () => () => {
						events.push(name);
						if (name === 'throws') throw new Error(name);
					}
				})
			);
		}

		node.activateCapabilities();
		expect(() => node.destroyCapabilities()).toThrow(AggregateError);
		expect(events).toEqual(['last', 'throws', 'first']);
	});

	it('warns when atom capability setup is registered but never activated', async () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const node = new Atom(undefined, 'root');

		node.capability(defineAtomCapability({ slot: capabilityKey('unsetup'), setup: () => {} }));
		void node.spread;

		// The spread is built during render and setup runs at mount, so the lifecycle question is
		// only answerable once the turn settles.
		await Promise.resolve();
		expect(warn).toHaveBeenCalledWith(
			expect.stringContaining('activateCapabilities() was never called')
		);
		warn.mockRestore();
	});

	it('runs atom capability mount callbacks with cleanup', () => {
		const seen: Array<Element | undefined> = [];
		const node = new Atom(undefined, 'root');
		node.capability(elementRef((element) => seen.push(element as Element | undefined)));

		const element = document.createElement('div');
		const cleanups = Object.getOwnPropertySymbols(node.spread)
			.map((key) => (node.spread[key] as (element: HTMLDivElement) => void | (() => void))(element))
			.filter((cleanup): cleanup is () => void => typeof cleanup === 'function');

		expect(node.element).toBe(element);
		expect(seen).toContain(element);

		for (let i = cleanups.length - 1; i >= 0; i--) cleanups[i]!();

		expect(node.element).toBeUndefined();
		expect(seen.at(-1)).toBeUndefined();
	});
});

describe('Atom compatibility', () => {
	it('is still a bonded Atom with the standard attrs', () => {
		const bond = new TestBond({ id: 'plain-id' });
		const atom = new TestAtom(bond);

		expect(atom).toBeInstanceOf(Atom);
		expect(atom.id).toBe('atom-test-root-plain-id');
		expect(atom.spread['data-bond']).toBe('atom-test');
		expect(atom.spread['data-kind']).toBe('atom-test-root');
	});
});

describe('Bond registered Atom APIs', () => {
	it('registers, looks up, and unregisters a component-owned node', () => {
		const bond = new TestBond({ id: 'registered-id' });
		const node = new Atom(bond, 'trigger');

		const unregister = bond.register(node);

		expect(bond.nodeByPart('trigger')).toBe(node);
		expect(bond.nodesByPart('trigger')).toEqual([node]);
		expect(bond.elements.trigger).toBeUndefined();

		unregister();

		expect(bond.nodeByPart('trigger')).toBeUndefined();
		expect(bond.nodesByPart('trigger')).toEqual([]);
	});

	it('rejects duplicate single-node registrations', () => {
		const bond = new TestBond({});

		bond.register(new Atom(bond, 'content'));
		expect(() => bond.register(new Atom(bond, 'content'))).toThrow('multiple nodes');
	});

	it('supports many-node registration', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const bond = new TestBond({});
		const first = new Atom(bond, 'item');
		const second = new Atom(bond, 'item');

		bond.register(first, { cardinality: 'many' });
		bond.register(second, { cardinality: 'many' });

		expect(bond.nodesByPart('item')).toEqual([first, second]);
		expect(warn).not.toHaveBeenCalled();
		warn.mockRestore();
	});

	it('finds component-owned atoms by role', () => {
		const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
		const bond = new TestBond({});
		const node = new Atom(bond, 'header').role('trigger');

		bond.register(node, { key: 'header' });

		expect(bond.nodeByRole('trigger')).toBe(node);

		warn.mockRestore();
	});
});

describe('merged Bond authoring facade', () => {
	it('constructs a Bond directly from its props', () => {
		const direct = new TestBond({ id: 'direct-id' });

		expect(direct.id).toBe('direct-id');
		expect(direct.props.id).toBe('direct-id');
	});

	it('exposes capability lookup on Bond', () => {
		const bond = new TestBond({ id: 'capability-id' });
		const surface = { value: 42 };

		bond.capability(
			defineCapability({
				slot: MODEL,
				surface
			})
		);

		expect(bond.surface(MODEL)).toBe(surface);
		expect(bond.requireSurface(MODEL)).toBe(surface);
		expect(bond.capabilities).toHaveLength(1);
	});
});

describe('createAtomInstance', () => {
	it('registers during component init and unregisters on destroy', () => {
		const bond = new TestBond({ id: 'helper-id' });
		const { unmount } = render(AtomProbe, { bond, nodeKey: 'content' });

		const node = bond.nodeByPart('content');
		expect(node).toBeInstanceOf(Atom);
		expect(node?.kind).toBe('atom-test-content');

		unmount();

		expect(bond.nodeByPart('content')).toBeUndefined();
	});

	it('transactionally unwinds function-style initializers when a later initializer throws', () => {
		const events: string[] = [];
		const bond = new TestBond({ id: 'helper-transaction-id' });

		expect(() =>
			render(AtomProbe, {
				bond,
				nodeKey: 'transaction',
				capabilities: [
					() => {
						events.push('setup:first');
						return () => events.push('teardown:first');
					},
					() => {
						events.push('setup:throws');
						throw new Error('initializer failed');
					}
				]
			})
		).toThrow('initializer failed');
		expect(events).toEqual(['setup:first', 'setup:throws', 'teardown:first']);
		expect(bond.nodeByPart('transaction')).toBeUndefined();
	});

	it('registers before atom capability setup and tears setup down before unregistering', () => {
		const bond = new TestBond({ id: 'helper-capability-id' });
		const cleanup = vi.fn();
		const setup = vi.fn((node: Atom) => {
			expect(bond.nodeByPart('trigger')).toBe(node);
			return () => {
				expect(bond.nodeByPart('trigger')).toBe(node);
				cleanup();
			};
		});

		const { unmount } = render(AtomProbe, {
			bond,
			nodeKey: 'trigger',
			capabilities: [
				defineAtomCapability({
					slot: capabilityKey('helper'),
					attach: { attrs: () => ({ 'data-helper': 'ready' }) },
					setup
				})
			]
		});

		const node = bond.nodeByPart('trigger');
		expect(node?.spread['data-helper']).toBe('ready');
		expect(setup).toHaveBeenCalledWith(node, bond);

		unmount();

		expect(cleanup).toHaveBeenCalledTimes(1);
		expect(bond.nodeByPart('trigger')).toBeUndefined();
	});

	it('runs every mount hook through one dependency-ordered attachment transaction', () => {
		const events: string[] = [];
		const bond = new TestBond({ id: 'mount-order' });
		const bondMount = capabilityKey('mount:bond');
		bond.capability(
			defineCapability({
				slot: bondMount,
				roles: {
					mount: () => ({
						onmount: () => {
							events.push('mount:bond');
							return () => events.push('cleanup:bond');
						}
					})
				}
			})
		);

		const first = capabilityKey('mount:first');
		const second = capabilityKey('mount:second');
		const atom = new LifecycleAtom(bond, events);
		atom.capability(
			defineAtomCapability({
				slot: second,
				requires: [first],
				attach: {
					onmount: () => {
						events.push('mount:second');
						return () => events.push('cleanup:second');
					}
				}
			})
		);
		atom.capability(
			defineAtomCapability({
				slot: first,
				attach: {
					onmount: () => {
						events.push('mount:first');
						return () => events.push('cleanup:first');
					}
				}
			})
		);
		atom.activateCapabilities();
		atom.role('mount');

		const spread = atom.spread;
		const symbols = Object.getOwnPropertySymbols(spread);
		expect(symbols).toHaveLength(1);
		const cleanup = (spread[symbols[0]!] as (node: HTMLDivElement) => () => void)(
			document.createElement('div')
		);
		expect(events).toEqual(['mount:own', 'mount:bond', 'mount:first', 'mount:second']);

		cleanup();
		expect(events).toEqual([
			'mount:own',
			'mount:bond',
			'mount:first',
			'mount:second',
			'cleanup:second',
			'cleanup:first',
			'cleanup:bond',
			'cleanup:own'
		]);
	});
});
